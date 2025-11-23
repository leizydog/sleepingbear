import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import PaymentProgress from '../../components/molecules/PaymentProgress';
import BookingSuccess from '../../components/organisms/BookingSuccess';

const ConfirmationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#e6e6e6] font-sans pb-20">
      <Header />
      
      <div className="px-4 pt-10">
        {/* Progress Bar set to Step 3 */}
        <PaymentProgress step={3} />
        
        {/* Success Card */}
        <BookingSuccess 
          onDownload={() => alert("Downloading Receipt...")}
          onHome={() => navigate('/search')}
        />
      </div>
    </div>
  );
};

export default ConfirmationPage;