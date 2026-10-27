import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import './Bikes.css';

export const TOP_CATEGORIES = [
  {
    id: 'All',
    name: 'All Fleet',
    icon: '✨',
    priceHint: '₹29 - ₹489/hr',
    tagline: 'Complete local fleet strictly under ₹500/hr',
    examples: 'All 70+ Models'
  },
  {
    id: 'Commuter',
    name: 'Commuter Bikes',
    icon: '🛣️',
    priceHint: '₹29 - ₹39/hr',
    tagline: 'Daily office, college aur market ke liye best mileage',
    examples: 'Hero Splendor Plus, HF Deluxe, TVS Sport'
  },
  {
    id: '125cc',
    name: '125cc Bikes',
    icon: '⚡',
    priceHint: '₹45 - ₹69/hr',
    tagline: 'Mileage aur power ka perfect balance',
    examples: 'Honda Shine 125, SP 125, Raider 125'
  },
  {
    id: 'CNG',
    name: 'CNG Bikes',
    icon: '⛽',
    priceHint: '₹39 - ₹49/hr',
    tagline: 'Sabse sasta aur eco-friendly running cost',
    examples: 'Bajaj Freedom 125 NG04 Drum & Disc'
  },
  {
    id: 'Electric',
    name: 'Electric Bikes',
    icon: '🔋',
    priceHint: '₹49 - ₹249/hr',
    tagline: 'Zero petrol expense, fast-charging city commuter',
    examples: 'Revolt RV400, Oben Rorr, Ultraviolette F77'
  },
  {
    id: 'Street / Naked',
    name: 'Street / Naked',
    icon: '🏍️',
    priceHint: '₹79 - ₹119/hr',
    tagline: 'City riding aur aggressive sporty looks',
    examples: 'Bajaj Pulsar NS160, Yamaha MT-15, Apache 160'
  },
  {
    id: 'Sports',
    name: 'Sports Bikes',
    icon: '🏁',
    priceHint: '₹89 - ₹489/hr',
    tagline: 'Aerodynamics, racing track feel aur speed thrill',
    examples: 'TVS Apache RTR 160 4V, Yamaha R15, Ninja ZX-10R'
  },
  {
    id: 'Performance',
    name: 'Performance Bikes',
    icon: '🔥',
    priceHint: '₹119 - ₹229/hr',
    tagline: 'Powerful high-cc engine aur rapid highway acceleration',
    examples: 'Pulsar NS200, KTM Duke 200/250, Dominar 250'
  },
  {
    id: 'Adventure / Dual-Purpose',
    name: 'Adventure / Dual-purpose',
    icon: '🏔️',
    priceHint: '₹119 - ₹349/hr',
    tagline: 'Village roads, rough terrain, hills aur long touring',
    examples: 'Hero Xpulse 200 4V, Himalayan 450, BMW G 310 GS'
  },
  {
    id: 'Roadster',
    name: 'Roadster Bikes',
    icon: '🌆',
    priceHint: '₹129 - ₹399/hr',
    tagline: 'City agility aur weekend highway cruising',
    examples: 'Hunter 350, Honda CB350, Speed 400, Harley X440'
  },
  {
    id: 'Classic / Retro',
    name: 'Classic / Retro',
    icon: '👑',
    priceHint: '₹139 - ₹179/hr',
    tagline: 'Timeless vintage style aur signature heavy thump',
    examples: 'Royal Enfield Classic 350, Bullet 350, Jawa 350'
  }
];

export const BUDGET_TIERS = [
  { id: 'all', label: 'All Under ₹500', min: 0, max: 500, icon: '🏷️' },
  { id: 'super-saver', label: 'Under ₹50/hr', min: 0, max: 50, icon: '🟢', sub: 'Commuter & CNG' },
  { id: 'economy', label: '₹50 - ₹100/hr', min: 50, max: 100, icon: '🔵', sub: '125cc, EV & Street' },
  { id: 'mid', label: '₹100 - ₹200/hr', min: 100, max: 200, icon: '🟣', sub: 'Classic, Roadster, Adv' },
  { id: 'premium', label: '₹200 - ₹500/hr', min: 200, max: 500, icon: '🟡', sub: 'Performance & Sports' }
];

export default function Bikes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('price-asc');

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

  const handleSelectBudgetTier = (tier) => {
    setSelectedBudgetTier(tier.id);
    if (tier.id === 'all') {
      setMaxPrice(500);
    } else {
      setMaxPrice(tier.max);
    }
  };

  const getPriceTierTag = (price) => {
    if (price <= 50) return { label: 'Super Saver', color: '#00e676', bg: 'rgba(0, 230, 118, 0.12)' };
    if (price <= 100) return { label: 'Economy', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
    if (price <= 200) return { label: 'Standard', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' };
    return { label: 'Premium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
  };

  const filteredBikes = bikes
    .filter(bike => {
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

      // Budget tier filter
      const tierObj = BUDGET_TIERS.find(t => t.id === selectedBudgetTier);
      let matchesTier = true;
      if (tierObj && tierObj.id !== 'all') {
        matchesTier = bike.price_per_hour >= tierObj.min && bike.price_per_hour <= tierObj.max;
      }

      const matchesPrice = bike.price_per_hour <= maxPrice;
      return matchesSearch && matchesType && matchesTier && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_per_hour - b.price_per_hour;
      if (sortBy === 'price-desc') return b.price_per_hour - a.price_per_hour;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'rating-desc') return (b.average_rating || 0) - (a.average_rating || 0);
      return 0;
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
        <div className="badge glass-panel price-guarantee-badge" style={{marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
          <span style={{color: '#00e676'}}>✓</span> Guaranteed Under ₹500/hr · Hourly Rates from ₹29/hr
        </div>
        <h1>Our <span className="text-accent">Fleet & Hourly Pricing</span></h1>
        <p>Har bike ka model-wise aur category-wise transparent hourly rent. No hidden charges!</p>
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
                  <div className="cat-sub-row">
                    <span className="cat-count">{count} available</span>
                    <span className="cat-price-hint">· {cat.priceHint}</span>
                  </div>
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
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                <h3>{activeCategoryMeta.name}</h3>
                <span className="category-rate-badge">{activeCategoryMeta.priceHint}</span>
              </div>
              <p className="banner-tagline">{activeCategoryMeta.tagline}</p>
            </div>
          </div>
          <div className="banner-right">
            <span className="example-label">Popular Local Examples:</span>
            <span className="example-names">{activeCategoryMeta.examples}</span>
          </div>
        </div>
      )}

      {/* BUDGET TIERS QUICK-SELECT BAR */}
      <div className="budget-tiers-container glass-panel">
        <span className="budget-tiers-label">Quick Budget Filter:</span>
        <div className="budget-chips">
          {BUDGET_TIERS.map(tier => (
            <button
              key={tier.id}
              type="button"
              className={`budget-chip ${selectedBudgetTier === tier.id ? 'active' : ''}`}
              onClick={() => handleSelectBudgetTier(tier)}
            >
              <span className="tier-icon">{tier.icon}</span>
              <span className="tier-name">{tier.label}</span>
              {tier.sub && <span className="tier-sub">({tier.sub})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Price Filter Controls */}
      <div className="filters-container glass-panel">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by model, brand (Splendor, Pulsar, Classic 350, Shine)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        {/* Sort By Dropdown */}
        <div className="sort-wrap">
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select 
            id="sort-select"
            className="form-control sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price-asc">Price: Low to High (₹29 ➔ ₹489/hr)</option>
            <option value="price-desc">Price: High to Low (₹489 ➔ ₹29/hr)</option>
            <option value="rating-desc">Rating: Highest First</option>
            <option value="name-asc">Model Name (A-Z)</option>
          </select>
        </div>

        <div className="price-slider-wrap">
          <div className="slider-header">
            <span>Price Ceiling:</span>
            <strong>₹{maxPrice}/hr max</strong>
          </div>
          <input 
            type="range" 
            min="25" 
            max="500" 
            step="10"
            value={maxPrice} 
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setSelectedBudgetTier('custom');
            }}
            style={{accentColor: 'var(--accent-color)'}}
          />
        </div>

        {(selectedType !== 'All' || selectedBudgetTier !== 'all' || maxPrice < 500 || searchTerm) && (
          <button 
            type="button" 
            className="btn-secondary reset-filter-btn"
            onClick={() => {
              handleSelectCategory('All');
              setSelectedBudgetTier('all');
              setMaxPrice(500);
              setSearchTerm('');
            }}
          >
            ✕ Reset All
          </button>
        )}
      </div>

      {/* Showing count indicator */}
      <div className="fleet-count-bar">
        <span>Showing <strong>{filteredBikes.length}</strong> bikes under ₹500/hr</span>
        {selectedType !== 'All' && <span className="active-cat-tag">Category: {selectedType}</span>}
      </div>

      {/* BIKE GRID */}
      <div className="bike-grid">
        {filteredBikes.length === 0 ? (
          <div className="empty-fleet-state glass-panel">
            <span style={{fontSize: '3rem', display: 'block', marginBottom: '10px'}}>🔍</span>
            <h3>No bikes found matching your criteria</h3>
            <p style={{color: 'var(--text-muted)'}}>Try widening your price cap or resetting the category filter.</p>
            <button 
              className="btn-primary" 
              style={{marginTop: '15px'}} 
              onClick={() => { setSelectedType('All'); setSelectedBudgetTier('all'); setMaxPrice(500); setSearchTerm(''); }}
            >
              View All 90+ Bikes
            </button>
          </div>
        ) : (
          filteredBikes.map(bike => {
            const tierMeta = getPriceTierTag(bike.price_per_hour);
            const estDayRate = Math.round(bike.price_per_hour * 24);

            return (
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
                  <div 
                    className="tier-badge"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: tierMeta.bg,
                      color: tierMeta.color,
                      border: `1px solid ${tierMeta.color}`,
                      borderRadius: '20px',
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {tierMeta.label}
                  </div>
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

                  <div className="day-rate-hint">
                    ~₹{estDayRate} / 24-hr day pass
                  </div>
                  
                  <div className="bike-price-row">
                    <div className="price">
                      <span className="currency">₹</span>
                      <span className="amount">{bike.price_per_hour}</span>
                      <span className="period">/hr</span>
                    </div>
                    <Link to={`/booking?bike=${bike.id}`} className="btn-primary rent-btn">
                      Book @ ₹{bike.price_per_hour}/hr ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}