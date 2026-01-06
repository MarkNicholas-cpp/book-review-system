import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import { createBlog } from '../services/blogsService';
import { getCurrentUserId, getCurrentUser } from '../auth/authClient';
import './CreateBlogPage.css';

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  
  // Field errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const categories = [
    'Technology',
    'Personal',
    'Science',
    'Lifestyle',
    'Education',
    'Recommendations',
    'Community',
    'Entertainment',
  ];

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
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Reset errors
    setTitleError(null);
    setSubtitleError(null);
    setContentError(null);
    setCategoryError(null);
    
    // Validation
    let hasErrors = false;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      hasErrors = true;
    }
    
    if (!subtitle.trim()) {
      setSubtitleError('Subtitle is required');
      hasErrors = true;
    }
    
    if (!content.trim()) {
      setContentError('Content is required');
      hasErrors = true;
    }
    
    if (!category) {
      setCategoryError('Please select a category');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    const userId = getCurrentUserId();
    if (!userId) {
      setError('You must be logged in to create a blog');
      return;
    }
    
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      // Parse tags from comma-separated string
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const blogData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category,
        tags: tagsArray,
        thumbnail: thumbnail.trim() || undefined,
        authorId: userId,
        authorName: user?.name || 'Anonymous',
      };
      
      const newBlog = await createBlog(blogData);
      navigate(`/blogs/${newBlog.id}`);
    } catch (err: any) {
      console.error('Error creating blog:', err);
      setError(err.message || 'Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-page">
      <Container>
        <div className="create-blog-header">
          <h1 className="page-title">Write a Blog Post</h1>
          <p className="page-subtitle">Share your thoughts, stories, and recommendations with the community</p>
        </div>

        <Card className="create-blog-card">
          {error && (
            <div className="form-error" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form className="create-blog-form" onSubmit={handleSubmit} noValidate>
            <Input
              type="text"
              label="Blog Title"
              placeholder="Enter a compelling title for your blog post"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
                setError(null);
              }}
              error={titleError || undefined}
              disabled={loading}
              required
              className="form-input"
            />

            <Input
              type="text"
              label="Subtitle"
              placeholder="A brief description or hook for your blog post"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                setSubtitleError(null);
                setError(null);
              }}
              error={subtitleError || undefined}
              disabled={loading}
              required
              className="form-input"
            />

            <TextArea
              label="Content"
              placeholder="Write your blog post here. You can use markdown-style formatting:
              
## Headings
> Blockquotes
- Lists

Feel free to express your thoughts and ideas!"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setContentError(null);
                setError(null);
              }}
              error={contentError || undefined}
              disabled={loading}
              required
              rows={15}
              className="form-textarea"
            />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category-select">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category-select"
                  className={`form-select ${categoryError ? 'error' : ''}`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCategoryError(null);
                    setError(null);
                  }}
                  disabled={loading}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {categoryError && <span className="form-error-message">{categoryError}</span>}
              </div>

              <div className="form-group">
                <Input
                  type="text"
                  label="Tags (comma-separated)"
                  placeholder="e.g., Books, Reading, Fiction, Recommendations"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
                <span className="form-help-text">Separate multiple tags with commas</span>
              </div>
            </div>

            <Input
              type="url"
              label="Thumbnail Image URL (Optional)"
              placeholder="https://example.com/blog-image.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              disabled={loading}
              className="form-input"
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/blogs')}
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
                {loading ? 'Publishing...' : 'Publish Blog'}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default CreateBlogPage;
