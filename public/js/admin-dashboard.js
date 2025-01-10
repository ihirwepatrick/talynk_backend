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
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const queryParams = new URLSearchParams({
            startDate: startDate || '',
            endDate: endDate || ''
        });

        const response = await fetch(`/api/posts/all?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
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
    
    const mediaElement = post.mediaType === 'video'
        ? `<video src="${post.mediaUrl}" class="post-media" controls></video>`
        : `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;
        
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
                <div class="post-actions">
                    <button class="action-btn approve-btn" onclick="updatePostStatus(${post.id}, 'approved')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="action-btn reject-btn" onclick="showRejectionModal(${post.id})">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    return div;
}

// Show Rejection Modal
function showRejectionModal(postId) {
    document.getElementById('reject-post-id').value = postId;
    document.getElementById('rejection-reason').value = '';
    document.getElementById('rejection-modal').style.display = 'block';
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