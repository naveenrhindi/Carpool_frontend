document.addEventListener('DOMContentLoaded', async function() {
    const user = AuthService.getUser();
    
    if (!AuthService.isAuthenticated()) {
        Swal.fire({
            icon: 'warning',
            title: 'Authentication Required',
            text: 'Please login to view your ride history'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    try {
        await loadRideHistory('all');
        setupFilterButtons();
    } catch (error) {
        console.error('Initial load error:', error);
    }
});

async function loadRideHistory(filter = 'all') {
    try {
        const user = AuthService.getUser();
        const token = AuthService.getToken();

        const response = await fetch(`http://localhost:5000/api/rides/history/${user.id}?filter=${filter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch ride history');
        }

        displayRideHistory(data);
        updateRideStats(data);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load ride history'
        });
    }
}

function displayRideHistory(rides) {
    const container = document.getElementById('rideHistory');
    container.innerHTML = '';

    if (!rides.length) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-calendar-x display-1 text-muted"></i>
                <h4 class="mt-3">No rides found</h4>
                <p class="text-muted">Your ride history will appear here</p>
            </div>
        `;
        return;
    }

    rides.forEach(ride => {
        container.innerHTML += createRideCard(ride);
    });
}

function createRideCard(ride) {
    return `
        <div class="col-12 mb-4" data-aos="fade-up">
            <div class="card ride-card">
                <div class="card-body position-relative">
                    <span class="ride-status status-${ride.status.toLowerCase()}">${ride.status}</span>
                    <div class="d-flex align-items-center mb-3">
                        <div class="ride-icon ${ride.role.toLowerCase()}-ride">
                            <i class="bi bi-${ride.role === 'driver' ? 'car-front' : 'person'}"></i>
                        </div>
                        <div>
                            <h5 class="mb-1">${ride.role}</h5>
                            <p class="mb-0 text-muted">${new Date(ride.date).toLocaleDateString()} • ${new Date(ride.date).toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center mb-3">
                        <div>
                            <p class="mb-0"><i class="bi bi-geo-alt text-primary"></i> ${ride.pickup}</p>
                        </div>
                        <div class="route-line"></div>
                        <div>
                            <p class="mb-0"><i class="bi bi-geo-alt text-danger"></i> ${ride.destination}</p>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-0">
                                ${ride.role === 'driver' 
                                    ? `<i class="bi bi-people"></i> ${ride.passengers} co-riders • ₹${ride.fare} earned`
                                    : `<i class="bi bi-cash"></i> ₹${ride.fare} ${ride.status === 'cancelled' ? 'refunded' : 'paid'}`}
                            </p>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" onclick="viewRideDetails('${ride._id}')">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateRideStats(rides) {
    const stats = {
        totalRides: rides.length,
        moneySaved: rides.reduce((sum, ride) => sum + (ride.status === 'completed' ? ride.fare : 0), 0),
        co2Reduced: rides.length * 2.5 // Example calculation
    };

    document.querySelector('.stats-card:nth-child(1) h3').textContent = stats.totalRides;
    document.querySelector('.stats-card:nth-child(2) h3').textContent = `₹${stats.moneySaved}`;
    document.querySelector('.stats-card:nth-child(3) h3').textContent = `${stats.co2Reduced} kg`;
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach((button, index) => {
        const filters = ['all', 'driver', 'passenger'];
        button.addEventListener('click', function() {
            document.querySelector('.filter-btn.active').classList.remove('active');
            this.classList.add('active');
            loadRideHistory(filters[index]);
        });
    });
}

async function viewRideDetails(rideId) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch ride details');
        
        const ride = await response.json();
        showRideDetailsModal(ride);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load ride details'
        });
    }
}

async function showRideDetailsModal(ride) {
    try {
        // Fetch chat history
        const response = await fetch(`http://localhost:5000/api/rides/${ride._id}/chat`, {
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`
            }
        });

        const chatHistory = await response.json();

        // Show modal with ride details and chat history
        Swal.fire({
            title: 'Ride Details',
            html: `
                <div class="ride-details">
                    <!-- Ride details here -->
                    <h5 class="mt-4">Chat History</h5>
                    <div class="chat-history">
                        ${chatHistory.map(msg => `
                            <div class="message ${msg.sender._id === AuthService.getUser().id ? 'sent' : 'received'}">
                                <strong>${msg.sender.name}</strong>: ${msg.content}
                                <small>${new Date(msg.timestamp).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            width: '600px'
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load ride details'
        });
    }
}