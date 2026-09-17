import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, MessageSquare } from 'lucide-react';
import { ROUTES } from '../../routes';
import { cn } from '../../components/ui/cn';

const navItems = [
  { to: ROUTES.owner, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.ownerProperties, label: 'Properties', icon: Building2, end: false },
  { to: ROUTES.ownerInquiries, label: 'Inquiries & Visits', icon: MessageSquare, end: false },
];

export const OwnerLayout: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-display text-ink-primary">Owner Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">Manage your properties, rooms, and incoming requests.</p>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto md:w-48 md:flex-col md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-subtle',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-secondary hover:bg-surface-muted'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OwnerLayout;
