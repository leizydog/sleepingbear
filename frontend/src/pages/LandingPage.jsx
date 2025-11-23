import React, { useState } from 'react';
import Header from '../components/organisms/Header';
import HomeSearchSection from '../components/organisms/HomeSearchSection';
import FeaturedListings from '../components/organisms/FeaturedListings';
import { useAuth } from '../context/AuthContext';

const allProperties = [
    { id: 'PR-201', image: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e', location: '123 Pasig St., Pasig City', unitType: '2-Bedroom Condo', price: '₱25,000/month' },
    { id: 'PR-202', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', location: '456 BGC, Taguig City', unitType: 'Studio Unit', price: '₱20,000/month' },
    { id: 'PRT001', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', location: 'BGC, Taguig', unitType: 'Studio (SMDC Grass)', price: '₱18,000/month' },
    { id: 'PRT002', image: 'https://images.unsplash.com/photo-1512918760383-eda2723ad13e', location: 'The Rise, Makati City', unitType: '1-Bedroom Condo', price: '₱12,000/month' },
    { id: 'PRT004', image: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3', location: 'Antipolo', unitType: '2-Bedroom', price: '₱10,000/month' },
];

const LandingPage = () => {
    const [filteredResults, setFilteredResults] = useState(allProperties);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { user } = useAuth();

    const handleSearch = (filters) => {
        // Implement the search filtering logic
        const results = allProperties.filter(prop => {
            const matchLoc = filters.location ? prop.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
            const matchType = filters.unitType ? prop.unitType.toLowerCase().includes(filters.unitType.toLowerCase()) : true;
            
            // Note: Price range filtering logic would be more complex but is skipped for this basic functional filter.
            return matchLoc && matchType;
        });

        setFilteredResults(results);
        setSearchPerformed(true);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Header shows Login button */}
            <Header isLoggedIn={!!user} />

            <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
                <div className="mb-12 animate-slide-up text-center md:text-left">
                    <h1 className="text-5xl font-extrabold font-serif text-gray-900 mb-4">
                        Find Your <span className="text-[#a86add]">Perfect Home</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl">
                        Search here to view available listings instantly.
                    </p>
                </div>
                
                {/* Search Bar */}
                <HomeSearchSection onSearch={handleSearch} />

                {/* Conditional Results Section */}
                {searchPerformed && (
                    <>
                        <hr className="border-gray-100 my-10" />
                        <h2 className="text-3xl font-extrabold font-serif text-gray-900 mb-4">
                           Search Results
                        </h2>
                        <p className="text-gray-600 mb-8">{filteredResults.length} properties found matching your criteria.</p>

                        <FeaturedListings properties={filteredResults} />
                        
                        {filteredResults.length === 0 && (
                            <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-xl">
                                No properties matched your search.
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default LandingPage;