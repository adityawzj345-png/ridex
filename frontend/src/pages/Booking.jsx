import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import './Booking.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const bikeId = searchParams.get('bike');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Schedule states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bike, setBike] = useState(null);
  const [stations, setStations] = useState([]);
  
  // Custom Locations (User khud fill kare)
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupStationId, setPickupStationId] = useState('');
  const [dropoffStationId, setDropoffStationId] = useState('');
  const [returnToSameStation, setReturnToSameStation] = useState(true);
  
  // WhatsApp Notification State
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Duration & Pricing
  const [durationHours, setDurationHours] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Payment Gateway Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentGateway] = useState('razorpay');
  const [paymentTab, setPaymentTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [customUpiId, setCustomUpiId] = useState('rider@okaxis');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8920 1124 9081',
    name: user?.name || 'RideX Rider',
    expiry: '12/28',
    cvv: '883'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('checkout'); // 'checkout', 'processing', 'success'
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [whatsappInfo, setWhatsappInfo] = useState(null);
  const [kycError, setKycError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bikeId) {
      navigate('/bikes');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [bikeData, stationsData] = await Promise.all([
          apiFetch(`/bikes/${bikeId}`),
          apiFetch('/stations/')
        ]);

        setBike(bikeData);
        setStations(stationsData);

        // Pre-fill initial locations based on bike station or first hub
        const initialStation = stationsData.find(s => s.id === bikeData.station_id) || stationsData[0];
        if (initialStation) {
          setPickupStationId(initialStation.id);
          setDropoffStationId(initialStation.id);
          const defaultLoc = `${initialStation.name}, ${initialStation.city}`;
          setPickupLocation(defaultLoc);
          setDropoffLocation(defaultLoc);
        }

        if (user.phone) {
          setWhatsappNumber(user.phone);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bikeId, navigate, user]);

  // Synchronize dropoff location if returnToSameStation is checked
  useEffect(() => {
    if (returnToSameStation) {
      setDropoffLocation(pickupLocation);
      setDropoffStationId(pickupStationId);
    }
  }, [returnToSameStation, pickupLocation, pickupStationId]);

  // Calculate estimated duration & total price
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

  // Handle Preset Hub selection to autofill text inputs
  const handleSelectPickupPreset = (station) => {
    setPickupStationId(station.id);
    const locText = `${station.name}, ${station.city} (${station.address})`;
    setPickupLocation(locText);
    if (returnToSameStation) {
      setDropoffLocation(locText);
      setDropoffStationId(station.id);
    }
  };

  const handleSelectDropoffPreset = (station) => {
    setDropoffStationId(station.id);
    setDropoffLocation(`${station.name}, ${station.city} (${station.address})`);
  };

  // Handle Opening Checkout Modal and Creating Order
  const handleInitiateCheckout = async (e) => {
    e.preventDefault();
    setKycError(null);

    if (estimatedTotal <= 0) {
      alert("Please select valid dates. Drop-off date must be after pickup date.");
      return;
    }

    if (!pickupLocation.trim()) {
      alert("Kripya booking ki jagah (Pickup Location) fill karein.");
      return;
    }

    const finalDropoff = returnToSameStation ? pickupLocation : dropoffLocation;
    if (!finalDropoff.trim()) {
      alert("Kripya bike chhodne ki jagah (Drop-off Location) fill karein.");
      return;
    }

    if (!whatsappNumber.trim()) {
      alert("Kripya apna WhatsApp mobile number enter karein taaki confirmation message receive ho sake.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Create Payment Order (Razorpay Sandbox)
      const order = await apiFetch('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(estimatedTotal),
          currency: 'INR',
          gateway: paymentGateway
        })
      });

      setOrderData(order);
      setPaymentStep('checkout');
      setIsCheckoutOpen(true);
    } catch (err) {
      alert("Error initiating checkout: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Payment Verification & Booking Creation
  const handleConfirmPayment = async () => {
    if (!orderData) return;

    setIsProcessingPayment(true);
    setPaymentStep('processing');

    try {
      const generatedPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const methodLabel = paymentTab === 'upi' 
        ? `Razorpay UPI (${selectedUpiApp})` 
        : paymentTab === 'card' 
          ? `Razorpay Card (*${cardDetails.number.slice(-4)})` 
          : `Razorpay NetBanking (${selectedBank})`;

      // 1. Verify Payment
      await apiFetch('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderData.order_id,
          payment_id: generatedPaymentId
        })
      });

      // 2. Create Booking with user filled custom locations and WhatsApp number
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();
      const finalDropoff = returnToSameStation ? pickupLocation : dropoffLocation;

      const bookingResponse = await apiFetch('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          bike_id: bikeId,
          start_time: startIso,
          end_time: endIso,
          total_price: parseFloat(estimatedTotal),
          pickup_station_id: pickupStationId ? parseInt(pickupStationId) : null,
          dropoff_station_id: returnToSameStation ? (pickupStationId ? parseInt(pickupStationId) : null) : (dropoffStationId ? parseInt(dropoffStationId) : null),
          pickup_location: pickupLocation.trim(),
          dropoff_location: finalDropoff.trim(),
          whatsapp_number: whatsappNumber.trim(),
          payment_method: methodLabel,
          payment_id: generatedPaymentId
        })
      });

      setConfirmedBooking(bookingResponse.booking);
      setWhatsappInfo(bookingResponse.whatsapp_notification);
      setPaymentStep('success');
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('kyc')) {
        setKycError(err.message);
        setIsCheckoutOpen(false);
      } else {
        alert("Payment / Booking failed: " + err.message);
        setPaymentStep('checkout');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page animate-fade-in">
        <div className="text-center" style={{paddingTop: '100px'}}>
          <div className="loading-spinner"></div>
          <h2>Loading booking details & rental stations...</h2>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="booking-page animate-fade-in">
        <div className="text-center error-message" style={{paddingTop: '100px'}}>
          <h2>{error || "Bike not found"}</h2>
          <Link to="/bikes" className="btn-primary" style={{marginTop: '1rem', display: 'inline-block'}}>
            Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page animate-fade-in">
      <div className="booking-container">
        
        {/* Left Side: Summary Box */}
        <div className="booking-details glass-panel">
          <div className="badge">Booking Summary</div>
          
          <div className="bike-preview-card">
            {bike.image_url?.includes('/') ? (
              <img src={bike.image_url} alt={bike.name} className="booking-bike-img" />
            ) : (
              <div className="bike-emoji-large">{bike.image_url || '🏍️'}</div>
            )}
            <div>
              <span className="bike-badge-small">{bike.type}</span>
              <h2>{bike.brand} {bike.name}</h2>
            </div>
          </div>

          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">{bike.price_per_hour}</span>
            <span className="period">/hour</span>
          </div>
          
          <div className="summary-box">
            <p className="summary-title">Ride Breakdown</p>
            <div className="summary-row">
              <span>Duration</span>
              <span className="highlight-text">{durationHours > 0 ? `${durationHours} hours` : 'Select dates'}</span>
            </div>
            <div className="summary-row">
              <span>Pickup Spot</span>
              <span className="station-summary-tag">
                📍 {pickupLocation || 'Not specified'}
              </span>
            </div>
            <div className="summary-row">
              <span>Drop-off Spot</span>
              <span className="station-summary-tag">
                🏁 {returnToSameStation ? pickupLocation : (dropoffLocation || 'Not specified')}
              </span>
            </div>
            <div className="summary-row">
              <span>WhatsApp Alerts</span>
              <span style={{color: '#25D366', fontWeight: 600}}>
                💬 {whatsappNumber ? whatsappNumber : 'Enabled'}
              </span>
            </div>
            <div className="summary-row">
              <span>Helmet & Taxes</span>
              <span style={{color: '#00e676'}}>Included Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total Payable</span>
              <span className="text-accent total-amount">
                {estimatedTotal > 0 ? `₹${estimatedTotal}` : '₹0.00'}
              </span>
            </div>
          </div>

          {/* WhatsApp Guarantee Alert */}
          <div className="secure-badge glass-panel" style={{marginTop: '20px', borderLeft: '4px solid #25D366'}}>
            <span className="shield-icon">📲</span>
            <div>
              <strong style={{color: '#25D366'}}>Instant WhatsApp Confirmation</strong>
              <p>Booking status, live receipt, and PIN will be sent directly to your WhatsApp.</p>
            </div>
          </div>
        </div>
        
        {/* Right Side: Form (Custom Locations, WhatsApp & Dates) */}
        <div className="booking-form-wrapper glass-panel">
          <h2>Schedule Your Ride</h2>
          <p className="form-subtitle">Enter your pickup and drop-off locations and choose your ride timings.</p>

          {kycError && (
            <div className="kyc-warning-banner glass-panel">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Driving License (KYC) Required:</strong>
                <p>{kycError}</p>
                <Link to="/profile" className="btn-primary btn-small" style={{marginTop: '0.5rem', display: 'inline-block'}}>
                  Complete KYC in Profile
                </Link>
              </div>
            </div>
          )}
          
          <form onSubmit={handleInitiateCheckout} className="booking-form">
            
            {/* Step 1: Location Inputs (User khud fill kare) */}
            <div className="form-section-title">
              <span className="section-step">1</span>
              <span>Pickup & Drop-off Locations (Aapki Jagah)</span>
            </div>

            {/* Pickup Location Custom Field */}
            <div className="form-group">
              <label>Booking / Pickup ki Jagah (Enter Pickup Address) <span className="required-star">*</span></label>
              <input 
                type="text" 
                className="form-control location-input" 
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Connaught Place Hub / Street address / Landmark"
                required
              />
              
              {/* Quick Preset Hubs */}
              {stations.length > 0 && (
                <div className="quick-presets">
                  <span className="presets-label">⚡ Quick Station Presets:</span>
                  <div className="preset-chips">
                    {stations.slice(0, 4).map(st => (
                      <button
                        key={st.id}
                        type="button"
                        className={`preset-chip ${pickupStationId === st.id ? 'active' : ''}`}
                        onClick={() => handleSelectPickupPreset(st)}
                      >
                        📍 {st.name} ({st.city})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Same Station Toggle */}
            <div className="same-station-toggle">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={returnToSameStation} 
                  onChange={(e) => setReturnToSameStation(e.target.checked)} 
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Bike usi jagah chhodenge jaha se pickup kiye hain (Same Location)</span>
              </label>
            </div>

            {/* Drop-off Location Custom Field (Conditional) */}
            {!returnToSameStation && (
              <div className="form-group animate-fade-in" style={{marginTop: '1.2rem'}}>
                <label>Bike Chhodne ki Jagah (Enter Return / Drop-off Address) <span className="required-star">*</span></label>
                <input 
                  type="text" 
                  className="form-control location-input" 
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="e.g. Bandra West Terminal / Home / Destination Landmark"
                  required
                />
                {/* Quick Presets for Drop-off */}
                {stations.length > 0 && (
                  <div className="quick-presets">
                    <span className="presets-label">⚡ Quick Drop-off Hubs:</span>
                    <div className="preset-chips">
                      {stations.slice(0, 4).map(st => (
                        <button
                          key={st.id}
                          type="button"
                          className={`preset-chip ${dropoffStationId === st.id ? 'active' : ''}`}
                          onClick={() => handleSelectDropoffPreset(st)}
                        >
                          🏁 {st.name} ({st.city})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Schedule Dates */}
            <div className="form-section-title" style={{marginTop: '2rem'}}>
              <span className="section-step">2</span>
              <span>Pickup & Drop-off Timings</span>
            </div>

            <div className="dates-grid">
              <div className="form-group">
                <label>Pickup Date & Time <span className="required-star">*</span></label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Drop-off Date & Time <span className="required-star">*</span></label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>

            {/* Step 3: WhatsApp Mobile Number for Confirmation Alert */}
            <div className="form-section-title" style={{marginTop: '2rem'}}>
              <span className="section-step">3</span>
              <span>WhatsApp Alerts (Confirmation Notification)</span>
            </div>

            <div className="form-group">
              <label>WhatsApp Mobile Number (Confirmation message ke liye) <span className="required-star">*</span></label>
              <div className="whatsapp-input-wrap">
                <span className="whatsapp-icon">💬</span>
                <input 
                  type="tel" 
                  className="form-control whatsapp-input" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <p className="field-hint">
                ✅ Email ke bajaye booking ka confirmation/status message directly is WhatsApp number par jayega.
              </p>
            </div>

            {/* Payment Summary Preview */}
            <div className="payment-gateway-preview glass-panel">
              <div className="pg-header">
                <div className="pg-title">
                  <span className="payment-icon">💳</span>
                  <strong>Online Payment Options</strong>
                </div>
                <span className="secure-tag">⚡ Instant Confirmation</span>
              </div>
              <p className="pg-desc">
                Supports Razorpay, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards & NetBanking.
              </p>
              <div className="payment-logos">
                <span className="pill">GPay</span>
                <span className="pill">PhonePe</span>
                <span className="pill">Paytm</span>
                <span className="pill">Cards</span>
                <span className="pill" style={{borderColor: '#25D366', color: '#25D366'}}>💬 WhatsApp Alert</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary booking-submit" 
              disabled={isProcessingPayment || estimatedTotal <= 0}
            >
              {isProcessingPayment 
                ? 'Connecting to Gateway...' 
                : estimatedTotal > 0 
                  ? `Proceed to Pay ₹${estimatedTotal}` 
                  : 'Select Dates to Continue'}
            </button>
          </form>
        </div>
      </div>

      {/* ================= PAYMENT GATEWAY CHECKOUT MODAL ================= */}
      {isCheckoutOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="checkout-modal glass-panel">
            
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-branding">
                <span className="brand-logo">Ride<span>X</span> Pay</span>
                <span className="secured-by">Secured by Razorpay</span>
              </div>
              {paymentStep !== 'processing' && (
                <button 
                  className="close-modal-btn" 
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Step 1: Checkout Form */}
            {paymentStep === 'checkout' && orderData && (
              <div className="modal-body animate-fade-in">
                {/* Order Summary Bar */}
                <div className="order-summary-bar">
                  <div>
                    <span className="order-label">Order ID: {orderData.order_id}</span>
                    <h3 className="order-bike-title">{bike.name} ({durationHours} hrs)</h3>
                    <p className="order-stations">
                      📍 {pickupLocation} ➔ 🏁 {returnToSameStation ? pickupLocation : dropoffLocation}
                    </p>
                  </div>
                  <div className="order-amount-box text-right">
                    <span className="amount-label">Amount to Pay</span>
                    <span className="amount-val text-accent">₹{orderData.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* WhatsApp Notification Alert inside modal */}
                <div className="modal-whatsapp-banner">
                  <span>💬 Confirmation alert will be sent to <strong>{whatsappNumber}</strong></span>
                </div>

                {/* Payment Tabs */}
                <div className="payment-tabs">
                  <button 
                    type="button" 
                    className={`pay-tab-btn ${paymentTab === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('upi')}
                  >
                    <span>⚡</span> UPI / QR
                  </button>
                  <button 
                    type="button" 
                    className={`pay-tab-btn ${paymentTab === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('card')}
                  >
                    <span>💳</span> Cards
                  </button>
                  <button 
                    type="button" 
                    className={`pay-tab-btn ${paymentTab === 'netbanking' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('netbanking')}
                  >
                    <span>🏦</span> Net Banking
                  </button>
                </div>

                {/* Tab 1: UPI */}
                {paymentTab === 'upi' && (
                  <div className="tab-content animate-fade-in">
                    <label className="tab-section-label">Select UPI App</label>
                    <div className="upi-apps-grid">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                        <div 
                          key={app} 
                          className={`upi-app-card ${selectedUpiApp === app ? 'selected' : ''}`}
                          onClick={() => setSelectedUpiApp(app)}
                        >
                          <span className="upi-app-name">{app}</span>
                          {selectedUpiApp === app && <span className="check-dot">✓</span>}
                        </div>
                      ))}
                    </div>

                    <div className="upi-id-box">
                      <label>Or Enter UPI ID / VPA</label>
                      <div className="upi-input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          value={customUpiId}
                          onChange={(e) => setCustomUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi"
                        />
                        <button 
                          type="button" 
                          className="btn-secondary verify-btn" 
                          onClick={() => alert(`UPI ID ${customUpiId} verified!`)}
                        >
                          Verify
                        </button>
                      </div>
                    </div>

                    <div className="qr-simulator-box">
                      <div className="dummy-qr">
                        <div className="qr-code-icon">📱</div>
                        <span>Scan & Pay with any UPI App</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Credit / Debit Card */}
                {paymentTab === 'card' && (
                  <div className="tab-content animate-fade-in">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        placeholder="1234 5678 9101 1121"
                        maxLength="19"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>

                    <div className="card-row">
                      <div className="form-group" style={{flex: 1}}>
                        <label>Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div className="form-group" style={{flex: 1}}>
                        <label>CVV</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          placeholder="•••"
                          maxLength="4"
                        />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-secondary autofill-btn"
                      onClick={() => setCardDetails({
                        number: '4111 2222 3333 4444',
                        name: user?.name || 'Verified Rider',
                        expiry: '09/29',
                        cvv: '991'
                      })}
                    >
                      ✨ Use Test Sandbox Card
                    </button>
                  </div>
                )}

                {/* Tab 3: Net Banking */}
                {paymentTab === 'netbanking' && (
                  <div className="tab-content animate-fade-in">
                    <label className="tab-section-label">Select Popular Bank</label>
                    <div className="banks-grid">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map(bank => (
                        <div 
                          key={bank} 
                          className={`bank-card ${selectedBank === bank ? 'selected' : ''}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          <span>{bank}</span>
                          {selectedBank === bank && <span className="check-dot">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay Action Button */}
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-primary pay-now-btn" 
                    onClick={handleConfirmPayment}
                  >
                    Pay ₹{orderData.amount.toFixed(2)} Securely
                  </button>
                  <p className="encryption-notice">
                    🔒 256-bit SSL encrypted. Payment is processed in Sandbox Mode.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Processing Screen */}
            {paymentStep === 'processing' && (
              <div className="modal-body text-center animate-fade-in" style={{padding: '50px 20px'}}>
                <div className="payment-processing-spinner"></div>
                <h3 style={{marginTop: '20px'}}>Contacting Payment Gateway...</h3>
                <p style={{color: 'var(--text-muted)'}}>
                  Authorizing transaction & generating WhatsApp confirmation...
                </p>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {paymentStep === 'success' && confirmedBooking && (
              <div className="modal-body text-center animate-fade-in success-screen">
                <div className="success-icon-badge">✓</div>
                <h2>Booking Confirmed!</h2>
                <p className="success-sub">Payment successful & ride scheduled.</p>

                {/* WhatsApp Confirmation Banner */}
                <div className="whatsapp-confirmed-box glass-panel">
                  <div className="whatsapp-header-row">
                    <span className="wa-icon">💬</span>
                    <div>
                      <strong>WhatsApp Message Sent!</strong>
                      <p>Confirmation message has been dispatched to <strong>{confirmedBooking.whatsapp_number || whatsappNumber}</strong></p>
                    </div>
                  </div>

                  {/* Direct Click to Open WhatsApp Chat */}
                  {whatsappInfo?.whatsapp_link && (
                    <a 
                      href={whatsappInfo.whatsapp_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-whatsapp-open"
                    >
                      <span>📲</span> Open Confirmation in WhatsApp
                    </a>
                  )}
                </div>

                <div className="receipt-box glass-panel">
                  <div className="receipt-row">
                    <span>Booking ID</span>
                    <strong>#{confirmedBooking.id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction ID</span>
                    <strong style={{fontFamily: 'monospace'}}>{confirmedBooking.payment_id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Bike</span>
                    <strong>{bike.brand} {bike.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Pickup Location</span>
                    <strong>{confirmedBooking.pickup_location}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Drop-off Location</span>
                    <strong>{confirmedBooking.dropoff_location}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Total Paid</span>
                    <strong className="text-accent">₹{confirmedBooking.total_price.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="success-actions">
                  <button 
                    className="btn-primary" 
                    style={{width: '100%'}}
                    onClick={() => navigate('/my-bookings')}
                  >
                    Go to My Bookings ➔
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}