import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import { getReviews, searchReviews, getReviewsByGenre } from '../services/reviewsService';
import type { Review } from '../services/reviewsService';
import { getGenres } from '../services/genresService';
import { getUsers } from '../services/usersService';
import './ReviewsListPage.css';

const ReviewsListPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest-rated' | 'most-liked'>('newest');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [currentPage, setCurrentPage] = useState(1);
  const [genres, setGenres] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [reviewerAvatars, setReviewerAvatars] = useState<Record<number, string>>({});

  const reviewsPerPage = 9;

  // Fetch reviews and genres on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [reviewsData, genresData, usersData] = await Promise.all([
          getReviews(),
          getGenres(),
          getUsers()
        ]);
        
        setAllReviews(reviewsData);
        setReviews(reviewsData);
        setGenres(genresData);

        // Create reviewer avatars map
        const avatarsMap: Record<number, string> = {};
        usersData.forEach(user => {
          if (user.avatar) {
            avatarsMap[user.id] = user.avatar;
          }
        });
        setReviewerAvatars(avatarsMap);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Unable to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        if (selectedGenre === 'All Genres') {
          setReviews(allReviews);
        } else {
          try {
            const filtered = await getReviewsByGenre(selectedGenre);
            setReviews(filtered);
          } catch (err) {
            console.error('Error filtering by genre:', err);
          }
        }
        return;
      }

      try {
        const results = await searchReviews(searchQuery);
        let filtered = results;
        if (selectedGenre !== 'All Genres') {
          filtered = results.filter(r => r.genre === selectedGenre);
        }
        setReviews(filtered);
      } catch (err) {
        console.error('Error searching reviews:', err);
        setError('Unable to search reviews. Please try again.');
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre, allReviews]);

  // Handle genre filter
  useEffect(() => {
    const handleGenreFilter = async () => {
      if (selectedGenre === 'All Genres') {
        if (!searchQuery.trim()) {
          setReviews(allReviews);
        }
        return;
      }

      try {
        const filtered = await getReviewsByGenre(selectedGenre);
        let results = filtered;
        if (searchQuery.trim()) {
          results = filtered.filter(r => 
            r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setReviews(results);
      } catch (err) {
        console.error('Error filtering by genre:', err);
      }
    };

    handleGenreFilter();
  }, [selectedGenre, searchQuery, allReviews]);

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'highest-rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'most-liked':
        return sorted.sort((a, b) => b.likes - a.likes);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(startIndex, startIndex + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, sortBy]);

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="skeleton-card">
      <div className="skeleton-image loading-skeleton"></div>
      <div className="skeleton-content">
        <div className="skeleton-line loading-skeleton short"></div>
        <div className="skeleton-line loading-skeleton"></div>
        <div className="skeleton-line loading-skeleton medium"></div>
        <div className="skeleton-line loading-skeleton"></div>
      </div>
    </div>
  );

  return (
    <div className="reviews-list-page">
      {/* Hero Section */}
      <div className="reviews-hero">
        <Container>
          <div className="reviews-hero-content">
            <h1 className="reviews-hero-title">Book Reviews</h1>
            <p className="reviews-hero-subtitle">
              Discover what readers are saying about their favorite books. Share your thoughts and connect with fellow book lovers.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filters-content">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search by book title or author..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group">
              {genres.slice(0, 5).map((genre) => (
                <button
                  key={genre.id}
                  className={`filter-btn ${selectedGenre === genre.name ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(genre.name)}
                >
                  {genre.name}
                </button>
              ))}
              {genres.length > 5 && (
                <select
                  className="filter-btn"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={{ appearance: 'none', paddingRight: 'var(--spacing-lg)' }}
                >
                  {genres.slice(5).map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedGenre !== 'All Genres' && (
                <button
                  className="filter-btn"
                  onClick={() => setSelectedGenre('All Genres')}
                >
                  Clear
                </button>
              )}
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest-rated' | 'most-liked')}
            >
              <option value="newest">Newest First</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button
              className="pagination-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="reviews-grid">
            {[...Array(reviewsPerPage)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedReviews.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h2 className="empty-state-title">No reviews found</h2>
            <p className="empty-state-message">
              {searchQuery || selectedGenre !== 'All Genres'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Be the first to share your thoughts on a book!'}
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && paginatedReviews.length > 0 && (
          <div className="reviews-grid">
            {paginatedReviews.map((review) => {
              const reviewerAvatar = reviewerAvatars[review.userId] || '';
              return (
                <div key={review.id} className="review-card">
                  <Link to={`/reviews/${review.id}`} className="review-card-link">
                    <div className="review-card-image-container">
                      {review.coverImage ? (
                        <img
                          src={review.coverImage}
                          alt={`${review.bookTitle} cover`}
                          className="review-card-image"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`review-card-image-placeholder ${review.coverImage ? 'hidden' : ''}`}>
                        📖
                      </div>
                    </div>
                    <div className="review-card-content">
                      <span className="review-card-genre">{review.genre}</span>
                      <h3 className="review-card-title">{review.bookTitle}</h3>
                      <p className="review-card-author">by {review.bookAuthor}</p>
                      <div className="review-card-rating">
                        <span className="stars">{renderStars(review.rating)}</span>
                        <span className="rating-value">{review.rating}.0</span>
                      </div>
                      <p className="review-card-preview">{review.reviewPreview}</p>
                      <div className="review-card-footer">
                        <div className="review-card-reviewer">
                          {reviewerAvatar ? (
                            <img
                              src={reviewerAvatar}
                              alt={review.reviewerName}
                              className="review-card-avatar"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`review-card-avatar-placeholder ${reviewerAvatar ? 'hidden' : ''}`}></div>
                          <span className="review-card-reviewer-name">{review.reviewerName}</span>
                        </div>
                        <div className="review-card-meta">
                          <span className="review-card-date">📅 {formatDate(review.date)}</span>
                          <span className="review-card-likes">❤️ {review.likes}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const page = index + 1;
              if (totalPages <= 5 || page === 1 || page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="pagination-info">...</span>;
              }
              return null;
            })}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ReviewsListPage;
