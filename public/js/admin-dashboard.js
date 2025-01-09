document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Check if user is logged in and is admin
    if (!token || !user || !user.isAdmin) {
        alert('Please login as admin');
        window.location.href = '/test.html';
        return;
    }

    // If we get here, user is authenticated and is admin
    document.getElementById('username-display').textContent = user.username;
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await fetch('/api/posts/all', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        // Update stats
        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        // Group posts by status
        const groupedPosts = {
            pending: [],
            approved: [],
            rejected: []
        };

        if (data.data) {
            data.data.forEach(post => {
                stats[post.status]++;
                groupedPosts[post.status].push(post);
            });
        }

        // Update stats display
        document.getElementById('pending-count').textContent = stats.pending;
        document.getElementById('approved-count').textContent = stats.approved;
        document.getElementById('rejected-count').textContent = stats.rejected;

        // Display posts
        displayPosts('pending-posts', groupedPosts.pending);
        displayPosts('approved-posts', groupedPosts.approved);
        displayPosts('rejected-posts', groupedPosts.rejected);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            alert('Session expired. Please login again.');
            window.location.href = '/test.html';
        }
    }
}

function displayPosts(containerId, posts) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    posts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
}

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
            </div>
            ${post.status === 'pending' ? `
                <div class="approval-buttons">
                    <button class="approve-btn" onclick="updatePostStatus(${post.id}, 'approved')">Approve</button>
                    <button class="reject-btn" onclick="updatePostStatus(${post.id}, 'rejected')">Reject</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return div;
}

async function updatePostStatus(postId, status) {
    try {
        const response = await fetch(`/api/posts/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert(`Post ${status} successfully`);
            loadDashboardData();
        } else {
            const data = await response.json();
            alert('Failed to update post status: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating post status:', error);
        alert('Error updating post status');
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear(); // Clear all localStorage items
    window.location.href = '/test.html';
}); 