import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import { getBlogs, getTrendingBlogs } from '../services/blogsService';
import { getReviews } from '../services/reviewsService';
import type { Blog } from '../services/blogsService';
import type { Review } from '../services/reviewsService';
import './HomePage.css';

const FEATURED_STORY_IMAGE = 'https://res.cloudinary.com/deqnohf2h/image/upload/v1764679841/featured_story_qzfjw3.jpg';

const HomePage = () => {
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Review[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [blogsData, reviewsData] = await Promise.all([
          getBlogs(),
          getReviews(),
        ]);

        const sortedBlogs = blogsData.sort((a, b) => b.claps - a.claps);
        setFeaturedBlog(sortedBlogs[0] || null);

        const trending = await getTrendingBlogs(6);
        setTrendingBlogs(trending);

        const sortedReviews = reviewsData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4);
        setLatestReviews(sortedReviews);

        // Get 3 specific featured books (IDs 1, 2, 3)
        const featured = reviewsData.filter(review => 
          review.id === 1 || review.id === 2 || review.id === 3
        );
        setFeaturedBooks(featured);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="homepage">
      {/* Hero Section - Redesigned */}
      <section className="hero-section-new">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <Container>
          <div className="hero-content-new">
            <div className="hero-text-content">
              <h1 className="hero-title-new">
                Discover books.
                <br />
                <span className="hero-title-accent">Share stories.</span>
                <br />
                Inspire readers.
              </h1>
              <p className="hero-subtitle-new">
                Join a community of passionate readers and writers. Explore reviews, 
                dive into thought-provoking blogs, and connect with fellow book lovers from around the world.
              </p>
              <div className="hero-actions-new">
                <Link to="/reviews">
                  <Button variant="primary" size="large" className="hero-btn-primary">
                    Explore Reviews
                  </Button>
                </Link>
                <Link to="/blogs">
                  <Button variant="secondary" size="large" className="hero-btn-secondary">
                    Read Blogs
                  </Button>
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat-item">
                  <span className="hero-stat-number">500+</span>
                  <span className="hero-stat-label">Reviews</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-number">200+</span>
                  <span className="hero-stat-label">Blogs</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-number">1K+</span>
                  <span className="hero-stat-label">Readers</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-books-stack">
                <div className="book-stack-item book-1"></div>
                <div className="book-stack-item book-2"></div>
                <div className="book-stack-item book-3"></div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Story */}
      {featuredBlog && (
        <section className="featured-section">
          <Container>
            <SectionTitle>Featured Story</SectionTitle>
            <Card className="featured-card">
              <div className="featured-blog-image">
                <img 
                  src={FEATURED_STORY_IMAGE} 
                  alt={featuredBlog.title}
                  className="featured-image"
                  onError={(e) => {
                    if (featuredBlog.thumbnail) {
                      e.currentTarget.src = featuredBlog.thumbnail;
                    } else {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }
                  }}
                />
                <div className="featured-image-placeholder hidden"></div>
              </div>
              <div className="featured-content">
                <h2 className="featured-title">{featuredBlog.title}</h2>
                <p className="featured-subtitle">{featuredBlog.subtitle}</p>
                <div className="featured-meta">
                  <span className="featured-author">By {featuredBlog.authorName}</span>
                  <span className="featured-date">{formatDate(featuredBlog.date)}</span>
                </div>
                <Link to={`/blogs/${featuredBlog.id}`} className="featured-link">
                  Read more →
                </Link>
              </div>
            </Card>
          </Container>
        </section>
      )}

      {/* Featured Books - Hovering Cards */}
      {featuredBooks.length > 0 && (
        <section className="featured-books-section">
          <Container>
            <div className="featured-books-header">
              <h2 className="featured-books-title">Featured Books</h2>
              <p className="featured-books-subtitle">Discover our top picks</p>
            </div>
            <div className="featured-books-grid">
              {featuredBooks.map((book) => (
                <Link key={book.id} to={`/reviews/${book.id}`} className="featured-book-card">
                  <div className="featured-book-image-container">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={`${book.bookTitle} cover`}
                        className="featured-book-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`featured-book-placeholder ${book.coverImage ? 'hidden' : ''}`}>
                      📖
                    </div>
                    <div className="featured-book-overlay">
                      <div className="featured-book-rating">
                        <span className="featured-book-stars">{renderStars(book.rating)}</span>
                        <span className="featured-book-rating-text">{book.rating}.0</span>
                      </div>
                    </div>
                    <div className="featured-book-shine"></div>
                  </div>
                  <div className="featured-book-info">
                    <span className="featured-book-genre">{book.genre}</span>
                    <h3 className="featured-book-title">{book.bookTitle}</h3>
                    <p className="featured-book-author">by {book.bookAuthor}</p>
                    <p className="featured-book-preview">{book.reviewPreview}</p>
                    <div className="featured-book-meta">
                      <span className="featured-book-reviewer">Reviewed by {book.reviewerName}</span>
                      <span className="featured-book-date">{formatDate(book.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Trending Blogs */}
      {trendingBlogs.length > 0 && (
        <section className="trending-section">
          <Container>
            <SectionTitle>Trending on BookReview</SectionTitle>
            <div className="trending-grid">
              {trendingBlogs.map((blog, index) => (
                <Link key={blog.id} to={`/blogs/${blog.id}`} className="trending-item-link">
                  <div className="trending-item">
                    <div className="trending-number">{index + 1}</div>
                    <div className="trending-content">
                      <h3 className="trending-title">{blog.title}</h3>
                      <p className="trending-author">By {blog.authorName}</p>
                      <p className="trending-snippet">
                        {blog.subtitle.length > 60 ? `${blog.subtitle.substring(0, 60)}...` : blog.subtitle}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Latest Reviews - Redesigned */}
      {latestReviews.length > 0 && (
        <section className="reviews-section-new">
          <Container>
            <div className="reviews-section-header">
              <h2 className="reviews-section-title">Latest Book Reviews</h2>
              <Link to="/reviews" className="reviews-section-link">
                View All →
              </Link>
            </div>
            <div className="reviews-grid-new">
              {latestReviews.map((review) => (
                <Link key={review.id} to={`/reviews/${review.id}`} className="review-card-new">
                  <div className="review-card-image-wrapper">
                    {review.coverImage ? (
                      <img
                        src={review.coverImage}
                        alt={`${review.bookTitle} cover`}
                        className="review-card-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`review-card-cover-placeholder ${review.coverImage ? 'hidden' : ''}`}>
                      📖
                    </div>
                    <div className="review-card-overlay">
                      <div className="review-card-rating-badge">
                        <span className="review-card-stars">{renderStars(review.rating)}</span>
                        <span className="review-card-rating-value">{review.rating}.0</span>
                      </div>
                    </div>
                  </div>
                  <div className="review-card-body">
                    <span className="review-card-genre">{review.genre}</span>
                    <h3 className="review-card-title">{review.bookTitle}</h3>
                    <p className="review-card-author">by {review.bookAuthor}</p>
                    <p className="review-card-preview">{review.reviewPreview}</p>
                    <div className="review-card-footer">
                      <div className="review-card-reviewer">
                        <span className="review-card-reviewer-name">{review.reviewerName}</span>
                      </div>
                      <span className="review-card-date">{formatDate(review.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
};

export default HomePage;
