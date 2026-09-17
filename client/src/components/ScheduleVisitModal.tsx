import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Property } from '../types';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from './ui/cn';

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({ property, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const dates = [
    { label: 'Today', date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
    {
      label: 'Tomorrow',
      date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      label: 'In 2 Days',
      date: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      label: 'In 3 Days',
      date: new Date(Date.now() + 259200000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
  ];

  const timeSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.scheduleVisit({ propertyId: property._id, date: selectedDate, time: selectedTime, notes });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule visit. Please login if not authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule a visit">
      {!submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            Book a walk-through for <span className="font-semibold text-ink-primary">{property.name}</span> in{' '}
            {property.location.area}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Select visit date</label>
              <div className="grid grid-cols-2 gap-2">
                {dates.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setSelectedDate(d.date)}
                    className={cn(
                      'rounded-lg border p-2.5 text-left transition-subtle',
                      selectedDate === d.date
                        ? 'border-brand-700 bg-brand-50 font-semibold text-brand-900'
                        : 'border-surface-border text-ink-secondary hover:border-gray-300'
                    )}
                  >
                    <span className="block text-xs font-medium text-ink-primary">{d.label}</span>
                    <span className="block text-[10px] text-ink-muted">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Select time slot</label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-subtle',
                      selectedTime === time
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-surface-border text-ink-secondary hover:border-gray-300'
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Specific questions or notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Would like to see the single room AC option"
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Confirm visit request
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-ink-primary">Visit request confirmed!</h3>
          <p className="mx-auto max-w-xs text-sm text-ink-secondary">
            Your visit request for <span className="font-semibold text-ink-primary">{selectedDate}</span> at{' '}
            <span className="font-semibold text-ink-primary">{selectedTime}</span> has been sent to the property owner.
          </p>
          <Button className="mt-2" onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};
