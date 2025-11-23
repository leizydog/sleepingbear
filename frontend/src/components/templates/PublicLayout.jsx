import React from 'react';
import Header from '../organisms/Header';

const PublicLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen font-sans text-gray-900">
      {/* 1. Background Image Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed' // Parallax effect
        }}
      />

      {/* 2. Blue Overlay Layer (The "Sleeping Bear" Tint) */}
      <div className="absolute inset-0 z-0 bg-blue-200/40 backdrop-blur-[2px]" />

      {/* 3. Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex items-center justify-center p-4 pb-20 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;