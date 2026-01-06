import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import { getReviewById, updateReview, getReviewsByGenre } from '../services/reviewsService';
import type { Review, Comment } from '../services/reviewsService';
import { getUserById } from '../services/usersService';
import { toggleFavorite, isFavorited as checkIsFavorited } from '../services/favoritesService';
import { getCurrentUserId, isAuthenticated } from '../auth/authClient';
import './ReviewDetailsPage.css';

const ReviewDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userName, setUserName] = useState('You');
  const [reviewerAvatar, setReviewerAvatar] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch review data
  useEffect(() => {
    const fetchReview = async () => {
      if (!id) {
        setError('Invalid review ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const reviewData = await getReviewById(Number(id));
        setReview(reviewData);
        setLikesCount(reviewData.likes);
        
        // Set document title
        document.title = `${reviewData.reviewTitle} — Review`;

        // Handle comments
        const reviewWithComments = reviewData as any;
        if (reviewWithComments.commentsArray && Array.isArray(reviewWithComments.commentsArray)) {
          setComments(reviewWithComments.commentsArray);
        } else {
          setComments([]);
        }

        // Fetch related reviews
        const related = await getReviewsByGenre(reviewData.genre);
        const filtered = related
          .filter(r => r.id !== reviewData.id)
          .slice(0, 3);
        setRelatedReviews(filtered);

        // Fetch reviewer info
        try {
          const reviewer = await getUserById(reviewData.userId);
          setUserName(reviewer.name);
          setReviewerAvatar(reviewer.avatar);
        } catch (err) {
          setUserName(reviewData.reviewerName);
        }

        // Check if user is authenticated and if review is favorited
        if (isAuthenticated()) {
          const userId = getCurrentUserId();
          if (userId) {
            setCurrentUserId(userId);
            try {
              const favorited = await checkIsFavorited(userId, 'review', reviewData.id);
              setIsFavorited(favorited);
            } catch (err) {
              console.error('Error checking favorite status:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('Review not found or unable to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();

    return () => {
      document.title = 'BookReview';
    };
  }, [id]);

  const handleLike = async () => {
    if (!review) return;

    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newLiked);
    setLikesCount(newCount);

    try {
      await updateReview(review.id, { likes: newCount });
    } catch (err) {
      console.error('Error updating likes:', err);
      setIsLiked(!newLiked);
      setLikesCount(likesCount);
    }
  };

  const handleFavorite = async () => {
    if (!review || !currentUserId) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    try {
      const result = await toggleFavorite(currentUserId, 'review', review.id);
      setIsFavorited(result.favorited);
      
      // Update user stats if needed (optional)
      // This could be handled in the favoritesService or backend
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!review) return;
    
    const url = window.location.href;
    const text = `Check out this review: ${review.reviewTitle} - ${review.bookTitle} by ${review.bookAuthor}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${review.reviewTitle} - ${review.bookTitle}`,
          text: text,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Fallback: show URL
        prompt('Copy this link:', url);
      }
    }
  };

  const handleAddComment = async () => {
    if (!review || !commentText.trim()) return;

    setSubmittingComment(true);
    const newComment: Comment = {
      id: Date.now(),
      author: userName,
      text: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setCommentText('');

    try {
      const updateData: any = {
        comments: updatedComments.length,
        commentsArray: updatedComments,
      };
      await updateReview(review.id, updateData);
      
      setReview({
        ...review,
        comments: updatedComments.length,
        ...updateData,
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      setComments(comments);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="review-details-page">
        <div className="skeleton skeleton-hero"></div>
        <Container>
          <div className="review-layout">
            <article className="review-article">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </article>
            <aside className="review-sidebar">
              <div className="sidebar-card">
                <div className="skeleton skeleton-text"></div>
              </div>
            </aside>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error || !review) {
    return (
      <div className="review-details-page">
        <Container>
          <div className="error-state">
            <h2 className="error-title">Review Not Found</h2>
            <p className="error-message">
              {error || 'The review you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <div className="error-actions">
              <Button variant="primary" onClick={() => navigate('/reviews')}>
                Browse All Reviews
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="review-details-page">
      {/* Hero Section */}
      <div className="review-hero">
        <Container>
          <div className="review-hero-content">
            <div className="review-hero-grid">
              <div className="review-hero-cover">
                {review.coverImage ? (
                  <img
                    src={review.coverImage}
                    alt={`${review.bookTitle} cover`}
                    className="review-hero-cover-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`review-hero-cover-placeholder ${review.coverImage ? 'hidden' : ''}`}></div>
              </div>
              <div className="review-hero-info">
                <h1 className="review-hero-title">{review.bookTitle}</h1>
                <p className="review-hero-author">by {review.bookAuthor}</p>
                <div className="review-hero-meta">
                  <div className="review-hero-rating">
                    <span className="stars-large">{renderStars(review.rating)}</span>
                    <span className="rating-value-large">{review.rating}.0</span>
                  </div>
                  <div className="review-hero-reviewer">
                    {reviewerAvatar ? (
                      <img
                        src={reviewerAvatar}
                        alt={review.reviewerName}
                        className="reviewer-avatar"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`reviewer-avatar-placeholder ${reviewerAvatar ? 'hidden' : ''}`}></div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">{review.reviewerName}</span>
                      <span className="review-date">{formatDate(review.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="review-layout">
          {/* Main Content */}
          <article className="review-article">
            <h2 className="review-title">{review.reviewTitle}</h2>
            
            <div className="review-content-text">
              {review.reviewText.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="review-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Book Details</h3>
              <div className="book-info-item">
                <span className="book-info-label">Genre</span>
                <span className="book-info-value">{review.genre}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Rating</span>
                <span className="book-info-value">
                  {renderStars(review.rating)} {review.rating}.0
                </span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Published</span>
                <span className="book-info-value">{review.date}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Likes</span>
                <span className="book-info-value">{likesCount}</span>
              </div>
              <div className="book-info-item">
                <span className="book-info-label">Comments</span>
                <span className="book-info-value">{comments.length}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Actions Bar */}
        <div className="review-actions-bar">
          <div className="review-actions-left">
            <button
              className={`action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <span>❤️</span>
              <span>Like</span>
              <span className="action-count">{likesCount}</span>
            </button>
            <button className="action-btn">
              <span>💬</span>
              <span>Comment</span>
              <span className="action-count">{comments.length}</span>
            </button>
            <button
              className={`action-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
            >
              <span>⭐</span>
              <span>Favorite</span>
            </button>
            <button
              className="action-btn"
              onClick={handleShare}
              title="Share this review"
            >
              <span>↗</span>
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <section className="comments-section">
          <h3 className="comments-section-title">Comments ({comments.length})</h3>
          
          <div className="comment-input-area">
            <div className="comment-input-header">
              {reviewerAvatar ? (
                <img
                  src={reviewerAvatar}
                  alt={userName}
                  className="comment-user-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`comment-user-avatar-placeholder ${reviewerAvatar ? 'hidden' : ''}`}></div>
              <TextArea
                placeholder="Share your thoughts..."
                className="comment-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <button
              className="comment-submit-btn"
              onClick={handleAddComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          <div className="comments-list">
            {comments.length > 0 ? (
              comments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className={`comment-avatar-placeholder ${comment.avatar ? 'hidden' : ''}`}></div>
                    {comment.avatar ? (
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="comment-avatar"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.previousElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">{formatDate(comment.date)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </section>

        {/* Related Reviews */}
        {relatedReviews.length > 0 && (
          <section className="related-reviews-section">
            <h3 className="related-reviews-title">More from {review.genre}</h3>
            <div className="related-reviews-grid">
              {relatedReviews.map((related) => (
                <Link key={related.id} to={`/reviews/${related.id}`} className="related-review-card">
                  <div className="related-cover-container">
                    {related.coverImage ? (
                      <img
                        src={related.coverImage}
                        alt={`${related.bookTitle} cover`}
                        className="related-cover-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`related-cover-placeholder ${related.coverImage ? 'hidden' : ''}`}>
                      📖
                    </div>
                  </div>
                  <div className="related-review-content">
                    <h4 className="related-review-title">{related.bookTitle}</h4>
                    <p className="related-review-author">by {related.bookAuthor}</p>
                    <div className="related-rating">
                      <span className="stars-related">{renderStars(related.rating)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default ReviewDetailsPage;
