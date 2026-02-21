/**
 * StudyNote - Smart Notebook Application
 * Features: Firebase Firestore, Cloudinary Image Upload, Categories, Tags, Search, Themes
 */

// ==================== CONFIGURATION ====================

const CLOUDINARY_CONFIG = {
    cloudName: "dgeukkdc9",
    uploadPreset: "notebook",   // ✅ Preset নাম একদম Cloudinary এর সাথে মিলবে
};

// ==================== CLOUDINARY SERVICE ====================

class CloudinaryService {
    constructor(config) {
        this.cloudName = config.cloudName;
        this.uploadPreset = config.uploadPreset;
        this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }

    async uploadImage(file) {

        if (!file || !file.type.startsWith("image/")) {
            throw new Error("Only image files are allowed");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.uploadPreset);

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Upload failed");
            }

            const data = await response.json();
            return data.secure_url;

        } catch (err) {
            console.error("Cloudinary Upload Error:", err);
            throw err;
        }
    }

    async uploadMultiple(files) {

        if (!files || files.length === 0) return [];

        const urls = [];

        for (const file of files) {
            const url = await this.uploadImage(file);
            urls.push(url);
        }

        return urls;
    }
}

// ==================== INSTANCE ====================

const cloudinaryService = new CloudinaryService(CLOUDINARY_CONFIG);

// ==================== FIRESTORE SERVICE ====================

class FirestoreService {
    constructor(db, firestore) {
        this.db = db;
        this.fs = firestore;
        this.notesCollection = 'notes';
        this.categoriesCollection = 'categories';
        this.trashCollection = 'trash';
    }

    async addNote(noteData) {
        try {
            const docRef = await this.fs.addDoc(
                this.fs.collection(this.db, this.notesCollection),
                {
                    ...noteData,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            );
            return { id: docRef.id, ...noteData };
        } catch (error) {
            console.error('Error adding note:', error);
            throw new Error(`Failed to save note: ${error.message}`);
        }
    }

    async updateNote(noteId, updates) {
        try {
            const noteRef = this.fs.doc(this.db, this.notesCollection, noteId);
            await this.fs.updateDoc(noteRef, {
                ...updates,
                updatedAt: Date.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating note:', error);
            throw new Error(`Failed to update note: ${error.message}`);
        }
    }

    async getAllNotes() {
        try {
            const q = this.fs.query(
                this.fs.collection(this.db, this.notesCollection),
                this.fs.orderBy('updatedAt', 'desc')
            );

            const querySnapshot = await this.fs.getDocs(q);
            const notes = [];
            
            querySnapshot.forEach((doc) => {
                notes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return notes;
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw new Error(`Failed to load notes: ${error.message}`);
        }
    }

    async deleteNote(noteId) {
        try {
            await this.fs.deleteDoc(
                this.fs.doc(this.db, this.notesCollection, noteId)
            );
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            throw new Error(`Failed to delete note: ${error.message}`);
        }
    }

    async moveToTrash(note) {
        try {
            await this.fs.addDoc(
                this.fs.collection(this.db, this.trashCollection),
                {
                    ...note,
                    deletedAt: Date.now()
                }
            );
            await this.deleteNote(note.id);
            return true;
        } catch (error) {
            console.error('Error moving to trash:', error);
            throw new Error(`Failed to move to trash: ${error.message}`);
        }
    }

    async getTrash() {
        try {
            const q = this.fs.query(
                this.fs.collection(this.db, this.trashCollection),
                this.fs.orderBy('deletedAt', 'desc')
            );

            const querySnapshot = await this.fs.getDocs(q);
            const trash = [];
            
            querySnapshot.forEach((doc) => {
                trash.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return trash;
        } catch (error) {
            console.error('Error fetching trash:', error);
            return [];
        }
    }

    async deleteFromTrash(trashId) {
        try {
            await this.fs.deleteDoc(
                this.fs.doc(this.db, this.trashCollection, trashId)
            );
            return true;
        } catch (error) {
            console.error('Error deleting from trash:', error);
            throw new Error(`Failed to delete: ${error.message}`);
        }
    }

    async getCategories() {
        try {
            const q = this.fs.query(
                this.fs.collection(this.db, this.categoriesCollection),
                this.fs.orderBy('name', 'asc')
            );

            const querySnapshot = await this.fs.getDocs(q);
            
            if (querySnapshot.empty) {
                return [...DEFAULT_CATEGORIES];
            }
            
            const categories = [];
            querySnapshot.forEach((doc) => {
                categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [...DEFAULT_CATEGORIES];
        }
    }

    async addCategory(categoryData) {
        try {
            const docRef = await this.fs.addDoc(
                this.fs.collection(this.db, this.categoriesCollection),
                categoryData
            );
            return { id: docRef.id, ...categoryData };
        } catch (error) {
            console.error('Error adding category:', error);
            throw new Error(`Failed to add category: ${error.message}`);
        }
    }
}

// ==================== DEFAULT DATA ====================

const DEFAULT_CATEGORIES = [
    { id: 'math', name: 'Mathematics', color: '#6366f1' },
    { id: 'science', name: 'Science', color: '#10b981' },
    { id: 'history', name: 'History', color: '#f59e0b' },
    { id: 'literature', name: 'Literature', color: '#ec4899' },
    { id: 'cs', name: 'Computer Science', color: '#06b6d4' }
];

// ==================== App State ====================

const state = {
    notes: [],
    categories: [...DEFAULT_CATEGORIES],
    trash: [],
    settings: { theme: 'light', sortBy: 'newest' },
    currentView: 'all',
    selectedCategory: null,
    searchQuery: '',
    activeTags: [],
    editingNote: null,
    currentImages: [], // Existing image URLs from Firestore
    currentImagePreviews: [], // Base64 previews for new images (not saved)
    currentImageFiles: [], // File objects to upload
    currentTags: [],
    isLoading: false
};

let firestoreService = null;

// ==================== DOM Elements ====================

const elements = {
    sidebar: document.getElementById('sidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    menuToggle: document.getElementById('menuToggle'),
    notesGrid: document.getElementById('notesGrid'),
    emptyState: document.getElementById('emptyState'),
    searchEmptyState: document.getElementById('searchEmptyState'),
    loadingState: document.getElementById('loadingState'),
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    sortSelect: document.getElementById('sortSelect'),
    newNoteBtn: document.getElementById('newNoteBtn'),
    emptyNewNoteBtn: document.getElementById('emptyNewNoteBtn'),
    viewTitle: document.getElementById('viewTitle'),
    viewSubtitle: document.getElementById('viewSubtitle'),
    categoryList: document.getElementById('categoryList'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    themeToggle: document.getElementById('themeToggle'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    allCount: document.getElementById('allCount'),
    favCount: document.getElementById('favCount'),
    trashCount: document.getElementById('trashCount'),
    tagsFilter: document.getElementById('tagsFilter'),
    activeTagsContainer: document.getElementById('activeTags'),
    clearTags: document.getElementById('clearTags'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.querySelector('.progress-fill'),
    progressText: document.querySelector('.progress-text'),
    
    // Editor Modal
    editorModal: document.getElementById('editorModal'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    noteCategory: document.getElementById('noteCategory'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    closeEditor: document.getElementById('closeEditor'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    deleteNoteBtn: document.getElementById('deleteNoteBtn'),
    addImageBtn: document.getElementById('addImageBtn'),
    imageInput: document.getElementById('imageInput'),
    addTagBtn: document.getElementById('addTagBtn'),
    tagsContainer: document.getElementById('tagsContainer'),
    imagePreviewContainer: document.getElementById('imagePreviewContainer'),
    
    // Tag Modal
    tagModal: document.getElementById('tagModal'),
    tagInput: document.getElementById('tagInput'),
    saveTagBtn: document.getElementById('saveTagBtn'),
    cancelTagBtn: document.getElementById('cancelTagBtn'),
    
    // Category Modal
    categoryModal: document.getElementById('categoryModal'),
    categoryInput: document.getElementById('categoryInput'),
    saveCategoryBtn: document.getElementById('saveCategoryBtn'),
    cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
    colorOptions: document.querySelectorAll('.color-option'),
    
    // Image Preview Modal
    imagePreviewModal: document.getElementById('imagePreviewModal'),
    previewImage: document.getElementById('previewImage'),
    closeImagePreview: document.getElementById('closeImagePreview'),
    
    // Confirm Dialog
    confirmDialog: document.getElementById('confirmDialog'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmBtn: document.getElementById('confirmBtn'),
    cancelConfirmBtn: document.getElementById('cancelConfirmBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// ==================== Initialization ====================

async function init() {
    // Wait for Firebase to be ready
    if (!window.db) {
        await new Promise(resolve => {
            window.addEventListener('firebase-ready', resolve, { once: true });
        });
    }
    
    // Initialize Firestore service
    firestoreService = new FirestoreService(window.db, window.firestore);
    
    // Load settings from localStorage
    loadSettings();
    
    // Apply theme
    applyTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial state (with default categories)
    renderCategories();
    
    // Load data from Firestore
    await loadData();
}

function loadSettings() {
    const saved = localStorage.getItem('studynote_settings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
    }
    elements.sortSelect.value = state.settings.sortBy;
}

function saveSettings() {
    localStorage.setItem('studynote_settings', JSON.stringify(state.settings));
}

async function loadData() {
    showLoading(true);
    
    try {
        // Load categories from Firestore
        const firestoreCategories = await firestoreService.getCategories();
        if (firestoreCategories.length > 0) {
            state.categories = firestoreCategories;
        }
        
        // Load notes
        state.notes = await firestoreService.getAllNotes();
        
        // Load trash
        state.trash = await firestoreService.getTrash();
        
        showLoading(false);
        render();
    } catch (error) {
        showLoading(false);
        showToast('Failed to load data: ' + error.message, 'error');
        render();
    }
}

function showLoading(show) {
    state.isLoading = show;
    elements.loadingState.classList.toggle('hidden', !show);
    elements.notesGrid.classList.toggle('hidden', show);
    if (show) {
        elements.emptyState.classList.add('hidden');
        elements.searchEmptyState.classList.add('hidden');
    }
}

// ==================== Event Listeners ====================

function setupEventListeners() {
    // Sidebar
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', toggleSidebar);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchView(item.dataset.view));
    });
    
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Sort
    elements.sortSelect.addEventListener('change', handleSort);
    
    // New Note
    elements.newNoteBtn.addEventListener('click', () => openEditor());
    elements.emptyNewNoteBtn.addEventListener('click', () => openEditor());
    
    // Categories
    elements.addCategoryBtn.addEventListener('click', openCategoryModal);
    
    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Export/Import
    elements.exportBtn.addEventListener('click', exportData);
    elements.importBtn.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', importData);
    
    // Editor Modal
    elements.closeEditor.addEventListener('click', closeEditor);
    elements.cancelBtn.addEventListener('click', closeEditor);
    elements.saveNoteBtn.addEventListener('click', saveNote);
    elements.deleteNoteBtn.addEventListener('click', confirmDeleteNote);
    elements.favoriteBtn.addEventListener('click', toggleFavoriteEditor);
    
    // Image Upload
    elements.addImageBtn.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', handleImageUpload);
    
    // Tags
    elements.addTagBtn.addEventListener('click', openTagModal);
    elements.saveTagBtn.addEventListener('click', saveTag);
    elements.cancelTagBtn.addEventListener('click', closeTagModal);
    elements.tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveTag();
    });
    
    // Category Modal
    elements.saveCategoryBtn.addEventListener('click', saveCategory);
    elements.cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    elements.categoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveCategory();
    });
    
    elements.colorOptions.forEach(option => {
        option.addEventListener('click', () => selectColor(option));
    });
    
    // Image Preview
    elements.closeImagePreview.addEventListener('click', closeImagePreviewModal);
    
    // Confirm Dialog
    elements.cancelConfirmBtn.addEventListener('click', closeConfirmDialog);
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal.id === 'editorModal') closeEditor();
            else if (modal.id === 'tagModal') closeTagModal();
            else if (modal.id === 'categoryModal') closeCategoryModal();
            else if (modal.id === 'imagePreviewModal') closeImagePreviewModal();
            else if (modal.id === 'confirmDialog') closeConfirmDialog();
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Clear tags
    elements.clearTags.addEventListener('click', clearTagFilters);
}

// ==================== Rendering ====================

function render() {
    renderCategories();
    renderNotes();
    updateCounts();
}

function renderCategories() {
    elements.categoryList.innerHTML = '';
    
    state.categories.forEach(category => {
        const count = state.notes.filter(n => n.categoryId === category.id).length;
        
        const btn = document.createElement('button');
        btn.className = `category-item ${state.selectedCategory === category.id ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="category-dot" style="background: ${category.color}"></span>
            <span class="category-name">${escapeHtml(category.name)}</span>
            <span class="category-count">${count}</span>
        `;
        btn.addEventListener('click', () => selectCategory(category.id));
        
        elements.categoryList.appendChild(btn);
    });
    
    updateCategorySelect();
}

function updateCategorySelect() {
    const currentValue = elements.noteCategory.value;
    elements.noteCategory.innerHTML = '<option value="">Select Category</option>';
    
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.noteCategory.appendChild(option);
    });
    
    elements.noteCategory.value = currentValue;
}

function renderNotes() {
    if (state.isLoading) return;
    
    let notes = getFilteredNotes();
    
    // Show/hide empty states
    if (notes.length === 0) {
        elements.notesGrid.classList.add('hidden');
        if (state.searchQuery) {
            elements.emptyState.classList.add('hidden');
            elements.searchEmptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.remove('hidden');
            elements.searchEmptyState.classList.add('hidden');
        }
    } else {
        elements.notesGrid.classList.remove('hidden');
        elements.emptyState.classList.add('hidden');
        elements.searchEmptyState.classList.add('hidden');
    }
    
    // Render notes
    elements.notesGrid.innerHTML = '';
    
    notes.forEach(note => {
        const card = createNoteCard(note);
        elements.notesGrid.appendChild(card);
    });
}

function createNoteCard(note) {
    const category = state.categories.find(c => c.id === note.categoryId);
    const card = document.createElement('div');
    card.className = `note-card ${note.favorite ? 'favorite' : ''}`;
    
    const imageHtml = note.imageUrls && note.imageUrls.length > 0
        ? `<div class="note-images">
            ${note.imageUrls.slice(0, 3).map((img, i) => 
                `<img src="${img}" class="note-image-thumb" alt="" data-index="${i}">`
            ).join('')}
            ${note.imageUrls.length > 3 ? `<div class="note-image-more">+${note.imageUrls.length - 3}</div>` : ''}
        </div>`
        : '';
    
    const tagsHtml = note.tags && note.tags.length > 0
        ? `<div class="note-tags">
            ${note.tags.slice(0, 4).map(tag => `<span class="note-tag">${escapeHtml(tag)}</span>`).join('')}
            ${note.tags.length > 4 ? `<span class="note-tag">+${note.tags.length - 4}</span>` : ''}
        </div>`
        : '';
    
    card.innerHTML = `
        <div class="note-header">
            <h3 class="note-title">${escapeHtml(note.title) || 'Untitled Note'}</h3>
            ${note.favorite ? '<span class="note-favorite">★</span>' : ''}
        </div>
        <p class="note-content">${escapeHtml(note.content) || 'No content'}</p>
        ${imageHtml}
        ${tagsHtml}
        <div class="note-footer">
            <span class="note-category">
                ${category ? `<span class="category-indicator" style="background: ${category.color}"></span>${escapeHtml(category.name)}` : 'Uncategorized'}
            </span>
            <span>${formatDate(note.updatedAt)}</span>
        </div>
    `;
    
    card.addEventListener('click', () => openEditor(note));
    
    // Image preview on click
    card.querySelectorAll('.note-image-thumb').forEach((img, index) => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openImagePreview(note.imageUrls[index]);
        });
    });
    
    return card;
}

function getFilteredNotes() {
    let notes = [];
    
    // Filter by view
    switch (state.currentView) {
        case 'favorites':
            notes = state.notes.filter(n => n.favorite);
            break;
        case 'recent':
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            notes = state.notes.filter(n => n.updatedAt > weekAgo);
            break;
        case 'trash':
            notes = state.trash;
            break;
        default:
            notes = state.notes;
    }
    
    // Filter by category
    if (state.selectedCategory) {
        notes = notes.filter(n => n.categoryId === state.selectedCategory);
    }
    
    // Filter by search
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        notes = notes.filter(n => 
            (n.title && n.title.toLowerCase().includes(query)) ||
            (n.content && n.content.toLowerCase().includes(query)) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(query)))
        );
    }
    
    // Filter by tags
    if (state.activeTags.length > 0) {
        notes = notes.filter(n => 
            state.activeTags.every(tag => n.tags && n.tags.includes(tag))
        );
    }
    
    // Sort
    const sortBy = elements.sortSelect.value;
    notes.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.createdAt - a.createdAt;
            case 'oldest':
                return a.createdAt - b.createdAt;
            case 'alpha':
                return (a.title || '').localeCompare(b.title || '');
            case 'updated':
                return b.updatedAt - a.updatedAt;
            default:
                return 0;
        }
    });
    
    return notes;
}

function updateCounts() {
    elements.allCount.textContent = state.notes.length;
    elements.favCount.textContent = state.notes.filter(n => n.favorite).length;
    elements.trashCount.textContent = state.trash.length;
}

// ==================== View Management ====================

function switchView(view) {
    state.currentView = view;
    state.selectedCategory = null;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
    
    // Update view title
    const titles = {
        all: 'All Notes',
        favorites: 'Favorite Notes',
        recent: 'Recent Notes',
        trash: 'Trash'
    };
    elements.viewTitle.textContent = titles[view] || 'Notes';
    elements.viewSubtitle.textContent = view === 'trash' 
        ? 'Deleted notes are kept for 30 days' 
        : 'Organize your study materials';
    
    // Update delete button text
    if (view === 'trash') {
        elements.deleteNoteBtn.textContent = 'Delete Forever';
    } else {
        elements.deleteNoteBtn.textContent = 'Delete';
    }
    
    renderNotes();
    renderCategories();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('open');
    }
}

function selectCategory(categoryId) {
    state.selectedCategory = state.selectedCategory === categoryId ? null : categoryId;
    
    renderCategories();
    
    if (state.selectedCategory) {
        const category = state.categories.find(c => c.id === categoryId);
        elements.viewTitle.textContent = category ? category.name : 'Category';
        elements.viewSubtitle.textContent = 'Filtered by category';
    } else {
        elements.viewTitle.textContent = 'All Notes';
        elements.viewSubtitle.textContent = 'Organize your study materials';
    }
    
    renderNotes();
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
}

// ==================== Search & Filter ====================

function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    elements.clearSearch.classList.toggle('hidden', !state.searchQuery);
    renderNotes();
}

function clearSearch() {
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.clearSearch.classList.add('hidden');
    renderNotes();
}

function handleSort() {
    state.settings.sortBy = elements.sortSelect.value;
    saveSettings();
    renderNotes();
}

// ==================== Editor ====================

function openEditor(note = null) {
    state.editingNote = note;
    state.currentImages = note ? [...(note.imageUrls || [])] : []; // Existing URLs from Firestore
    state.currentImagePreviews = []; // Base64 previews for new uploads (not saved to Firestore)
    state.currentImageFiles = []; // Files pending upload to Cloudinary
    state.currentTags = note ? [...(note.tags || [])] : [];
    
    // Populate fields
    elements.noteTitle.value = note ? note.title : '';
    elements.noteContent.value = note ? note.content : '';
    elements.noteCategory.value = note ? note.categoryId : '';
    
    // Favorite button
    elements.favoriteBtn.classList.toggle('active', note ? note.favorite : false);
    
    // Delete button
    elements.deleteNoteBtn.classList.toggle('hidden', !note);
    
    // Hide upload progress
    elements.uploadProgress.classList.add('hidden');
    
    // Render images
    renderImagePreviews();
    
    // Render tags
    renderTags();
    
    // Show modal
    elements.editorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus title
    setTimeout(() => elements.noteTitle.focus(), 100);
}

function closeEditor() {
    elements.editorModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset state
    state.editingNote = null;
    state.currentImages = [];
    state.currentImageFiles = [];
    state.currentTags = [];
    
    // Clear inputs
    elements.noteTitle.value = '';
    elements.noteContent.value = '';
    elements.noteCategory.value = '';
    elements.favoriteBtn.classList.remove('active');
    elements.imagePreviewContainer.innerHTML = '';
    elements.tagsContainer.innerHTML = '';
    elements.uploadProgress.classList.add('hidden');
}

async function saveNote() {
    const title = elements.noteTitle.value.trim();
    const content = elements.noteContent.value.trim();
    const categoryId = elements.noteCategory.value;
    
    if (!title && !content && state.currentImagePreviews.length === 0 && state.currentImageFiles.length === 0 && !state.editingNote) {
        showToast('Please add some content to your note', 'error');
        return;
    }
    
    // Show loading state
    elements.saveNoteBtn.disabled = true;
    elements.saveNoteBtn.querySelector('.btn-text').textContent = 'Saving...';
    
    try {
        let imageUrls = state.editingNote ? [...(state.editingNote.imageUrls || [])] : [];
        
        // Upload new images to Cloudinary
        if (state.currentImageFiles.length > 0) {
            elements.uploadProgress.classList.remove('hidden');
            
            const newUrls = await cloudinaryService.uploadMultiple(
                state.currentImageFiles,
                (completed, total) => {
                    const percent = Math.round((completed / total) * 100);
                    elements.progressFill.style.width = `${percent}%`;
                    elements.progressText.textContent = `Uploading image ${completed}/${total}...`;
                }
            );
            
            imageUrls = [...imageUrls, ...newUrls];
        }
        // Limit to 20 images to prevent Firestore 1MB limit
        imageUrls = imageUrls.slice(0, 20);
        
        const noteData = {
            title,
            content,
            categoryId,
            imageUrls,
            tags: [...state.currentTags],
            favorite: elements.favoriteBtn.classList.contains('active')
        };
        
        if (state.editingNote) {
            // Update existing note
            await firestoreService.updateNote(state.editingNote.id, noteData);
            
            // Update local state
            const index = state.notes.findIndex(n => n.id === state.editingNote.id);
            if (index !== -1) {
                state.notes[index] = { ...state.notes[index], ...noteData, updatedAt: Date.now() };
            }
            
            showToast('Note updated successfully', 'success');
        } else {
            // Create new note
            const newNote = await firestoreService.addNote(noteData);
            state.notes.unshift(newNote);
            showToast('Note created successfully', 'success');
        }
        
        closeEditor();
        render();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        elements.saveNoteBtn.disabled = false;
        elements.saveNoteBtn.querySelector('.btn-text').textContent = 'Save Note';
    }
}

async function confirmDeleteNote() {
    if (!state.editingNote) return;
    
    if (state.currentView === 'trash') {
        // Permanent delete from trash
        showConfirmDialog(
            'Delete Forever',
            'This action cannot be undone. Are you sure?',
            async () => {
                try {
                    await firestoreService.deleteFromTrash(state.editingNote.id);
                    state.trash = state.trash.filter(n => n.id !== state.editingNote.id);
                    closeEditor();
                    render();
                    showToast('Note permanently deleted', 'info');
                } catch (error) {
                    showToast('Error: ' + error.message, 'error');
                }
            }
        );
    } else {
        // Move to trash
        showConfirmDialog(
            'Move to Trash',
            'Are you sure you want to delete this note?',
            async () => {
                try {
                    await firestoreService.moveToTrash(state.editingNote);
                    state.notes = state.notes.filter(n => n.id !== state.editingNote.id);
                    state.trash.unshift({ ...state.editingNote, deletedAt: Date.now() });
                    closeEditor();
                    render();
                    showToast('Note moved to trash', 'info');
                } catch (error) {
                    showToast('Error: ' + error.message, 'error');
                }
            }
        );
    }
}

function toggleFavoriteEditor() {
    elements.favoriteBtn.classList.toggle('active');
}

// ==================== Image Upload ====================

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('Please select only image files', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showToast('Image size should be less than 10MB', 'error');
            return;
        }
        
        // Store file for upload
        state.currentImageFiles.push(file);
        
        // Create preview only (base64 not saved to Firestore)
        const reader = new FileReader();
        reader.onload = (event) => {
            state.currentImagePreviews.push(event.target.result);
            renderImagePreviews();
        };
        reader.readAsDataURL(file);
    });
    
    e.target.value = '';
}

function renderImagePreviews() {
    elements.imagePreviewContainer.innerHTML = '';
    
    state.currentImagePreviews.forEach((image, index) => {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
            <img src="${image}" alt="Preview">
            <button class="remove-image" data-index="${index}">&times;</button>
        `;
        
        preview.querySelector('.remove-image').addEventListener('click', () => {
            state.currentImagePreviews.splice(index, 1);
            if (index < state.currentImageFiles.length) {
                state.currentImageFiles.splice(index, 1);
            }
            renderImagePreviews();
        });
        
        preview.querySelector('img').addEventListener('click', () => {
            openImagePreview(image);
        });
        
        elements.imagePreviewContainer.appendChild(preview);
    });
}

function openImagePreview(imageSrc) {
    elements.previewImage.src = imageSrc;
    elements.imagePreviewModal.classList.add('active');
}

function closeImagePreviewModal() {
    elements.imagePreviewModal.classList.remove('active');
    elements.previewImage.src = '';
}

// ==================== Tags ====================

function openTagModal() {
    elements.tagModal.classList.add('active');
    elements.tagInput.value = '';
    setTimeout(() => elements.tagInput.focus(), 100);
}

function closeTagModal() {
    elements.tagModal.classList.remove('active');
}

function saveTag() {
    const tag = elements.tagInput.value.trim();
    
    if (!tag) {
        showToast('Please enter a tag name', 'error');
        return;
    }
    
    if (state.currentTags.includes(tag)) {
        showToast('Tag already exists', 'error');
        return;
    }
    
    state.currentTags.push(tag);
    renderTags();
    closeTagModal();
}

function renderTags() {
    elements.tagsContainer.innerHTML = '';
    
    state.currentTags.forEach((tag, index) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            ${escapeHtml(tag)}
            <button data-index="${index}">&times;</button>
        `;
        
        tagEl.querySelector('button').addEventListener('click', () => {
            state.currentTags.splice(index, 1);
            renderTags();
        });
        
        elements.tagsContainer.appendChild(tagEl);
    });
}

// ==================== Categories ====================

function openCategoryModal() {
    elements.categoryModal.classList.add('active');
    elements.categoryInput.value = '';
    
    elements.colorOptions.forEach(opt => opt.classList.remove('active'));
    elements.colorOptions[0].classList.add('active');
    
    setTimeout(() => elements.categoryInput.focus(), 100);
}

function closeCategoryModal() {
    elements.categoryModal.classList.remove('active');
}

function selectColor(option) {
    elements.colorOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
}

async function saveCategory() {
    const name = elements.categoryInput.value.trim();
    
    if (!name) {
        showToast('Please enter a category name', 'error');
        return;
    }
    
    if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Category already exists', 'error');
        return;
    }
    
    const selectedColor = document.querySelector('.color-option.active');
    const color = selectedColor ? selectedColor.dataset.color : '#6366f1';
    
    const categoryData = { name, color };
    
    try {
        const newCategory = await firestoreService.addCategory(categoryData);
        state.categories.push(newCategory);
        renderCategories();
        closeCategoryModal();
        showToast('Category added successfully', 'success');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ==================== Theme ====================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    state.settings.theme = newTheme;
    saveSettings();
    
    document.querySelector('meta[name="theme-color"]').setAttribute('content', 
        newTheme === 'dark' ? '#0f172a' : '#6366f1'
    );
}

function applyTheme() {
    const theme = state.settings.theme;
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    document.querySelector('meta[name="theme-color"]').setAttribute('content', 
        theme === 'dark' ? '#0f172a' : '#6366f1'
    );
}

// ==================== Export/Import ====================

function exportData() {
    const data = {
        notes: state.notes,
        categories: state.categories,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `studynote-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.notes || !Array.isArray(data.notes)) {
                throw new Error('Invalid backup file');
            }
            
            showConfirmDialog(
                'Import Data',
                `This will import ${data.notes.length} notes. Continue?`,
                async () => {
                    try {
                        // Import notes to Firestore
                        for (const note of data.notes) {
                            const { id, ...noteData } = note;
                            // Truncate images to prevent Firestore 1MB limit
                            noteData.imageUrls = noteData.imageUrls?.slice(0, 20);
                            await firestoreService.addNote(noteData);
                        }
                        
                        // Reload data
                        await loadData();
                        showToast('Data imported successfully', 'success');
                    } catch (error) {
                        showToast('Import failed: ' + error.message, 'error');
                    }
                }
            );
        } catch (error) {
            showToast('Failed to import data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    e.target.value = '';
}

// ==================== Utilities ====================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span>${icons[type]}</span>
        <span>${escapeHtml(message)}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirmDialog(title, message, onConfirm) {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmDialog.classList.add('active');
    
    elements.confirmBtn.onclick = () => {
        closeConfirmDialog();
        onConfirm();
    };
}

function closeConfirmDialog() {
    elements.confirmDialog.classList.remove('active');
}

function handleKeyboard(e) {
    if (e.key === 'Escape') {
        if (elements.editorModal.classList.contains('active')) closeEditor();
        if (elements.tagModal.classList.contains('active')) closeTagModal();
        if (elements.categoryModal.classList.contains('active')) closeCategoryModal();
        if (elements.imagePreviewModal.classList.contains('active')) closeImagePreviewModal();
        if (elements.confirmDialog.classList.contains('active')) closeConfirmDialog();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openEditor();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (elements.editorModal.classList.contains('active')) {
            e.preventDefault();
            saveNote();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        elements.searchInput.focus();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 60 * 1000) {
            const mins = Math.floor(diff / (60 * 1000));
            return mins < 1 ? 'Just now' : `${mins}m ago`;
        }
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}h ago`;
    }
    
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}d ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', init);