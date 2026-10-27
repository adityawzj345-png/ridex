import { Link } from 'react-router-dom';
import './Home.css';

const HOME_CATEGORIES = [
  { id: 'Commuter', name: 'Commuter Bikes', startingRate: '₹29/hr', icon: '🛣️', desc: 'Daily office, college & market travel', ex: 'Hero Splendor Plus, HF Deluxe', img: '/bikes/commuter_splendor.jpg' },
  { id: '125cc', name: '125cc Bikes', startingRate: '₹45/hr', icon: '⚡', desc: 'Perfect balance of high mileage & power', ex: 'Honda Shine 125, Hero Glamour', img: '/bikes/125cc_shine.jpg' },
  { id: 'CNG', name: 'CNG Bikes', startingRate: '₹39/hr', icon: '⛽', desc: 'Ultra-low running cost eco-friendly rides', ex: 'Bajaj Freedom 125', img: '/bikes/cng_freedom.jpg' },
  { id: 'Electric', name: 'Electric Bikes', startingRate: '₹49/hr', icon: '🔋', desc: 'Quiet city commuting & instant battery charging', ex: 'Revolt RV400, Oben Rorr', img: '/bikes/electric_revolt.jpg' },
  { id: 'Street / Naked', name: 'Street / Naked', startingRate: '₹79/hr', icon: '🏍️', desc: 'Agile city riding & muscular sporty looks', ex: 'Bajaj Pulsar NS160, Yamaha MT-15', img: '/bikes/street_pulsarns.jpg' },
  { id: 'Sports', name: 'Sports Bikes', startingRate: '₹89/hr', icon: '🏁', desc: 'Performance aerodynamics & speed thrill', ex: 'TVS Apache RTR 160 4V, Yamaha R15', img: '/bikes/sports_apache.jpg' },
  { id: 'Performance', name: 'Performance Bikes', startingRate: '₹119/hr', icon: '🔥', desc: 'Powerful high-RPM engines & track speed', ex: 'Pulsar NS200, KTM Duke 200', img: '/bikes/performance_duke.jpg' },
  { id: 'Adventure / Dual-Purpose', name: 'Adventure / Dual-purpose', startingRate: '₹119/hr', icon: '🏔️', desc: 'Rough trails, village roads & long touring', ex: 'Hero Xpulse 200 4V, Himalayan 450', img: '/bikes/adventure_xpulse.jpg' },
  { id: 'Roadster', name: 'Roadster Bikes', startingRate: '₹129/hr', icon: '🌆', desc: 'City flickability & weekend highway cruises', ex: 'Hunter 350, Honda CB350', img: '/bikes/roadster_hunter.jpg' },
  { id: 'Classic / Retro', name: 'Classic / Retro', startingRate: '₹139/hr', icon: '👑', desc: 'Timeless vintage character & thumping ride', ex: 'Royal Enfield Classic 350, Jawa 350', img: '/bikes/classic_retro.jpg' },
];

export default function Home() {
  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge glass-panel">🔥 Local Fleet Live · Rates Strictly Under ₹500/hr</div>
          <h1 className="hero-title">
            Unleash Your <span className="text-accent">Journey.</span>
          </h1>
          <p className="hero-subtitle">
            Rent top Indian two-wheelers on demand — Commuters from ₹29/hr, 125cc, Classic 350, Sports, CNG & Electric bikes with instant WhatsApp confirmation.
          </p>
          
          <div className="hero-actions">
            <Link to="/bikes" className="btn-primary btn-large">Explore All Fleet</Link>
            <Link to="/register" className="btn-secondary btn-large">Join RideX</Link>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <h3>10</h3>
              <p>Bike Categories</p>
            </div>
            <div className="stat-item">
              <h3>70+</h3>
              <p>Indian Models</p>
            </div>
            <div className="stat-item">
              <h3>&lt; ₹500</h3>
              <p>Max Price/hr</p>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="glow-circle"></div>
          <div className="hero-bike-gallery">
            <img src="/bikes/classic_retro.jpg" alt="Classic 350" className="hero-bike-img img-1" onError={(e) => { e.target.src = '/bikes/sport.jpg'; }} />
            <img src="/bikes/sports_apache.jpg" alt="Sports Bike" className="hero-bike-img img-2" onError={(e) => { e.target.src = '/bikes/sport.jpg'; }} />
            <img src="/bikes/electric_revolt.jpg" alt="Electric Bike" className="hero-bike-img img-3" onError={(e) => { e.target.src = '/bikes/scooter.jpg'; }} />
          </div>
        </div>
      </section>

      {/* TOP 10 BIKE CATEGORIES SHOWCASE SECTION */}
      <section className="categories-section">
        <div className="section-header text-center">
          <span className="section-kicker">Transparent Hourly Pricing · Under ₹500/hr</span>
          <h2>Top 10 <span className="text-accent">Bike Categories</span></h2>
          <p>Model ke hisab se calibrated hourly rent. Choose according to your budget and travel needs.</p>
        </div>

        <div className="categories-grid">
          {HOME_CATEGORIES.map((cat, idx) => (
            <Link 
              key={cat.id} 
              to={`/bikes?category=${encodeURIComponent(cat.id)}`} 
              className="home-category-card glass-panel animate-fade-in"
            >
              <div className="cat-img-box">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="cat-thumb"
                  onError={(e) => { e.target.src = '/bikes/commuter_splendor.jpg'; }}
                />
                <span className="cat-badge-pill">{cat.icon} {cat.name}</span>
                <span className="cat-rate-pill">from {cat.startingRate}</span>
                <span className="cat-num-pill">#{idx + 1}</span>
              </div>
              <div className="cat-card-body">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                  <h3 style={{margin: 0}}>{cat.name}</h3>
                  <span style={{color: '#00e676', fontWeight: 700, fontSize: '0.85rem'}}>{cat.startingRate}</span>
                </div>
                <p className="cat-desc">{cat.desc}</p>
                <div className="cat-examples-row">
                  <span className="ex-label">Popular:</span>
                  <span className="ex-text">{cat.ex}</span>
                </div>
                <div className="cat-action-link">
                  <span>Browse Category</span>
                  <span className="arrow">➔</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
