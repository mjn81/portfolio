'use client'

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface PageLoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: Dispatch<SetStateAction<boolean>>;
}

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined);

export const PageLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isPageLoading, setIsPageLoading] = useState(true); // Default to true, page starts loading
  return (
    <PageLoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
      {children}
    </PageLoadingContext.Provider>
  );
};

export const usePageLoading = () => {
  const context = useContext(PageLoadingContext);
  if (context === undefined) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider');
  }
  return context;
}; 