import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-surface-border mt-16 text-xs text-ink-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
              <span className="font-bold text-base text-ink-primary">Staywise</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Know the place before you move in. Discover, evaluate, and compare student PGs and co-living residences in Jaipur by true monthly cost.
            </p>
          </div>

          {/* Explore Hubs */}
          <div className="space-y-2">
            <h4 className="font-semibold text-ink-primary text-xs uppercase tracking-wider">Explore Jaipur Hubs</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/explore?area=Malviya Nagar" className="hover:text-brand-700 transition-colors">
                  Malviya Nagar (MNIT)
                </Link>
              </li>
              <li>
                <Link to="/explore?area=Jagatpura" className="hover:text-brand-700 transition-colors">
                  Jagatpura (JECRC & SKIT)
                </Link>
              </li>
              <li>
                <Link to="/explore?area=Mansarovar" className="hover:text-brand-700 transition-colors">
                  Mansarovar
                </Link>
              </li>
              <li>
                <Link to="/explore?area=Vaishali Nagar" className="hover:text-brand-700 transition-colors">
                  Vaishali Nagar
                </Link>
              </li>
              <li>
                <Link to="/explore?area=C-Scheme" className="hover:text-brand-700 transition-colors">
                  C-Scheme & Raja Park
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Owners */}
          <div className="space-y-2">
            <h4 className="font-semibold text-ink-primary text-xs uppercase tracking-wider">For Property Owners</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to={ROUTES.owner} className="hover:text-brand-700 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ownerPropertyNew} className="hover:text-brand-700 transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ownerInquiries} className="hover:text-brand-700 transition-colors">
                  Manage Tenant Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparent Guarantees */}
          <div className="space-y-2">
            <h4 className="font-semibold text-ink-primary text-xs uppercase tracking-wider">Staywise Standard</h4>
            <ul className="space-y-1.5 text-ink-secondary">
              <li>✓ True Monthly Cost Transparency</li>
              <li>✓ Multi-dimensional Living Score</li>
              <li>✓ Verified House Rules & Restrictions</li>
              <li>✓ Direct Visit Scheduling</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-muted">
          <p>© {new Date().getFullYear()} Staywise Technologies. Built for student & young professional accommodation clarity.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span>Jaipur, Rajasthan, India</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
