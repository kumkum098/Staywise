import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, ArrowLeft, BedDouble } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Tooltip } from '../../components/ui/Tooltip';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/Accordion';
import { ROUTES } from '../../routes';
import { RoomOption } from '../../types';

interface PropertyFormValues {
  name: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'coliving' | 'apartment';
  gender: 'male' | 'female' | 'unisex';
  location: {
    address: string;
    area: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    nearby: { name: string; category: string; distanceKm: number; travelTimeMins: number }[];
  };
  images: string;
  amenities: string;
  pricing: {
    startingRent: number;
    deposit: number;
    foodCost: number;
    electricityCost: number;
    maintenanceCost: number;
    wifiCost: number;
  };
  houseRules: {
    curfew: string;
    visitorsAllowed: boolean;
    visitorPolicy: string;
    smokingAllowed: boolean;
    alcoholAllowed: boolean;
    petsAllowed: boolean;
    noticePeriodDays: number;
  };
  beforeYouBook: string;
  goodFor: string;
  thingsToKnow: string;
}

const emptyDefaults: PropertyFormValues = {
  name: '',
  description: '',
  propertyType: 'pg',
  gender: 'unisex',
  location: { address: '', area: '', city: 'Jaipur', pincode: '302017', lat: 26.85, lng: 75.8, nearby: [] },
  images: '',
  amenities: '',
  pricing: { startingRent: 0, deposit: 0, foodCost: 0, electricityCost: 0, maintenanceCost: 0, wifiCost: 0 },
  houseRules: {
    curfew: '10:30 PM',
    visitorsAllowed: true,
    visitorPolicy: 'Visitors allowed in common areas until 8 PM',
    smokingAllowed: false,
    alcoholAllowed: false,
    petsAllowed: false,
    noticePeriodDays: 30,
  },
  beforeYouBook: '',
  goodFor: '',
  thingsToKnow: '',
};

const ACCORDION_SECTIONS = ['basic', 'location', 'pricing', 'houseRules', 'amenities', 'reality'];

const toLines = (arr?: string[]) => (arr && arr.length ? arr.join('\n') : '');
const fromLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
const fromCommaList = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const OwnerPropertyFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'double',
    capacity: 2,
    rent: 0,
    totalUnits: 1,
    occupiedUnits: 0,
    features: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ownerProperty', id],
    queryFn: () => api.getPropertyById(id as string),
    enabled: isEdit,
  });

  const property = data?.property;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({ defaultValues: emptyDefaults });

  const { fields, append, remove } = useFieldArray({ control, name: 'location.nearby' });

  useEffect(() => {
    if (property) {
      reset({
        name: property.name,
        description: property.description,
        propertyType: property.propertyType,
        gender: property.gender,
        location: {
          address: property.location.address,
          area: property.location.area,
          city: property.location.city,
          pincode: property.location.pincode,
          lat: property.location.lat,
          lng: property.location.lng,
          nearby: property.location.nearby.map((n) => ({
            name: n.name,
            category: n.category,
            distanceKm: n.distanceKm,
            travelTimeMins: n.travelTimeMins,
          })),
        },
        images: toLines(property.images),
        amenities: property.amenities.join(', '),
        pricing: property.pricing,
        houseRules: property.houseRules,
        beforeYouBook: toLines(property.beforeYouBook),
        goodFor: toLines(property.goodFor),
        thingsToKnow: toLines(property.thingsToKnow),
      });
    }
  }, [property, reset]);

  const onSubmit = async (values: PropertyFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        propertyType: values.propertyType,
        gender: values.gender,
        location: {
          address: values.location.address,
          area: values.location.area,
          city: values.location.city,
          pincode: values.location.pincode,
          lat: Number(values.location.lat),
          lng: Number(values.location.lng),
          nearby: values.location.nearby.map((n) => ({
            name: n.name,
            category: n.category,
            distanceKm: Number(n.distanceKm),
            travelTimeMins: Number(n.travelTimeMins),
          })),
        },
        images: fromLines(values.images),
        amenities: fromCommaList(values.amenities),
        pricing: {
          startingRent: Number(values.pricing.startingRent),
          deposit: Number(values.pricing.deposit),
          foodCost: Number(values.pricing.foodCost) || 0,
          electricityCost: Number(values.pricing.electricityCost) || 0,
          maintenanceCost: Number(values.pricing.maintenanceCost) || 0,
          wifiCost: Number(values.pricing.wifiCost) || 0,
        },
        houseRules: {
          ...values.houseRules,
          noticePeriodDays: Number(values.houseRules.noticePeriodDays),
        },
        beforeYouBook: fromLines(values.beforeYouBook),
        goodFor: fromLines(values.goodFor),
        thingsToKnow: fromLines(values.thingsToKnow),
      };

      if (isEdit && id) {
        await api.updateProperty(id, payload);
        queryClient.invalidateQueries({ queryKey: ['ownerProperty', id] });
        toast.success('Property updated.');
        navigate(ROUTES.ownerProperties);
      } else {
        const res = await api.createProperty(payload);
        toast.success('Property created and saved to the database.');
        navigate(ROUTES.ownerProperty(res.property._id));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save property.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRoom = async () => {
    if (!id) return;
    try {
      await api.createRoom(id, {
        name: newRoom.name,
        type: newRoom.type,
        capacity: Number(newRoom.capacity),
        rent: Number(newRoom.rent),
        totalUnits: Number(newRoom.totalUnits),
        occupiedUnits: Number(newRoom.occupiedUnits),
        available: Number(newRoom.occupiedUnits) < Number(newRoom.totalUnits),
        features: fromCommaList(newRoom.features),
      });
      setNewRoom({ name: '', type: 'double', capacity: 2, rent: 0, totalUnits: 1, occupiedUnits: 0, features: '' });
      setAddingRoom(false);
      queryClient.invalidateQueries({ queryKey: ['ownerProperty', id] });
      toast.success('Room added.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add room.');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Remove this room?')) return;
    try {
      await api.deleteRoom(roomId);
      queryClient.invalidateQueries({ queryKey: ['ownerProperty', id] });
      toast.success('Room removed.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove room.');
    }
  };

  if (isEdit && isLoading) {
    return <div className="py-24 text-center text-sm text-ink-secondary">Loading property…</div>;
  }
  if (isEdit && isError) {
    return <div className="py-24 text-center text-sm text-danger-600">Could not load this property.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={ROUTES.ownerProperties}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to properties
      </Link>
      <h1 className="text-display text-ink-primary">{isEdit ? 'Edit property' : 'List a new property'}</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        {isEdit
          ? 'Update your listing details below.'
          : 'Fill in the details below — this is saved to the database and shown in Explore once submitted.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Accordion type="multiple" defaultValue={ACCORDION_SECTIONS} className="space-y-4">
          <AccordionItem value="basic">
            <AccordionTrigger>Basic info</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Input label="Property name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
                <Textarea
                  label="Description"
                  rows={3}
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required' })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Property type" {...register('propertyType')}>
                    <option value="pg">PG</option>
                    <option value="hostel">Hostel</option>
                    <option value="coliving">Co-Living</option>
                    <option value="apartment">Apartment / Rental Room</option>
                  </Select>
                  <Select label="Occupant / gender" {...register('gender')}>
                    <option value="unisex">Unisex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger>Location</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Input label="Address" {...register('location.address', { required: true })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Area" {...register('location.area', { required: true })} />
                  <Input label="City" {...register('location.city')} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Pincode" {...register('location.pincode')} />
                  <Input label="Latitude" type="number" step="any" {...register('location.lat', { valueAsNumber: true })} />
                  <Input label="Longitude" type="number" step="any" {...register('location.lng', { valueAsNumber: true })} />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-primary">Nearby places</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => append({ name: '', category: 'college', distanceKm: 1, travelTimeMins: 5 })}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add place
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                        <div className="col-span-4">
                          <Input placeholder="Name" {...register(`location.nearby.${index}.name` as const, { required: true })} />
                        </div>
                        <div className="col-span-3">
                          <Select {...register(`location.nearby.${index}.category` as const)}>
                            <option value="college">College</option>
                            <option value="metro">Metro</option>
                            <option value="grocery">Grocery</option>
                            <option value="gym">Gym</option>
                            <option value="hospital">Hospital</option>
                            <option value="restaurant">Restaurant</option>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="any"
                            placeholder="km"
                            {...register(`location.nearby.${index}.distanceKm` as const, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="mins"
                            {...register(`location.nearby.${index}.travelTimeMins` as const, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="col-span-1 pt-2.5">
                          <Tooltip content="Remove place">
                            <button type="button" onClick={() => remove(index)} className="text-ink-muted hover:text-danger-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && <p className="text-xs text-ink-muted">No nearby places added yet.</p>}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing">
            <AccordionTrigger>Pricing</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Input
                  label="Starting rent (₹)"
                  type="number"
                  {...register('pricing.startingRent', { required: true, valueAsNumber: true })}
                />
                <Input
                  label="Security deposit (₹)"
                  type="number"
                  {...register('pricing.deposit', { required: true, valueAsNumber: true })}
                />
                <Input label="Food cost (₹)" type="number" {...register('pricing.foodCost', { valueAsNumber: true })} />
                <Input
                  label="Electricity (₹)"
                  type="number"
                  {...register('pricing.electricityCost', { valueAsNumber: true })}
                />
                <Input
                  label="Maintenance (₹)"
                  type="number"
                  {...register('pricing.maintenanceCost', { valueAsNumber: true })}
                />
                <Input label="Wi-Fi (₹)" type="number" {...register('pricing.wifiCost', { valueAsNumber: true })} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="houseRules">
            <AccordionTrigger>House rules</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Curfew (e.g. 10:30 PM or No Curfew)" {...register('houseRules.curfew')} />
                  <Input
                    label="Notice period (days)"
                    type="number"
                    {...register('houseRules.noticePeriodDays', { valueAsNumber: true })}
                  />
                </div>
                <Input label="Visitor policy" {...register('houseRules.visitorPolicy')} />
                <div className="divide-y divide-surface-border rounded-lg border border-surface-border px-4">
                  <Controller
                    name="houseRules.visitorsAllowed"
                    control={control}
                    render={({ field }) => <Switch label="Visitors allowed" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <Controller
                    name="houseRules.smokingAllowed"
                    control={control}
                    render={({ field }) => <Switch label="Smoking allowed" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <Controller
                    name="houseRules.alcoholAllowed"
                    control={control}
                    render={({ field }) => <Switch label="Alcohol allowed" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <Controller
                    name="houseRules.petsAllowed"
                    control={control}
                    render={({ field }) => <Switch label="Pets allowed" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="amenities">
            <AccordionTrigger>Amenities &amp; images</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Input label="Amenities (comma-separated)" placeholder="Wi-Fi, AC, Food, Laundry" {...register('amenities')} />
                <Textarea
                  label="Image URLs (one per line)"
                  rows={3}
                  placeholder="https://..."
                  error={errors.images?.message}
                  {...register('images', { required: 'At least one image URL is required' })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reality">
            <AccordionTrigger>Reality check &amp; before you book</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Textarea label="Good for (one per line)" rows={3} placeholder="Students near XYZ college" {...register('goodFor')} />
                <Textarea
                  label="Things to know (one per line)"
                  rows={3}
                  placeholder="Strict 10:30 PM curfew"
                  {...register('thingsToKnow')}
                />
                <Textarea
                  label="Before you book notes (one per line)"
                  rows={3}
                  placeholder="Electricity billed separately"
                  {...register('beforeYouBook')}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ownerProperties)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            <Save className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Create property'}
          </Button>
        </div>
      </form>

      {isEdit && property && (
        <Card className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              <BedDouble className="h-4 w-4" /> Rooms
            </h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAddingRoom((v) => !v)}>
              <Plus className="h-3.5 w-3.5" /> Add room
            </Button>
          </div>

          {addingRoom && (
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-surface-border p-3 sm:grid-cols-3">
              <Input placeholder="Room name" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
              <Select value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
              </Select>
              <Input
                type="number"
                placeholder="Capacity"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Rent"
                value={newRoom.rent}
                onChange={(e) => setNewRoom({ ...newRoom, rent: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Total units"
                value={newRoom.totalUnits}
                onChange={(e) => setNewRoom({ ...newRoom, totalUnits: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Occupied units"
                value={newRoom.occupiedUnits}
                onChange={(e) => setNewRoom({ ...newRoom, occupiedUnits: Number(e.target.value) })}
              />
              <Input
                className="col-span-2 sm:col-span-3"
                placeholder="Features (comma-separated)"
                value={newRoom.features}
                onChange={(e) => setNewRoom({ ...newRoom, features: e.target.value })}
              />
              <div className="col-span-2 flex justify-end sm:col-span-3">
                <Button type="button" size="sm" onClick={handleAddRoom}>
                  Save room
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(property.rooms || []).map((room: RoomOption) => (
              <div key={room._id} className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-ink-primary">{room.name}</span>
                  <span className="ml-2 text-ink-muted">
                    {room.type} · ₹{room.rent.toLocaleString('en-IN')} · {room.occupiedUnits}/{room.totalUnits} occupied
                  </span>
                </div>
                <Tooltip content="Remove room">
                  <button type="button" onClick={() => handleDeleteRoom(room._id)} className="text-ink-muted hover:text-danger-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            ))}
            {(!property.rooms || property.rooms.length === 0) && <p className="text-xs text-ink-muted">No rooms added yet.</p>}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OwnerPropertyFormPage;
