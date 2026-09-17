import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import './Auth.css'; // Reusing form styles

export default function Profile() {
  const { user, login } = useContext(AuthContext); // Note: login might just update local context
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMessage("Profile updated successfully!");
      // We might need to refresh user context here, 
      // but simpler to just let them see the message.
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card glass-panel" style={{marginTop: '2rem'}}>
        <h2>My <span className="text-accent">Profile</span></h2>
        <p className="auth-subtitle">Update your personal information.</p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message" style={{color: '#00e676', marginBottom: '1rem', textAlign: 'center'}}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email (Cannot be changed)</label>
            <input 
              type="email" 
              className="form-control" 
              value={user.email}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              name="phone"
              className="form-control" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>New Password (Leave blank to keep current)</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
