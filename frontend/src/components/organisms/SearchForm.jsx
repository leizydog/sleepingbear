import React from 'react';
import SearchBar from '../molecules/SearchBar';
import PriceRange from '../molecules/PriceRange';
import Button from '../atoms/Button';

const SearchForm = ({ onSearch }) => {
  return (
    <div className="w-full max-w-[600px] bg-white rounded-[30px] px-8 pt-10 pb-16 relative shadow-xl mx-auto mt-10">
      <h2 className="text-center text-4xl font-extrabold mb-10 text-black">
        Find a Place
      </h2>

      {/* Search Bar 1: Type of Unit */}
      <SearchBar 
        icon="Search" 
        placeholder="Type of Unit" 
      />

      {/* Search Bar 2: Location */}
      <SearchBar 
        icon="Search" 
        placeholder="Location" 
      />

      {/* Price Range Molecule */}
      <PriceRange />

      {/* Search Button (Purple Pill) */}
      <Button 
        variant="primary" 
        onClick={onSearch}
      >
        Search
      </Button>
    </div>
  );
};

export default SearchForm;