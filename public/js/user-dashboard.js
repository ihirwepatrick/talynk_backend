document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/test.html';
        return;
    }

    document.getElementById('username-display').textContent = user.username;
    setupEventListeners();
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

function displayPosts(containerId, posts) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<div class="no-posts">No posts found</div>';
        return;
    }

    posts.forEach(post => {
        container.appendChild(createPostCard(post));
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
                <div>Status: <span class="status-${post.status}">${post.status}</span></div>
                <div>Category: ${post.category ? post.category.name : 'Uncategorized'}</div>
                <div>Posted: ${new Date(post.createdAt).toLocaleDateString()}</div>
                ${post.rejectionReason ? `
                    <div class="rejection-reason">
                        Rejection Reason: ${post.rejectionReason}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return div;
}

function handleError(error) {
    if (error.message.includes('401') || error.message.includes('403')) {
        alert('Session expired. Please login again.');
        window.location.href = '/test.html';
    } else {
        alert('Error: ' + error.message);
    }
} 