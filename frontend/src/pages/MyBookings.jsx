import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import './MyBookings.css';

export default function MyBookings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [reviewData, setReviewData] = useState({ bookingId: null, bikeId: null, rating: 5, comment: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const data = await apiFetch('/bookings/');
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      alert("Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/bikes/${reviewData.bikeId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });
      alert("Review submitted successfully!");
      setReviewData({ bookingId: null, bikeId: null, rating: 5, comment: '' });
      fetchBookings(); // Optionally refresh if we track review status
    } catch (err) {
      alert("Failed to submit review: " + err.message);
    }
  };

  if (loading) return <div className="bookings-page animate-fade-in text-center" style={{paddingTop: '100px'}}><h2>Loading your bookings...</h2></div>;
  if (error) return <div className="bookings-page animate-fade-in text-center" style={{paddingTop: '100px', color: 'red'}}><h2>{error}</h2></div>;

  return (
    <div className="bookings-page animate-fade-in">
      <div className="bookings-header text-center">
        <h1>My <span className="text-accent">Bookings</span></h1>
        <p>Manage and view your past and upcoming rides</p>
      </div>

      <div className="bookings-list">
        {bookings.length === 0 ? (
          <p className="no-bookings">You have no bookings yet. Time to rent a bike!</p>
        ) : (
          bookings.map(booking => {
            const isPast = new Date(booking.end_time) < new Date();
            const isOngoing = new Date(booking.start_time) < new Date() && !isPast;
            const canCancel = booking.status !== 'Cancelled' && new Date(booking.start_time) > new Date();
            const canReview = booking.status !== 'Cancelled' && isPast;

            return (
              <div key={booking.id} className="booking-card glass-panel">
                <div className={`booking-status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </div>
                <div className="booking-info">
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                    <h3 style={{margin: 0}}>Booking #{booking.id}</h3>
                    {booking.payment_method && (
                      <span style={{fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '12px', color: '#00e676'}}>
                        ✓ {booking.payment_method}
                      </span>
                    )}
                  </div>
                  <p style={{margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '600'}}>
                    {booking.bike_brand ? `${booking.bike_brand} ${booking.bike_name}` : `Bike #${booking.bike_id}`}
                  </p>
                  
                  {/* Stations Info */}
                  <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '8px 0 14px 0', fontSize: '0.85rem', color: '#bbb'}}>
                    <span>📍 <strong>Pickup:</strong> {booking.pickup_station_name || 'Central Hub'}</span>
                    <span>🏁 <strong>Return:</strong> {booking.dropoff_station_name || 'Central Hub'}</span>
                  </div>

                  <div className="booking-dates">
                    <div className="date-box">
                      <span className="label">Pickup Time</span>
                      <span>{new Date(booking.start_time).toLocaleString()}</span>
                    </div>
                    <div className="date-box">
                      <span className="label">Drop-off Time</span>
                      <span>{new Date(booking.end_time).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="booking-price">
                    <span>Total Paid:</span>
                    <span className="amount">₹{booking.total_price.toFixed(2)}</span>
                  </div>
                  
                  <div className="booking-actions" style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                    {canCancel && (
                      <button onClick={() => handleCancel(booking.id)} className="btn-secondary" style={{borderColor: '#ff3d00', color: '#ff3d00'}}>
                        Cancel Booking
                      </button>
                    )}
                    {canReview && reviewData.bookingId !== booking.id && (
                      <button onClick={() => setReviewData({ bookingId: booking.id, bikeId: booking.bike_id, rating: 5, comment: '' })} className="btn-primary">
                        Leave a Review
                      </button>
                    )}
                  </div>

                  {reviewData.bookingId === booking.id && (
                    <form onSubmit={handleReviewSubmit} className="review-form" style={{marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                      <h4>Rate your ride</h4>
                      <div className="form-group">
                        <label>Rating (1-5)</label>
                        <input type="number" min="1" max="5" value={reviewData.rating} onChange={(e) => setReviewData({...reviewData, rating: e.target.value})} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>Comment</label>
                        <textarea value={reviewData.comment} onChange={(e) => setReviewData({...reviewData, comment: e.target.value})} className="form-control" rows="2"></textarea>
                      </div>
                      <div style={{display: 'flex', gap: '1rem'}}>
                        <button type="submit" className="btn-primary">Submit Review</button>
                        <button type="button" onClick={() => setReviewData({ bookingId: null, bikeId: null, rating: 5, comment: '' })} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
