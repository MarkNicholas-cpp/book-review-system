import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import TextArea from '../components/TextArea';
import { getBlogById, clapBlog, getBlogsByCategory, updateBlog } from '../services/blogsService';
import { getUserById } from '../services/usersService';
import { toggleFavorite, isFavorited as checkIsFavorited } from '../services/favoritesService';
import { toggleFollow, isFollowing as checkIsFollowing } from '../services/followsService';
import { getCurrentUserId, isAuthenticated } from '../auth/authClient';
import type { Blog, Comment } from '../services/blogsService';
import type { User } from '../services/usersService';
import './BlogDetailsPage.css';

const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClapped, setIsClapped] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userName, setUserName] = useState('You');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('Invalid blog ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const blogData = await getBlogById(Number(id));
        setBlog(blogData);
        setClapCount(blogData.claps);
        
        // Set document title
        document.title = `${blogData.title} — BookReview`;

        // Handle comments - check if commentsArray exists, otherwise use empty array
        const blogWithComments = blogData as any;
        if (blogWithComments.commentsArray && Array.isArray(blogWithComments.commentsArray)) {
          setComments(blogWithComments.commentsArray);
        } else {
          setComments([]);
        }

        // Fetch author info
        try {
          const authorData = await getUserById(blogData.authorId);
          setAuthor(authorData);
          setUserName(authorData.name);
        } catch (err) {
          console.error('Error fetching author:', err);
        }

        // Fetch related blogs (same category)
        try {
          const related = await getBlogsByCategory(blogData.category);
          const filtered = related
            .filter(b => b.id !== blogData.id)
            .slice(0, 3);
          setRelatedBlogs(filtered);
        } catch (err) {
          console.error('Error fetching related blogs:', err);
        }

        // Check if user is authenticated and if blog is favorited
        if (isAuthenticated()) {
          const userId = getCurrentUserId();
          if (userId) {
            setCurrentUserId(userId);
            try {
              const favorited = await checkIsFavorited(userId, 'blog', blogData.id);
              setIsFavorited(favorited);
              
              // Check if user is following the author
              if (blogData.authorId) {
                const following = await checkIsFollowing(userId, blogData.authorId);
                setIsFollowing(following);
              }
            } catch (err) {
              console.error('Error checking favorite/follow status:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Blog not found or unable to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();

    // Cleanup: reset document title on unmount
    return () => {
      document.title = 'BookReview';
    };
  }, [id]);

  const handleClap = async () => {
    if (!blog) return;

    const newClapped = !isClapped;
    const newCount = newClapped ? clapCount + 1 : clapCount - 1;

    // Optimistic update
    setIsClapped(newClapped);
    setClapCount(newCount);

    try {
      await clapBlog(blog.id, newCount);
    } catch (err) {
      console.error('Error updating claps:', err);
      // Revert on error
      setIsClapped(!newClapped);
      setClapCount(clapCount);
    }
  };

  const handleFavorite = async () => {
    if (!blog || !currentUserId) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    try {
      const result = await toggleFavorite(currentUserId, 'blog', blog.id);
      setIsFavorited(result.favorited);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const handleFollow = async () => {
    if (!blog || !currentUserId) {
      navigate('/login');
      return;
    }

    if (blog.authorId === currentUserId) {
      return; // Can't follow yourself
    }

    try {
      const result = await toggleFollow(currentUserId, blog.authorId);
      setIsFollowing(result.following);
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.subtitle,
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
    if (!blog || !commentText.trim()) return;

    setSubmittingComment(true);
    const newComment: Comment = {
      id: Date.now(), // Temporary ID
      name: userName,
      text: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    // Optimistic update
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setCommentText('');

    try {
      const updateData: any = {
        comments: updatedComments.length,
        commentsArray: updatedComments, // Store full array
      };
      await updateBlog(blog.id, updateData);
      
      // Update local blog state
      setBlog({
        ...blog,
        comments: updatedComments.length,
        ...updateData,
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      // Revert on error
      setComments(comments);
      setCommentText(commentText);
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="blog-details-page">
        <Container>
          <div className="blog-details-layout">
            <article className="blog-article">
              <div className="skeleton skeleton-title-large"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-hero"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </article>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="blog-details-page">
        <Container>
          <div className="error-state">
            <h2 className="error-title">Blog Not Found</h2>
            <p className="error-message">
              {error || 'The blog you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <div className="error-actions">
              <Button variant="primary" onClick={() => navigate('/blogs')}>
                Browse All Blogs
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
    <div className="blog-details-page">
      <Container>
        <div className="blog-details-layout">
          {/* Floating Action Bar (Left Side) */}
          <aside className="floating-actions">
            <button 
              className={`floating-action-btn clap-btn ${isClapped ? 'clapped' : ''}`}
              onClick={handleClap}
            >
              <span className="action-icon-large">👏</span>
              <span className="action-count-large">{clapCount}</span>
            </button>
            <button className="floating-action-btn">
              <span className="action-icon-large">💬</span>
              <span className="action-count-large">
                {typeof blog.comments === 'number' ? blog.comments : comments.length}
              </span>
            </button>
            <button 
              className={`floating-action-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="action-icon-large">{isFavorited ? '⭐' : '☆'}</span>
            </button>
            <button 
              className="floating-action-btn"
              onClick={handleShare}
              title="Share this blog"
            >
              <span className="action-icon-large">↗</span>
            </button>
          </aside>

          {/* Main Content */}
          <article className="blog-article">
            {/* Section 1: Header */}
            <header className="blog-header">
              <h1 className="blog-title">{blog.title}</h1>
              <p className="blog-subtitle">{blog.subtitle}</p>
            </header>

            {/* Section 2: Author Information Block */}
            <div className="author-info-block">
              {author?.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="author-avatar-medium-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`author-avatar-medium ${author?.avatar ? 'hidden' : ''}`}></div>
              <div className="author-details">
                <span className="author-name-medium">{blog.authorName}</span>
                <span className="author-meta-separator">·</span>
                <span className="author-date">{formatDate(blog.date)}</span>
                <span className="author-meta-separator">·</span>
                <span className="author-read-time">{blog.readTime}</span>
              </div>
              <Button 
                variant="outline" 
                size="small"
                className="follow-btn"
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            {/* Section 3: Hero Image */}
            <div className="blog-hero-image">
              {blog.thumbnail ? (
                <img 
                  src={blog.thumbnail} 
                  alt={blog.title}
                  className="hero-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`hero-image-placeholder ${blog.thumbnail ? 'hidden' : ''}`}></div>
            </div>

            {/* Section 4: Blog Content */}
            <div className="blog-content">
              <div className="article-content">
                {blog.content.split('\n\n').map((paragraph, index) => {
                  // Handle markdown-style headings
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="content-heading">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  // Handle blockquotes
                  if (paragraph.startsWith('> ')) {
                    return (
                      <blockquote key={index} className="pull-quote">
                        {paragraph.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  // Handle lists
                  if (paragraph.includes('\n- ')) {
                    const lines = paragraph.split('\n');
                    const listItems = lines.filter(line => line.startsWith('- '));
                    if (listItems.length > 0) {
                      return (
                        <ul key={index}>
                          {listItems.map((item, i) => (
                            <li key={i}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                  }
                  // Regular paragraphs
                  return (
                    <p key={index}>{paragraph}</p>
                  );
                })}
              </div>
            </div>

            {/* Section 7: Tags */}
            <div className="blog-tags-section">
              {blog.tags.map((tag, index) => (
                <button key={index} className="blog-tag-chip">{tag}</button>
              ))}
            </div>

            {/* Section 8: Author Bio Card */}
            {author && (
              <Card className="author-bio-card">
                <div className="author-bio-content">
                  {author.avatar ? (
                    <img 
                      src={author.avatar} 
                      alt={author.name}
                      className="author-bio-avatar-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`author-bio-avatar ${author.avatar ? 'hidden' : ''}`}></div>
                  <div className="author-bio-text">
                    <h3 className="author-bio-name">{author.name}</h3>
                    <p className="author-bio-description">{author.bio}</p>
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Section 9: Related Blogs */}
            {relatedBlogs.length > 0 && (
              <section className="related-blogs-section">
                <h2 className="related-blogs-title">More from {blog.category}</h2>
                <div className="related-blogs-grid">
                  {relatedBlogs.map((related) => (
                    <Link key={related.id} to={`/blogs/${related.id}`} className="related-blog-card-link">
                      <Card className="related-blog-card">
                        <div className="related-blog-thumbnail">
                          {related.thumbnail ? (
                            <img 
                              src={related.thumbnail} 
                              alt={related.title}
                              className="related-blog-thumbnail-image"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`related-blog-thumbnail-placeholder ${related.thumbnail ? 'hidden' : ''}`}></div>
                        </div>
                        <h4 className="related-blog-title">{related.title}</h4>
                        <p className="related-blog-author">{related.authorName}</p>
                        <p className="related-blog-snippet">{related.subtitle}</p>
                        <span className="related-blog-link">Read more →</span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Section 10: Comments Section */}
            <section className="comments-section">
              <h3 className="comments-section-title">Comments</h3>
              
              <div className="comment-input-area">
                <div className="comment-input-header">
                  {author?.avatar ? (
                    <img 
                      src={author.avatar} 
                      alt={userName}
                      className="comment-user-avatar-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`comment-user-avatar ${author?.avatar ? 'hidden' : ''}`}></div>
                  <TextArea
                    placeholder="Write a comment..."
                    className="comment-textarea"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="small"
                  disabled={!commentText.trim() || submittingComment}
                  onClick={handleAddComment}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>

              <div className="comments-list">
                {comments.length > 0 ? (
                  comments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((comment) => (
                      <div key={comment.id} className="comment-item">
                        {comment.avatar ? (
                          <img 
                            src={comment.avatar} 
                            alt={comment.name}
                            className="comment-avatar-image"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`comment-avatar ${comment.avatar ? 'hidden' : ''}`}></div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">{comment.name}</span>
                            <span className="comment-time">{formatDate(comment.date)}</span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </section>
          </article>
        </div>
      </Container>
    </div>
  );
};

export default BlogDetailsPage;
