import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQueryInternal] = useState('');
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryInternal(query);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}


