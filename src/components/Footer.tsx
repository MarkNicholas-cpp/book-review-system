import './Footer.css';
import Container from './Container';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <p className="footer-text">
            © 2025 BookReview. A platform for book lovers.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

