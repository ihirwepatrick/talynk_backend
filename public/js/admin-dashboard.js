document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || !user.isAdmin) {
        alert('Please login as admin');
        window.location.href = '/test.html';
        return;
    }

    document.getElementById('username-display').textContent = user.username;
    setupEventListeners();
    loadDashboardData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.posts-grid').forEach(grid => grid.classList.remove('active'));
            document.getElementById(`${button.dataset.tab}-posts`).classList.add('active');
        });
    });

    // Date filter
    document.getElementById('apply-filter').addEventListener('click', () => {
        loadDashboardData();
    });

    document.getElementById('reset-filter').addEventListener('click', () => {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        loadDashboardData();
    });

    // Rejection modal
    const modal = document.getElementById('rejection-modal');
    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Rejection form
    document.getElementById('rejection-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const postId = document.getElementById('reject-post-id').value;
        const reason = document.getElementById('rejection-reason').value;
        await updatePostStatus(postId, 'rejected', reason);
        modal.style.display = 'none';
    });
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data');
        console.log('Token:', localStorage.getItem('token'));
        console.log('User:', localStorage.getItem('user'));

        const response = await fetch('/api/posts/all', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch posts');
        }

        updateStatistics(data.data);
        displayPosts(data.data);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            alert('Session expired. Please login again.');
            window.location.href = '/test.html';
        }
    }
}

// Update Statistics
function updateStatistics(posts) {
    const stats = {
        total: posts.length,
        pending: posts.filter(post => post.status === 'pending').length,
        approved: posts.filter(post => post.status === 'approved').length,
        rejected: posts.filter(post => post.status === 'rejected').length
    };

    document.getElementById('total-count').textContent = stats.total;
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('approved-count').textContent = stats.approved;
    document.getElementById('rejected-count').textContent = stats.rejected;
}

// Display Posts
function displayPosts(posts) {
    const containers = {
        pending: document.getElementById('pending-posts'),
        approved: document.getElementById('approved-posts'),
        rejected: document.getElementById('rejected-posts')
    };

    // Clear existing posts
    Object.values(containers).forEach(container => container.innerHTML = '');

    // Group posts by status
    posts.forEach(post => {
        const postElement = createPostCard(post);
        containers[post.status].appendChild(postElement);
    });
}

// Create Post Card
function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    let mediaElement = '';
    let videoWatched = false;
    
    if (post.mediaType === 'video') {
        mediaElement = `
            <div class="video-container">
                <video id="video-${post.id}" class="post-media" controls>
                    <source src="${post.mediaUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-overlay" id="overlay-${post.id}">
                    <span>Please watch at least 1 minute before taking action</span>
                </div>
            </div>`;
    } else {
        mediaElement = `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;
    }
        
    div.innerHTML = `
        ${mediaElement}
        <div class="post-content">
            <div class="post-title">${post.title}</div>
            <div class="post-meta">
                <div>By: ${post.author ? post.author.username : 'Unknown'}</div>
                <div>Category: ${post.category ? post.category.name : 'Uncategorized'}</div>
                <div>Posted: ${new Date(post.createdAt).toLocaleDateString()}</div>
                ${post.rejectionReason ? `<div class="rejection-reason">Rejection Reason: ${post.rejectionReason}</div>` : ''}
            </div>
            ${post.status === 'pending' ? `
                <div class="post-actions" id="actions-${post.id}">
                    <button class="action-btn approve-btn" disabled onclick="handleApprove(${post.id})">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="action-btn reject-btn" disabled onclick="showRejectionModal(${post.id})">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    // Add video event listeners if it's a video
    if (post.mediaType === 'video') {
        setTimeout(() => {
            const video = div.querySelector(`#video-${post.id}`);
            const overlay = div.querySelector(`#overlay-${post.id}`);
            const actions = div.querySelector(`#actions-${post.id}`);
            
            if (video && actions) {
                let watchTime = 0;
                
                video.addEventListener('timeupdate', () => {
                    watchTime = video.currentTime;
                    if (watchTime >= 60 && !videoWatched) { // 60 seconds = 1 minute
                        videoWatched = true;
                        overlay.style.display = 'none';
                        const buttons = actions.querySelectorAll('button');
                        buttons.forEach(btn => btn.disabled = false);
                    }
                });
            }
        }, 0);
    } else {
        // For images, enable buttons immediately
        const actions = div.querySelector(`#actions-${post.id}`);
        if (actions) {
            const buttons = actions.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
    
    return div;
}

async function handleApprove(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'approved'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to approve post');
        }

        alert('Post approved successfully');
        loadDashboardData(); // Refresh the dashboard
    } catch (error) {
        console.error('Error approving post:', error);
        alert('Error approving post: ' + error.message);
    }
}

function showRejectionModal(postId) {
    const modal = document.getElementById('rejection-modal');
    document.getElementById('reject-post-id').value = postId;
    document.getElementById('rejection-reason').value = '';
    modal.style.display = 'block';
}

// Update Post Status
async function updatePostStatus(postId, status, rejectionReason = null) {
    try {
        const response = await fetch(`/api/posts/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status,
                rejectionReason: rejectionReason
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update post status');
        }

        alert(`Post ${status} successfully`);
        loadDashboardData();
    } catch (error) {
        console.error('Error updating post status:', error);
        alert('Error updating post status: ' + error.message);
    }
}

// Logout Handler
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/test.html';
});

// Add CSS for video overlay and disabled buttons
const style = document.createElement('style');
style.textContent = `
    .video-container {
        position: relative;
    }

    .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1rem;
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style); 