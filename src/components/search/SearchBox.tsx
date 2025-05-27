
import React from 'react';
import { X } from 'lucide-react';

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  clearSearch 
}) => {
  return (
    <form onSubmit={handleSearch} className="relative mb-6 animate-fade-in">
      <input 
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for products..."
        className="input-field pl-10 py-3 w-full border rounded-lg"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m19 19-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      
      {searchQuery && (
        <button 
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <X size={18} className="text-gray-400" />
        </button>
      )}
    </form>
  );
};

export default SearchBox;
