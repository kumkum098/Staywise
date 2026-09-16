import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Property, Review, RoomOption } from '../types';
import { ROUTES } from '../routes';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { LivingScoreCard } from '../components/LivingScoreCard';
import { LifestyleMatchCard } from '../components/LifestyleMatchCard';
import { BeforeYouBookCard } from '../components/BeforeYouBookCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { ScheduleVisitModal } from '../components/ScheduleVisitModal';
import { InquiryModal } from '../components/InquiryModal';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const propertyTypeLabel = (type: Property['propertyType']) =>
  type === 'coliving' ? 'Co-living' : type.charAt(0).toUpperCase() + type.slice(1);

const roomTypeLabel = (type: RoomOption['type']) => type.charAt(0).toUpperCase() + type.slice(1);

const PropertyDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
    <div className="h-4 w-36 bg-surface-muted rounded" />
    <div className="space-y-3">
      <div className="h-8 w-2/3 bg-surface-muted rounded" />
      <div className="h-4 w-1/3 bg-surface-muted rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-[360px]">
      <div className="lg:col-span-3 bg-surface-muted rounded-lg" />
      <div className="hidden lg:block lg:col-span-2 space-y-2">
        <div className="h-1/2 bg-surface-muted rounded-lg" />
        <div className="h-1/2 bg-surface-muted rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-56 bg-surface-muted rounded-lg" />
      <div className="h-56 bg-surface-muted rounded-lg" />
    </div>
  </div>
);

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isPropertySaved, toggleSaveProperty } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [visitOpen, setVisitOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    setMessage(`Please log in to ${action}.`);
  };

  const handleSave = async () => {
    if (!property) return;
    if (!user) {
      requestAuth('save properties');
      return;
    }
    setSaveLoading(true);
    setMessage('');
    try {
      await toggleSaveProperty(property._id);
    } catch {
      setMessage('Unable to update your saved properties. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCompare = () => {
    if (!property) return;
    setMessage('');
    if (compared) {
      removeFromCompare(property._id);
      return;
    }
    if (!addToCompare(property)) {
      setMessage('You can compare up to 3 properties at a time.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('Property link copied.');
      }
    } catch {
      setMessage('Unable to share this property right now.');
    }
  };

  const handlePrimaryAction = (action: 'visit' | 'inquiry') => {
    if (!user) {
      requestAuth(action === 'visit' ? 'schedule a visit' : 'send an inquiry');
      return;
    }
    setMessage('');
    if (action === 'visit') setVisitOpen(true);
    else setInquiryOpen(true);
  };

  if (propertyQuery.isLoading) return <PropertyDetailSkeleton />;

  if (!id || propertyQuery.isError || !property) {
    const notFound = propertyQuery.error instanceof Error && /not found/i.test(propertyQuery.error.message);
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-semibold">{notFound ? '404' : 'Error'}</p>
        <h1 className="mt-4 text-3xl font-bold text-ink-primary">{notFound ? 'Property not found' : 'Unable to load this property.'}</h1>
        <p className="mt-3 text-sm text-ink-secondary">
          {notFound ? 'This property may have been removed or is no longer available.' : 'Something went wrong while loading the property.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {!notFound && <button onClick={() => propertyQuery.refetch()} className="px-4 py-2 text-xs font-semibold text-white bg-brand-700 rounded-lg hover:bg-brand-800">Try again</button>}
          <Link to={ROUTES.explore} className="px-4 py-2 text-xs font-semibold border border-surface-border rounded-lg hover:border-brand-300">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const currentImageFailed = failedImages[activeImage];
  const nearby = property.location.nearby || [];
  const totalCost = property.totalEstimatedMonthly ??
    property.pricing.startingRent + property.pricing.foodCost + property.pricing.electricityCost + property.pricing.maintenanceCost + property.pricing.wifiCost;
  const hasPreferences = Boolean(user && Object.keys(user.preferences || {}).length > 0);

  return (
    <div className="pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between gap-4 text-xs text-ink-secondary">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 hover:text-brand-700"><ArrowLeft className="w-4 h-4" /> Back</button>
          <Link to={ROUTES.explore} className="hover:text-brand-700">Explore more stays</Link>
        </div>

        <header className="mt-7 flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-surface-border pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span>{propertyTypeLabel(property.propertyType)}</span><span>·</span><span>{property.gender} accommodation</span>
              {property.verification?.isVerified && <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Verified property</span>}
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink-primary">{property.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary"><MapPin className="w-4 h-4 text-brand-700" />{property.location.area}, {property.location.city}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-ink-primary"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{property.rating?.toFixed(1) || 'Not rated'} <span className="font-normal text-ink-secondary">({property.reviewCount || 0} reviews)</span></div>
            <button onClick={handleSave} disabled={saveLoading} className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg ${saved ? 'border-red-200 bg-red-50 text-red-600' : 'border-surface-border hover:border-brand-300 text-ink-secondary'}`} aria-label={saved ? 'Unsave property' : 'Save property'}><Heart className={`w-4 h-4 ${saved ? 'fill-red-500' : ''}`} />{saveLoading ? 'Saving...' : saved ? 'Saved' : 'Save'}</button>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-surface-border rounded-lg hover:border-brand-300 text-ink-secondary" aria-label="Share property"><Share2 className="w-4 h-4" />Share</button>
          </div>
        </header>

        {message && <div className="mt-4 flex items-center justify-between gap-3 border border-brand-200 bg-brand-50 px-3 py-2.5 rounded-lg text-xs text-brand-900"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss message"><X className="w-4 h-4" /></button></div>}

        <section className="mt-6" aria-label="Property images">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-[280px] sm:h-[400px]">
            <div className="lg:col-span-3 relative bg-surface-muted rounded-lg overflow-hidden">
              {!currentImageFailed && images[activeImage] ? <img src={images[activeImage]} alt={`${property.name} ${activeImage + 1}`} className="w-full h-full object-cover" onError={() => setFailedImages((prev) => ({ ...prev, [activeImage]: true }))} /> : <div className="h-full flex items-center justify-center text-sm text-ink-muted">Property images unavailable</div>}
              {images.length > 1 && <><button onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full" aria-label="Previous image"><ChevronLeft className="w-5 h-5" /></button><button onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full" aria-label="Next image"><ChevronRight className="w-5 h-5" /></button></>}
            </div>
            <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((imageIndex) => <button key={imageIndex} onClick={() => images[imageIndex] && setActiveImage(imageIndex)} className="bg-surface-muted rounded-lg overflow-hidden text-left" aria-label={`View image ${imageIndex + 1}`}>
                {images[imageIndex] && !failedImages[imageIndex] ? <img src={images[imageIndex]} alt={`${property.name} ${imageIndex + 1}`} className="w-full h-full object-cover hover:opacity-90" onError={() => setFailedImages((prev) => ({ ...prev, [imageIndex]: true }))} /> : <span className="flex h-full items-center justify-center text-xs text-ink-muted">No image</span>}
              </button>)}
            </div>
          </div>
          {images.length > 1 && <div className="flex gap-2 mt-2 overflow-x-auto lg:hidden">{images.map((image, index) => <button key={image} onClick={() => setActiveImage(index)} className={`w-16 h-12 shrink-0 rounded overflow-hidden border-2 ${activeImage === index ? 'border-brand-700' : 'border-transparent'}`}><img src={failedImages[index] ? '' : image} alt={`${property.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" onError={() => setFailedImages((prev) => ({ ...prev, [index]: true }))} /></button>)}</div>}
        </section>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-10">
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-surface-border py-5">
              <InfoItem label="Starting rent" value={`${money(property.pricing.startingRent)} / month`} />
              <InfoItem label="Security deposit" value={property.pricing.deposit > 0 ? money(property.pricing.deposit) : 'Not specified'} />
              <InfoItem label="Availability" value={property.availableRoomsCount !== undefined ? `${property.availableRoomsCount} room${property.availableRoomsCount === 1 ? '' : 's'}` : 'See rooms below'} />
              <InfoItem label="Accommodation" value={`${propertyTypeLabel(property.propertyType)} · ${property.gender}`} />
            </section>

            <section><SectionHeading eyebrow="About this place" title="A clearer view before you move in" /><p className="mt-4 text-sm leading-7 text-ink-secondary whitespace-pre-line">{property.description}</p></section>

            <section><SectionHeading eyebrow="Room options" title="Choose the setup that fits" /><div className="mt-4 divide-y divide-surface-border border-y border-surface-border">{rooms.length ? rooms.map((room) => <RoomRow key={room._id} room={room} />) : <p className="py-5 text-sm text-ink-secondary">Room options have not been provided by the property.</p>}</div></section>

            <section><SectionHeading eyebrow="Estimated monthly cost" title={money(totalCost) + ' / month'} /><p className="mt-2 text-xs text-ink-secondary">Your actual monthly cost may vary depending on usage and property billing policies.</p><div className="mt-5 border-y border-surface-border divide-y divide-surface-border">{[
              ['Rent', property.pricing.startingRent], ['Food', property.pricing.foodCost], ['Electricity', property.pricing.electricityCost], ['Maintenance', property.pricing.maintenanceCost],
            ].map(([label, value]) => <CostRow key={String(label)} label={String(label)} value={Number(value)} />)}<CostRow label="Wi-Fi" value={property.pricing.wifiCost} included={property.amenities.includes('Wi-Fi') && property.pricing.wifiCost === 0} /><div className="flex items-center justify-between py-4 font-bold text-ink-primary"><span>Estimated total</span><span>{money(totalCost)}</span></div></div></section>

            <section><SectionHeading eyebrow="Amenities" title="What is available here" /><div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3">{property.amenities.length ? property.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-2 text-sm text-ink-secondary"><Check className="w-4 h-4 text-emerald-700 shrink-0" />{amenity}</div>) : <p className="text-sm text-ink-secondary">Amenities have not been provided.</p>}</div></section>

            <LivingScoreCard score={property.livingScore} reviewCount={property.reviewCount} />
            {hasPreferences ? <LifestyleMatchCard property={property} /> : <section className="border border-surface-border bg-white rounded-lg p-5"><SectionHeading eyebrow="Lifestyle match" title="See how this place fits you" /><p className="mt-2 text-sm text-ink-secondary">Set your preferences to see a transparent match based on budget, quietness, food, AC, and Wi-Fi.</p><button onClick={() => requestAuth('set your preferences')} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800">Set preferences <ArrowRight className="w-4 h-4" /></button></section>}

            <BeforeYouBookCard beforeYouBook={property.beforeYouBook} houseRules={property.houseRules} />

            <section><SectionHeading eyebrow="House rules" title="Know the property policies" /><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">{property.houseRules ? <><Rule label="Curfew" value={property.houseRules.curfew} /><Rule label="Visitors" value={property.houseRules.visitorsAllowed ? property.houseRules.visitorPolicy || 'Allowed' : 'Not allowed'} /><Rule label="Smoking" value={property.houseRules.smokingAllowed ? 'Allowed' : 'Not allowed'} /><Rule label="Alcohol" value={property.houseRules.alcoholAllowed ? 'Allowed' : 'Not allowed'} /><Rule label="Pets" value={property.houseRules.petsAllowed ? 'Allowed' : 'Not allowed'} /><Rule label="Notice period" value={property.houseRules.noticePeriodDays ? `${property.houseRules.noticePeriodDays} days` : 'Not specified'} /></> : <p className="text-sm text-ink-secondary">House rules have not been provided by the property.</p>}</div></section>

            <section><SectionHeading eyebrow="Location" title={`${property.location.area}, ${property.location.city}`} /><p className="mt-3 text-sm text-ink-secondary">{property.location.address}{property.location.pincode ? ` · ${property.location.pincode}` : ''}</p>{nearby.length > 0 && <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">{nearby.map((place) => <div key={`${place.name}-${place.category}`} className="flex justify-between border-b border-surface-border py-2 text-xs"><span className="text-ink-secondary">{place.name}</span><span className="font-semibold text-ink-primary">{place.distanceKm} km · {place.travelTimeMins} min</span></div>)}</div>}<div className="mt-5 h-64"><InteractiveMap properties={[property]} /></div></section>

            <ReviewsSection reviews={reviews} loading={reviewsQuery.isLoading} error={reviewsQuery.isError} rating={property.rating} count={property.reviewCount} />
          </main>

          <aside className="hidden lg:block"><div className="sticky top-24 border border-surface-border bg-white rounded-lg p-5 shadow-subtle space-y-4"><div><p className="text-xs uppercase tracking-wider text-ink-muted">From</p><p className="mt-1 text-2xl font-bold text-ink-primary">{money(property.pricing.startingRent)} <span className="text-xs font-normal text-ink-secondary">/ month</span></p><p className="mt-1 text-xs text-brand-700">≈ {money(totalCost)} estimated monthly cost</p></div><button onClick={() => handlePrimaryAction('visit')} className="w-full py-3 bg-brand-700 text-white text-sm font-bold rounded-lg hover:bg-brand-800">Schedule a visit</button><button onClick={() => handlePrimaryAction('inquiry')} className="w-full py-3 border border-brand-300 text-brand-700 text-sm font-bold rounded-lg hover:bg-brand-50"><MessageSquare className="inline w-4 h-4 mr-1.5" />Send inquiry</button><button onClick={handleCompare} className="w-full py-2.5 border border-surface-border text-xs font-semibold rounded-lg hover:border-brand-300">{compared ? 'Remove from compare' : 'Add to compare'}</button><div className="pt-3 border-t border-surface-border text-xs text-ink-secondary"><p className="font-semibold text-ink-primary">{property.owner?.name || 'Property manager'}</p><p className="mt-1">Send an inquiry to connect with management.</p></div></div></aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-surface-border p-3"><div className="max-w-7xl mx-auto flex gap-2"><button onClick={handleSave} className="w-12 shrink-0 border border-surface-border rounded-lg flex items-center justify-center" aria-label={saved ? 'Unsave property' : 'Save property'}><Heart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} /></button><button onClick={() => handlePrimaryAction('visit')} className="flex-1 py-3 bg-brand-700 text-white text-sm font-bold rounded-lg">Schedule visit</button><button onClick={() => handlePrimaryAction('inquiry')} className="flex-1 py-3 border border-brand-300 text-brand-700 text-sm font-bold rounded-lg">Inquiry</button></div></div>
      <ScheduleVisitModal property={property} isOpen={visitOpen} onClose={() => setVisitOpen(false)} />
      <InquiryModal property={property} isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><p className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</p><p className="mt-1 text-sm font-semibold text-ink-primary">{value}</p></div>;

const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => <div><p className="text-[11px] uppercase tracking-[0.16em] text-brand-700 font-semibold">{eyebrow}</p><h2 className="mt-1 text-xl font-bold text-ink-primary">{title}</h2></div>;

const RoomRow: React.FC<{ room: RoomOption }> = ({ room }) => <div className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 sm:items-center"><div><p className="font-semibold text-sm text-ink-primary">{room.name || roomTypeLabel(room.type)}</p><p className="mt-1 text-xs text-ink-secondary flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.capacity} person{room.capacity === 1 ? '' : 's'}{room.features?.length ? ` · ${room.features.join(', ')}` : ''}</p></div><p className="text-sm font-bold text-ink-primary">{money(room.rent)} <span className="text-xs font-normal text-ink-secondary">/ month</span></p><span className={`text-xs font-semibold ${room.available ? 'text-emerald-700' : 'text-ink-muted'}`}>{room.available ? 'Available' : 'Unavailable'}</span></div>;

const CostRow: React.FC<{ label: string; value: number; included?: boolean }> = ({ label, value, included }) => <div className="flex items-center justify-between py-3 text-sm"><span className="text-ink-secondary">{label}</span><span className="font-semibold text-ink-primary">{included ? 'Included' : value > 0 ? money(value) : 'Not specified'}</span></div>;

const Rule: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="flex items-start justify-between gap-4 border-b border-surface-border py-2.5"><span className="text-ink-secondary">{label}</span><span className="text-right font-medium text-ink-primary">{value}</span></div>;

const ReviewsSection: React.FC<{ reviews: Review[]; loading: boolean; error: boolean; rating: number; count: number }> = ({ reviews, loading, error, rating, count }) => <section><SectionHeading eyebrow="Resident reviews" title="Experiences from the community" /><div className="mt-4 flex items-center gap-3 border-y border-surface-border py-4"><span className="text-3xl font-bold text-ink-primary">{rating?.toFixed(1) || '—'}</span><span className="text-sm text-ink-secondary"><span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-amber-400" /> Overall rating</span>{count} review{count === 1 ? '' : 's'}</span></div>{loading ? <p className="py-5 text-sm text-ink-secondary">Loading reviews...</p> : error ? <p className="py-5 text-sm text-ink-secondary">Reviews are temporarily unavailable.</p> : reviews.length === 0 ? <p className="py-5 text-sm text-ink-secondary">No reviews yet. Be the first resident to share your experience.</p> : <div className="divide-y divide-surface-border">{reviews.map((review) => <article key={review._id} className="py-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-sm text-ink-primary">{review.user?.name || review.userName || 'Resident'}</p><p className="mt-1 text-xs text-ink-muted">{new Date(review.createdAt).toLocaleDateString()}</p></div><span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-primary"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{review.overall.toFixed(1)}</span></div><p className="mt-3 text-sm leading-6 text-ink-secondary">{review.comment}</p><div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-ink-muted"><span>Cleanliness {review.cleanliness.toFixed(1)}</span><span>Internet {review.internet.toFixed(1)}</span><span>Food {review.food.toFixed(1)}</span><span>Noise {review.noise.toFixed(1)}</span><span>Location {review.location.toFixed(1)}</span><span>Privacy {review.privacy.toFixed(1)}</span><span>Safety {review.safety.toFixed(1)}</span></div></article>)}</div>}</section>;

export default PropertyDetailPage;