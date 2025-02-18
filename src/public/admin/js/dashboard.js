// Check authentication
if (!auth.checkAuth('admin')) {
    window.location.href = '/login.html';
}

// Page content templates
const pages = {
    dashboard: `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Dashboard Overview</h1>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="stats-card">
                    <h3 id="totalUsers">0</h3>
                    <p>Total Users</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <h3 id="pendingApprovals">0</h3>
                    <p>Pending Approvals</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <h3 id="totalVideos">0</h3>
                    <p>Total Videos</p>
                </div>
            </div>
        </div>
    `,
    
    approvers: `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Manage Approvers</h1>
            <button class="btn btn-primary" onclick="showAddApproverModal()">Add New Approver</button>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="approversList">
                    <!-- Approvers will be loaded here -->
                </tbody>
            </table>
        </div>
    `,

    videos: `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Video Management</h1>
        </div>
        <div class="row" id="videosList">
            <!-- Videos will be loaded here -->
        </div>
    `,

    users: `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">User Management</h1>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersList">
                    <!-- Users will be loaded here -->
                </tbody>
            </table>
        </div>
    `
};

// Load page content
function loadPage(pageName) {
    const content = document.getElementById('content');
    content.innerHTML = pages[pageName];
    
    // Update URL without reloading
    window.history.pushState({}, '', `/admin/dashboard.html?page=${pageName}`);
    
    // Load data based on page
    switch(pageName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'approvers':
            loadApprovers();
            break;
        case 'videos':
            loadVideos();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// API calls
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('pendingApprovals').textContent = data.data.pendingApprovals;
            document.getElementById('totalVideos').textContent = data.data.totalVideos;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Event listeners
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        if (page) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            loadPage(page);
        }
    });
});

// Load correct page based on URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'dashboard';
    loadPage(page);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'dashboard';
    loadPage(page);
}); 