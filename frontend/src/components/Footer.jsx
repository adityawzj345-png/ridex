import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Ride<span>X</span></h2>
          <p>Premium bike rentals for the modern explorer. Ride anywhere, anytime with our top-tier fleet.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Company</h3>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
          
          <div className="link-group">
            <h3>Support</h3>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RideX. All rights reserved.</p>
      </div>
    </footer>
  );
}
