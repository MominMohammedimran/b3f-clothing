
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProfileSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearchChange?: (value: string) => void;
}

const ProfileSearchBar = ({ searchTerm, setSearchTerm, onSearchChange }: ProfileSearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 bg-white"
      />
    </div>
  );
};

export default ProfileSearchBar;
