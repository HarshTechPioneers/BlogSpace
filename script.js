// ============================================
// Blog Platform JavaScript - Main Application Logic
// ============================================

/**
 * Blog Platform Application
 * A complete frontend blog management system using localStorage
 * Features: CRUD operations, search, filter, themes, responsive design
 */

class BlogPlatform {
    constructor() {
        // Initialize application state
        this.blogs = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.currentTheme = 'light';
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     * Sets up event listeners and loads existing data
     */
    init() {
        this.loadBlogsFromStorage();
        this.loadThemeFromStorage();
        this.setupEventListeners();
        this.renderBlogs();
        this.updateStats();
        this.updateCategoryFilter();
        
        console.log('Blog Platform initialized successfully!');
    }

    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        // Modal controls
        document.getElementById('add-blog-btn').addEventListener('click', () => this.openAddBlogModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeBlogModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeBlogModal());
        
        // Delete modal controls
        document.getElementById('close-delete-modal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());
        
        // Form submission
        document.getElementById('blog-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Filter functionality
        document.getElementById('category-filter').addEventListener('change', (e) => this.handleCategoryFilter(e.target.value));
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeBlogModal();
                this.closeDeleteModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeBlogModal();
                this.closeDeleteModal();
            }
        });
    }

    /**
     * Load blogs from localStorage
     */
    loadBlogsFromStorage() {
        try {
            const storedBlogs = localStorage.getItem('blogPlatform_blogs');
            this.blogs = storedBlogs ? JSON.parse(storedBlogs) : [];
        } catch (error) {
            console.error('Error loading blogs from storage:', error);
            this.blogs = [];
        }
    }

    /**
     * Save blogs to localStorage
     */
    saveBlogsToStorage() {
        try {
            localStorage.setItem('blogPlatform_blogs', JSON.stringify(this.blogs));
        } catch (error) {
            console.error('Error saving blogs to storage:', error);
        }
    }

    /**
     * Load theme preference from localStorage
     */
    loadThemeFromStorage() {
        try {
            const storedTheme = localStorage.getItem('blogPlatform_theme');
            this.currentTheme = storedTheme || 'light';
            this.applyTheme();
        } catch (error) {
            console.error('Error loading theme from storage:', error);
        }
    }

    /**
     * Save theme preference to localStorage
     */
    saveThemeToStorage() {
        try {
            localStorage.setItem('blogPlatform_theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme to storage:', error);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveThemeToStorage();
    }

    /**
     * Apply the current theme to the document
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label', `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme`);
    }

    /**
     * Open the add blog modal
     */
    openAddBlogModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Blog Post';
        document.getElementById('save-btn').textContent = 'Save Blog';
        this.clearForm();
        this.showModal('blog-modal');
    }

    /**
     * Open the edit blog modal with existing data
     */
    openEditBlogModal(id) {
        const blog = this.blogs.find(b => b.id === id);
        if (!blog) return;

        this.currentEditId = id;
        document.getElementById('modal-title').textContent = 'Edit Blog Post';
        document.getElementById('save-btn').textContent = 'Update Blog';
        
        // Populate form with existing data
        document.getElementById('blog-title').value = blog.title;
        document.getElementById('blog-author').value = blog.author;
        document.getElementById('blog-category').value = blog.category;
        document.getElementById('blog-tags').value = blog.tags.join(', ');
        document.getElementById('blog-content').value = blog.content;
        
        this.showModal('blog-modal');
    }

    /**
     * Close the blog modal
     */
    closeBlogModal() {
        this.hideModal('blog-modal');
        this.clearForm();
        this.currentEditId = null;
    }

    /**
     * Open delete confirmation modal
     */
    openDeleteModal(id) {
        this.currentDeleteId = id;
        this.showModal('delete-modal');
    }

    /**
     * Close delete confirmation modal
     */
    closeDeleteModal() {
        this.hideModal('delete-modal');
        this.currentDeleteId = null;
    }

    /**
     * Show a modal by ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        
        // Focus on first input if it's the blog modal
        if (modalId === 'blog-modal') {
            setTimeout(() => {
                document.getElementById('blog-title').focus();
            }, 300);
        }
    }

    /**
     * Hide a modal by ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    /**
     * Clear the blog form
     */
    clearForm() {
        document.getElementById('blog-form').reset();
        this.clearFormErrors();
    }

    /**
     * Clear form validation errors
     */
    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    /**
     * Validate form input
     */
    validateForm(formData) {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!formData.author.trim()) {
            errors.author = 'Author is required';
        }

        if (!formData.category.trim()) {
            errors.category = 'Category is required';
        }

        if (!formData.content.trim()) {
            errors.content = 'Content is required';
        }

        return errors;
    }

    /**
     * Display form validation errors
     */
    displayFormErrors(errors) {
        this.clearFormErrors();
        
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
        });
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            title: document.getElementById('blog-title').value.trim(),
            author: document.getElementById('blog-author').value.trim(),
            category: document.getElementById('blog-category').value.trim(),
            tags: document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            content: document.getElementById('blog-content').value.trim()
        };

        // Validate form
        const errors = this.validateForm(formData);
        
        if (Object.keys(errors).length > 0) {
            this.displayFormErrors(errors);
            return;
        }

        // Save or update blog
        if (this.currentEditId) {
            this.updateBlog(this.currentEditId, formData);
        } else {
            this.addBlog(formData);
        }

        this.closeBlogModal();
    }

    /**
     * Add a new blog post
     */
    addBlog(blogData) {
        const newBlog = {
            id: this.generateId(),
            ...blogData,
            date: new Date().toISOString(),
            dateFormatted: this.formatDate(new Date())
        };

        this.blogs.unshift(newBlog); // Add to beginning of array
        this.saveBlogsToStorage();
        this.renderBlogs();
        this.updateStats();
        this.updateCategoryFilter();
        
        console.log('Blog added successfully:', newBlog);
    }

    /**
     * Update an existing blog post
     */
    updateBlog(id, blogData) {
        const index = this.blogs.findIndex(blog => blog.id === id);
        if (index === -1) return;

        this.blogs[index] = {
            ...this.blogs[index],
            ...blogData,
            updatedDate: new Date().toISOString()
        };

        this.saveBlogsToStorage();
        this.renderBlogs();
        this.updateStats();
        this.updateCategoryFilter();
        
        console.log('Blog updated successfully:', this.blogs[index]);
    }

    /**
     * Confirm and delete a blog post
     */
    confirmDelete() {
        if (!this.currentDeleteId) return;

        this.blogs = this.blogs.filter(blog => blog.id !== this.currentDeleteId);
        this.saveBlogsToStorage();
        this.renderBlogs();
        this.updateStats();
        this.updateCategoryFilter();
        this.closeDeleteModal();
        
        console.log('Blog deleted successfully');
    }

    /**
     * Generate a unique ID for blog posts
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format date for display
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    /**
     * Render all blog posts
     */
    renderBlogs(blogsToRender = this.blogs) {
        const container = document.getElementById('blogs-container');
        const noResultsMessage = document.getElementById('no-blogs-message');

        if (blogsToRender.length === 0) {
            container.innerHTML = '';
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';
        
        container.innerHTML = blogsToRender.map(blog => this.createBlogCard(blog)).join('');
        
        // Add event listeners to action buttons
        this.attachBlogEventListeners();
    }

    /**
     * Create HTML for a single blog card
     */
    createBlogCard(blog) {
        return `
            <article class="blog-card">
                <header class="blog-header">
                    <h2 class="blog-title">${this.escapeHtml(blog.title)}</h2>
                    <div class="blog-meta">
                        <span class="blog-author">By ${this.escapeHtml(blog.author)}</span>
                        <span class="blog-date">${blog.dateFormatted}</span>
                        <span class="blog-category">${this.escapeHtml(blog.category)}</span>
                    </div>
                </header>
                
                <div class="blog-content">
                    ${this.escapeHtml(blog.content)}
                </div>
                
                ${blog.tags.length > 0 ? `
                    <div class="blog-tags">
                        ${blog.tags.map(tag => `<span class="blog-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                
                <footer class="blog-actions">
                    <button class="btn btn-secondary btn-small edit-btn" data-id="${blog.id}">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-small delete-btn" data-id="${blog.id}">
                        🗑️ Delete
                    </button>
                </footer>
            </article>
        `;
    }

    /**
     * Attach event listeners to blog action buttons
     */
    attachBlogEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.openEditBlogModal(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.openDeleteModal(id);
            });
        });
    }

    /**
     * Handle search functionality
     */
    handleSearch(query) {
        const filteredBlogs = this.filterBlogs(query, this.getCurrentCategoryFilter());
        this.renderBlogs(filteredBlogs);
    }

    /**
     * Handle category filter
     */
    handleCategoryFilter(category) {
        const filteredBlogs = this.filterBlogs(this.getCurrentSearchQuery(), category);
        this.renderBlogs(filteredBlogs);
    }

    /**
     * Get current search query
     */
    getCurrentSearchQuery() {
        return document.getElementById('search-input').value.trim().toLowerCase();
    }

    /**
     * Get current category filter
     */
    getCurrentCategoryFilter() {
        return document.getElementById('category-filter').value;
    }

    /**
     * Filter blogs based on search query and category
     */
    filterBlogs(searchQuery = '', category = '') {
        let filtered = this.blogs;

        // Filter by search query (title and tags)
        if (searchQuery) {
            filtered = filtered.filter(blog => 
                blog.title.toLowerCase().includes(searchQuery) ||
                blog.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );
        }

        // Filter by category
        if (category) {
            filtered = filtered.filter(blog => blog.category === category);
        }

        return filtered;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        this.renderBlogs();
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const totalBlogs = this.blogs.length;
        const uniqueCategories = [...new Set(this.blogs.map(blog => blog.category))].length;

        document.getElementById('total-blogs').textContent = totalBlogs;
        document.getElementById('total-categories').textContent = uniqueCategories;
    }

    /**
     * Update category filter dropdown
     */
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        const currentValue = categoryFilter.value;
        
        // Get unique categories
        const categories = [...new Set(this.blogs.map(blog => blog.category))].sort();
        
        // Clear existing options except the first one
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (categories.includes(currentValue)) {
            categoryFilter.value = currentValue;
        }
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Global functions for HTML onclick handlers
// ============================================

/**
 * Global function to open add blog modal
 * Called from the empty state button
 */
function openAddBlogModal() {
    if (window.blogPlatform) {
        window.blogPlatform.openAddBlogModal();
    }
}

// ============================================
// Application Initialization
// ============================================

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create global blog platform instance
    window.blogPlatform = new BlogPlatform();
    
    // Add some sample data if no blogs exist (for demo purposes)
    if (window.blogPlatform.blogs.length === 0) {
        console.log('No existing blogs found. Adding sample data...');
        
        const sampleBlogs = [
            {
                title: "Getting Started with JavaScript",
                author: "Jane Developer",
                category: "Technology",
                tags: ["javascript", "programming", "beginner"],
                content: "JavaScript is a versatile programming language that powers the modern web. In this comprehensive guide, we'll explore the fundamentals of JavaScript, from basic syntax to advanced concepts. Whether you're a complete beginner or looking to refresh your knowledge, this post will provide you with a solid foundation to build upon. We'll cover variables, functions, objects, and much more!"
            },
            {
                title: "The Art of Minimalist Living",
                author: "John Minimalist",
                category: "Lifestyle",
                tags: ["minimalism", "lifestyle", "wellness"],
                content: "Minimalist living isn't just about having fewer possessions—it's about creating space for what truly matters in your life. In this post, we'll explore practical strategies for decluttering your physical and mental space, finding joy in simplicity, and developing a more intentional approach to your daily routines. Discover how less can truly become more."
            },
            {
                title: "Hidden Gems of Southeast Asia",
                author: "Sarah Explorer",
                category: "Travel",
                tags: ["travel", "asia", "adventure"],
                content: "Southeast Asia is home to some of the world's most breathtaking destinations, many of which remain off the beaten path. Join me as we explore hidden temples, pristine beaches, and vibrant local markets that showcase the authentic culture and natural beauty of this incredible region. From secret waterfalls to ancient ruins, these destinations will leave you speechless."
            }
        ];
        
        sampleBlogs.forEach(blogData => {
            window.blogPlatform.addBlog(blogData);
        });
    }
});

// ============================================
// Error Handling and Logging
// ============================================

/**
 * Global error handler for unhandled errors
 */
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log('Blog Platform script loaded successfully!');