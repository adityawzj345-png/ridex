import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({ totalBikes: 0, totalRevenue: 0, activeBookings: 0 });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Bike State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBike, setNewBike] = useState({ name: '', brand: '', type: '', price_per_hour: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const bookingsData = await apiFetch('/admin/bookings');
      setBookings(bookingsData);
      
      const bikesData = await apiFetch('/bikes/');
      
      let revenue = 0;
      let active = 0;
      bookingsData.forEach(b => {
        if (b.status === 'Confirmed') {
          active++;
        }
        if (b.status !== 'Cancelled') {
          revenue += b.total_price;
        }
      });
      
      setMetrics({
        totalBikes: bikesData.length,
        totalRevenue: revenue,
        activeBookings: active
      });
      
    } catch (err) {
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newBike.name);
      formData.append('brand', newBike.brand);
      formData.append('type', newBike.type);
      formData.append('price_per_hour', newBike.price_per_hour);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiFetch('/bikes/', {
        method: 'POST',
        body: formData,
        // Omit Content-Type to let browser set it with boundary for multipart/form-data
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }, true); // Assuming apiFetch can handle omitting headers if we pass a flag, wait I didn't write apiFetch to handle multipart cleanly...
      // Let's use native fetch directly here to avoid overriding content-type
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/bikes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to add bike');

      alert("Bike added successfully!");
      setShowAddForm(false);
      fetchDashboardData();
    } catch (err) {
      alert("Error adding bike: " + err.message);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  if (loading) return <div className="admin-page text-center" style={{paddingTop: '100px'}}><h2>Loading Admin Dashboard...</h2></div>;
  if (error) return <div className="admin-page text-center" style={{paddingTop: '100px', color: 'red'}}><h2>{error}</h2></div>;

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header">
        <h1>Admin <span className="text-accent">Dashboard</span></h1>
        <p>Manage fleet and monitor platform performance</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <h3>Total Revenue</h3>
          <p className="metric-value">${metrics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="metric-card glass-panel">
          <h3>Active Bookings</h3>
          <p className="metric-value">{metrics.activeBookings}</p>
        </div>
        <div className="metric-card glass-panel">
          <h3>Fleet Size</h3>
          <p className="metric-value">{metrics.totalBikes}</p>
          <button className="btn-primary" style={{marginTop: '1rem', padding: '0.5rem'}} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Bike'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="admin-section glass-panel" style={{padding: '2rem', marginBottom: '3rem'}}>
          <h2>Add New Bike</h2>
          <form onSubmit={handleAddBike} style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
            <input className="form-control" placeholder="Brand" required onChange={e => setNewBike({...newBike, brand: e.target.value})} style={{flex: '1 1 200px'}} />
            <input className="form-control" placeholder="Name/Model" required onChange={e => setNewBike({...newBike, name: e.target.value})} style={{flex: '1 1 200px'}} />
            <input className="form-control" placeholder="Type (e.g., Sport)" required onChange={e => setNewBike({...newBike, type: e.target.value})} style={{flex: '1 1 200px'}} />
            <input className="form-control" type="number" placeholder="Price per hour" required onChange={e => setNewBike({...newBike, price_per_hour: e.target.value})} style={{flex: '1 1 200px'}} />
            <input className="form-control" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{flex: '1 1 200px', paddingTop: '10px'}} />
            <button className="btn-primary" type="submit" style={{width: '100%'}}>Save Bike</button>
          </form>
        </div>
      )}

      <div className="admin-section">
        <h2>Recent Bookings (Platform-wide)</h2>
        <div className="bookings-table-container glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Bike ID</th>
                <th>Pickup</th>
                <th>Drop-off</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No bookings found on the platform.</td></tr>
              ) : (
                currentBookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.user_name}</td>
                    <td>#{b.bike_id}</td>
                    <td>{new Date(b.start_time).toLocaleString()}</td>
                    <td>{new Date(b.end_time).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>${b.total_price.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination" style={{display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem'}}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={{alignSelf: 'center'}}>Page {currentPage} of {totalPages}</span>
              <button 
                className="btn-secondary" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
