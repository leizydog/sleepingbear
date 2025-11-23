import React, { useState, useEffect } from 'react';

// --- COMPONENTS ---
import Header from '../components/organisms/Header';
import HomeSearchSection from '../components/organisms/HomeSearchSection';
import FeaturedListings from '../components/organisms/FeaturedListings';

// --- CONTEXT & SERVICES ---
import { useAuth } from '../context/AuthContext';
import { propertyAPI } from '../services/api'; 

// --- ASSETS ---
import bgImage from '../assets/B.jpg'; 

const LandingPage = () => {
    // ==============================
    // 1. STATE MANAGEMENT
    // ==============================
    const [properties, setProperties] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // ==============================
    // 2. EFFECTS (DATA FETCHING)
    // ==============================
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await propertyAPI.getAll();
                
                const formattedProps = response.data.properties.map(p => ({
                    id: p.id,
                    image: p.image_url || 'https://via.placeholder.com/400',
                    location: p.address,
                    unitType: p.name, 
                    price: `₱${p.price_per_month.toLocaleString()}/month`
                }));

                setProperties(formattedProps);
                setFilteredResults(formattedProps);
            } catch (error) {
                console.error("Failed to load properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    // ==============================
    // 3. HANDLERS
    // ==============================
    const handleSearch = (filters) => {
        const results = properties.filter(prop => {
            const matchLoc = filters.location 
                ? prop.location.toLowerCase().includes(filters.location.toLowerCase()) 
                : true;
            const matchType = filters.unitType 
                ? prop.unitType.toLowerCase().includes(filters.unitType.toLowerCase()) 
                : true;
            return matchLoc && matchType;
        });

        setFilteredResults(results);
        setSearchPerformed(true);
    };

    // ==============================
    // 4. RENDER HELPERS
    // ==============================
    
    const renderBackground = () => (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <img 
                src={bgImage} 
                alt="Background" 
                className="w-full h-full object-cover opacity-90" 
            />
            <div className="absolute inset-0 bg-white/40"></div>
        </div>
    );

    const renderResultsSection = () => {
        if (!searchPerformed && loading) return null;

        return (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl mt-10 shadow-lg animate-fade-in">
                <h2 className="text-3xl font-extrabold font-serif text-gray-900 mb-4">
                    {searchPerformed ? 'Search Results' : 'Featured Listings'}
                </h2>
                
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600 font-bold animate-pulse">Loading properties...</p>
                    </div>
                ) : filteredResults.length > 0 ? (
                    <FeaturedListings properties={filteredResults} />
                ) : (
                    <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-xl">
                        No properties found matching your criteria.
                    </div>
                )}
            </div>
        );
    };

    // ==============================
    // 5. MAIN RENDER
    // ==============================
    return (
        <div className="min-h-screen font-sans text-gray-900 relative overflow-hidden">
            {renderBackground()}

            <div className="relative z-10">
                <Header isLoggedIn={!!user} />

                {/* INCREASED TOP PADDING (pt-28) TO ACCOUNT FOR FIXED HEADER */}
                <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20">
                    
                    <div className="mb-12 animate-slide-up text-center md:text-left bg-white/60 backdrop-blur-sm p-8 rounded-3xl inline-block shadow-sm border border-white/50">
                        <h1 className="text-5xl font-extrabold font-serif text-gray-900 mb-4 leading-tight">
                            Find Your <span className="text-[#a86add]">Perfect Home</span>
                        </h1>
                        <p className="text-xl text-gray-800 font-semibold max-w-2xl">
                            Search here to view available listings instantly.
                        </p>
                    </div>
                    
                    <HomeSearchSection onSearch={handleSearch} />

                    {renderResultsSection()}

                </main>
            </div>
        </div>
    );
};

export default LandingPage;