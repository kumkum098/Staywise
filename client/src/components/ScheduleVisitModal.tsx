import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';

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
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

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
    setError('');

    try {
      await api.scheduleVisit({
        propertyId: property._id,
        date: selectedDate,
        time: selectedTime,
        notes,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule visit. Please login if not authenticated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative border border-surface-border space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink-primary p-1 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div>
              <div className="flex items-center space-x-2 text-brand-700">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-bold text-ink-primary">Schedule a Visit</h3>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Book a walk-through for <span className="font-semibold text-ink-primary">{property.name}</span> in {property.location.area}.
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Date selection */}
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">Select Visit Date</label>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        selectedDate === d.date
                          ? 'border-brand-700 bg-brand-50 text-brand-900 font-semibold'
                          : 'border-surface-border text-ink-secondary hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-medium text-ink-primary text-xs">{d.label}</span>
                      <span className="text-[10px] text-ink-muted block">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot selection */}
              <div>
                <label className="block font-semibold text-ink-primary mb-1.5">Select Time Slot</label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        selectedTime === time
                          ? 'border-brand-700 bg-brand-700 text-white'
                          : 'border-surface-border text-ink-secondary hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional notes */}
              <div>
                <label className="block font-semibold text-ink-primary mb-1">Specific Questions or Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Would like to see the single room AC option"
                  className="w-full px-3 py-2 border border-surface-border rounded-lg text-xs focus:ring-1 focus:ring-brand-700 outline-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-lg transition-colors shadow-subtle disabled:opacity-50"
              >
                {loading ? 'Confirming Visit...' : 'Confirm Visit Request'}
              </button>
            </form>
          </>
        ) : (
          /* Success confirmation screen */
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-ink-primary">Visit Request Confirmed!</h3>
            <p className="text-xs text-ink-secondary max-w-xs mx-auto">
              Your visit request for <span className="font-semibold text-ink-primary">{selectedDate}</span> at{' '}
              <span className="font-semibold text-ink-primary">{selectedTime}</span> has been sent to the property owner.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
