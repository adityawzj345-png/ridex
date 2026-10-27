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
  
  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bike, setBike] = useState(null);
  const [stations, setStations] = useState([]);
  const [pickupStationId, setPickupStationId] = useState('');
  const [dropoffStationId, setDropoffStationId] = useState('');
  const [returnToSameStation, setReturnToSameStation] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Duration & Pricing
  const [durationHours, setDurationHours] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Payment Gateway Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentGateway, setPaymentGateway] = useState('razorpay'); // 'razorpay'
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
        // Fetch bike details and available stations concurrently
        const [bikeData, stationsData] = await Promise.all([
          apiFetch(`/bikes/${bikeId}`),
          apiFetch('/stations/')
        ]);

        setBike(bikeData);
        setStations(stationsData);

        // Pre-select pickup station based on bike's current station or first station
        if (bikeData.station_id) {
          setPickupStationId(bikeData.station_id);
          setDropoffStationId(bikeData.station_id);
        } else if (stationsData.length > 0) {
          setPickupStationId(stationsData[0].id);
          setDropoffStationId(stationsData[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bikeId, navigate, user]);

  // Synchronize dropoff station if returnToSameStation is checked
  useEffect(() => {
    if (returnToSameStation && pickupStationId) {
      setDropoffStationId(pickupStationId);
    }
  }, [returnToSameStation, pickupStationId]);

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

  // Handle Opening Checkout Modal and Creating Order
  const handleInitiateCheckout = async (e) => {
    e.preventDefault();
    setKycError(null);

    if (estimatedTotal <= 0) {
      alert("Please select valid dates. Drop-off date must be after pickup date.");
      return;
    }

    if (!pickupStationId) {
      alert("Please select a pickup rental hub.");
      return;
    }

    const finalDropoffId = returnToSameStation ? pickupStationId : dropoffStationId;
    if (!finalDropoffId) {
      alert("Please select a drop-off rental hub.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Call Backend to create Payment Order (Razorpay Sandbox)
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
      // 1. Verify Payment with backend
      const generatedPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const methodLabel = paymentTab === 'upi' 
        ? `Razorpay UPI (${selectedUpiApp})` 
        : paymentTab === 'card' 
          ? `Razorpay Card (*${cardDetails.number.slice(-4)})` 
          : `Razorpay NetBanking (${selectedBank})`;

      await apiFetch('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderData.order_id,
          payment_id: generatedPaymentId
        })
      });

      // 2. Create the Booking in Database
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();
      const finalDropoffId = returnToSameStation ? pickupStationId : dropoffStationId;

      const bookingResponse = await apiFetch('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          bike_id: bikeId,
          start_time: startIso,
          end_time: endIso,
          total_price: parseFloat(estimatedTotal),
          pickup_station_id: parseInt(pickupStationId),
          dropoff_station_id: parseInt(finalDropoffId),
          payment_method: methodLabel,
          payment_id: generatedPaymentId
        })
      });

      setConfirmedBooking(bookingResponse.booking);
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

  const selectedPickup = stations.find(s => String(s.id) === String(pickupStationId));
  const selectedDropoff = stations.find(s => String(s.id) === String(returnToSameStation ? pickupStationId : dropoffStationId));

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
        
        {/* Left Side: Bike Info & Ride Summary */}
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
              <span>Pickup Hub</span>
              <span className="station-summary-tag">
                📍 {selectedPickup ? `${selectedPickup.name} (${selectedPickup.city})` : 'Select Station'}
              </span>
            </div>
            <div className="summary-row">
              <span>Return Hub</span>
              <span className="station-summary-tag">
                🏁 {selectedDropoff ? `${selectedDropoff.name} (${selectedDropoff.city})` : 'Select Station'}
              </span>
            </div>
            <div className="summary-row">
              <span>Platform & Helmet Fee</span>
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

          {/* Secure Guarantee Badge */}
          <div className="secure-badge glass-panel">
            <span className="shield-icon">🛡️</span>
            <div>
              <strong>RideX Secure Guarantee</strong>
              <p>24/7 Roadside Assistance & Instant Helmet Included</p>
            </div>
          </div>
        </div>
        
        {/* Right Side: Form (Dates, Station Pickers & Checkout trigger) */}
        <div className="booking-form-wrapper glass-panel">
          <h2>Schedule Your Ride</h2>
          <p className="form-subtitle">Choose rental stations and your pickup & return schedule.</p>

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
            
            {/* Station Selection Section */}
            <div className="form-section-title">
              <span className="section-step">1</span>
              <span>Select Rental Stations</span>
            </div>

            {/* Pickup Station Dropdown */}
            <div className="form-group">
              <label>Pickup Station Hub <span className="required-star">*</span></label>
              <select 
                className="form-control station-select"
                value={pickupStationId}
                onChange={(e) => setPickupStationId(e.target.value)}
                required
              >
                <option value="">-- Choose Pickup Hub --</option>
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    [{st.city}] {st.name} — {st.address}
                  </option>
                ))}
              </select>
              
              {selectedPickup && (
                <div className="station-preview-box">
                  <div className="station-preview-header">
                    <span className="station-city-badge">{selectedPickup.city}</span>
                    <span className="station-name">{selectedPickup.name}</span>
                  </div>
                  <p className="station-address">📍 {selectedPickup.address}</p>
                  <p className="station-contact">📞 Helpline: {selectedPickup.contact_number}</p>
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
                <span className="checkbox-label">Return bike to the same station ({selectedPickup?.name || 'Pickup Hub'})</span>
              </label>
            </div>

            {/* Return Station Dropdown (Conditional) */}
            {!returnToSameStation && (
              <div className="form-group animate-fade-in" style={{marginTop: '1rem'}}>
                <label>Drop-off / Return Station Hub <span className="required-star">*</span></label>
                <select 
                  className="form-control station-select"
                  value={dropoffStationId}
                  onChange={(e) => setDropoffStationId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Drop-off Hub --</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>
                      [{st.city}] {st.name} — {st.address}
                    </option>
                  ))}
                </select>

                {selectedDropoff && (
                  <div className="station-preview-box">
                    <div className="station-preview-header">
                      <span className="station-city-badge">{selectedDropoff.city}</span>
                      <span className="station-name">{selectedDropoff.name}</span>
                    </div>
                    <p className="station-address">🏁 {selectedDropoff.address}</p>
                    <p className="station-contact">📞 Helpline: {selectedDropoff.contact_number}</p>
                  </div>
                )}
              </div>
            )}

            {/* Date & Time Selection Section */}
            <div className="form-section-title" style={{marginTop: '2rem'}}>
              <span className="section-step">2</span>
              <span>Choose Rental Schedule</span>
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
                <span className="pill">Visa</span>
                <span className="pill">MasterCard</span>
                <span className="pill">UPI QR</span>
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
                      {selectedPickup?.city}: {selectedPickup?.name} ➔ {selectedDropoff?.name}
                    </p>
                  </div>
                  <div className="order-amount-box text-right">
                    <span className="amount-label">Amount to Pay</span>
                    <span className="amount-val text-accent">₹{orderData.amount.toFixed(2)}</span>
                  </div>
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
                          onClick={() => alert(`UPI ID ${customUpiId} verified successfully!`)}
                        >
                          Verify
                        </button>
                      </div>
                    </div>

                    <div className="qr-simulator-box">
                      <div className="dummy-qr">
                        <div className="qr-corner top-left"></div>
                        <div className="qr-corner top-right"></div>
                        <div className="qr-corner bottom-left"></div>
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
                  Authorizing transaction with Razorpay Bank Servers. Please do not refresh.
                </p>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {paymentStep === 'success' && confirmedBooking && (
              <div className="modal-body text-center animate-fade-in success-screen">
                <div className="success-icon-badge">✓</div>
                <h2>Payment Successful!</h2>
                <p className="success-sub">Your ride booking is confirmed and ready for pickup.</p>

                <div className="receipt-box glass-panel">
                  <div className="receipt-row">
                    <span>Booking Reference</span>
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
                    <span>Pickup Hub</span>
                    <strong>{confirmedBooking.pickup_station_name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Drop-off Hub</span>
                    <strong>{confirmedBooking.dropoff_station_name}</strong>
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
                    View My Bookings & Receipt ➔
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