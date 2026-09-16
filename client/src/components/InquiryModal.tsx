import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

interface InquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ property, isOpen, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>(
    `Hi, I am interested in ${property.name} in ${property.location.area}. Is a double room available for move-in next month?`
  );
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createInquiry({
        propertyId: property._id,
        message,
        phone,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry. Please login to continue.');
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
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-bold text-ink-primary">Enquire about Property</h3>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Send a direct message to <span className="font-semibold text-ink-primary">{property.name}</span> management.
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">Your Phone / WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-surface-border rounded-lg text-xs focus:ring-1 focus:ring-brand-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg text-xs focus:ring-1 focus:ring-brand-700 outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-lg transition-colors shadow-subtle disabled:opacity-50"
              >
                {loading ? 'Sending Inquiry...' : 'Send Inquiry Message'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-ink-primary">Inquiry Sent!</h3>
            <p className="text-xs text-ink-secondary max-w-xs mx-auto">
              The property manager has received your message and will respond via your profile or contact details.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
