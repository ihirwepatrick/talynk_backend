let currentPage = 1;
const postsPerPage = 10;
let loading = false;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/test.html';
        return;
    }

    document.getElementById('username-display').textContent = user.username;
    setupEventListeners();
    loadCategories();
    loadPosts();
});

function setupEventListeners() {
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/test.html';
    });

    // Create post modal
    const modal = document.getElementById('create-post-modal');
    const createBtn = document.getElementById('create-post-btn');
    const closeBtn = document.querySelector('.close');

    createBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Form submission
    document.getElementById('create-post-form').addEventListener('submit', handlePostSubmit);

    // Filters
    document.getElementById('category-filter').addEventListener('change', () => {
        currentPage = 1;
        loadPosts(true);
    });
    document.getElementById('sort-filter').addEventListener('change', () => {
        currentPage = 1;
        loadPosts(true);
    });

    // Load more
    document.getElementById('load-more').addEventListener('click', () => {
        currentPage++;
        loadPosts();
    });
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        const categorySelects = ['category-filter', 'category'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadPosts(reset = false) {
    if (loading) return;
    loading = true;

    try {
        const categoryId = document.getElementById('category-filter').value;
        const sortOrder = document.getElementById('sort-filter').value;
        
        const response = await fetch(`/api/posts?page=${currentPage}&limit=${postsPerPage}&category=${categoryId}&sort=${sortOrder}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (reset) {
            document.getElementById('posts-container').innerHTML = '';
        }

        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(post => {
                const postCard = createPostCard(post);
                document.getElementById('posts-container').appendChild(postCard);
            });

            document.getElementById('load-more').style.display = 
                data.pagination.hasMore ? 'block' : 'none';
        } else {
            console.error('Invalid data format received:', data);
        }

    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        loading = false;
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
                <div class="post-author">👤 ${post.author ? post.author.username : 'Unknown'}</div>
            </div>
            <div class="post-meta">
                <div class="category">📁 ${post.category ? post.category.name : 'Uncategorized'}</div>
                <div class="date">📅 ${new Date(post.createdAt).toLocaleDateString()}</div>
            </div>
            ${post.caption ? `<div class="post-caption">${post.caption}</div>` : ''}
        </div>
    `;
    
    return div;
}

async function handlePostSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('categoryId', document.getElementById('category').value);
    formData.append('media', document.getElementById('media').files[0]);
    formData.append('caption', document.getElementById('caption').value);

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to create post');

        document.getElementById('create-post-modal').style.display = 'none';
        document.getElementById('create-post-form').reset();
        alert('Post created successfully! Waiting for approval.');

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + error.message);
    }
} 