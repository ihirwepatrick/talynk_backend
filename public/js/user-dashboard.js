// Load user posts
async function loadUserPosts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('http://localhost:3000/api/posts/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayPosts(data.data.posts);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Error loading posts. Please try again.');
    }
}

// Display posts in the UI
function displayPosts(posts) {
    const postsContainer = document.getElementById('userPosts');
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Create your first post!</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.caption}</p>
            <div class="post-media">
                ${post.mediaType === 'image' 
                    ? `<img src="${post.mediaUrl}" alt="${post.title}">` 
                    : `<video src="${post.mediaUrl}" controls></video>`
                }
            </div>
            <div class="post-status ${post.status}">
                Status: ${post.status}
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadUserPosts();
});

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.posts-grid').forEach(grid => grid.classList.remove('active'));
            if (button.dataset.tab === 'pending') {
                document.getElementById('pending-posts').classList.add('active');
                loadPendingPosts();
            } else {
                document.getElementById('all-posts').classList.add('active');
                loadAllUserPosts();
            }
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/test.html';
    });
}

async function loadPendingPosts() {
    try {
        const response = await fetch('/api/posts/user/pending', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch posts');
        }

        displayPosts('pending-posts', data.data);

    } catch (error) {
        console.error('Error loading pending posts:', error);
        handleError(error);
    }
}

async function loadAllUserPosts() {
    try {
        const response = await fetch('/api/posts/user/all', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch posts');
        }

        displayPosts('all-posts', data.data);

    } catch (error) {
        console.error('Error loading all posts:', error);
        handleError(error);
    }
}

function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    const mediaElement = post.mediaType === 'video'
        ? `<video class="post-media" controls><source src="${post.mediaUrl}" type="video/mp4"></video>`
        : `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;

    div.innerHTML = `
        ${mediaElement}
        <div class="post-content">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-status status-${post.status}">
                    ${post.status.toUpperCase()}
                </div>
            </div>
            <div class="post-meta">
                <div class="category">
                    <i class="fas fa-folder"></i> ${post.category ? post.category.name : 'Uncategorized'}
                </div>
                <div class="date">
                    <i class="fas fa-calendar"></i> ${new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>
            ${post.rejectionReason ? `
                <div class="rejection-reason">
                    <i class="fas fa-exclamation-circle"></i> Rejection Reason: ${post.rejectionReason}
                </div>
            ` : ''}
            <div class="post-actions">
                ${post.status === 'pending' ? `
                    <button class="cancel-btn" data-post-id="${post.id}">
                        <i class="fas fa-times"></i> Cancel Post
                    </button>
                ` : ''}
                <button class="delete-btn" data-post-id="${post.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const cancelBtn = div.querySelector('.cancel-btn');
    const deleteBtn = div.querySelector('.delete-btn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => handleCancelPost(post.id));
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => handleDeletePost(post.id));
    }
    
    return div;
}

async function handleCancelPost(postId) {
    if (!confirm('Are you sure you want to cancel this post?')) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to cancel post');

        loadUserPosts(); // Refresh the posts
        alert('Post cancelled successfully');

    } catch (error) {
        console.error('Error cancelling post:', error);
        alert('Error cancelling post');
    }
}

async function handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete post');

        loadUserPosts(); // Refresh the posts
        alert('Post deleted successfully');

    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}

function handleError(error) {
    if (error.message.includes('401') || error.message.includes('403')) {
        alert('Session expired. Please login again.');
        window.location.href = '/test.html';
    } else {
        alert('Error: ' + error.message);
    }
} 