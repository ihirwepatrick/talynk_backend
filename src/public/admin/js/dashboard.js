// Check authentication
if (!auth.checkAuth('admin')) {
    window.location.href = '/login.html';
}

// Page templates
const pages = {
    overview: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Dashboard Overview</h1>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="refreshStats()">
                    <i class='bx bx-refresh'></i> Refresh
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="stats-card">
                    <h3 id="totalUsers">0</h3>
                    <p class="text-muted mb-0">Total Users</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stats-card">
                    <h3 id="totalApprovers">0</h3>
                    <p class="text-muted mb-0">Active Approvers</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stats-card">
                    <h3 id="pendingVideos">0</h3>
                    <p class="text-muted mb-0">Pending Videos</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="stats-card">
                    <h3 id="approvedVideos">0</h3>
                    <p class="text-muted mb-0">Approved Videos</p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="table-container">
                    <h4 class="mb-3">Recent Activity</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Details</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody id="recentActivity">
                                <!-- Activity will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,

    approvers: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Approvers Management</h1>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addApproverModal">
                <i class='bx bx-plus'></i> Add Approver
            </button>
        </div>
        <div class="table-container">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Videos Approved</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="approversList">
                        <!-- Approvers will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    `
};

// Load page content
function loadPage(pageName) {
    const content = document.getElementById('content');
    content.innerHTML = pages[pageName];
    
    // Load data based on page
    switch(pageName) {
        case 'overview':
            loadDashboardStats();
            loadRecentActivity();
            break;
        case 'approvers':
            loadApprovers();
            break;
    }
}

// API calls
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('totalApprovers').textContent = data.data.totalApprovers;
            document.getElementById('pendingVideos').textContent = data.data.pendingVideos;
            document.getElementById('approvedVideos').textContent = data.data.approvedVideos;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadApprovers() {
    try {
        const response = await fetch('/api/admin/approvers', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            const approversList = document.getElementById('approversList');
            approversList.innerHTML = data.data.approvers.map(approver => `
                <tr>
                    <td>${approver.username}</td>
                    <td>${approver.email}</td>
                    <td>
                        <span class="badge bg-${approver.status === 'active' ? 'success' : 'danger'}">
                            ${approver.status}
                        </span>
                    </td>
                    <td>${approver.videosApproved || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-${approver.status === 'active' ? 'danger' : 'success'}"
                                onclick="toggleApproverStatus('${approver.id}', '${approver.status}')">
                            ${approver.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading approvers:', error);
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

// Load overview by default
loadPage('overview'); 