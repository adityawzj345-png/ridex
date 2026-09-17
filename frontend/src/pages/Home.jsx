import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page animate-fade-in">
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge glass-panel">🔥 New Premium Fleet Available</div>
          <h1 className="hero-title">
            Unleash Your <span className="text-accent">Journey.</span>
          </h1>
          <p className="hero-subtitle">
            Experience the thrill of the open road with our premium selection of sports bikes, cruisers, and city scooters. Rent instantly.
          </p>
          
          <div className="hero-actions">
            <Link to="/bikes" className="btn-primary btn-large">View Fleet</Link>
            <Link to="/register" className="btn-secondary btn-large">Join RideX</Link>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Premium Bikes</p>
            </div>
            <div className="stat-item">
              <h3>20k+</h3>
              <p>Happy Riders</p>
            </div>
            <div className="stat-item">
              <h3>4.9/5</h3>
              <p>User Ratings</p>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="glow-circle"></div>
          <div className="hero-bike-gallery">
            <img src="/bikes/sport.jpg" alt="Sport Bike" className="hero-bike-img img-1" />
            <img src="/bikes/cruiser.jpg" alt="Cruiser Bike" className="hero-bike-img img-2" />
            <img src="/bikes/scooter.jpg" alt="Scooter" className="hero-bike-img img-3" />
          </div>
        </div>
      </section>
    </div>
  );
}
