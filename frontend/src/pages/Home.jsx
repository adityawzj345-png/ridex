import { Link } from 'react-router-dom';
import './Home.css';

const HOME_CATEGORIES = [
  { id: 'Commuter', name: 'Commuter Bikes', icon: '🛣️', desc: 'Daily office, college & market travel', ex: 'Hero Splendor Plus, HF Deluxe', img: '/bikes/commuter_splendor.jpg' },
  { id: '125cc', name: '125cc Bikes', icon: '⚡', desc: 'Perfect balance of high mileage & power', ex: 'Honda Shine 125, Hero Glamour', img: '/bikes/125cc_shine.jpg' },
  { id: 'Street / Naked', name: 'Street / Naked', icon: '🏍️', desc: 'Agile city riding & muscular sporty looks', ex: 'Bajaj Pulsar NS160, Yamaha MT-15', img: '/bikes/street_pulsarns.jpg' },
  { id: 'Sports', name: 'Sports Bikes', icon: '🏁', desc: 'Performance aerodynamics & speed thrill', ex: 'TVS Apache RTR 160 4V, Yamaha R15', img: '/bikes/sports_apache.jpg' },
  { id: 'Classic / Retro', name: 'Classic / Retro', icon: '👑', desc: 'Timeless vintage character & thumping ride', ex: 'Royal Enfield Classic 350, Jawa 350', img: '/bikes/classic_retro.jpg' },
  { id: 'Roadster', name: 'Roadster Bikes', icon: '🌆', desc: 'City flickability & weekend highway cruises', ex: 'Hunter 350, Honda CB350', img: '/bikes/roadster_hunter.jpg' },
  { id: 'Performance', name: 'Performance Bikes', icon: '🔥', desc: 'Powerful high-RPM engines & track speed', ex: 'Pulsar NS200, KTM Duke 200', img: '/bikes/performance_duke.jpg' },
  { id: 'Adventure / Dual-Purpose', name: 'Adventure / Dual-purpose', icon: '🏔️', desc: 'Rough trails, village roads & long touring', ex: 'Hero Xpulse 200 4V, Himalayan 450', img: '/bikes/adventure_xpulse.jpg' },
  { id: 'CNG', name: 'CNG Bikes', icon: '⛽', desc: 'Ultra-low running cost eco-friendly rides', ex: 'Bajaj Freedom 125', img: '/bikes/cng_freedom.jpg' },
  { id: 'Electric', name: 'Electric Bikes', icon: '🔋', desc: 'Quiet city commuting & instant battery charging', ex: 'Revolt RV400, Oben Rorr', img: '/bikes/electric_revolt.jpg' },
];

export default function Home() {
  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge glass-panel">🔥 Local Fleet Live in Delhi, Bengaluru, Mumbai & Gurugram</div>
          <h1 className="hero-title">
            Unleash Your <span className="text-accent">Journey.</span>
          </h1>
          <p className="hero-subtitle">
            Rent top Indian two-wheelers on demand — Commuters, 125cc, Classic 350, Sports, CNG & Electric bikes with instant WhatsApp confirmation.
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
              <h3>500+</h3>
              <p>Active Fleet</p>
            </div>
            <div className="stat-item">
              <h3>4.9/5</h3>
              <p>Rider Ratings</p>
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
          <span className="section-kicker">Local Area Favorite Choices</span>
          <h2>Top 10 <span className="text-accent">Bike Categories</span></h2>
          <p>Choose the category tailored for your commute, adventure, or weekend trip.</p>
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
                <span className="cat-num-pill">#{idx + 1}</span>
              </div>
              <div className="cat-card-body">
                <h3>{cat.name}</h3>
                <p className="cat-desc">{cat.desc}</p>
                <div className="cat-examples-row">
                  <span className="ex-label">Popular:</span>
                  <span className="ex-text">{cat.ex}</span>
                </div>
                <div className="cat-action-link">
                  <span>View Bikes</span>
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
