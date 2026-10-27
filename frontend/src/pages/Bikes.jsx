import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import './Bikes.css';

export const TOP_CATEGORIES = [
  {
    id: 'All',
    name: 'All Fleet',
    icon: '✨',
    tagline: 'Explore our complete local fleet',
    examples: 'All Models'
  },
  {
    id: 'Commuter',
    name: 'Commuter Bikes',
    icon: '🛣️',
    tagline: 'Daily office, college aur market ke liye',
    examples: 'Hero Splendor Plus, HF Deluxe'
  },
  {
    id: '125cc',
    name: '125cc Bikes',
    icon: '⚡',
    tagline: 'Mileage aur power ka perfect balance',
    examples: 'Honda Shine 125, Hero Glamour'
  },
  {
    id: 'Street / Naked',
    name: 'Street / Naked',
    icon: '🏍️',
    tagline: 'City riding aur aggressive sporty looks',
    examples: 'Bajaj Pulsar NS160, Yamaha MT-15'
  },
  {
    id: 'Sports',
    name: 'Sports Bikes',
    icon: '🏁',
    tagline: 'Young riders aur high-performance thrill',
    examples: 'TVS Apache RTR 160 4V, Yamaha R15'
  },
  {
    id: 'Classic / Retro',
    name: 'Classic / Retro',
    icon: '👑',
    tagline: 'Timeless style aur comfortable cruising',
    examples: 'Royal Enfield Classic 350, Jawa 350'
  },
  {
    id: 'Roadster',
    name: 'Roadster Bikes',
    icon: '🌆',
    tagline: 'City agility aur short highway rides',
    examples: 'Hunter 350, Honda CB350'
  },
  {
    id: 'Performance',
    name: 'Performance Bikes',
    icon: '🔥',
    tagline: 'Powerful engine aur fast highway riding',
    examples: 'Pulsar NS200, KTM Duke 200'
  },
  {
    id: 'Adventure / Dual-Purpose',
    name: 'Adventure / Dual-purpose',
    icon: '🏔️',
    tagline: 'Village roads, rough terrain aur touring',
    examples: 'Hero Xpulse 200 4V, Himalayan 450'
  },
  {
    id: 'CNG',
    name: 'CNG Bikes',
    icon: '⛽',
    tagline: 'Fuel cost bachane ka eco-friendly option',
    examples: 'Bajaj Freedom 125'
  },
  {
    id: 'Electric',
    name: 'Electric Bikes',
    icon: '🔋',
    tagline: 'Short-distance city travel & battery charging',
    examples: 'Revolt RV400, Oben Rorr'
  }
];

export default function Bikes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(500);

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

  // Update selectedType if URL search parameter changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedType(cat);
    }
  }, [searchParams]);

  const handleSelectCategory = (catId) => {
    setSelectedType(catId);
    if (catId === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const filteredBikes = bikes.filter(bike => {
    const matchesSearch = 
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bike.type.toLowerCase().includes(searchTerm.toLowerCase());

    const bType = bike.type.toLowerCase();
    const sType = selectedType.toLowerCase();

    let matchesType = false;
    if (selectedType === 'All') {
      matchesType = true;
    } else if (selectedType === 'Sports' || selectedType === 'Sport') {
      matchesType = bType.includes('sport');
    } else if (selectedType === 'Classic / Retro') {
      matchesType = bType.includes('classic') || bType.includes('retro');
    } else if (selectedType === 'Adventure / Dual-Purpose') {
      matchesType = bType.includes('adventure') || bType.includes('dual');
    } else if (selectedType === 'Street / Naked') {
      matchesType = bType.includes('street') || bType.includes('naked');
    } else {
      matchesType = bType.includes(sType);
    }

    const matchesPrice = bike.price_per_hour <= maxPrice;
    return matchesSearch && matchesType && matchesPrice;
  });

  const activeCategoryMeta = TOP_CATEGORIES.find(c => c.id === selectedType) || TOP_CATEGORIES[0];

  if (loading) {
    return (
      <div className="bikes-page animate-fade-in text-center" style={{paddingTop: '100px'}}>
        <div className="loading-spinner"></div>
        <h2>Loading local bike fleet & categories...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bikes-page animate-fade-in text-center" style={{paddingTop: '100px', color: 'red'}}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="bikes-page animate-fade-in">
      <div className="bikes-header text-center">
        <div className="badge glass-panel" style={{marginBottom: '10px', display: 'inline-block'}}>
          🏍️ Local Area Top 10 Bike Categories
        </div>
        <h1>Our <span className="text-accent">Fleet & Categories</span></h1>
        <p>Commuter, 125cc, Sports, Classic, Roadster, CNG & Electric Two-wheelers ready to ride.</p>
      </div>

      {/* TOP 10 CATEGORIES SCROLLER / GRID */}
      <div className="categories-filter-wrapper">
        <div className="categories-bar">
          {TOP_CATEGORIES.map(cat => {
            const count = cat.id === 'All' 
              ? bikes.length 
              : bikes.filter(b => {
                  const bt = b.type.toLowerCase();
                  if (cat.id === 'Sports') return bt.includes('sport');
                  if (cat.id === 'Classic / Retro') return bt.includes('classic') || bt.includes('retro');
                  if (cat.id === 'Adventure / Dual-Purpose') return bt.includes('adventure');
                  if (cat.id === 'Street / Naked') return bt.includes('street') || bt.includes('naked');
                  return bt.includes(cat.id.toLowerCase());
                }).length;

            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${selectedType === cat.id ? 'active' : ''}`}
                onClick={() => handleSelectCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <div className="cat-text-wrap">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">{count} available</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Description Banner */}
      {selectedType !== 'All' && (
        <div className="active-category-banner glass-panel animate-fade-in">
          <div className="banner-left">
            <span className="banner-icon">{activeCategoryMeta.icon}</span>
            <div>
              <h3>{activeCategoryMeta.name}</h3>
              <p className="banner-tagline">{activeCategoryMeta.tagline}</p>
            </div>
          </div>
          <div className="banner-right">
            <span className="example-label">Popular Local Examples:</span>
            <span className="example-names">{activeCategoryMeta.examples}</span>
          </div>
        </div>
      )}

      {/* Search & Price Filter Controls */}
      <div className="filters-container glass-panel">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by model, brand (Splendor, Pulsar, Classic 350)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="price-slider-wrap">
          <div className="slider-header">
            <span>Budget / Price Cap:</span>
            <strong>₹{maxPrice}/hr</strong>
          </div>
          <input 
            type="range" 
            min="25" 
            max="500" 
            step="10"
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{accentColor: 'var(--accent-color)'}}
          />
        </div>

        {selectedType !== 'All' && (
          <button 
            type="button" 
            className="btn-secondary reset-filter-btn"
            onClick={() => handleSelectCategory('All')}
          >
            ✕ Reset Category
          </button>
        )}
      </div>

      {/* BIKE GRID */}
      <div className="bike-grid">
        {filteredBikes.length === 0 ? (
          <div className="empty-fleet-state glass-panel">
            <span style={{fontSize: '3rem', display: 'block', marginBottom: '10px'}}>🔍</span>
            <h3>No bikes found matching "{selectedType}" category</h3>
            <p style={{color: 'var(--text-muted)'}}>Try resetting filters or adjusting maximum price.</p>
            <button 
              className="btn-primary" 
              style={{marginTop: '15px'}} 
              onClick={() => { setSelectedType('All'); setMaxPrice(500); setSearchTerm(''); }}
            >
              View All Bikes
            </button>
          </div>
        ) : (
          filteredBikes.map(bike => (
            <div key={bike.id} className="bike-card glass-panel animate-fade-in">
              <div className="bike-image-container">
                {bike.image_url && bike.image_url.includes('/') ? (
                  <img 
                    src={bike.image_url} 
                    alt={bike.name} 
                    className="bike-image" 
                    onError={(e) => { e.target.src = '/bikes/commuter_splendor.jpg'; }}
                  />
                ) : (
                  <span className="bike-emoji">{bike.image_url || '🏍️'}</span>
                )}
                <div className="bike-badge">{bike.type}</div>
                {bike.station_city && (
                  <div className="station-badge">📍 {bike.station_city}</div>
                )}
              </div>
              
              <div className="bike-info">
                <span className="bike-brand">{bike.brand}</span>
                <div className="bike-name-row">
                  <h3>{bike.name}</h3>
                  {bike.average_rating > 0 && (
                    <span className="bike-rating">
                      ★ {bike.average_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                
                <div className="bike-price-row">
                  <div className="price">
                    <span className="currency">₹</span>
                    <span className="amount">{bike.price_per_hour}</span>
                    <span className="period">/hour</span>
                  </div>
                  <Link to={`/booking?bike=${bike.id}`} className="btn-primary rent-btn">
                    Rent Now ➔
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}