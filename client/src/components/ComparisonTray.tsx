import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { ROUTES } from '../routes';

export const ComparisonTray: React.FC = () => {
  const { compareProperties, removeFromCompare, clearCompare } = useCompare();

  if (compareProperties.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-ink-primary text-white rounded-xl shadow-2xl p-3 sm:p-4 border border-gray-700 flex items-center justify-between space-x-3">
        {/* Left Info & Items */}
        <div className="flex items-center space-x-3 overflow-x-auto py-1 scrollbar-none">
          <div className="hidden sm:flex items-center space-x-1.5 shrink-0 pr-2 border-r border-gray-700 text-xs font-semibold">
            <GitCompare className="w-4 h-4 text-brand-500" />
            <span>{compareProperties.length} / 3 Selected</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {compareProperties.map((property) => (
              <div
                key={property._id}
                className="flex items-center space-x-2 bg-gray-800 rounded-lg px-2.5 py-1.5 border border-gray-700 text-xs"
              >
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-7 h-7 rounded object-cover shrink-0"
                />
                <div className="max-w-[100px] truncate">
                  <span className="font-semibold block truncate">{property.name}</span>
                  <span className="text-[10px] text-gray-400">₹{property.pricing.startingRent}</span>
                </div>
                <button
                  onClick={() => removeFromCompare(property._id)}
                  className="text-gray-400 hover:text-white transition-colors p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
          >
            Clear
          </button>
          <Link
            to={ROUTES.compare}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors shadow-subtle"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
