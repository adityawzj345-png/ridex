import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import './Booking.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const bikeId = searchParams.get('bike');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [durationHours, setDurationHours] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bikeId) {
      navigate('/bikes');
      return;
    }

    const fetchBike = async () => {
      try {
        const data = await apiFetch(`/bikes/${bikeId}`);
        setBike(data);
      } catch (err) {
        setError('Failed to load bike details');
      } finally {
        setLoading(false);
      }
    };
    fetchBike();
  }, [bikeId, navigate, user]);

  // Calculate estimated total
  useEffect(() => {
    if (startDate && endDate && bike) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 0) {
        setDurationHours(hours.toFixed(1));
        setEstimatedTotal((hours * bike.price_per_hour).toFixed(2));
      } else {
        setDurationHours(0);
        setEstimatedTotal(0);
      }
    }
  }, [startDate, endDate, bike]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (estimatedTotal <= 0) {
      alert("Please select valid dates. End date must be after start date.");
      return;
    }
    
    if (!cardNumber || cardNumber.length < 16) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Process Mock Payment
      await apiFetch('/payment/process', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(estimatedTotal),
          card_number: cardNumber
        })
      });

      // 2. Create Booking
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();
      
      await apiFetch('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          bike_id: bikeId,
          start_time: startIso,
          end_time: endIso
        })
      });
      
      alert("Payment successful! Booking confirmed.");
      navigate('/my-bookings');
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="booking-page animate-fade-in"><div className="text-center" style={{paddingTop: '100px'}}>Loading...</div></div>;
  if (error || !bike) return <div className="booking-page animate-fade-in"><div className="text-center error-message" style={{paddingTop: '100px'}}>{error || "Bike not found"}</div></div>;

  return (
    <div className="booking-page animate-fade-in">
      <div className="booking-container">
        
        <div className="booking-details glass-panel">
          <div className="badge">Booking Details</div>
          <h2>{bike.brand} {bike.name}</h2>
          <div className="price-tag">
            <span className="currency">$</span>
            <span className="amount">{bike.price_per_hour}</span>
            <span className="period">/hour</span>
          </div>
          
          <div className="summary-box">
            <p className="summary-title">Ride Summary</p>
            <div className="summary-row">
              <span>Duration</span>
              <span>{durationHours > 0 ? `${durationHours} hours` : 'Pending'}</span>
            </div>
            <div className="summary-row">
              <span>Taxes & Fees</span>
              <span>Included</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Estimated Total</span>
              <span className="text-accent">{estimatedTotal > 0 ? `$${estimatedTotal}` : 'Select Dates'}</span>
            </div>
          </div>
        </div>
        
        <div className="booking-form-wrapper glass-panel">
          <h2>Schedule Your Ride</h2>
          <p className="form-subtitle">Choose your pickup and drop-off times.</p>
          
          <form onSubmit={handleBooking} className="booking-form">
            <div className="form-group">
              <label>Pickup Date & Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Drop-off Date & Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {estimatedTotal > 0 && (
              <div className="payment-section" style={{marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                <h3 style={{marginBottom: '1rem'}}>Payment Details</h3>
                <div className="form-group">
                  <label>Card Number (Mock)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9101 1121"
                    maxLength="16"
                    required
                  />
                </div>
              </div>
            )}
            
            <button type="submit" className="btn-primary booking-submit" disabled={isProcessing || estimatedTotal <= 0}>
              {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}