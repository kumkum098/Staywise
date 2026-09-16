import React, { createContext, useContext, useState } from 'react';
import { Property } from '../types';

interface CompareContextType {
  compareProperties: Property[];
  addToCompare: (property: Property) => boolean;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareProperties, setCompareProperties] = useState<Property[]>([]);

  const addToCompare = (property: Property): boolean => {
    if (compareProperties.some((p) => p._id === property._id)) {
      return true; // Already added
    }
    if (compareProperties.length >= 3) {
      return false; // Max 3 properties limit
    }
    setCompareProperties((prev) => [...prev, property]);
    return true;
  };

  const removeFromCompare = (propertyId: string) => {
    setCompareProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  const clearCompare = () => {
    setCompareProperties([]);
  };

  const isInCompare = (propertyId: string) => {
    return compareProperties.some((p) => p._id === propertyId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProperties,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
