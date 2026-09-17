import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import './Bikes.css';

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const data = await apiFetch('/bikes/');
        setBikes(data);
      } catch (err) {
        setError('Failed to load fleet');
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  const types = ['All', ...new Set(bikes.map(b => b.type))];

  const filteredBikes = bikes.filter(bike => {
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || bike.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || bike.type === selectedType;
    const matchesPrice = bike.price_per_hour <= maxPrice;
    return matchesSearch && matchesType && matchesPrice;
  });

  if (loading) return <div className="bikes-page animate-fade-in text-center" style={{paddingTop: '100px'}}><h2>Loading fleet...</h2></div>;
  if (error) return <div className="bikes-page animate-fade-in text-center" style={{paddingTop: '100px', color: 'red'}}><h2>{error}</h2></div>;


  return (
    <div className="bikes-page animate-fade-in">
      <div className="bikes-header text-center">
        <h1>Our <span className="text-accent">Fleet</span></h1>
        <p>Choose your perfect ride from our premium collection</p>
      </div>

      <div className="filters-container glass-panel" style={{marginBottom: '2rem', padding: '1rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
        <input 
          type="text" 
          placeholder="Search brand or name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{maxWidth: '300px', margin: 0}}
        />
        
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="form-control" style={{maxWidth: '200px', margin: 0}}>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <div style={{display: 'flex', flexDirection: 'column', minWidth: '200px'}}>
          <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Max Price: ${maxPrice}/hr</label>
          <input 
            type="range" 
            min="10" 
            max="150" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{accentColor: 'var(--accent-color)'}}
          />
        </div>
      </div>

      <div className="bike-grid">
        {filteredBikes.length === 0 ? <p style={{gridColumn: '1 / -1', textAlign: 'center'}}>No bikes match your filters.</p> : filteredBikes.map(bike => (
          <div key={bike.id} className="bike-card glass-panel">
            <div className="bike-image-container">
              {bike.image_url.includes('/') ? (
                <img src={bike.image_url} alt={bike.name} className="bike-image" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <span className="bike-emoji">{bike.image_url}</span>
              )}
              <div className="bike-badge">{bike.type}</div>
            </div>
            
            <div className="bike-info">
              <span className="bike-brand">{bike.brand}</span>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>{bike.name}</h3>
                {bike.average_rating > 0 && (
                  <span style={{color: '#ffc107', fontWeight: 'bold'}}>
                    ★ {bike.average_rating.toFixed(1)}
                  </span>
                )}
              </div>
              
              <div className="bike-price-row">
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">{bike.price_per_hour}</span>
                  <span className="period">/hour</span>
                </div>
                <Link to={`/booking?bike=${bike.id}`} className="btn-primary rent-btn">Rent Now</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}