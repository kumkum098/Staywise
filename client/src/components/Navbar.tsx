import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, GitCompare, LogOut, Building2, UserCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { ROUTES } from '../routes';
import { Avatar } from './ui/Avatar';
import { Tooltip } from './ui/Tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/DropdownMenu';

export const Navbar: React.FC = () => {
  const { user, logout, savedPropertyIds } = useAuth();
  const { compareProperties } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to={ROUTES.home} className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-lg shadow-subtle group-hover:bg-brand-800 transition-colors">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-ink-primary group-hover:text-brand-700 transition-colors">
                  Staywise
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold -mt-1">
                  Jaipur
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to={ROUTES.explore}
                className={`text-sm font-medium transition-colors ${
                  isActive('/explore') ? 'text-brand-700 font-semibold' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Explore
              </Link>
              <Link
                to={`${ROUTES.explore}?propertyType=pg`}
                className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
              >
                PGs
              </Link>
              <Link
                to={`${ROUTES.explore}?propertyType=hostel`}
                className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Hostels
              </Link>
              <Link
                to={`${ROUTES.explore}?propertyType=coliving`}
                className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Co-Living
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Compare Badge Link */}
            {compareProperties.length > 0 && (
              <Link
                to={ROUTES.compare}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md hover:bg-brand-100 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
                <span className="ml-1 px-1.5 py-0.5 bg-brand-700 text-white rounded-full text-[10px]">
                  {compareProperties.length}
                </span>
              </Link>
            )}

            {/* Saved Link */}
            <Tooltip content="Saved properties">
              <Link
                to={ROUTES.saved}
                className="relative p-2 text-ink-secondary hover:text-brand-700 transition-colors rounded-md hover:bg-surface-muted"
              >
                <Bookmark className="w-5 h-5" />
                {savedPropertyIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-700 rounded-full"></span>
                )}
              </Link>
            </Tooltip>

            {/* Owner CTA / Auth Buttons */}
            {user?.role === 'owner' || user?.role === 'admin' ? (
              <Link
                to={ROUTES.owner}
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-ink-primary bg-surface-muted hover:bg-gray-200 rounded-lg transition-colors border border-surface-border"
              >
                <Building2 className="w-4 h-4 text-brand-700" />
                <span>Owner Portal</span>
              </Link>
            ) : (
              <Link
                to={`${ROUTES.register}?role=owner`}
                className="hidden sm:inline-flex text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors px-2 py-1"
              >
                List your property
              </Link>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 transition-subtle hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30">
                    <Avatar name={user.name} className="h-8 w-8 text-xs" />
                    <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.profile}>
                      <UserCircle className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.saved}>
                      <Bookmark className="h-4 w-4" /> Saved properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to={ROUTES.login}
                  className="px-3.5 py-1.5 text-xs font-semibold text-ink-primary hover:text-brand-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.register}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 transition-colors rounded-lg shadow-subtle"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
