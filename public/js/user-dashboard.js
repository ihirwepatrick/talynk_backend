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
        // Load user profile
        await loadUserProfile();
        // Load categories for dropdowns
        await loadCategories();
        // Load user posts
        await loadUserPosts();
        // Load statistics
        await loadStatistics();
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Error loading dashboard');
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load profile');

        const data = await response.json();
        currentUser = data.data.user;

        // Update UI with user data
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('username').value = currentUser.username;
        document.getElementById('phone1').value = currentUser.phone1 || '';
        document.getElementById('phone2').value = currentUser.phone2 || '';
        
        if (currentUser.facialImage) {
            document.getElementById('userAvatar').src = currentUser.facialImage;
        }
    } catch (error) {
        console.error('Profile loading error:', error);
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load categories');

        const data = await response.json();
        const categories = data.data.categories;

        // Update category dropdowns
        const categorySelects = ['category'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        });
    } catch (error) {
        console.error('Categories loading error:', error);
    }
}

// Load user posts
async function loadUserPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load posts');

        const data = await response.json();
        const posts = data.data.posts;

        // Update posts grid
        const postsGrid = document.getElementById('userPosts');
        postsGrid.innerHTML = '';

        if (posts.length === 0) {
            postsGrid.innerHTML = '<p>No posts yet. Create your first post!</p>';
            return;
        }

        posts.forEach(post => {
            const postCard = createPostCard(post);
            postsGrid.appendChild(postCard);
        });
    } catch (error) {
        console.error('Posts loading error:', error);
    }
}

// Create post card element
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.caption}</p>
        ${post.mediaType === 'image' 
            ? `<img src="${post.mediaUrl}" alt="${post.title}" style="max-width: 100%;">` 
            : `<video src="${post.mediaUrl}" controls style="max-width: 100%;"></video>`
        }
        <p class="status ${post.status}">Status: ${post.status}</p>
        ${post.status === 'rejected' ? `<p class="rejection-reason">Reason: ${post.rejectionReason}</p>` : ''}
        <button onclick="deletePost(${post.id})" class="delete-btn">Delete</button>
    `;
    return card;
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/users/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load statistics');

        const data = await response.json();
        const stats = data.data.stats;

        // Update statistics
        document.getElementById('totalPosts').textContent = stats.totalPosts;
        document.getElementById('approvedPosts').textContent = stats.approvedPosts;
        document.getElementById('pendingPosts').textContent = stats.pendingPosts;
    } catch (error) {
        console.error('Statistics loading error:', error);
    }
}

// Handle tab switching
function switchTab(tabId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${tabId}Section`).style.display = 'block';
    
    // Update active tab
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${tabId}"]`).classList.add('active');
}

// Handle create post
async function handleCreatePost(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('caption', document.getElementById('caption').value);
    formData.append('categoryId', document.getElementById('category').value);
    formData.append('media', document.getElementById('media').files[0]);

    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to create post');

        alert('Post created successfully!');
        document.getElementById('createPostForm').reset();
        await loadUserPosts();
        switchTab('posts');
    } catch (error) {
        console.error('Post creation error:', error);
        alert('Error creating post');
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        phone1: document.getElementById('phone1').value,
        phone2: document.getElementById('phone2').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update profile');

        alert('Profile updated successfully!');
        await loadUserProfile();
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Error updating profile');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete post');

        alert('Post deleted successfully!');
        await loadUserPosts();
    } catch (error) {
        console.error('Post deletion error:', error);
        alert('Error deleting post');
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
    document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // Media preview
    document.getElementById('media').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById('mediaPreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = file.type.startsWith('image/')
                    ? `<img src="${e.target.result}" style="max-width: 200px;">`
                    : `<video src="${e.target.result}" style="max-width: 200px;" controls>`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 