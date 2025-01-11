document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || !user.isAdmin) {
        window.location.href = '/test.html';
        return;
    }

    document.getElementById('username-display').textContent = user.username;
    setupEventListeners();
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
        console.log('Loading dashboard data...');
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        let url = '/api/posts/admin/all';
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Fetched data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch posts');
        }

        // Update statistics
        updateStatistics(data.stats);

        // Group posts by status
        const groupedPosts = {
            pending: data.data.filter(post => post.status === 'pending'),
            approved: data.data.filter(post => post.status === 'approved'),
            rejected: data.data.filter(post => post.status === 'rejected')
        };

        // Display posts
        Object.keys(groupedPosts).forEach(status => {
            const container = document.getElementById(`${status}-posts`);
            container.innerHTML = '';
            
            if (groupedPosts[status].length === 0) {
                container.innerHTML = `<div class="no-posts">No ${status} posts found</div>`;
                return;
            }

            groupedPosts[status].forEach(post => {
                container.appendChild(createPostCard(post));
            });
        });

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            alert('Session expired. Please login again.');
            window.location.href = '/test.html';
        } else {
            alert('Error loading dashboard data: ' + error.message);
        }
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
    
    let mediaElement = '';
    let videoWatched = false;
    
    if (post.mediaType === 'video') {
        mediaElement = `
            <div class="video-container">
                <video id="video-${post.id}" class="post-media" controls>
                    <source src="${post.mediaUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                ${post.status === 'pending' ? `
                    <div class="video-overlay" id="overlay-${post.id}">
                        <span>Please watch at least 1 minute before taking action</span>
                    </div>
                ` : ''}
            </div>`;
    } else {
        mediaElement = `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;
    }
        
    div.innerHTML = `
        ${mediaElement}
        <div class="post-content">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-id">ID: ${post.id}</div>
            </div>
            <div class="post-meta">
                <div class="user-info">
                    <i class="fas fa-user"></i> 
                    Posted by: ${post.author ? post.author.username : 'Unknown'}
                </div>
                <div class="category-info">
                    <i class="fas fa-folder"></i>
                    Category: ${post.category ? post.category.name : 'Uncategorized'}
                </div>
                <div class="date-info">
                    <i class="fas fa-calendar"></i>
                    Posted: ${new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div class="status-info status-${post.status}">
                    <i class="fas fa-info-circle"></i>
                    Status: ${post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </div>
                ${post.rejectionReason ? `
                    <div class="rejection-reason">
                        <i class="fas fa-exclamation-circle"></i>
                        Rejection Reason: ${post.rejectionReason}
                    </div>
                ` : ''}
            </div>
            ${post.status === 'pending' ? `
                <div class="post-actions" id="actions-${post.id}">
                    <button class="action-btn approve-btn" data-action="approve" data-post-id="${post.id}" disabled>
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="action-btn reject-btn" data-action="reject" data-post-id="${post.id}" disabled>
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    // Add event listeners after creating the element
    if (post.status === 'pending') {
        const approveBtn = div.querySelector('.approve-btn');
        const rejectBtn = div.querySelector('.reject-btn');
        
        if (approveBtn) {
            approveBtn.addEventListener('click', () => handleApprove(post.id));
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => showRejectionModal(post.id));
        }
    }

    // Add video event listeners if it's a video and pending
    if (post.mediaType === 'video' && post.status === 'pending') {
        setTimeout(() => {
            const video = div.querySelector(`#video-${post.id}`);
            const overlay = div.querySelector(`#overlay-${post.id}`);
            const actions = div.querySelector(`#actions-${post.id}`);
            
            if (video && actions) {
                let watchTime = 0;
                
                video.addEventListener('timeupdate', () => {
                    watchTime = video.currentTime;
                    if (watchTime >= 60 && !videoWatched) {
                        videoWatched = true;
                        if (overlay) overlay.style.display = 'none';
                        const buttons = actions.querySelectorAll('button');
                        buttons.forEach(btn => btn.disabled = false);
                    }
                });
            }
        }, 0);
    } else if (post.status === 'pending') {
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