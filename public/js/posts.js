let currentPage = 1;
const postsPerPage = 12;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/test.html';
        return;
    }
    
    loadUserInfo();
    loadCategories();
    loadPosts(true); // Load initial posts
    setupEventListeners();
});

// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        document.getElementById('username-display').textContent = data.data.username;
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        const categorySelect = document.getElementById('category');
        const categoryFilter = document.getElementById('category-filter');
        
        const categoryOptions = data.data.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
        
        categorySelect.innerHTML = categoryOptions;
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load posts
async function loadPosts(reset = false) {
    if (reset) currentPage = 1;
    
    const categoryId = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    
    try {
        const response = await fetch(`/api/posts?page=${currentPage}&limit=${postsPerPage}&categoryId=${categoryId}&sort=${sortBy}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        console.log('Posts data:', data); // Debug log
        
        const postsGrid = document.getElementById('posts-grid');
        
        if (reset) {
            postsGrid.innerHTML = '';
        }
        
        if (data.data && data.data.length > 0) {
            data.data.forEach(post => {
                postsGrid.appendChild(createPostCard(post));
            });
            
            document.getElementById('load-more').style.display = 
                data.data.length < postsPerPage ? 'none' : 'block';
        } else {
            if (reset) {
                postsGrid.innerHTML = '<div class="no-posts">No posts found</div>';
            }
            document.getElementById('load-more').style.display = 'none';
        }
            
        currentPage++;
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Create post card
function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    const mediaElement = post.mediaType === 'video'
        ? `<video src="${post.mediaUrl}" class="post-media" controls></video>`
        : `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;
        
    div.innerHTML = `
        ${mediaElement}
        <div class="post-content">
            <div class="post-title">${post.title}</div>
            <div class="post-caption">${post.caption || ''}</div>
            <div class="post-meta">
                <span class="post-category">${post.category ? post.category.name : 'Uncategorized'}</span>
                <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="post-status ${post.status}">${post.status}</div>
        </div>
    `;
    
    return div;
}

// Setup event listeners
function setupEventListeners() {
    // Create post modal
    const modal = document.getElementById('create-post-modal');
    const createPostBtn = document.getElementById('create-post-btn');
    const closeBtn = document.getElementsByClassName('close')[0];

    createPostBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    // Post form submission
    document.getElementById('post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('caption', document.getElementById('caption').value);
        formData.append('categoryId', document.getElementById('category').value);
        
        const mediaFile = document.getElementById('media').files[0];
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Post created successfully!');
                modal.style.display = 'none';
                e.target.reset();
                document.getElementById('media-preview').innerHTML = '';
                loadPosts(true);
            } else {
                const data = await response.json();
                alert('Failed to create post: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post: ' + error.message);
        }
    });

    // Filters
    document.getElementById('category-filter').addEventListener('change', () => loadPosts(true));
    document.getElementById('sort-filter').addEventListener('change', () => loadPosts(true));

    // Load more
    document.getElementById('load-more').addEventListener('click', () => loadPosts());

    // Media preview
    document.getElementById('media').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const preview = document.getElementById('media-preview');
            const reader = new FileReader();
            
            reader.onload = function(e) {
                if (file.type.startsWith('video/')) {
                    preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
                } else {
                    preview.innerHTML = `<img src="${e.target.result}">`;
                }
            }
            
            reader.readAsDataURL(file);
        }
    });
}

// Handle logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/test.html';
}); 