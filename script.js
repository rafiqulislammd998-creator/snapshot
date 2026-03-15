/**
 * LUMINA BLOG - MAIN JAVASCRIPT
 * ==============================
 * A modern, feature-rich blog website with:
 * - Dynamic blog post rendering
 * - Category filtering & search
 * - Dark/Light mode toggle
 * - Mobile navigation
 * - Scroll animations
 * - Article modal view
 */

// ============================================
// BLOG POSTS DATA (Simulating CMS)
// ============================================

// blogPosts data is now loaded from blog.js file
// Make sure to include: <script src="blog.js"></script> before this script

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    hamburger: document.getElementById('hamburger'),
    mobileMenu: document.getElementById('mobileMenu'),
    navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Scroll
    scrollProgress: document.getElementById('scrollProgress'),
    backToTop: document.getElementById('backToTop'),
    
    // Blog
    featuredArticle: document.getElementById('featuredArticle'),
    blogGrid: document.getElementById('blogGrid'),
    categoryFilters: document.getElementById('categoryFilters'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    noResults: document.getElementById('noResults'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    
    // Modal
    articleModal: document.getElementById('articleModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalContent: document.getElementById('modalContent'),
    
    // Forms
    contactForm: document.getElementById('contactForm'),
    newsletterForm: document.getElementById('newsletterForm'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')

    // Manager & Password
    , managerBtn: document.getElementById('managerBtn')
    , passwordModal: document.getElementById('passwordModal')
    , passwordModalOverlay: document.getElementById('passwordModalOverlay')
    , passwordModalClose: document.getElementById('passwordModalClose')
    , passwordForm: document.getElementById('passwordForm')
    , passwordInput: document.getElementById('passwordInput')
    , passwordError: document.getElementById('passwordError')
    , managerModal: document.getElementById('managerModal')
    , managerModalOverlay: document.getElementById('managerModalOverlay')
    , managerClose: document.getElementById('managerClose')
    , managerLogout: document.getElementById('managerLogout')
    , managerNavItems: document.querySelectorAll('.manager-nav-item')
    , uploadTab: document.getElementById('uploadTab')
    , manageTab: document.getElementById('manageTab')
    , uploadForm: document.getElementById('uploadForm')
    , blogTitleInput: document.getElementById('blogTitle')
    , blogCategoryInput: document.getElementById('blogCategory')
    , blogExcerptInput: document.getElementById('blogExcerpt')
    , blogContentInput: document.getElementById('blogContent')
    // Input for the blog image URL (no file upload)
    , blogImageUrlInput: document.getElementById('blogImageUrl')
    // Additional fields for author avatar and publish date
    , avatarUrlInput: document.getElementById('avatarUrl')
    , blogDateInput: document.getElementById('blogDate')
    , uploadSubmitBtn: document.getElementById('uploadSubmitBtn')
    , manageSearch: document.getElementById('manageSearch')
    , manageFilter: document.getElementById('manageFilter')
    , blogsList: document.getElementById('blogsList')
};

// ============================================
// STATE
// ============================================

const state = {
    currentCategory: 'all',
    searchQuery: '',
    displayedPosts: 6,
    postsPerLoad: 3,
    isDarkMode: false,
    // Manager authentication flag
    managerLoggedIn: false
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderFeaturedArticle();
    renderBlogPosts();
    initEventListeners();
    initLazyLoading();
    initScrollAnimations();

    // Fetch dynamic blogs from Firestore after initial render
    if (typeof fetchBlogs === 'function') {
        fetchBlogs();
    }
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    // Force dark mode by default. If the user has previously selected light mode
    // we honour that preference, otherwise default to dark.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function toggleTheme() {
    if (state.isDarkMode) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    state.isDarkMode = true;
    localStorage.setItem('theme', 'dark');
}

function enableLightMode() {
    document.documentElement.removeAttribute('data-theme');
    elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    state.isDarkMode = false;
    localStorage.setItem('theme', 'light');
}

// ============================================
// NAVIGATION
// ============================================

function toggleMobileMenu() {
    elements.hamburger.classList.toggle('active');
    elements.mobileMenu.classList.toggle('active');
    document.body.style.overflow = elements.mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    elements.hamburger.classList.remove('active');
    elements.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// SCROLL FEATURES
// ============================================

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    elements.scrollProgress.style.width = `${scrollPercent}%`;
}

function handleScroll() {
    const scrollTop = window.scrollY;
    
    // Update navbar
    if (scrollTop > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }
    
    // Update scroll progress
    updateScrollProgress();
    
    // Update active nav link
    updateActiveNavLink();
    
    // Show/hide back to top button
    if (scrollTop > 500) {
        elements.backToTop.classList.add('visible');
    } else {
        elements.backToTop.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// BLOG POSTS RENDERING
// ============================================

function renderFeaturedArticle() {
    const featured = blogPosts.find(post => post.featured);
    if (!featured) return;
    
    elements.featuredArticle.innerHTML = `
        <div class="featured-image">
            <img src="${featured.image}" alt="${featured.title}" loading="lazy">
            <span class="featured-category">${featured.category}</span>
        </div>
        <div class="featured-content">
            <div class="featured-meta">
                <span><i class="far fa-calendar"></i> ${formatDate(featured.date)}</span>
                <span><i class="far fa-clock"></i> ${featured.readTime}</span>
            </div>
            <h3 class="featured-title">${featured.title}</h3>
            <p class="featured-excerpt">${featured.excerpt}</p>
            <div class="featured-author">
                <img src="${featured.author.avatar}" alt="${featured.author.name}" class="author-avatar">
                <div class="author-info">
                    <span class="author-name">${featured.author.name}</span>
                    <span class="author-role">${featured.author.role}</span>
                </div>
                <button class="btn btn-primary" onclick="openArticle(${featured.id})">
                    <span>Read Article</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

function renderBlogPosts() {
    const filtered = getFilteredPosts();
    const postsToShow = filtered.slice(0, state.displayedPosts);
    
    // Show/hide no results message
    if (filtered.length === 0) {
        elements.blogGrid.innerHTML = '';
        elements.noResults.classList.add('visible');
        elements.loadMoreBtn.style.display = 'none';
        return;
    }
    
    elements.noResults.classList.remove('visible');
    
    // Render posts
    elements.blogGrid.innerHTML = postsToShow.map((post, index) => `
        <article class="blog-card animate-fadeInUp" style="animation-delay: ${index * 0.1}s" onclick="openArticle(${post.id})">
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <span class="blog-card-category">${post.category}</span>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
                    <span><i class="far fa-eye"></i> ${post.views}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <span class="read-more-btn">
                        Read More <i class="fas fa-arrow-right"></i>
                    </span>
                    <span class="read-time">${post.readTime}</span>
                </div>
            </div>
        </article>
    `).join('');
    
    // Show/hide load more button
    if (state.displayedPosts >= filtered.length) {
        elements.loadMoreBtn.style.display = 'none';
    } else {
        elements.loadMoreBtn.style.display = 'inline-flex';
    }
    
    // Re-init lazy loading for new images
    initLazyLoading();
}

function getFilteredPosts() {
    return blogPosts.filter(post => {
        // Filter by category
        const categoryMatch = state.currentCategory === 'all' || post.category === state.currentCategory;
        
        // Filter by search query
        const searchMatch = !state.searchQuery || 
            post.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(state.searchQuery.toLowerCase());
        
        return categoryMatch && searchMatch;
    });
}

function filterByCategory(category) {
    state.currentCategory = category;
    state.displayedPosts = 6; // Reset pagination
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    renderBlogPosts();
}

function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    state.displayedPosts = 6; // Reset pagination
    
    // Show/hide clear button
    elements.searchClear.classList.toggle('visible', state.searchQuery.length > 0);
    
    renderBlogPosts();
}

function clearSearch() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    state.displayedPosts = 6;
    elements.searchClear.classList.remove('visible');
    renderBlogPosts();
}

function loadMorePosts() {
    elements.loadMoreBtn.classList.add('loading');
    
    // Simulate loading delay
    setTimeout(() => {
        state.displayedPosts += state.postsPerLoad;
        renderBlogPosts();
        elements.loadMoreBtn.classList.remove('loading');
    }, 500);
}

// ============================================
// ARTICLE MODAL
// ============================================

function openArticle(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Ensure tags is an array to avoid errors if undefined
    const tags = post.tags || [];
    elements.modalContent.innerHTML = `
        <div class="article-header">
            <img src="${post.image}" alt="${post.title}" class="article-image">
            <div class="article-header-content">
                <span class="article-category">${post.category}</span>
                <h1 class="article-title">${post.title}</h1>
                <div class="article-meta">
                    <div class="article-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}">
                        <div class="article-author-info">
                            <span class="article-author-name">${post.author.name}</span>
                            <span class="article-date">${formatDate(post.date)} · ${post.readTime}</span>
                        </div>
                    </div>
                    <div class="article-stats">
                        <span class="article-stat"><i class="far fa-eye"></i> ${post.views}</span>
                        <span class="article-stat"><i class="far fa-heart"></i> ${post.likes}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="article-body">
            ${post.content}
        </div>
        <div class="article-footer">
            <div class="article-tags">
                ${tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
            </div>
            <div class="article-actions">
                <button class="article-action-btn" onclick="shareArticle(${post.id})" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="article-action-btn" onclick="likeArticle(${post.id})" title="Like">
                    <i class="far fa-heart"></i>
                </button>
                <button class="article-action-btn" onclick="closeArticleModal()" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    elements.articleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
    elements.articleModal.classList.remove('active');
    document.body.style.overflow = '';
}

function shareArticle(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (navigator.share) {
        navigator.share({
            title: post.title,
            text: post.excerpt,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
    }
}

function likeArticle(postId) {
    const post = blogPosts.find(p => p.id === postId);
    post.likes++;
    showToast('Article liked!');
    // Re-render to update like count
    openArticle(postId);
}

// ============================================
// FORMS
// ============================================

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Message sent successfully!');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simulate subscription
    const submitBtn = e.target.querySelector('button');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    setTimeout(() => {
        showToast('Successfully subscribed to newsletter!');
        e.target.reset();
        submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
    }, 1000);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('active');
    
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

// ============================================
// LAZY LOADING
// ============================================

function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => img.classList.add('loaded'));
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fadeInUp, .animate-fadeIn');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => animationObserver.observe(el));
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu
    elements.hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Back to top
    elements.backToTop.addEventListener('click', scrollToTop);
    
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
    });
    
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchClear.addEventListener('click', clearSearch);
    
    // Load more
    elements.loadMoreBtn.addEventListener('click', loadMorePosts);
    
    // Modal
    elements.modalOverlay.addEventListener('click', closeArticleModal);
    elements.modalClose.addEventListener('click', closeArticleModal);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.articleModal.classList.contains('active')) {
            closeArticleModal();
        }
    });
    
    // Forms
    elements.contactForm.addEventListener('submit', handleContactSubmit);
    elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    
    // Footer category links
    document.querySelectorAll('.footer-menu a[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            filterByCategory(category);
            document.getElementById('blog').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // =============================
    // MANAGER PANEL EVENTS
    // =============================
    // Open password modal
    if (elements.managerBtn) {
        elements.managerBtn.addEventListener('click', openPasswordModal);
    }

    // Password modal interactions
    if (elements.passwordModalOverlay) {
        elements.passwordModalOverlay.addEventListener('click', closePasswordModal);
    }
    if (elements.passwordModalClose) {
        elements.passwordModalClose.addEventListener('click', closePasswordModal);
    }
    if (elements.passwordForm) {
        elements.passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // Manager modal interactions
    if (elements.managerModalOverlay) {
        elements.managerModalOverlay.addEventListener('click', closeManagerModal);
    }
    if (elements.managerClose) {
        elements.managerClose.addEventListener('click', closeManagerModal);
    }
    if (elements.managerLogout) {
        elements.managerLogout.addEventListener('click', handleManagerLogout);
    }
    // Tab switching
    elements.managerNavItems.forEach(item => {
        item.addEventListener('click', () => switchManagerTab(item.dataset.tab));
    });

    // Image upload area
    if (elements.imageUploadArea) {
        elements.imageUploadArea.addEventListener('click', () => {
            elements.blogImageInput.click();
        });
        elements.imageUploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            e.stopPropagation();
            elements.imageUploadArea.classList.add('dragover');
        });
        elements.imageUploadArea.addEventListener('dragleave', e => {
            e.preventDefault();
            e.stopPropagation();
            elements.imageUploadArea.classList.remove('dragover');
        });
        elements.imageUploadArea.addEventListener('drop', handleDropImage);
    }
    if (elements.blogImageInput) {
        elements.blogImageInput.addEventListener('change', handleImageSelection);
    }
    if (elements.removeImageBtn) {
        elements.removeImageBtn.addEventListener('click', removeSelectedImage);
    }
    if (elements.uploadForm) {
        elements.uploadForm.addEventListener('submit', handleUploadFormSubmit);
    }
    // Manage search & filter
    if (elements.manageSearch) {
        elements.manageSearch.addEventListener('input', updateManageList);
    }
    if (elements.manageFilter) {
        elements.manageFilter.addEventListener('change', updateManageList);
    }
    // Delete blog item via delegation
    if (elements.blogsList) {
        elements.blogsList.addEventListener('click', handleBlogsListClick);
    }
}

// ============================================
// MANAGER PANEL & FIRESTORE FUNCTIONS
// ============================================

// Store dynamically loaded posts from Firestore
let dynamicPosts = [];
// In the link-based upload flow we no longer store an image file.
// Keeping a variable here for potential future use, but not used in current implementation.
let selectedImageFile = null;

/**
 * Show the password modal to prompt for manager access
 */
function openPasswordModal() {
    elements.passwordInput.value = '';
    if (elements.passwordError) elements.passwordError.style.display = 'none';
    elements.passwordModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the password modal
 */
function closePasswordModal() {
    elements.passwordModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Handle password form submission. Validates the passcode (4466).
 */
function handlePasswordSubmit(e) {
    e.preventDefault();
    const pass = elements.passwordInput.value.trim();
    if (pass === '4466') {
        state.managerLoggedIn = true;
        closePasswordModal();
        openManagerModal();
    } else {
        if (elements.passwordError) {
            elements.passwordError.style.display = 'block';
        }
    }
}

/**
 * Show the manager modal and fetch posts
 */
function openManagerModal() {
    elements.managerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Reset upload form inputs when opening panel
    if (elements.uploadForm) {
        elements.uploadForm.reset();
    }
    // Clear any previously entered image URL when opening the panel
    if (elements.blogImageUrlInput) {
        elements.blogImageUrlInput.value = '';
    }
    // Clear avatar URL and reset date to today
    if (elements.avatarUrlInput) {
        elements.avatarUrlInput.value = '';
    }
    if (elements.blogDateInput) {
        // Set date to current date in YYYY-MM-DD format
        elements.blogDateInput.value = new Date().toISOString().split('T')[0];
    }
    // Default to upload tab on open
    switchManagerTab('upload');
    // Fetch blogs from Firestore
    fetchBlogs();
}

/**
 * Hide the manager modal
 */
function closeManagerModal() {
    elements.managerModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Logout manager and close the panel
 */
function handleManagerLogout() {
    state.managerLoggedIn = false;
    closeManagerModal();
}

/**
 * Switch between upload and manage tabs within the manager panel
 * @param {string} tab - 'upload' or 'manage'
 */
function switchManagerTab(tab) {
    elements.managerNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    elements.uploadTab.classList.toggle('active', tab === 'upload');
    elements.manageTab.classList.toggle('active', tab === 'manage');
    if (tab === 'manage') {
        updateManageList();
    }
}

/**
 * Handle image selection from file input
 */
function handleImageSelection(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = function(evt) {
        elements.previewImg.src = evt.target.result;
        elements.imagePreview.style.display = 'flex';
        elements.imagePlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/**
 * Handle image drop (drag-and-drop) onto upload area
 */
function handleDropImage(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
        // Set the file input's files so that handleImageSelection processes it
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        elements.blogImageInput.files = dataTransfer.files;
        handleImageSelection({ target: { files: [file] } });
    }
    elements.imageUploadArea.classList.remove('dragover');
}

/**
 * Remove the currently selected image
 */
function removeSelectedImage() {
    selectedImageFile = null;
    if (elements.blogImageInput) {
        elements.blogImageInput.value = '';
    }
    elements.imagePreview.style.display = 'none';
    elements.imagePlaceholder.style.display = 'flex';
}

/**
 * Handle the upload form submission. Uploads image to Firebase Storage and post data to Firestore.
 */
async function handleUploadFormSubmit(e) {
    e.preventDefault();
    if (!state.managerLoggedIn) return;
    const title = elements.blogTitleInput.value.trim();
    const category = elements.blogCategoryInput.value;
    const excerpt = elements.blogExcerptInput.value.trim();
    const content = elements.blogContentInput.value.trim();
    if (!title || !category || !excerpt || !content) {
        showToast('Please fill out all fields.');
        return;
    }
    // Get the image URL from the input instead of a file
    const imageUrl = elements.blogImageUrlInput ? elements.blogImageUrlInput.value.trim() : '';
    if (!imageUrl) {
        showToast('Please provide a valid image URL.');
        return;
    }

    // Get optional avatar and date values
    const avatarUrl = elements.avatarUrlInput && elements.avatarUrlInput.value.trim();
    const dateValue = elements.blogDateInput && elements.blogDateInput.value;
    // Show loading indicator on button
    const btn = elements.uploadSubmitBtn;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    btn.disabled = true;
    try {
        const { addDoc, collection, serverTimestamp } = window.firebaseModules;
        // Store the post directly with the provided image URL.  
        // The imagePath is left empty since we are not uploading to Storage.
        await addDoc(collection(window.db, 'blogs'), {
            title,
            category,
            excerpt,
            content,
            image: imageUrl,
            imagePath: '',
            // Store the publish date provided by the user or default to today
            date: dateValue || new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
            readTime: '5 min read',
            views: '0',
            likes: 0,
            author: {
                name: 'Admin',
                // Use the avatar URL entered by the manager or a default avatar image
                avatar: avatarUrl || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=60',
                role: 'Admin'
            }
        });
        // Reset form and states
        elements.uploadForm.reset();
        // Clear image, avatar and date fields explicitly (reset does not repopulate date)
        if (elements.blogImageUrlInput) {
            elements.blogImageUrlInput.value = '';
        }
        if (elements.avatarUrlInput) {
            elements.avatarUrlInput.value = '';
        }
        if (elements.blogDateInput) {
            elements.blogDateInput.value = new Date().toISOString().split('T')[0];
        }
        showToast('Blog uploaded successfully!');
        // Re-fetch posts to include the new one
        await fetchBlogs();
        // Switch to manage tab to show new post
        switchManagerTab('manage');
    } catch (err) {
        console.error(err);
        showToast('Error uploading blog. Please try again.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

/**
 * Fetch blog entries from Firestore and merge with existing posts
 */
async function fetchBlogs() {
    if (!window.firebaseModules || !window.db) return;
    const { collection, getDocs, query, orderBy } = window.firebaseModules;
    try {
        const q = query(collection(window.db, 'blogs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        // Build dynamic posts array
        const newDynamic = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            let createdDate;
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                createdDate = data.createdAt.toDate();
            } else {
                createdDate = new Date();
            }
            // Use the explicit date saved in the document if available, otherwise derive from createdAt
            const postDate = data.date || createdDate.toISOString().split('T')[0];
            newDynamic.push({
                id: createdDate.getTime(),
                docId: docSnap.id,
                title: data.title,
                category: data.category,
                excerpt: data.excerpt,
                content: data.content,
                image: data.image,
                imagePath: data.imagePath || '',
                date: postDate,
                readTime: data.readTime || '5 min read',
                views: data.views || '0',
                likes: data.likes || 0,
                // Provide an empty array for tags if none were saved to avoid errors in openArticle
                tags: data.tags || [],
                author: data.author || { name: 'Admin', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=60', role: 'Admin' }
            });
        });
        dynamicPosts = newDynamic;
        // Remove previous dynamic posts from blogPosts
        for (let i = blogPosts.length - 1; i >= 0; i--) {
            if (blogPosts[i].docId) {
                blogPosts.splice(i, 1);
            }
        }
        // Append new dynamic posts
        blogPosts.push(...dynamicPosts);
        // Re-render articles for all users
        renderFeaturedArticle();
        renderBlogPosts();
        // Update manage list if panel open and manage tab active
        if (elements.managerModal.classList.contains('active') && elements.manageTab.classList.contains('active')) {
            updateManageList();
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Build the manage list UI based on dynamic posts and filters
 */
function updateManageList() {
    if (!elements.blogsList) return;
    let filtered = dynamicPosts.slice();
    const search = elements.manageSearch && elements.manageSearch.value.trim().toLowerCase();
    const filterCategory = elements.manageFilter && elements.manageFilter.value;
    if (search) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(search) || p.excerpt.toLowerCase().includes(search));
    }
    if (filterCategory && filterCategory !== 'all') {
        filtered = filtered.filter(p => p.category === filterCategory);
    }
    const html = filtered.map(post => {
        return `
            <div class="blog-item" data-doc-id="${post.docId}">
                <div class="blog-item-info">
                    <img src="${post.image}" alt="${post.title}" class="blog-item-thumb">
                    <div>
                        <div class="blog-item-title">${post.title}</div>
                        <div class="blog-item-meta">${post.category} · ${formatDate(post.date)}</div>
                    </div>
                </div>
                <button class="delete-blog" data-doc-id="${post.docId}" data-image-path="${post.imagePath}" aria-label="Delete blog">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');
    elements.blogsList.innerHTML = html;
}

/**
 * Handle click events inside the manage blogs list (for deletion)
 */
async function handleBlogsListClick(e) {
    const deleteBtn = e.target.closest('.delete-blog');
    if (!deleteBtn) return;
    const docId = deleteBtn.dataset.docId;
    const imagePath = deleteBtn.dataset.imagePath;
    if (!docId) return;
    const confirmed = confirm('Are you sure you want to delete this blog?');
    if (!confirmed) return;
    try {
        const { deleteDoc, doc, deleteObject, ref } = window.firebaseModules;
        await deleteDoc(doc(window.db, 'blogs', docId));
        if (imagePath) {
            await deleteObject(ref(window.storage, imagePath));
        }
        showToast('Blog deleted successfully!');
        // Remove from blogPosts array
        for (let i = blogPosts.length - 1; i >= 0; i--) {
            if (blogPosts[i].docId === docId) {
                blogPosts.splice(i, 1);
                break;
            }
        }
        // Re-fetch dynamic posts to refresh lists
        await fetchBlogs();
    } catch (err) {
        console.error(err);
        showToast('Error deleting blog. Please try again.');
    }
}

// ============================================
// SERVICE WORKER (for offline support)
// ============================================

// Register the service worker only when the site is served over HTTP/HTTPS.  
// Service workers cannot be registered from the `file:` protocol, which is used when opening the HTML file directly in a browser.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        // Simple service worker for offline caching
        const swCode = `
            self.addEventListener('install', e => {
                e.waitUntil(
                    caches.open('lumina-blog-v1').then(cache => {
                        return cache.addAll([
                            '/',
                            '/index.html',
                            '/style.css',
                            '/script.js'
                        ]);
                    })
                );
            });
            
            self.addEventListener('fetch', e => {
                e.respondWith(
                    caches.match(e.request).then(response => {
                        return response || fetch(e.request);
                    })
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl).catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    });
}
