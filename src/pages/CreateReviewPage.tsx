import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import { createReview } from '../services/reviewsService';
import { getGenres } from '../services/genresService';
import { getCurrentUserId, getCurrentUser } from '../auth/authClient';
import type { Genre } from '../services/genresService';
import './CreateReviewPage.css';

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // Form fields
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isbn, setIsbn] = useState('');
  
  // Field errors
  const [bookTitleError, setBookTitleError] = useState<string | null>(null);
  const [bookAuthorError, setBookAuthorError] = useState<string | null>(null);
  const [reviewTitleError, setReviewTitleError] = useState<string | null>(null);
  const [reviewTextError, setReviewTextError] = useState<string | null>(null);
  const [genreError, setGenreError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        navigate('/login');
        return;
      }
    };
    
    checkAuth();
    
    // Fetch genres
    const fetchGenres = async () => {
      try {
        const genresData = await getGenres();
        setGenres(genresData);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    fetchGenres();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Reset errors
    setBookTitleError(null);
    setBookAuthorError(null);
    setReviewTitleError(null);
    setReviewTextError(null);
    setGenreError(null);
    
    // Validation
    let hasErrors = false;
    
    if (!bookTitle.trim()) {
      setBookTitleError('Book title is required');
      hasErrors = true;
    }
    
    if (!bookAuthor.trim()) {
      setBookAuthorError('Book author is required');
      hasErrors = true;
    }
    
    if (!reviewTitle.trim()) {
      setReviewTitleError('Review title is required');
      hasErrors = true;
    }
    
    if (!reviewText.trim()) {
      setReviewTextError('Review text is required');
      hasErrors = true;
    }
    
    if (!genre) {
      setGenreError('Please select a genre');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    const userId = getCurrentUserId();
    if (!userId) {
      setError('You must be logged in to create a review');
      return;
    }
    
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      const reviewData = {
        bookTitle: bookTitle.trim(),
        bookAuthor: bookAuthor.trim(),
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        genre,
        coverImage: coverImage.trim() || undefined,
        isbn: isbn.trim() || undefined,
        userId,
        reviewerName: user?.name || 'Anonymous',
      };
      
      const newReview = await createReview(reviewData);
      navigate(`/reviews/${newReview.id}`);
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err.message || 'Failed to create review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (selectedRating: number) => {
    return (
      <div className="rating-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= selectedRating ? 'active' : ''}`}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            {star <= selectedRating ? '★' : '☆'}
          </button>
        ))}
        <span className="rating-value">{rating}.0</span>
      </div>
    );
  };

  return (
    <div className="create-review-page">
      <Container>
        <div className="create-review-header">
          <h1 className="page-title">Write a Book Review</h1>
          <p className="page-subtitle">Share your thoughts about a book you've read</p>
        </div>

        <Card className="create-review-card">
          {error && (
            <div className="form-error" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form className="create-review-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <Input
                type="text"
                label="Book Title"
                placeholder="Enter the book title"
                value={bookTitle}
                onChange={(e) => {
                  setBookTitle(e.target.value);
                  setBookTitleError(null);
                  setError(null);
                }}
                error={bookTitleError || undefined}
                disabled={loading}
                required
                className="form-input"
              />
              <Input
                type="text"
                label="Book Author"
                placeholder="Enter the author's name"
                value={bookAuthor}
                onChange={(e) => {
                  setBookAuthor(e.target.value);
                  setBookAuthorError(null);
                  setError(null);
                }}
                error={bookAuthorError || undefined}
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              {renderStars(rating)}
            </div>

            <Input
              type="text"
              label="Review Title"
              placeholder="Give your review a catchy title"
              value={reviewTitle}
              onChange={(e) => {
                setReviewTitle(e.target.value);
                setReviewTitleError(null);
                setError(null);
              }}
              error={reviewTitleError || undefined}
              disabled={loading}
              required
              className="form-input"
            />

            <TextArea
              label="Your Review"
              placeholder="Share your thoughts about this book. What did you like? What didn't you like? Would you recommend it?"
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setReviewTextError(null);
                setError(null);
              }}
              error={reviewTextError || undefined}
              disabled={loading}
              required
              rows={8}
              className="form-textarea"
            />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="genre-select">
                  Genre <span className="required">*</span>
                </label>
                <select
                  id="genre-select"
                  className={`form-select ${genreError ? 'error' : ''}`}
                  value={genre}
                  onChange={(e) => {
                    setGenre(e.target.value);
                    setGenreError(null);
                    setError(null);
                  }}
                  disabled={loading}
                  required
                >
                  <option value="">Select a genre</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {genreError && <span className="form-error-message">{genreError}</span>}
              </div>
            </div>

            <div className="form-row">
              <Input
                type="url"
                label="Cover Image URL (Optional)"
                placeholder="https://example.com/book-cover.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                disabled={loading}
                className="form-input"
              />
              <Input
                type="text"
                label="ISBN (Optional)"
                placeholder="978-0123456789"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/reviews')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'Publishing...' : 'Publish Review'}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default CreateReviewPage;
