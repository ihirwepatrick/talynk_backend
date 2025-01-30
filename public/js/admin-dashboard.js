let currentStatus = 'pending'; // Default status

function setupTabListeners() {
    const tabs = document.querySelectorAll('.status-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Update current status and reload posts
            currentStatus = tab.dataset.status;
            loadPosts(currentStatus);
        });
    });
}

async function loadPosts(status = 'pending') {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const postsContainer = document.getElementById('posts-container');
        
        if (!postsContainer) {
            console.error('Posts container not found');
            return;
        }

        postsContainer.innerHTML = '';

        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error(`Error loading ${status} posts:`, error);
    }
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';

    const mediaHtml = post.mediaType === 'video' 
        ? `<video src="${post.mediaUrl}" controls class="post-media"></video>`
        : `<img src="${post.mediaUrl}" alt="Post media" class="post-media">`;

    postDiv.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">📝 ${post.title}</h3>
            <span class="post-date">📅 ${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="post-media-container">
            ${mediaHtml}
        </div>
        <div class="post-info">
            <p class="post-author">👤 Author: ${post.author ? post.author.username : 'Unknown'}</p>
            <p class="post-category">📁 Category: ${post.category ? post.category.name : 'Uncategorized'}</p>
            <p class="post-status">Status: ${getStatusEmoji(post.status)} ${post.status}</p>
        </div>
        ${post.status === 'pending' ? `
            <div class="post-actions">
                <button onclick="handleApprove(${post.id})" class="approve-btn">✅ Approve</button>
                <button onclick="handleReject(${post.id})" class="reject-btn">❌ Reject</button>
            </div>
        ` : ''}
        ${post.status === 'rejected' && post.rejectionReason ? `
            <div class="rejection-reason">
                <p>❗ Rejection Reason: ${post.rejectionReason}</p>
            </div>
        ` : ''}
    `;

    // Add video watch time check
    if (post.mediaType === 'video' && post.status === 'pending') {
        const video = postDiv.querySelector('video');
        const approveBtn = postDiv.querySelector('.approve-btn');
        const rejectBtn = postDiv.querySelector('.reject-btn');
        
        if (video && approveBtn && rejectBtn) {
            approveBtn.disabled = true;
            rejectBtn.disabled = true;
            
            video.addEventListener('timeupdate', () => {
                if (video.currentTime >= video.duration / 2) {
                    approveBtn.disabled = false;
                    rejectBtn.disabled = false;
                }
            });
        }
    }

    return postDiv;
}

function getStatusEmoji(status) {
    switch (status) {
        case 'pending': return '⌛';
        case 'approved': return '✅';
        case 'rejected': return '❌';
        default: return '❓';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    setupTabListeners();
    loadDashboardData();
    loadPosts('pending'); // Load pending posts by default
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
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update statistics
        document.getElementById('total-count').textContent = data.data.stats.total || 0;
        document.getElementById('pending-count').textContent = data.data.stats.pending || 0;
        document.getElementById('approved-count').textContent = data.data.stats.approved || 0;
        document.getElementById('rejected-count').textContent = data.data.stats.rejected || 0;

        // Update posts container
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // Clear existing posts

        if (data.data.recentPosts && Array.isArray(data.data.recentPosts)) {
            data.data.recentPosts.forEach(post => {
                const postCard = createPostCard(post);
                postsContainer.appendChild(postCard);
            });
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    // Create media element based on type
    const mediaElement = post.mediaType === 'video' 
        ? `<video class="post-media" controls>
             <source src="${post.mediaUrl}" type="video/mp4">
           </video>`
        : `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;

    div.innerHTML = `
        <div class="post-header">
            <div class="post-title">📝 ${post.title}</div>
            <div class="post-id">🆔 ${post.id}</div>
        </div>
        ${mediaElement}
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

    // Add event listeners for video if present
    if (post.mediaType === 'video') {
        const video = div.querySelector('video');
        const actions = div.querySelector(`#actions-${post.id}`);

        if (video && actions) {
            let watchTime = 0;
            video.addEventListener('timeupdate', () => {
                watchTime = video.currentTime;
                const duration = video.duration;
                if (watchTime >= duration / 2) { // Enable buttons after watching half the video
                    const buttons = actions.querySelectorAll('button');
                    buttons.forEach(btn => btn.disabled = false);
                }
            });
        }
    }

    // Add event listeners for action buttons
    const approveBtn = div.querySelector('[data-action="approve"]');
    const rejectBtn = div.querySelector('[data-action="reject"]');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', () => handleApprove(post.id));
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => showRejectionModal(post.id));
    }

    return div;
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    loadDashboardData();
});

// Add functions for handling approve/reject actions
async function handleApprove(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/approve`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to approve post');
        }

        // Reload dashboard data after successful approval
        loadDashboardData();
        alert('Post approved successfully!');

    } catch (error) {
        console.error('Error approving post:', error);
        alert('Error approving post: ' + error.message);
    }
}

function showRejectionModal(postId) {
    // Implement rejection modal logic here
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
        handleReject(postId, reason);
    }
}

async function handleReject(postId, reason) {
    try {
        const response = await fetch(`/api/posts/${postId}/reject`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) {
            throw new Error('Failed to reject post');
        }

        // Reload dashboard data after successful rejection
        loadDashboardData();
        alert('Post rejected successfully!');

    } catch (error) {
        console.error('Error rejecting post:', error);
        alert('Error rejecting post: ' + error.message);
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

        // Update tab badges if they exist
        const pendingBadge = document.querySelector('[data-status="pending"] .count');
        const approvedBadge = document.querySelector('[data-status="approved"] .count');
        const rejectedBadge = document.querySelector('[data-status="rejected"] .count');

        if (pendingBadge) pendingBadge.textContent = data.data.stats.pending || 0;
        if (approvedBadge) approvedBadge.textContent = data.data.stats.approved || 0;
        if (rejectedBadge) rejectedBadge.textContent = data.data.stats.rejected || 0;

        // Load initial posts if not already loaded
        if (!document.querySelector('.post-card')) {
            loadPosts(currentStatus);
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Add event listeners for the status filters
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/test.html';
        return;
    }

    // Status filter buttons
    document.querySelectorAll('.status-filter').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all buttons
            document.querySelectorAll('.status-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load data for selected status
            const status = button.getAttribute('data-status');
            loadDashboardData(status);
        });
    });

    // Date filter
    const applyFilterBtn = document.querySelector('#apply-filter');
    const resetBtn = document.querySelector('#reset');

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            const startDate = document.querySelector('#start-date').value;
            const endDate = document.querySelector('#end-date').value;
            // Implement date filtering logic here
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelector('#start-date').value = '';
            document.querySelector('#end-date').value = '';
            loadDashboardData('pending');
        });
    }

    // Initial load
    loadDashboardData('pending');
});

// Add event listeners for filter buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Load posts for selected status
            loadPosts(button.dataset.status);
        });
    });

    // Load pending posts by default
    loadPosts('pending');
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/test.html';
        return;
    }

    // Set up tab switching
    setupTabs();
    
    // Load initial data
    loadStats();
    loadPosts();
    loadUsers();

    // Set up filters
    setupFilters();
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
        });
    });
}

async function loadStats() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        document.getElementById('total-count').textContent = data.data.stats.total || 0;
        document.getElementById('pending-count').textContent = data.data.stats.pending || 0;
        document.getElementById('approved-count').textContent = data.data.stats.approved || 0;
        document.getElementById('rejected-count').textContent = data.data.stats.rejected || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadPosts(status = 'all') {
    try {
        const response = await fetch(`/api/admin/posts?status=${status}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        const tableBody = document.getElementById('posts-table-body');
        tableBody.innerHTML = '';

        data.data.forEach(post => {
            const row = document.createElement('tr');
            
            // Format engagement data
            const engagement = {
                likes: post.likes?.length || 0,
                comments: post.comments?.length || 0,
                shares: post.shares?.length || 0,
                views: post.views?.length || 0
            };

            // Format comments data
            const commentsData = post.comments?.map(comment => ({
                user: comment.user.username,
                date: new Date(comment.createdAt).toLocaleDateString(),
                text: comment.text
            })) || [];

            // Format shares data
            const sharesData = post.shares?.map(share => ({
                user: share.user.username,
                date: new Date(share.createdAt).toLocaleDateString()
            })) || [];

            // Calculate video length if it's a video
            const videoLength = post.mediaType === 'video' ? post.mediaMetadata?.duration || 'N/A' : 'N/A';

            row.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.caption || 'No caption'}</td>
                <td>
                    ${post.mediaType === 'video' 
                        ? `<video width="100" height="60" controls><source src="/uploads/${post.mediaUrl}" type="video/mp4"></video>`
                        : `<img src="/uploads/${post.mediaUrl}" width="100" height="60" alt="Post media">`
                    }
                </td>
                <td>${videoLength}</td>
                <td>${post.author ? post.author.username : 'Unknown'}</td>
                <td>${post.category ? post.category.name : 'Uncategorized'}</td>
                <td><span class="status-badge ${post.status}">${post.status}</span></td>
                <td>${post.approver ? post.approver.username : 'N/A'}</td>
                <td>${post.approvedAt ? new Date(post.approvedAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="engagement-stats">
                        <span title="Likes">👍 ${engagement.likes}</span>
                        <span title="Comments">💬 ${engagement.comments}</span>
                        <span title="Shares">🔄 ${engagement.shares}</span>
                        <span title="Views">👁️ ${engagement.views}</span>
                    </div>
                </td>
                <td>
                    <div class="comments-preview" onclick="showCommentsDetail(${JSON.stringify(commentsData)})">
                        ${commentsData.length > 0 
                            ? `Latest: ${commentsData[0].user} - ${commentsData[0].date}`
                            : 'No comments'
                        }
                    </div>
                </td>
                <td>
                    <div class="shares-preview" onclick="showSharesDetail(${JSON.stringify(sharesData)})">
                        ${sharesData.length > 0
                            ? `${sharesData.length} shares`
                            : 'No shares'
                        }
                    </div>
                </td>
                <td>
                    <div class="views-count">
                        ${post.views?.length || 0} views
                    </div>
                </td>
                <td>
                    ${post.status === 'pending' ? `
                        <button onclick="handleApprove(${post.id})" class="action-btn approve">✅</button>
                        <button onclick="handleReject(${post.id})" class="action-btn reject">❌</button>
                    ` : ''}
                    <button onclick="handleDelete(${post.id})" class="action-btn delete">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';

        data.data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>${user.postsCount || 0}</td>
                <td>
                    ${user.role !== 'admin' ? `
                        <button onclick="handleRoleToggle(${user.id})" class="action-btn">👑</button>
                    ` : ''}
                    <button onclick="handleUserDelete(${user.id})" class="action-btn delete">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function setupFilters() {
    // Status filter for posts
    document.getElementById('status-filter').addEventListener('change', (e) => {
        loadPosts(e.target.value);
    });

    // Search filter for posts
    document.getElementById('search-posts').addEventListener('input', debounce((e) => {
        // Implement post search
    }, 300));

    // Role filter for users
    document.getElementById('role-filter').addEventListener('change', (e) => {
        // Implement role filter
    });

    // Search filter for users
    document.getElementById('search-users').addEventListener('input', debounce((e) => {
        // Implement user search
    }, 300));
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add functions to show detailed modals
function showCommentsDetail(comments) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Comments</h3>
            <div class="comments-list">
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <strong>${comment.user}</strong>
                            <span>${comment.date}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function showSharesDetail(shares) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Shares</h3>
            <div class="shares-list">
                ${shares.map(share => `
                    <div class="share">
                        <strong>${share.user}</strong>
                        <span>${share.date}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
} 