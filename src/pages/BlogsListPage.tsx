import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { getBlogs, getTrendingBlogs, searchBlogs, getBlogsByCategory, getBlogsByTag } from '../services/blogsService';
import { getUsers } from '../services/usersService';
import type { Blog } from '../services/blogsService';
import type { User } from '../services/usersService';
import './BlogsListPage.css';

const BlogsListPage = () => {
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [topAuthors, setTopAuthors] = useState<User[]>([]);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [authorAvatars, setAuthorAvatars] = useState<Record<number, string>>({});

  const blogsPerPage = 6;

  // Fetch blogs and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [blogsData, usersData] = await Promise.all([
          getBlogs(),
          getUsers()
        ]);
        
        // Sort blogs by date (newest first)
        const sorted = blogsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAllBlogs(sorted);
        setBlogs(sorted);
        
        // Get trending blogs (top 4 by claps)
        const trending = await getTrendingBlogs(4);
        setTrendingBlogs(trending);
        
        // Extract unique tags
        const tags = Array.from(new Set(blogsData.flatMap(blog => blog.tags)));
        setUniqueTags(tags.sort());
        
        // Extract unique categories
        const categories = Array.from(new Set(blogsData.map(blog => blog.category)));
        setUniqueCategories(categories.sort());
        
        // Get top authors (by stats)
        const top = usersData
          .sort((a, b) => (b.stats.blogs + b.stats.reviews) - (a.stats.blogs + a.stats.reviews))
          .slice(0, 5);
        setTopAuthors(top);
        
        // Create author avatars map
        const avatarsMap: Record<number, string> = {};
        usersData.forEach(user => {
          if (user.avatar) {
            avatarsMap[user.id] = user.avatar;
          }
        });
        setAuthorAvatars(avatarsMap);
        
        // Set document title
        document.title = 'Blogs — BookReview';
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Unable to load blogs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup: reset document title
    return () => {
      document.title = 'BookReview';
    };
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        // If search is empty, apply category/tag filters only
        applyFilters(selectedCategory, selectedTag);
        return;
      }

      try {
        const results = await searchBlogs(searchQuery);
        let filtered = results;
        
        // Apply category filter
        if (selectedCategory !== 'All Categories') {
          filtered = filtered.filter(b => b.category === selectedCategory);
        }
        
        // Apply tag filter
        if (selectedTag) {
          filtered = filtered.filter(b => b.tags.includes(selectedTag));
        }
        
        setBlogs(filtered);
        
        // Update trending based on filtered results
        const trending = filtered
          .sort((a, b) => b.claps - a.claps)
          .slice(0, 4);
        setTrendingBlogs(trending);
      } catch (err) {
        console.error('Error searching blogs:', err);
        setError('Unable to search blogs. Please try again.');
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, selectedTag, allBlogs]);

  // Apply filters function
  const applyFilters = async (category: string, tag: string) => {
    try {
      let filtered = allBlogs;
      
      // Apply category filter
      if (category !== 'All Categories') {
        const categoryResults = await getBlogsByCategory(category);
        filtered = categoryResults;
      }
      
      // Apply tag filter
      if (tag) {
        if (category !== 'All Categories') {
          filtered = filtered.filter(b => b.tags.includes(tag));
        } else {
          const tagResults = await getBlogsByTag(tag);
          filtered = tagResults;
        }
      }
      
      setBlogs(filtered);
      
      // Update trending based on filtered results
      const trending = filtered
        .sort((a, b) => b.claps - a.claps)
        .slice(0, 4);
      setTrendingBlogs(trending);
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  // Handle category filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      applyFilters(selectedCategory, selectedTag);
    }
  }, [selectedCategory, selectedTag, searchQuery, allBlogs]);

  // Pagination
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    return blogs.slice(startIndex, startIndex + blogsPerPage);
  }, [blogs, currentPage]);

  // Featured blog (first blog from filtered list)
  const featuredBlog = useMemo(() => {
    return blogs.length > 0 ? blogs[0] : null;
  }, [blogs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag]);

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

  // Loading skeletons
  const FeaturedSkeleton = () => (
    <Card className="featured-blog-card">
      <div className="featured-blog-image">
        <div className="featured-image-placeholder skeleton skeleton-hero"></div>
      </div>
      <div className="featured-blog-content">
        <div className="skeleton skeleton-chip"></div>
        <div className="skeleton skeleton-title-large"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
    </Card>
  );

  const TrendingSkeleton = () => (
    <div className="trending-item">
      <div className="trending-thumbnail skeleton"></div>
      <div className="trending-content">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
    </div>
  );

  const BlogSkeleton = () => (
    <div className="blog-preview-card">
      <div className="blog-preview-content">
        <div className="blog-thumbnail skeleton"></div>
        <div className="blog-preview-text">
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="blogs-list-page">
      <Container>
        {/* Section 1: Page Header / Hero */}
        <header className="blogs-hero">
          <div className="hero-content">
            <h1 className="blogs-title">Blogs</h1>
            <p className="blogs-subtitle">Stories, recommendations, and essays from our readers.</p>
          </div>
          <Link to="/write-blog">
            <Button variant="primary" size="large">Write a Blog</Button>
          </Link>
        </header>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Section 2: Featured Blog */}
        {!error && (
          <section className="featured-blog-section">
            {loading ? (
              <FeaturedSkeleton />
            ) : featuredBlog ? (
              <Link to={`/blogs/${featuredBlog.id}`} className="featured-blog-link">
                <Card className="featured-blog-card">
                  <div className="featured-blog-image">
                    {featuredBlog.thumbnail ? (
                      <img 
                        src={featuredBlog.thumbnail} 
                        alt={featuredBlog.title}
                        className="featured-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`featured-image-placeholder ${featuredBlog.thumbnail ? 'hidden' : ''}`}></div>
                  </div>
                  <div className="featured-blog-content">
                    <span className="featured-category">{featuredBlog.category}</span>
                    <h2 className="featured-blog-title">{featuredBlog.title}</h2>
                    <p className="featured-blog-subtitle">{featuredBlog.subtitle}</p>
                    <div className="featured-blog-meta">
                      <div className="featured-author-info">
                        {authorAvatars[featuredBlog.authorId] ? (
                          <img 
                            src={authorAvatars[featuredBlog.authorId]} 
                            alt={featuredBlog.authorName}
                            className="featured-author-avatar-image"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`featured-author-avatar ${authorAvatars[featuredBlog.authorId] ? 'hidden' : ''}`}></div>
                        <span className="featured-author-name">{featuredBlog.authorName}</span>
                      </div>
                      <span className="featured-read-time">{featuredBlog.readTime}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : null}
          </section>
        )}

        {/* Section 3: Trending / Editors' Picks */}
        {!error && (
          <section className="trending-section">
            <h3 className="trending-title">Trending on BookReview</h3>
            {loading ? (
              <div className="trending-list">
                {[...Array(4)].map((_, i) => (
                  <TrendingSkeleton key={i} />
                ))}
              </div>
            ) : trendingBlogs.length > 0 ? (
              <div className="trending-list">
                {trendingBlogs.map((blog) => (
                  <Link key={blog.id} to={`/blogs/${blog.id}`} className="trending-item">
                    {blog.thumbnail ? (
                      <img 
                        src={blog.thumbnail} 
                        alt={blog.title}
                        className="trending-thumbnail-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`trending-thumbnail ${blog.thumbnail ? 'hidden' : ''}`}></div>
                    <div className="trending-content">
                      <h4 className="trending-item-title">{blog.title}</h4>
                      <p className="trending-item-author">{blog.authorName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-trending">No trending blogs available.</p>
            )}
          </section>
        )}

        {/* Search and Filters */}
        {!error && !loading && (
          <div className="blogs-filters">
            <div className="search-wrapper">
              <input
                type="search"
                placeholder="Search blogs..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select 
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Section 4: Main Content - Two Column Layout */}
        {!error && (
          <div className="blogs-main-layout">
            {/* Left Column: Blog List */}
            <main className="blogs-list-column">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <BlogSkeleton key={i} />
                ))
              ) : paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <Link key={blog.id} to={`/blogs/${blog.id}`} className="blog-preview-card">
                    <div className="blog-preview-content">
                      {blog.thumbnail ? (
                        <img 
                          src={blog.thumbnail} 
                          alt={blog.title}
                          className="blog-thumbnail-image"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`blog-thumbnail ${blog.thumbnail ? 'hidden' : ''}`}></div>
                      <div className="blog-preview-text">
                        <div className="blog-category-tag">{blog.category}</div>
                        <h3 className="blog-preview-title">{blog.title}</h3>
                        <p className="blog-preview-subtitle">{blog.subtitle}</p>
                        <div className="blog-preview-meta">
                          <div className="blog-author-row">
                            {authorAvatars[blog.authorId] ? (
                              <img 
                                src={authorAvatars[blog.authorId]} 
                                alt={blog.authorName}
                                className="blog-author-avatar-image"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`blog-author-avatar ${authorAvatars[blog.authorId] ? 'hidden' : ''}`}></div>
                            <span className="blog-author-name">{blog.authorName}</span>
                            <span className="blog-meta-separator">•</span>
                            <span className="blog-date">{formatDate(blog.date)}</span>
                            <span className="blog-meta-separator">•</span>
                            <span className="blog-read-time">{blog.readTime}</span>
                          </div>
                          <div className="blog-actions">
                            <span className="blog-claps">Claps {blog.claps}</span>
                          </div>
                        </div>
                        <div className="blog-tags">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <button
                              key={index}
                              className={`blog-tag ${selectedTag === tag ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedTag(selectedTag === tag ? '' : tag);
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <p className="empty-state-text">
                    {searchQuery || selectedCategory !== 'All Categories' || selectedTag
                      ? 'No blogs found. Try a different search or filter.'
                      : selectedCategory !== 'All Categories'
                      ? `No blogs in ${selectedCategory} category yet.`
                      : 'No blogs available.'}
                  </p>
                </div>
              )}
            </main>

            {/* Right Column: Sidebar */}
            <aside className="blogs-sidebar">
              {/* About / Author Spotlight */}
              <Card className="sidebar-widget">
                <h4 className="widget-title">About BookReview</h4>
                <p className="widget-text">
                  A platform where readers share their thoughts, discover new books, and connect with a community of book lovers.
                </p>
              </Card>

              {/* Popular Tags */}
              {uniqueTags.length > 0 && (
                <Card className="sidebar-widget">
                  <h4 className="widget-title">Popular Tags</h4>
                  <div className="tags-list">
                    {uniqueTags.slice(0, 6).map((tag, index) => (
                      <button
                        key={index}
                        className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Top Authors */}
              {topAuthors.length > 0 && (
                <Card className="sidebar-widget">
                  <h4 className="widget-title">Top Authors</h4>
                  <div className="authors-list">
                    {topAuthors.map((author) => (
                      <div key={author.id} className="author-item">
                        {author.avatar ? (
                          <img 
                            src={author.avatar} 
                            alt={author.name}
                            className="author-avatar-small-image"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`author-avatar-small ${author.avatar ? 'hidden' : ''}`}></div>
                        <div className="author-info">
                          <span className="author-name-small">{author.name}</span>
                          <span className="author-followers">
                            {author.stats.blogs + author.stats.reviews} posts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Subscribe CTA */}
              <Card className="sidebar-widget">
                <h4 className="widget-title">Subscribe to Newsletter</h4>
                <p className="widget-text">Get the latest blog posts and book recommendations delivered to your inbox.</p>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="subscribe-input"
                />
                <Button variant="primary" size="small" className="subscribe-btn">Subscribe</Button>
              </Card>
            </aside>
          </div>
        )}

        {/* Section 6: Pagination */}
        {!error && !loading && totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
            </div>
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BlogsListPage;
