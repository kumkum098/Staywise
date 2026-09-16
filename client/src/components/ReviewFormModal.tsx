import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Property } from '../types';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';

interface ReviewFormModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const DIMENSIONS: Array<{ key: string; label: string }> = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'internet', label: 'Wi-Fi / Internet' },
  { key: 'food', label: 'Food' },
  { key: 'safety', label: 'Safety' },
  { key: 'noise', label: 'Noise level' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'location', label: 'Location' },
  { key: 'ownerResponsiveness', label: 'Owner responsiveness' },
  { key: 'valueForMoney', label: 'Value for money' },
];

const initialScores: Record<string, number> = DIMENSIONS.reduce(
  (acc, d) => ({ ...acc, [d.key]: 8 }),
  {}
);

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({ property, isOpen, onClose, onSubmitted }) => {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [comment, setComment] = useState('');
  const [whatIWishIKnew, setWhatIWishIKnew] = useState('');
  const [stayDurationMonths, setStayDurationMonths] = useState('');
  const [roomType, setRoomType] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addReview(property._id, {
        ...scores,
        comment,
        whatIWishIKnew: whatIWishIKnew || undefined,
        stayDurationMonths: stayDurationMonths ? Number(stayDurationMonths) : undefined,
        roomType: roomType || undefined,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setScores(initialScores);
    setComment('');
    setWhatIWishIKnew('');
    setStayDurationMonths('');
    setRoomType('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Write a review" maxWidth="max-w-xl">
      {submitted ? (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-ink-primary">Thanks for sharing!</h3>
          <p className="mx-auto max-w-xs text-sm text-ink-secondary">
            Your review helps future residents make a more informed decision.
          </p>
          <Button className="mt-2" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-primary">Rate your experience (1–10)</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-ink-secondary">{dim.label}</label>
                    <span className="text-xs font-semibold text-ink-primary">{scores[dim.key]}/10</span>
                  </div>
                  <Slider
                    value={scores[dim.key]}
                    onChange={(v) => setScores((prev) => ({ ...prev, [dim.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Your review"
            rows={3}
            required
            placeholder="Share your honest experience living here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Textarea
            label="What I wish I knew before moving in (optional)"
            rows={2}
            placeholder="e.g. Electricity is billed separately during summer"
            value={whatIWishIKnew}
            onChange={(e) => setWhatIWishIKnew(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stay duration (months, optional)"
              type="number"
              min={1}
              value={stayDurationMonths}
              onChange={(e) => setStayDurationMonths(e.target.value)}
              hint="Adding this shows a 'Verified stay details' badge"
            />
            <Select label="Room type (optional)" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="">Select...</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </Select>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Submit review
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default ReviewFormModal;
