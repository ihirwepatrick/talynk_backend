document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/test.html';
        return;
    }

    document.getElementById('username-display').textContent = user.username;
    setupEventListeners();
    loadApprovedPosts();
});

function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/test.html';
    });
}

async function loadApprovedPosts() {
    try {
        const response = await fetch('/api/posts/approved', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        displayPosts(data.data);

    } catch (error) {
        console.error('Error loading posts:', error);
        if (error.message.includes('401')) {
            window.location.href = '/test.html';
        }
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-feed');
    container.innerHTML = '';

    if (!posts.length) {
        container.innerHTML = '<div class="no-posts">No approved posts available</div>';
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
        ? `<video class="post-media" controls><source src="${post.mediaUrl}" type="video/mp4"></video>`
        : `<img src="${post.mediaUrl}" class="post-media" alt="${post.title}">`;

    div.innerHTML = `
        ${mediaElement}
        <div class="post-content">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-author">
                    <i class="fas fa-user"></i> ${post.author ? post.author.username : 'Unknown'}
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
            <div class="post-caption">${post.caption || ''}</div>
        </div>
    `;
    
    return div;
} 