import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Loader2, Share2, Heart } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; 

// --- SERVICES & CONTEXT ---
import { propertyAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/organisms/Header';

const PropertyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // --- BOOKING STATE ---
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [occupiedDates, setOccupiedDates] = useState([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Property Details
                const propData = await propertyAPI.getOne(id);
                setProperty(propData);

                // 2. Get Occupied Dates (To block in calendar)
                try {
                    const occupiedData = await bookingAPI.getOccupiedDates(id);
                    // Check if data exists before mapping
                    if (occupiedData && Array.isArray(occupiedData)) {
                        const blockedIntervals = occupiedData.map(booking => ({
                            start: new Date(booking.start_date),
                            end: new Date(booking.end_date)
                        }));
                        setOccupiedDates(blockedIntervals);
                    }
                } catch (err) {
                    console.warn("Could not fetch occupied dates", err);
                }

            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- HANDLERS ---
    const onChangeDates = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const handleBookNow = async () => {
        if (!user) {
            alert("Please login to book this property.");
            navigate('/login');
            return;
        }

        if (!startDate || !endDate) {
            alert("Please select a move-in and move-out date.");
            return;
        }

        setProcessing(true);
        try {
            const bookingData = {
                property_id: property.id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            };

            const response = await bookingAPI.create(bookingData);
            
            // Navigate to Payment
            navigate('/payment', { state: { bookingId: response.id } });

        } catch (error) {
            console.error("Booking failed:", error);
            const errorMessage = error.response?.data?.detail || "Booking failed. Dates might be taken.";
            alert(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        if (!property || !startDate || !endDate) return "0.00";
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays === 0) return "0.00";
        
        // Whole month logic (Round UP)
        const months = Math.ceil(diffDays / 30); 
        return (property.price_per_month * months).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    // --- RENDER ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#a86add]" size={48} />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800">Property Not Found</h1>
                <button onClick={() => navigate('/')} className="text-[#a86add] mt-4 hover:underline">Go Home</button>
            </div>
        );
    }

    const allImages = property.images && property.images.length > 0 
        ? property.images 
        : [property.image_url || "https://via.placeholder.com/800x600?text=No+Image"];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Header isLoggedIn={!!user} />

            <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-[#a86add] transition-colors mb-6 font-medium"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Listings
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    
                    {/* LEFT: Images Gallery */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video w-full bg-gray-200 rounded-3xl overflow-hidden shadow-lg relative">
                            <img 
                                src={allImages[selectedImage]} 
                                alt={property.name} 
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="p-2 rounded-full bg-white/90 text-gray-600 hover:text-red-500 transition-colors shadow-sm">
                                    <Heart size={20} />
                                </button>
                                <button className="p-2 rounded-full bg-white/90 text-gray-600 hover:text-blue-500 transition-colors shadow-sm">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#a86add] ring-2 ring-purple-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{property.name}</h1>
                                <p className="flex items-center text-gray-500 text-sm">
                                    <MapPin size={16} className="mr-1 text-[#a86add]" /> 
                                    {property.address}
                                </p>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-extrabold text-[#a86add]">₱{property.price_per_month.toLocaleString()}</span>
                                <span className="text-gray-400 font-medium">/ month</span>
                            </div>

                            {/* SMART CALENDAR */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Dates</label>
                                <div className="border-2 border-gray-200 rounded-xl overflow-hidden p-1 flex justify-center bg-gray-50">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={onChangeDates}
                                        startDate={startDate}
                                        endDate={endDate}
                                        selectsRange
                                        inline
                                        excludeDateIntervals={occupiedDates} // BLOCKS BOOKED DATES
                                        minDate={new Date()} 
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">Dates in gray are already booked.</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                                <span className="text-sm font-bold text-purple-900">Est. Total</span>
                                <span className="text-lg font-extrabold text-purple-900">₱{calculateTotal()}</span>
                            </div>

                            <button 
                                onClick={handleBookNow}
                                disabled={!property.is_available || processing}
                                className="w-full bg-[#3a2a22] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-[#5a4235] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                            </button>
                            
                            {!property.is_available && (
                                <p className="text-center text-xs text-red-500 font-bold mt-3 bg-red-50 py-2 rounded-lg">
                                    This property is currently unavailable.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- INFO SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Features */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Property Features</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                                    <Bed size={24} className="text-[#a86add] mb-2" />
                                    <span className="font-bold text-gray-900">{property.bedrooms} Bedrooms</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                                    <Bath size={24} className="text-[#a86add] mb-2" />
                                    <span className="font-bold text-gray-900">{property.bathrooms} Bathrooms</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                                    <Maximize size={24} className="text-[#a86add] mb-2" />
                                    <span className="font-bold text-gray-900">{property.size_sqm} sqm</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {property.description || "No description provided for this unit."}
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default PropertyDetailsPage;