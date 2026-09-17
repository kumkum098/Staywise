import React, { useState } from 'react';
import { UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Slider } from '../components/ui/Slider';

const AREAS = ['Malviya Nagar', 'Jagatpura', 'Mansarovar', 'Vaishali Nagar', 'Raja Park', 'C-Scheme'];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, updatePreferences } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    minBudget: user?.preferences.minBudget ?? 5000,
    maxBudget: user?.preferences.maxBudget ?? 15000,
    quietness: user?.preferences.quietness ?? 7,
    privacy: user?.preferences.privacy ?? 7,
    foodRequired: user?.preferences.foodRequired ?? false,
    acRequired: user?.preferences.acRequired ?? true,
    roomType: user?.preferences.roomType ?? 'any',
    preferredArea: user?.preferences.preferredArea ?? AREAS[0],
    maxDistanceKm: user?.preferences.maxDistanceKm ?? 5,
    curfewFlexible: user?.preferences.curfewFlexible ?? true,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);

  if (!user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ name, phone });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaving(true);
    try {
      await updatePreferences(prefs);
      toast.success('Preferences updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-display text-ink-primary">Your profile</h1>
          <p className="text-sm text-ink-secondary">Manage your account and lifestyle preferences.</p>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Account</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user.email} disabled hint="Email cannot be changed." />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" isLoading={profileSaving}>
            Save profile
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Lifestyle preferences</h2>
        <form onSubmit={handlePrefsSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min budget (₹)"
              type="number"
              value={prefs.minBudget}
              onChange={(e) => setPrefs({ ...prefs, minBudget: Number(e.target.value) })}
            />
            <Input
              label="Max budget (₹)"
              type="number"
              value={prefs.maxBudget}
              onChange={(e) => setPrefs({ ...prefs, maxBudget: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Room / sharing type" value={prefs.roomType} onChange={(e) => setPrefs({ ...prefs, roomType: e.target.value as typeof prefs.roomType })}>
              <option value="any">Any</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </Select>
            <Select label="Preferred area" value={prefs.preferredArea} onChange={(e) => setPrefs({ ...prefs, preferredArea: e.target.value })}>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-primary">Quietness importance ({prefs.quietness}/10)</label>
              <Slider value={prefs.quietness} onChange={(v) => setPrefs({ ...prefs, quietness: v })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-primary">Privacy importance ({prefs.privacy}/10)</label>
              <Slider value={prefs.privacy} onChange={(v) => setPrefs({ ...prefs, privacy: v })} />
            </div>
          </div>
          <Input
            label="Max distance from campus/work (km)"
            type="number"
            value={prefs.maxDistanceKm}
            onChange={(e) => setPrefs({ ...prefs, maxDistanceKm: Number(e.target.value) })}
          />
          <div className="divide-y divide-surface-border rounded-lg border border-surface-border px-4">
            <Switch
              label="Food / mess required"
              checked={prefs.foodRequired}
              onCheckedChange={(checked) => setPrefs({ ...prefs, foodRequired: checked })}
            />
            <Switch
              label="AC required"
              checked={prefs.acRequired}
              onCheckedChange={(checked) => setPrefs({ ...prefs, acRequired: checked })}
            />
            <Switch
              label="Okay with a strict curfew"
              checked={prefs.curfewFlexible}
              onCheckedChange={(checked) => setPrefs({ ...prefs, curfewFlexible: checked })}
            />
          </div>
          <Button type="submit" isLoading={prefsSaving}>
            Save preferences
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
