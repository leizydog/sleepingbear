import React, { useState, useEffect } from 'react';

// --- COMPONENTS ---
import Header from '../components/organisms/Header';
import HomeSearchSection from '../components/organisms/HomeSearchSection';
import FeaturedListings from '../components/organisms/FeaturedListings';
import PromoBanner from '../components/organisms/PromoBanner'; // Added PromoBanner

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
                
                // ✅ FIX: Access 'response.properties' directly (api.js already unwraps .data)
                const dataList = response.properties || []; 

                const formattedProps = dataList.map(p => ({
                    id: p.id,
                    image: p.image_url || 'https://via.placeholder.com/400',
                    location: p.address,
                    unitType: p.name, 
                    price: `₱${p.price_per_month.toLocaleString()}/month`
                }));

                setProperties(formattedProps);
                // Don't show all properties immediately in "Search Results", 
                // but we can show them in "Featured" if needed.
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
        setLoading(true);
        // Simulate a small delay for UX or filter immediately
        setTimeout(() => {
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
            setLoading(false);
        }, 500);
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
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80"></div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans text-gray-900 relative overflow-x-hidden">
            {renderBackground()}

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header isLoggedIn={!!user} />

                <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
                    
                    {/* HERO SECTION */}
                    <div className="text-center mb-16 space-y-6 animate-fade-in-up">
                        <div className="inline-block bg-white/70 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-sm border border-white/50">
                            <h1 className="text-4xl md:text-6xl font-extrabold font-serif text-gray-900 mb-2 leading-tight">
                                Find Your <span className="text-[#a86add]">Perfect Home</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-700 font-medium">
                                Discover comfort and luxury in the heart of the city.
                            </p>
                        </div>
                    </div>
                    
                    {/* SEARCH SECTION */}
                    <div className="mb-16 relative z-20">
                        <HomeSearchSection onSearch={handleSearch} />
                    </div>

                    {/* PROMO BANNER (Only show if no search performed yet) */}
                    {!searchPerformed && (
                        <div className="mb-16 animate-fade-in">
                            <PromoBanner />
                        </div>
                    )}

                    {/* RESULTS / FEATURED SECTION */}
                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[30px] shadow-xl border border-white/60 transition-all duration-300 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold font-serif text-gray-900">
                                {searchPerformed ? 'Search Results' : 'Featured Properties'}
                            </h2>
                            {searchPerformed && (
                                <button 
                                    onClick={() => { setSearchPerformed(false); setFilteredResults(properties); }}
                                    className="text-sm text-[#a86add] font-semibold hover:underline"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                        
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <FeaturedListings properties={filteredResults} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-300 rounded-2xl">
                                <div className="text-6xl mb-4">🏠</div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Properties Found</h3>
                                <p className="text-gray-500">We couldn't find any matches for your criteria.</p>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default LandingPage;