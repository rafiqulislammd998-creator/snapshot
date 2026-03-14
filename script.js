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
};

// ============================================
// STATE
// ============================================

const state = {
    currentCategory: 'all',
    searchQuery: '',
    displayedPosts: 6,
    postsPerLoad: 3,
    isDarkMode: false
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
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
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
                ${post.tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
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
}

// ============================================
// SERVICE WORKER (for offline support)
// ============================================

if ('serviceWorker' in navigator) {
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
