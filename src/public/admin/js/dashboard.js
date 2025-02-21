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
    `,

    users: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Users Management</h1>
            <div class="d-flex gap-2">
                <input type="text" class="form-control" id="userSearch" placeholder="Search users...">
                <select class="form-select" id="statusFilter">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>
        </div>
        <div class="table-container">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Videos</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersList">
                        <!-- Users will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- User Videos Modal -->
        <div class="modal fade" id="userVideosModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">User Videos</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Approver</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody id="userVideosList">
                                    <!-- Videos will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    videos: `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Videos Management</h1>
            <div class="d-flex gap-2">
                <select class="form-select" id="videoStatusFilter" onchange="loadVideos(1)">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card" id="totalVideosCard">
                    <h3 id="statsTotal">0</h3>
                    <p>Total Videos</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card" id="pendingVideosCard">
                    <h3 id="statsPending">0</h3>
                    <p>Pending Review</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card" id="approvedVideosCard">
                    <h3 id="statsApproved">0</h3>
                    <p>Approved</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card" id="rejectedVideosCard">
                    <h3 id="statsRejected">0</h3>
                    <p>Rejected</p>
                </div>
            </div>
        </div>

        <div class="table-container">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Approver</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="videosList">
                        <!-- Videos will be loaded here -->
                    </tbody>
                </table>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <div id="videosCount"></div>
                <div id="videosPagination" class="btn-group">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Video Preview Modal -->
        <div class="modal fade" id="videoPreviewModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Video Preview</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="ratio ratio-16x9 mb-3">
                            <video id="videoPreview" controls>
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div class="mb-3">
                            <h6>Title</h6>
                            <p id="videoTitle"></p>
                        </div>
                        <div class="mb-3">
                            <h6>Description</h6>
                            <p id="videoDescription"></p>
                        </div>
                        <div id="videoStatusActions">
                            <div class="mb-3" id="rejectionReasonDiv" style="display: none;">
                                <label class="form-label">Rejection Reason</label>
                                <textarea class="form-control" id="rejectionReason" rows="3"></textarea>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-success" onclick="updateVideoStatus(currentVideoId, 'approved')">
                                    Approve
                                </button>
                                <button class="btn btn-danger" onclick="showRejectionReason()">
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    settings: `
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Profile Settings</h5>
                    </div>
                    <div class="card-body">
                        <form id="profileForm">
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" id="profileUsername" name="username">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="profileEmail" name="email">
                            </div>
                            <button type="submit" class="btn btn-primary">
                                Update Profile
                            </button>
                        </form>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Change Password</h5>
                    </div>
                    <div class="card-body">
                        <form id="passwordForm">
                            <div class="mb-3">
                                <label class="form-label">Current Password</label>
                                <input type="password" class="form-control" name="currentPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-control" name="newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" name="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Permissions</h5>
                    </div>
                    <div class="card-body">
                        <form id="permissionsForm">
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="canViewApproved">
                                    <label class="form-check-label">Can View Approved Videos</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="canViewPending">
                                    <label class="form-check-label">Can View Pending Videos</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="canManageApprovers">
                                    <label class="form-check-label">Can Manage Approvers</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="canManageUsers">
                                    <label class="form-check-label">Can Manage Users</label>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                Update Permissions
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Load page content
function loadPage(pageName) {
    const content = document.getElementById('content');
    content.innerHTML = pages[pageName];
    
    // Initialize page-specific functionality
    switch(pageName) {
        case 'overview':
            loadDashboardStats();
            loadRecentActivity();
            break;
        case 'approvers':
            loadApprovers();
            break;
        case 'users':
            loadUsers();
            break;
        case 'videos':
            loadVideos();
            loadVideoStats();
            break;
        case 'settings':
            loadSettings();
            initializeSettingsPage();
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

async function loadRecentActivity() {
    try {
        const response = await fetch('/api/admin/recent-activity', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            const activityList = document.getElementById('recentActivity');
            activityList.innerHTML = data.data.map(activity => `
                <tr>
                    <td>
                        <span class="badge bg-${
                            activity.action.includes('Approved') ? 'success' :
                            activity.action.includes('Rejected') ? 'danger' : 
                            'info'
                        }">
                            ${activity.action}
                        </span>
                    </td>
                    <td>${activity.user}</td>
                    <td>${activity.details}</td>
                    <td>${new Date(activity.date).toLocaleString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

function refreshStats() {
    loadDashboardStats();
    loadRecentActivity();
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

async function addApprover() {
    try {
        const form = document.getElementById('addApproverForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        const response = await fetch('/api/admin/approvers', {
            method: 'POST',
            headers: {
                ...auth.getHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Close modal and refresh list
            bootstrap.Modal.getInstance(document.getElementById('addApproverModal')).hide();
            form.reset();
            loadApprovers();
            showAlert('Approver added successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding approver:', error);
        showAlert('Failed to add approver', 'danger');
    }
}

async function toggleApproverStatus(approverId, currentStatus) {
    try {
        const response = await fetch(`/api/admin/approvers/${approverId}/status`, {
            method: 'PUT',
            headers: auth.getHeaders()
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadApprovers();
            showAlert('Approver status updated successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error toggling approver status:', error);
        showAlert('Failed to update approver status', 'danger');
    }
}

async function deleteApprover(approverId) {
    if (!confirm('Are you sure you want to delete this approver?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/approvers/${approverId}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadApprovers();
            showAlert('Approver deleted successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting approver:', error);
        showAlert('Failed to delete approver', 'danger');
    }
}

// Add this utility function for showing alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const content = document.getElementById('content');
    content.insertBefore(alertDiv, content.firstChild);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = data.data.users.map(user => `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge bg-${user.status === 'active' ? 'success' : 'danger'}">
                            ${user.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="showUserVideos('${user.id}', '${user.username}')">
                            ${user.totalVideos} Videos
                        </button>
                    </td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-${user.status === 'active' ? 'warning' : 'success'}"
                                    onclick="toggleUserStatus('${user.id}', '${user.status}')">
                                ${user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteUser('${user.id}')">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Failed to load users', 'danger');
    }
}

async function showUserVideos(userId, username) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/videos`, {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            const videosList = document.getElementById('userVideosList');
            videosList.innerHTML = data.data.videos.map(video => `
                <tr>
                    <td>${video.title}</td>
                    <td>
                        <span class="badge bg-${
                            video.status === 'approved' ? 'success' :
                            video.status === 'rejected' ? 'danger' : 'warning'
                        }">
                            ${video.status}
                        </span>
                    </td>
                    <td>${video.Approver ? video.Approver.username : 'Pending'}</td>
                    <td>${new Date(video.createdAt).toLocaleString()}</td>
                </tr>
            `).join('');
            
            document.querySelector('#userVideosModal .modal-title').textContent = 
                `Videos by ${username}`;
            
            new bootstrap.Modal(document.getElementById('userVideosModal')).show();
        }
    } catch (error) {
        console.error('Error loading user videos:', error);
        showAlert('Failed to load user videos', 'danger');
    }
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: auth.getHeaders()
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadUsers();
            showAlert('User status updated successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showAlert('Failed to update user status', 'danger');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadUsers();
            showAlert('User deleted successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Failed to delete user', 'danger');
    }
}

let currentVideoId = null;

async function loadVideos(page = 1) {
    try {
        const status = document.getElementById('videoStatusFilter').value;
        const response = await fetch(`/api/admin/videos?page=${page}&status=${status}`, {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            renderVideos(data.data);
            loadVideoStats();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showAlert('Failed to load videos', 'danger');
    }
}

function renderVideos(data) {
    const videosList = document.getElementById('videosList');
    videosList.innerHTML = data.videos.map(video => `
        <tr>
            <td>
                <a href="#" onclick="previewVideo('${video.id}')">${video.title}</a>
            </td>
            <td>${video.User.username}</td>
            <td>
                <span class="badge bg-${
                    video.status === 'approved' ? 'success' :
                    video.status === 'rejected' ? 'danger' : 'warning'
                }">
                    ${video.status}
                </span>
            </td>
            <td>${video.Approver ? video.Approver.username : '-'}</td>
            <td>${new Date(video.createdAt).toLocaleString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-primary" onclick="previewVideo('${video.id}')">
                        View
                    </button>
                    <button class="btn btn-danger" onclick="deleteVideo('${video.id}')">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render pagination
    const pagination = document.getElementById('videosPagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= data.pages; i++) {
        pagination.innerHTML += `
            <button class="btn btn-${i === data.currentPage ? 'primary' : 'outline-primary'}"
                    onclick="loadVideos(${i})">
                ${i}
            </button>
        `;
    }

    // Update count
    document.getElementById('videosCount').textContent = 
        `Showing ${data.videos.length} of ${data.total} videos`;
}

async function loadVideoStats() {
    try {
        const response = await fetch('/api/admin/videos/stats', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('statsTotal').textContent = data.data.total;
            document.getElementById('statsPending').textContent = data.data.pending;
            document.getElementById('statsApproved').textContent = data.data.approved;
            document.getElementById('statsRejected').textContent = data.data.rejected;
        }
    } catch (error) {
        console.error('Error loading video stats:', error);
    }
}

async function previewVideo(videoId) {
    currentVideoId = videoId;
    // In a real application, you would load the video details here
    const videoModal = new bootstrap.Modal(document.getElementById('videoPreviewModal'));
    videoModal.show();
}

function showRejectionReason() {
    document.getElementById('rejectionReasonDiv').style.display = 'block';
}

async function updateVideoStatus(videoId, status) {
    try {
        const reason = status === 'rejected' ? 
            document.getElementById('rejectionReason').value : null;

        const response = await fetch(`/api/admin/videos/${videoId}/status`, {
            method: 'PUT',
            headers: {
                ...auth.getHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, reason })
        });

        const result = await response.json();

        if (result.status === 'success') {
            bootstrap.Modal.getInstance(document.getElementById('videoPreviewModal')).hide();
            loadVideos();
            showAlert('Video status updated successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error updating video status:', error);
        showAlert('Failed to update video status', 'danger');
    }
}

async function deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/videos/${videoId}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadVideos();
            showAlert('Video deleted successfully', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        showAlert('Failed to delete video', 'danger');
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/api/admin/settings', {
            headers: auth.getHeaders()
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            // Fill profile form
            document.getElementById('profileUsername').value = data.data.settings.username;
            document.getElementById('profileEmail').value = data.data.settings.email;

            // Set permissions
            const permissions = data.data.settings.permissions;
            document.getElementById('canViewApproved').checked = permissions.canViewApproved;
            document.getElementById('canViewPending').checked = permissions.canViewPending;
            document.getElementById('canManageApprovers').checked = permissions.canManageApprovers;
            document.getElementById('canManageUsers').checked = permissions.canManageUsers;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showAlert('Failed to load settings', 'danger');
    }
}

function initializeSettingsPage() {
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const response = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: {
                    ...auth.getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const result = await response.json();
            if (result.status === 'success') {
                showAlert('Profile updated successfully', 'success');
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('Failed to update profile', 'danger');
        }
    });

    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (formData.get('newPassword') !== formData.get('confirmPassword')) {
            showAlert('New passwords do not match', 'danger');
            return;
        }

        try {
            const response = await fetch('/api/admin/password', {
                method: 'PUT',
                headers: {
                    ...auth.getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: formData.get('currentPassword'),
                    newPassword: formData.get('newPassword')
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                showAlert('Password updated successfully', 'success');
                e.target.reset();
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            showAlert('Failed to update password', 'danger');
        }
    });

    // Permissions form submission
    document.getElementById('permissionsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const permissions = {
                canViewApproved: document.getElementById('canViewApproved').checked,
                canViewPending: document.getElementById('canViewPending').checked,
                canManageApprovers: document.getElementById('canManageApprovers').checked,
                canManageUsers: document.getElementById('canManageUsers').checked
            };

            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    ...auth.getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ permissions })
            });

            const result = await response.json();
            if (result.status === 'success') {
                showAlert('Permissions updated successfully', 'success');
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            showAlert('Failed to update permissions', 'danger');
        }
    });
} 