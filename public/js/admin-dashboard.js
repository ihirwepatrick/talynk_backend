document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/test.html';
        return;
    }
    loadDashboardData();
});

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
    document.getElementById('apply-filter').addEventListener('click', loadDashboardData);
    document.getElementById('reset-filter').addEventListener('click', () => {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        loadDashboardData();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/test.html';
    });
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Present' : 'Missing'); // Debug log

        if (!token) {
            window.location.href = '/test.html';
            return;
        }

        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.log('Unauthorized access, redirecting to login...');
            localStorage.removeItem('token');
            window.location.href = '/test.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dashboard data:', data); // Debug log

        // Update the dashboard with the received data
        updateDashboard(data);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStatistics(stats) {
    document.getElementById('total-count').textContent = stats.total;
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('approved-count').textContent = stats.approved;
    document.getElementById('rejected-count').textContent = stats.rejected;
}

// Create Post Card
function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    if (post.mediaType === 'video') {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const video = document.createElement('video');
        video.id = `video-${post.id}`;
        video.className = 'post-media';
        video.controls = true;
        video.preload = 'metadata';
        
        const source = document.createElement('source');
        source.src = post.mediaUrl;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        videoContainer.appendChild(video);

        // Add overlay if pending
        if (post.status === 'pending') {
            const overlay = document.createElement('div');
            overlay.id = `overlay-${post.id}`;
            overlay.className = 'video-overlay';
            const message = document.createElement('div');
            message.className = 'video-message';
            message.id = `message-${post.id}`;
            message.textContent = '⏱️ Please watch at least half of the video before taking action';
            overlay.appendChild(message);
            videoContainer.appendChild(overlay);
        }

        div.appendChild(videoContainer);
        
        // Add event listeners
        video.addEventListener('loadedmetadata', () => {
            console.log(`Video ${post.id} duration:`, video.duration);
            const requiredWatchTime = video.duration / 2;
            const message = div.querySelector(`#message-${post.id}`);
            if (message) {
                const seconds = Math.round(requiredWatchTime);
                message.textContent = `⏱️ Please watch at least ${seconds} seconds before taking action`;
            }
        });

        video.addEventListener('play', () => {
            console.log(`Video ${post.id} started playing`);
            const overlay = div.querySelector(`#overlay-${post.id}`);
            if (overlay) {
                overlay.style.opacity = '0.5';
            }
        });

        video.addEventListener('pause', () => {
            console.log(`Video ${post.id} paused`);
            const overlay = div.querySelector(`#overlay-${post.id}`);
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });

        let watchTime = 0;
        video.addEventListener('timeupdate', () => {
            watchTime = video.currentTime;
            const requiredWatchTime = video.duration / 2;
            console.log(`Video ${post.id} watch time: ${watchTime}/${requiredWatchTime}`);
            
            if (watchTime >= requiredWatchTime) {
                const overlay = div.querySelector(`#overlay-${post.id}`);
                const actions = div.querySelector(`#actions-${post.id}`);
                if (overlay) {
                    overlay.remove();
                }
                if (actions) {
                    const buttons = actions.querySelectorAll('button');
                    buttons.forEach(btn => {
                        if (btn.disabled) {
                            btn.disabled = false;
                            console.log(`Enabling button for video ${post.id}`);
                        }
                    });
                }
            }
        });
    } else {
        const img = document.createElement('img');
        img.src = post.mediaUrl;
        img.className = 'post-media';
        img.alt = post.title;
        div.appendChild(img);
    }

    // Create and append post content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    contentDiv.innerHTML = `
        <div class="post-header">
            <div class="post-title">${post.title}</div>
            <div class="post-id">🆔 ${post.id}</div>
        </div>
        <div class="post-meta">
            <div class="user-info">
                👤 Posted by: ${post.author ? post.author.username : 'Unknown'}
            </div>
            <div class="category-info">
                📁 Category: ${post.category ? post.category.name : 'Uncategorized'}
            </div>
            <div class="date-info">
                📅 Posted: ${new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div class="status-info status-${post.status}">
                ℹ️ Status: ${post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </div>
        </div>
        ${post.status === 'pending' ? `
            <div class="post-actions" id="actions-${post.id}">
                <button class="action-btn approve-btn" data-action="approve" data-post-id="${post.id}" disabled>
                    ✅ Approve
                </button>
                <button class="action-btn reject-btn" data-action="reject" data-post-id="${post.id}" disabled>
                    ❌ Reject
                </button>
            </div>
        ` : ''}
    `;
    
    div.appendChild(contentDiv);

    // Add event listeners for buttons
    if (post.status === 'pending') {
        const approveBtn = div.querySelector('[data-action="approve"]');
        const rejectBtn = div.querySelector('[data-action="reject"]');
        
        if (approveBtn) {
            approveBtn.addEventListener('click', () => handleApprove(post.id));
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => showRejectionModal(post.id));
        }
    }

    return div;
}

// Add this helper function to check video URLs
function validateVideoUrl(url) {
    console.log('Validating video URL:', url);
    try {
        const fullUrl = new URL(url, window.location.origin);
        return fullUrl.href;
    } catch (e) {
        console.error('Invalid video URL:', e);
        return url;
    }
}

async function handleApprove(postId) {
    try {
        console.log('Approving post:', postId);
        const response = await fetch(`/api/posts/admin/${postId}/status`, {
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

        // Refresh the dashboard data
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error approving post:', error);
        alert('Error approving post: ' + error.message);
    }
}

async function handleReject(postId, reason) {
    try {
        console.log('Rejecting post:', postId, 'Reason:', reason);
        const response = await fetch(`/api/posts/admin/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'rejected',
                rejectionReason: reason
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reject post');
        }

        // Close modal and refresh dashboard
        closeRejectionModal();
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error rejecting post:', error);
        alert('Error rejecting post: ' + error.message);
    }
}

// Rejection modal handlers
function showRejectionModal(postId) {
    const modal = document.getElementById('rejection-modal');
    document.getElementById('reject-post-id').value = postId;
    document.getElementById('rejection-reason').value = '';
    modal.style.display = 'block';
}

function closeRejectionModal() {
    const modal = document.getElementById('rejection-modal');
    modal.style.display = 'none';
}

// Setup rejection form submission
document.getElementById('rejection-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = document.getElementById('reject-post-id').value;
    const reason = document.getElementById('rejection-reason').value;
    await handleReject(postId, reason);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('rejection-modal');
    if (e.target === modal) {
        closeRejectionModal();
    }
});

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

// Add this function to update the dashboard with data
function updateDashboard(data) {
    try {
        console.log('Updating dashboard with data:', data);

        // Update statistics
        document.getElementById('total-count').textContent = data.data.stats.total || 0;
        document.getElementById('pending-count').textContent = data.data.stats.pending || 0;
        document.getElementById('approved-count').textContent = data.data.stats.approved || 0;
        document.getElementById('rejected-count').textContent = data.data.stats.rejected || 0;

        // Update posts container if it exists
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer && data.data.recentPosts) {
            postsContainer.innerHTML = ''; // Clear existing posts
            data.data.recentPosts.forEach(post => {
                const postCard = createPostCard(post);
                postsContainer.appendChild(postCard);
            });
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
} 