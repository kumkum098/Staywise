import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createInquiry({ propertyId: property._id, message, phone });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send inquiry. Please login to continue.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enquire about property">
      {!submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            Send a direct message to <span className="font-semibold text-ink-primary">{property.name}</span> management.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your phone / WhatsApp (optional)"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <Textarea
              label="Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={loading}>
              Send inquiry message
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-ink-primary">Inquiry sent!</h3>
          <p className="mx-auto max-w-xs text-sm text-ink-secondary">
            The property manager has received your message and will respond via your profile or contact details.
          </p>
          <Button className="mt-2" onClick={handleClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
};
