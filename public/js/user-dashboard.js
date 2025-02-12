// Global variables
let currentUser = null;
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/login';
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        await Promise.all([
            loadUserProfile(),
            loadCategories(),
            loadUserPosts(),
            loadStatistics(),
            loadNotifications()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Error loading dashboard');
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        currentUser = data.data.user;
        
        // Update UI
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userEmail').textContent = currentUser.email;
        if (currentUser.user_facial_image) {
            document.getElementById('userAvatar').src = `data:image/jpeg;base64,${currentUser.user_facial_image}`;
        }
    } catch (error) {
        console.error('Profile loading error:', error);
        showError('Error loading profile');
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load categories');
        
        const data = await response.json();
        const categories = data.data.categories;
        
        // Update category dropdowns
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
        });
    } catch (error) {
        console.error('Categories loading error:', error);
        showError('Error loading categories');
    }
}

// Create post
async function createPost(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('caption', document.getElementById('caption').value);
        formData.append('post_category', document.getElementById('category').value);
        
        const mediaFile = document.getElementById('media').files[0];
        if (mediaFile) {
            formData.append('media', mediaFile);
        }
        
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        
        showSuccess('Post created successfully');
        document.getElementById('createPostForm').reset();
        await loadUserPosts();
        switchTab('posts');
    } catch (error) {
        console.error('Post creation error:', error);
        showError('Error creating post');
    }
}

// Load user posts
async function loadUserPosts() {
    try {
        const response = await fetch('/api/posts/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load posts');
        
        const data = await response.json();
        const posts = data.data.posts;
        
        // Update posts grid
        const postsGrid = document.getElementById('userPosts');
        postsGrid.innerHTML = posts.length ? '' : '<p>No posts yet. Create your first post!</p>';
        
        posts.forEach(post => {
            postsGrid.innerHTML += `
                <div class="post-card">
                    <h3>${post.title}</h3>
                    <p>${post.caption}</p>
                    <div class="post-stats">
                        <span>${post.likes} likes</span>
                        <span>${post.comments} comments</span>
                        <span>${post.views} views</span>
                    </div>
                    <div class="post-actions">
                        <button onclick="deletePost(${post.uniqueTraceability_id})">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Posts loading error:', error);
        showError('Error loading posts');
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/user/statistics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load statistics');
        
        const data = await response.json();
        const stats = data.data.statistics;
        
        // Update statistics UI
        document.getElementById('totalPosts').textContent = stats.posts_count;
        document.getElementById('approvedPosts').textContent = stats.approved_posts;
        document.getElementById('pendingPosts').textContent = stats.pending_posts;
        document.getElementById('profileViews').textContent = stats.total_profile_views;
    } catch (error) {
        console.error('Statistics loading error:', error);
        showError('Error loading statistics');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(e.target.dataset.section);
        });
    });
    
    // Form submissions
    document.getElementById('createPostForm').addEventListener('submit', createPost);
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    
    // Media preview
    document.getElementById('media').addEventListener('change', handleMediaPreview);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });
}

// Helper functions
function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${tabId}Section`).style.display = 'block';
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${tabId}"]`).classList.add('active');
}

function showSuccess(message) {
    alert(message); // Replace with better UI notification
}

function showError(message) {
    alert(message); // Replace with better UI notification
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 