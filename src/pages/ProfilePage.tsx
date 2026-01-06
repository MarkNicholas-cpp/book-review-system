import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import { getUserById, getUserReviews, getUserBlogs, updateUserStats } from '../services/usersService';
import { getFavorites } from '../services/favoritesService';
import { getReviewById } from '../services/reviewsService';
import { getBlogById } from '../services/blogsService';
import { getCurrentUserId, isAuthenticated } from '../auth/authClient';
import type { User } from '../services/usersService';
import type { Review } from '../services/reviewsService';
import type { Blog } from '../services/blogsService';
import type { Favorite } from '../services/favoritesService';
import './ProfilePage.css';

// Will use getCurrentUserId() from auth

interface FavoriteItem {
  id: number;
  type: 'review' | 'blog';
  item: Review | Blog;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'blogs' | 'favorites'>('reviews');
  const [user, setUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      // Check authentication
      if (!isAuthenticated()) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        setError('Unable to identify user. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user
        const userData = await getUserById(userId);
        setUser(userData);

        // Set document title
        document.title = `${userData.name} — Profile`;

        // Fetch user reviews and blogs in parallel
        const [reviewsData, blogsData, favoritesData] = await Promise.all([
          getUserReviews(userId),
          getUserBlogs(userId),
          getFavorites(userId),
        ]);

        // Sort reviews by newest first
        const sortedReviews = reviewsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setUserReviews(sortedReviews);

        // Sort blogs by newest first
        const sortedBlogs = blogsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setUserBlogs(sortedBlogs);

        // Resolve favorite items
        const favoriteItems: FavoriteItem[] = [];
        for (const favorite of favoritesData) {
          try {
            if (favorite.type === 'review') {
              const review = await getReviewById(favorite.itemId);
              favoriteItems.push({ id: favorite.id, type: 'review', item: review });
            } else if (favorite.type === 'blog') {
              const blog = await getBlogById(favorite.itemId);
              favoriteItems.push({ id: favorite.id, type: 'blog', item: blog });
            }
          } catch (err) {
            console.error(`Error fetching favorite ${favorite.type} ${favorite.itemId}:`, err);
            // Skip failed items
          }
        }
        setFavorites(favoriteItems);

        // Update user stats
        try {
          await updateUserStats(userId, {
            reviews: sortedReviews.length,
            blogs: sortedBlogs.length,
            favorites: favoriteItems.length,
          });
          // Refresh user data to get updated stats
          const updatedUser = await getUserById(CURRENT_USER_ID);
          setUser(updatedUser);
        } catch (err) {
          console.error('Error updating user stats:', err);
          // Non-critical error, continue
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Unable to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    // Cleanup: reset document title on unmount
    return () => {
      document.title = 'BookReview';
    };
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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="profile-page">
        <Container>
          {/* Header Skeleton */}
          <header className="profile-header">
            <div className="profile-header-content">
              <div className="profile-avatar-large skeleton skeleton-avatar"></div>
              <div className="profile-info">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
                <div className="skeleton skeleton-meta"></div>
              </div>
            </div>
          </header>

          {/* Tabs Skeleton */}
          <div className="profile-tabs">
            <div className="skeleton skeleton-tab"></div>
            <div className="skeleton skeleton-tab"></div>
            <div className="skeleton skeleton-tab"></div>
          </div>

          {/* Content Skeleton */}
          <div className="profile-tab-content">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="profile-review-item">
                <div className="skeleton skeleton-cover"></div>
                <div className="skeleton skeleton-content"></div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="profile-page">
        <Container>
          <div className="error-state">
            <h2 className="error-title">Unable to Load Profile</h2>
            <p className="error-message">
              {error || 'Unable to load profile data. Please try again.'}
            </p>
            <div className="error-actions">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Container>
        {/* Section 1: Profile Header */}
        <header className="profile-header">
          <div className="profile-header-content">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="profile-avatar-large-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`profile-avatar-large ${user.avatar ? 'hidden' : ''}`}></div>
            <div className="profile-info">
              <div className="profile-name-section">
                <h1 className="profile-name">{user.name}</h1>
                <Button variant="outline" size="small" className="edit-profile-btn">
                  Edit Profile
                </Button>
              </div>
              <p className="profile-bio">{user.bio}</p>
              <div className="profile-metadata">
                <div className="metadata-item">
                  <span className="metadata-icon">📅</span>
                  <span className="metadata-label">Joined</span>
                  <span className="metadata-value">{user.joinedDate}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-icon">✍️</span>
                  <span className="metadata-label">Blogs</span>
                  <span className="metadata-value">{user.stats.blogs}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-icon">⭐</span>
                  <span className="metadata-label">Reviews</span>
                  <span className="metadata-value">{user.stats.reviews}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-icon">❤️</span>
                  <span className="metadata-label">Favorites</span>
                  <span className="metadata-value">{user.stats.favorites}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Section 2: Tabs Navigation */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            className={`profile-tab ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            Blogs
          </button>
          <button
            className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>

        {/* Section 3: Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="profile-tab-content">
            {userReviews.length > 0 ? (
              <div className="reviews-list">
                {userReviews.map((review) => (
                  <div key={review.id} className="profile-review-item">
                    <div className="review-cover">
                      {review.coverImage ? (
                        <img 
                          src={review.coverImage} 
                          alt={`${review.bookTitle} cover`}
                          className="book-cover-image"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`book-cover-placeholder ${review.coverImage ? 'hidden' : ''}`}></div>
                    </div>
                    <div className="review-content">
                      <div className="review-header">
                        <div>
                          <h3 className="review-book-title">{review.bookTitle}</h3>
                          <p className="review-book-author">by {review.bookAuthor}</p>
                        </div>
                        <div className="review-actions">
                          <Link to={`/reviews/${review.id}/edit`}>
                            <Button variant="outline" size="small">Edit</Button>
                          </Link>
                          <Button variant="outline" size="small" className="delete-btn">Delete</Button>
                        </div>
                      </div>
                      <div className="review-rating">
                        <span className="stars">{renderStars(review.rating)}</span>
                      </div>
                      <h4 className="review-title">{review.reviewTitle}</h4>
                      <p className="review-preview">{review.reviewPreview}</p>
                      <span className="review-date">{formatDate(review.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="empty-state">
                <div className="empty-state-content">
                  <p className="empty-state-text">You haven't written any reviews yet.</p>
                  <Link to="/write-review">
                    <Button variant="primary">Write a Review</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Section 4: Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="profile-tab-content">
            {userBlogs.length > 0 ? (
              <div className="blogs-list">
                {userBlogs.map((blog) => (
                  <Card key={blog.id} className="profile-blog-card">
                    <div className="blog-card-content">
                      {blog.thumbnail ? (
                        <img 
                          src={blog.thumbnail} 
                          alt={blog.title}
                          className="blog-thumbnail-small-image"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`blog-thumbnail-small ${blog.thumbnail ? 'hidden' : ''}`}></div>
                      <div className="blog-card-text">
                        <h3 className="blog-card-title">{blog.title}</h3>
                        <p className="blog-card-subtitle">{blog.subtitle}</p>
                        <div className="blog-card-meta">
                          <span className="blog-date">{formatDate(blog.date)}</span>
                          <span className="blog-meta-separator">•</span>
                          <span className="blog-read-time">{blog.readTime}</span>
                          <span className="blog-meta-separator">•</span>
                          <span className="blog-claps">Claps {blog.claps}</span>
                        </div>
                      </div>
                      <div className="blog-card-actions">
                        <Link to={`/blogs/${blog.id}/edit`}>
                          <Button variant="outline" size="small">Edit</Button>
                        </Link>
                        <Button variant="outline" size="small" className="delete-btn">Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="empty-state">
                <div className="empty-state-content">
                  <p className="empty-state-text">You haven't written any blogs yet.</p>
                  <Link to="/write-blog">
                    <Button variant="primary">Write a Blog</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Section 5: Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="profile-tab-content">
            {favorites.length > 0 ? (
              <div className="favorites-list">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="favorite-item-card">
                    {favorite.type === 'review' ? (
                      <Link to={`/reviews/${favorite.item.id}`} className="favorite-item-link">
                        <div className="favorite-item-content">
                          <div className="favorite-cover">
                            {(favorite.item as Review).coverImage ? (
                              <img 
                                src={(favorite.item as Review).coverImage} 
                                alt={`${(favorite.item as Review).bookTitle} cover`}
                                className="favorite-cover-image"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`favorite-cover-placeholder ${(favorite.item as Review).coverImage ? 'hidden' : ''}`}></div>
                          </div>
                          <div className="favorite-item-text">
                            <span className="favorite-type-badge">Review</span>
                            <h4 className="favorite-title">{(favorite.item as Review).bookTitle}</h4>
                            <p className="favorite-author">by {(favorite.item as Review).bookAuthor}</p>
                            <div className="favorite-rating">
                              <span className="stars">{renderStars((favorite.item as Review).rating)}</span>
                            </div>
                            <p className="favorite-preview">{(favorite.item as Review).reviewPreview}</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link to={`/blogs/${favorite.item.id}`} className="favorite-item-link">
                        <div className="favorite-item-content">
                          <div className="favorite-thumbnail">
                            {(favorite.item as Blog).thumbnail ? (
                              <img 
                                src={(favorite.item as Blog).thumbnail} 
                                alt={(favorite.item as Blog).title}
                                className="favorite-thumbnail-image"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`favorite-thumbnail-placeholder ${(favorite.item as Blog).thumbnail ? 'hidden' : ''}`}></div>
                          </div>
                          <div className="favorite-item-text">
                            <span className="favorite-type-badge">Blog</span>
                            <h4 className="favorite-title">{(favorite.item as Blog).title}</h4>
                            <p className="favorite-subtitle">{(favorite.item as Blog).subtitle}</p>
                            <div className="favorite-meta">
                              <span className="favorite-author">{(favorite.item as Blog).authorName}</span>
                              <span className="favorite-meta-separator">•</span>
                              <span className="favorite-claps">Claps {(favorite.item as Blog).claps}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="empty-state">
                <div className="empty-state-content">
                  <p className="empty-state-text">No favorites yet.</p>
                  <p className="empty-state-subtext">Start exploring reviews and blogs to add them to your favorites.</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProfilePage;
