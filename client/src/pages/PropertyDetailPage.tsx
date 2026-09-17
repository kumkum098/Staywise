import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  Share2,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Property, RoomOption } from '../types';
import { ROUTES } from '../routes';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { computeTotalMonthlyCost } from '../lib/pricing';
import { LivingScoreCard } from '../components/LivingScoreCard';
import { LifestyleMatchCard } from '../components/LifestyleMatchCard';
import { BeforeYouBookCard } from '../components/BeforeYouBookCard';
import { RealityCheckCard } from '../components/RealityCheckCard';
import { NeighborhoodIntelligenceCard } from '../components/NeighborhoodIntelligenceCard';
import { ReviewsSection } from '../components/ReviewsSection';
import { ReviewFormModal } from '../components/ReviewFormModal';
import { InteractiveMap } from '../components/InteractiveMap';
import { ScheduleVisitModal } from '../components/ScheduleVisitModal';
import { InquiryModal } from '../components/InquiryModal';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const propertyTypeLabel = (type: Property['propertyType']) =>
  type === 'coliving' ? 'Co-living' : type.charAt(0).toUpperCase() + type.slice(1);

const roomTypeLabel = (type: RoomOption['type']) => type.charAt(0).toUpperCase() + type.slice(1);

const PropertyDetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <div className="h-4 w-36 rounded bg-surface-muted" />
    <div className="space-y-3">
      <div className="h-8 w-2/3 rounded bg-surface-muted" />
      <div className="h-4 w-1/3 rounded bg-surface-muted" />
    </div>
    <div className="grid h-[360px] grid-cols-1 gap-2 lg:grid-cols-5">
      <div className="rounded-lg bg-surface-muted lg:col-span-3" />
      <div className="hidden space-y-2 lg:col-span-2 lg:block">
        <div className="h-1/2 rounded-lg bg-surface-muted" />
        <div className="h-1/2 rounded-lg bg-surface-muted" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="h-56 rounded-lg bg-surface-muted lg:col-span-2" />
      <div className="h-56 rounded-lg bg-surface-muted" />
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</p>
    <p className="mt-1 text-sm font-semibold text-ink-primary">{value}</p>
  </div>
);

const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
    <h2 className="mt-1 text-xl font-bold text-ink-primary">{title}</h2>
  </div>
);

const RoomRow: React.FC<{ room: RoomOption }> = ({ room }) => (
  <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
    <div>
      <p className="text-sm font-semibold text-ink-primary">{room.name || roomTypeLabel(room.type)}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-ink-secondary">
        <Users className="h-3.5 w-3.5" />
        {room.capacity} person{room.capacity === 1 ? '' : 's'}
        {room.features?.length ? ` · ${room.features.join(', ')}` : ''}
      </p>
    </div>
    <p className="text-sm font-bold text-ink-primary">
      {money(room.rent)} <span className="text-xs font-normal text-ink-secondary">/ month</span>
    </p>
    <span className={`text-xs font-semibold ${room.available ? 'text-success-700' : 'text-ink-muted'}`}>
      {room.available ? 'Available' : 'Unavailable'}
    </span>
  </div>
);

const CostRow: React.FC<{ label: string; value: number; included?: boolean }> = ({ label, value, included }) => (
  <div className="flex items-center justify-between py-3 text-sm">
    <span className="text-ink-secondary">{label}</span>
    <span className="font-semibold text-ink-primary">{included ? 'Included' : value > 0 ? money(value) : 'Not specified'}</span>
  </div>
);

const Rule: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-surface-border py-2.5">
    <span className="text-ink-secondary">{label}</span>
    <span className="text-right font-medium text-ink-primary">{value}</span>
  </div>
);

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isPropertySaved, toggleSaveProperty } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [visitOpen, setVisitOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const propertyQuery = useQuery({
    queryKey: ['property', id],
    queryFn: () => api.getPropertyById(id as string),
    enabled: Boolean(id && id.trim()),
    retry: false,
  });

  const property = propertyQuery.data?.property;
  const reviewsQuery = useQuery({
    queryKey: ['propertyReviews', id],
    queryFn: () => api.getReviews(id as string),
    enabled: Boolean(property && id),
    retry: false,
  });

  const rooms = useMemo(() => property?.rooms || property?.roomOptions || [], [property]);
  const images = property?.images || [];
  const saved = property ? isPropertySaved(property._id) : false;
  const compared = property ? isInCompare(property._id) : false;
  const reviews = reviewsQuery.data?.reviews || [];

  const requestAuth = (action: string) => {
    toast.info(`Please log in to ${action}.`);
  };

  const handleSave = async () => {
    if (!property) return;
    if (!user) {
      requestAuth('save properties');
      return;
    }
    setSaveLoading(true);
    try {
      await toggleSaveProperty(property._id);
    } catch {
      toast.error('Unable to update your saved properties. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCompare = () => {
    if (!property) return;
    if (compared) {
      removeFromCompare(property._id);
      return;
    }
    if (!addToCompare(property)) {
      toast.error('You can compare up to 3 properties at a time.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Property link copied.');
      }
    } catch {
      toast.error('Unable to share this property right now.');
    }
  };

  const handlePrimaryAction = (action: 'visit' | 'inquiry' | 'review') => {
    if (!user) {
      requestAuth(
        action === 'visit' ? 'schedule a visit' : action === 'inquiry' ? 'send an inquiry' : 'write a review'
      );
      return;
    }
    if (action === 'visit') setVisitOpen(true);
    else if (action === 'inquiry') setInquiryOpen(true);
    else setReviewOpen(true);
  };

  if (propertyQuery.isLoading) return <PropertyDetailSkeleton />;

  if (!id || propertyQuery.isError || !property) {
    const notFound = propertyQuery.error instanceof Error && /not found/i.test(propertyQuery.error.message);
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{notFound ? '404' : 'Error'}</p>
        <h1 className="mt-4 text-3xl font-bold text-ink-primary">
          {notFound ? 'Property not found' : 'Unable to load this property.'}
        </h1>
        <p className="mt-3 text-sm text-ink-secondary">
          {notFound
            ? 'This property may have been removed or is no longer available.'
            : 'Something went wrong while loading the property.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {!notFound && (
            <button
              onClick={() => propertyQuery.refetch()}
              className="rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800"
            >
              Try again
            </button>
          )}
          <Link to={ROUTES.explore} className="rounded-lg border border-surface-border px-4 py-2 text-xs font-semibold hover:border-brand-300">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const currentImageFailed = failedImages[activeImage];
  const nearby = property.location.nearby || [];
  const totalCost = property.totalEstimatedMonthly ?? computeTotalMonthlyCost(property.pricing);
  const hasPreferences = Boolean(user && Object.keys(user.preferences || {}).length > 0);

  return (
    <div className="pb-24 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 text-xs text-ink-secondary">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Link to={ROUTES.explore} className="hover:text-brand-700">
            Explore more stays
          </Link>
        </div>

        <header className="mt-7 flex flex-col justify-between gap-5 border-b border-surface-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span>{propertyTypeLabel(property.propertyType)}</span>
              <span>·</span>
              <span>{property.gender} accommodation</span>
              {property.verification?.isVerified && (
                <span className="inline-flex items-center gap-1 font-semibold text-success-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified property
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">{property.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary">
              <MapPin className="h-4 w-4 text-brand-700" />
              {property.location.area}, {property.location.city}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-ink-primary">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {property.rating?.toFixed(1) || 'Not rated'}{' '}
              <span className="font-normal text-ink-secondary">({property.reviewCount || 0} reviews)</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                saved ? 'border-red-200 bg-red-50 text-red-600' : 'border-surface-border text-ink-secondary hover:border-brand-300'
              }`}
              aria-label={saved ? 'Unsave property' : 'Save property'}
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-red-500' : ''}`} />
              {saveLoading ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-secondary hover:border-brand-300"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </header>

        <section className="mt-6" aria-label="Property images">
          <div className="grid h-[280px] grid-cols-1 gap-2 sm:h-[400px] lg:grid-cols-5">
            <div className="relative overflow-hidden rounded-lg bg-surface-muted lg:col-span-3">
              {!currentImageFailed && images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={`${property.name} ${activeImage + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => setFailedImages((prev) => ({ ...prev, [activeImage]: true }))}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">Property images unavailable</div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="hidden grid-cols-2 gap-2 lg:col-span-2 lg:grid">
              {[1, 2, 3, 4].map((imageIndex) => (
                <button
                  key={imageIndex}
                  onClick={() => images[imageIndex] && setActiveImage(imageIndex)}
                  className="overflow-hidden rounded-lg bg-surface-muted text-left"
                  aria-label={`View image ${imageIndex + 1}`}
                >
                  {images[imageIndex] && !failedImages[imageIndex] ? (
                    <img
                      src={images[imageIndex]}
                      alt={`${property.name} ${imageIndex + 1}`}
                      className="h-full w-full object-cover hover:opacity-90"
                      onError={() => setFailedImages((prev) => ({ ...prev, [imageIndex]: true }))}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-ink-muted">No image</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto lg:hidden">
              {images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded border-2 ${
                    activeImage === index ? 'border-brand-700' : 'border-transparent'
                  }`}
                >
                  <img
                    src={failedImages[index] ? '' : image}
                    alt={`${property.name} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => setFailedImages((prev) => ({ ...prev, [index]: true }))}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <main className="space-y-10 lg:col-span-2">
            <section className="grid grid-cols-2 gap-4 border-y border-surface-border py-5 sm:grid-cols-4">
              <InfoItem label="Starting rent" value={`${money(property.pricing.startingRent)} / month`} />
              <InfoItem
                label="Security deposit"
                value={property.pricing.deposit > 0 ? money(property.pricing.deposit) : 'Not specified'}
              />
              <InfoItem
                label="Availability"
                value={
                  property.availableRoomsCount !== undefined
                    ? `${property.availableRoomsCount} room${property.availableRoomsCount === 1 ? '' : 's'}`
                    : 'See rooms below'
                }
              />
              <InfoItem label="Accommodation" value={`${propertyTypeLabel(property.propertyType)} · ${property.gender}`} />
            </section>

            <section>
              <SectionHeading eyebrow="About this place" title="A clearer view before you move in" />
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-secondary">{property.description}</p>
            </section>

            <section>
              <SectionHeading eyebrow="Room options" title="Choose the setup that fits" />
              <div className="mt-4 divide-y divide-surface-border border-y border-surface-border">
                {rooms.length ? (
                  rooms.map((room) => <RoomRow key={room._id} room={room} />)
                ) : (
                  <p className="py-5 text-sm text-ink-secondary">Room options have not been provided by the property.</p>
                )}
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Estimated monthly cost" title={`${money(totalCost)} / month`} />
              <p className="mt-2 text-xs text-ink-secondary">
                Your actual monthly cost may vary depending on usage and property billing policies.
              </p>
              <div className="mt-5 divide-y divide-surface-border border-y border-surface-border">
                <CostRow label="Rent" value={property.pricing.startingRent} />
                <CostRow label="Food" value={property.pricing.foodCost} />
                <CostRow label="Electricity" value={property.pricing.electricityCost} />
                <CostRow label="Maintenance" value={property.pricing.maintenanceCost} />
                <CostRow
                  label="Wi-Fi"
                  value={property.pricing.wifiCost}
                  included={property.amenities.includes('Wi-Fi') && property.pricing.wifiCost === 0}
                />
                <div className="flex items-center justify-between py-4 font-bold text-ink-primary">
                  <span>Estimated total</span>
                  <span>{money(totalCost)}</span>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Amenities" title="What is available here" />
              <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                {property.amenities.length ? (
                  property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-ink-secondary">
                      <Check className="h-4 w-4 shrink-0 text-success-700" />
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-secondary">Amenities have not been provided.</p>
                )}
              </div>
            </section>

            <LivingScoreCard score={property.livingScore} reviewCount={property.reviewCount} />

            <RealityCheckCard property={property} />

            {hasPreferences ? (
              <LifestyleMatchCard property={property} />
            ) : (
              <section className="rounded-lg border border-surface-border bg-white p-5">
                <SectionHeading eyebrow="Lifestyle match" title="See how this place fits you" />
                <p className="mt-2 text-sm text-ink-secondary">
                  Set your preferences to see a transparent match based on budget, quietness, food, AC, and Wi-Fi.
                </p>
                <button
                  onClick={() => requestAuth('set your preferences')}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Set preferences <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            )}

            <BeforeYouBookCard beforeYouBook={property.beforeYouBook} houseRules={property.houseRules} />

            <section>
              <SectionHeading eyebrow="House rules" title="Know the property policies" />
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {property.houseRules ? (
                  <>
                    <Rule label="Curfew" value={property.houseRules.curfew} />
                    <Rule
                      label="Visitors"
                      value={property.houseRules.visitorsAllowed ? property.houseRules.visitorPolicy || 'Allowed' : 'Not allowed'}
                    />
                    <Rule label="Smoking" value={property.houseRules.smokingAllowed ? 'Allowed' : 'Not allowed'} />
                    <Rule label="Alcohol" value={property.houseRules.alcoholAllowed ? 'Allowed' : 'Not allowed'} />
                    <Rule label="Pets" value={property.houseRules.petsAllowed ? 'Allowed' : 'Not allowed'} />
                    <Rule
                      label="Notice period"
                      value={property.houseRules.noticePeriodDays ? `${property.houseRules.noticePeriodDays} days` : 'Not specified'}
                    />
                  </>
                ) : (
                  <p className="text-sm text-ink-secondary">House rules have not been provided by the property.</p>
                )}
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Location" title={`${property.location.area}, ${property.location.city}`} />
              <p className="mt-3 text-sm text-ink-secondary">
                {property.location.address}
                {property.location.pincode ? ` · ${property.location.pincode}` : ''}
              </p>
              <div className="mt-5 h-64">
                <InteractiveMap properties={[property]} />
              </div>
            </section>

            <NeighborhoodIntelligenceCard
              nearby={nearby}
              area={property.location.area}
              city={property.location.city}
              areaHighlights={property.areaHighlights}
              nearbyByCategory={property.nearbyByCategory}
            />

            <ReviewsSection
              reviews={reviews}
              loading={reviewsQuery.isLoading}
              error={reviewsQuery.isError}
              rating={property.rating}
              count={property.reviewCount}
              onWriteReview={() => handlePrimaryAction('review')}
            />
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-lg border border-surface-border bg-white p-5 shadow-subtle">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">From</p>
                <p className="mt-1 text-2xl font-bold text-ink-primary">
                  {money(property.pricing.startingRent)} <span className="text-xs font-normal text-ink-secondary">/ month</span>
                </p>
                <p className="mt-1 text-xs text-brand-700">≈ {money(totalCost)} estimated monthly cost</p>
              </div>
              <button
                onClick={() => handlePrimaryAction('visit')}
                className="w-full rounded-lg bg-brand-700 py-3 text-sm font-bold text-white hover:bg-brand-800"
              >
                Schedule a visit
              </button>
              <button
                onClick={() => handlePrimaryAction('inquiry')}
                className="w-full rounded-lg border border-brand-300 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                <MessageSquare className="mr-1.5 inline h-4 w-4" />
                Send inquiry
              </button>
              <button
                onClick={handleCompare}
                className="w-full rounded-lg border border-surface-border py-2.5 text-xs font-semibold hover:border-brand-300"
              >
                {compared ? 'Remove from compare' : 'Add to compare'}
              </button>
              <div className="border-t border-surface-border pt-3 text-xs text-ink-secondary">
                <p className="font-semibold text-ink-primary">{property.owner?.name || 'Property manager'}</p>
                <p className="mt-1">Send an inquiry to connect with management.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-white p-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <button
            onClick={handleSave}
            className="flex w-12 shrink-0 items-center justify-center rounded-lg border border-surface-border"
            aria-label={saved ? 'Unsave property' : 'Save property'}
          >
            <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button
            onClick={() => handlePrimaryAction('visit')}
            className="flex-1 rounded-lg bg-brand-700 py-3 text-sm font-bold text-white"
          >
            Schedule visit
          </button>
          <button
            onClick={() => handlePrimaryAction('inquiry')}
            className="flex-1 rounded-lg border border-brand-300 py-3 text-sm font-bold text-brand-700"
          >
            Inquiry
          </button>
        </div>
      </div>

      <ScheduleVisitModal property={property} isOpen={visitOpen} onClose={() => setVisitOpen(false)} />
      <InquiryModal property={property} isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <ReviewFormModal
        property={property}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['propertyReviews', id] })}
      />
    </div>
  );
};

export default PropertyDetailPage;
