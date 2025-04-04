// Initialize WebSocket and global variables
const ws = new WebSocket('ws://localhost:5000');
let currentUser = null;
let map, marker, activeInput;
const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // India's center

document.addEventListener('DOMContentLoaded', function() {
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize components
    // Initialize components
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }

    // Show search results section when form is submitted
    const findRideForm = document.getElementById('findRideForm');
    if (findRideForm) {
        findRideForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('searchResults').style.display = 'block';
            // Scroll to results
            document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Initialize time picker
    const customDateTime = document.getElementById('customDateTime');
    if (customDateTime) {
        flatpickr(customDateTime, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today"
        });
    }

    // Handle time preset changes
    const timePreset = document.getElementById('timePreset');
    if (timePreset) {
        timePreset.addEventListener('change', function(e) {
            const customDateTime = document.getElementById('customDateTime');
            customDateTime.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

async function searchRides() {
    try {
        const token = localStorage.getItem('token');
        
        const params = {
            origin: document.getElementById('currentLocation').value,
            destination: document.getElementById('destination').value,
            departureDate: document.getElementById('customDateTime').value,
            seatsNeeded: document.getElementById('seatsRequired').value || 1,
            preferences: JSON.stringify({
                femaleOnly: document.getElementById('femaleOnly')?.checked || false
            })
        };

        const response = await fetch(`http://localhost:5000/api/rides/search?${new URLSearchParams(params)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch rides');
        }

        displayRides(data.rides || []);
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}

function displayRides(rides) {
    const container = document.querySelector('.results-container');
    container.innerHTML = '';

    if (!rides || rides.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-emoji-frown display-1 text-muted"></i>
                <h4 class="mt-3">No rides found</h4>
                <p class="text-muted">Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    rides.forEach(ride => {
        container.innerHTML += `
            <div class="card ride-card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="driver-info mb-3">
                                <img src="${ride.driver.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'}" 
                                     alt="Driver" class="driver-avatar">
                                <div>
                                    <h5 class="mb-1">${ride.driver.name}</h5>
                                    <div class="rating-stars">
                                        ${generateRatingStars(ride.driver.rating)}
                                        <span class="ms-2">${ride.driver.rating} (${ride.driver.totalRides || 0} rides)</span>
                                    </div>
                                </div>
                            </div>

                            <div class="vehicle-info mb-3">
                                <span class="badge bg-primary me-2">
                                    <i class="bi bi-car-front"></i> ${ride.vehicleDetails.type}
                                </span>
                                <span class="text-muted">${ride.vehicleDetails.number}</span>
                            </div>

                            <div class="route-preview" onclick="toggleRouteDetails(this)">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <div class="mb-2">
                                            <i class="bi bi-geo-alt text-success"></i> ${ride.route.origin}
                                        </div>
                                        <div>
                                            <i class="bi bi-geo-alt text-danger"></i> ${ride.route.destination}
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <div class="mb-2">${new Date(ride.route.departureTime).toLocaleTimeString()}</div>
                                        <div>${estimateArrivalTime(ride.route.departureTime, ride.route.duration)}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="route-details">
                                <div id="routeMap_${ride._id}" style="height: 200px; border-radius: 10px;"></div>
                                <div class="mt-2">
                                    <small class="text-muted">
                                        Via: ${ride.route.via || 'Direct route'}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4 border-start">
                            <div class="text-center">
                                <div class="mb-3">
                                    <h4 class="mb-1">₹${ride.fare}</h4>
                                    <small class="text-muted">per seat</small>
                                </div>
                                
                                <div class="mb-3">
                                    <i class="bi bi-person-fill"></i>
                                    <span>${ride.vehicleDetails.seatsAvailable} seats available</span>
                                </div>

                                <div class="contact-options mb-3">
                                    <button class="btn btn-outline-primary contact-btn" 
                                            onclick="initiateChat('${ride._id}')" 
                                            data-bs-toggle="tooltip" 
                                            title="Chat">
                                        <i class="bi bi-chat"></i>
                                    </button>
                                    <button class="btn btn-outline-primary contact-btn" 
                                            onclick="initiateCall('${ride.driver.phone}')" 
                                            data-bs-toggle="tooltip" 
                                            title="Call">
                                        <i class="bi bi-telephone"></i>
                                    </button>
                                    <button class="btn btn-outline-primary contact-btn" 
                                            onclick="initiateWhatsApp('${ride.driver.phone}')" 
                                            data-bs-toggle="tooltip" 
                                            title="WhatsApp">
                                        <i class="bi bi-whatsapp"></i>
                                    </button>
                                </div>

                                <button class="btn btn-primary w-100 mb-2" 
                                        onclick="bookRide('${ride._id}')">
                                    Request Ride
                                </button>
                                <button class="btn btn-outline-primary w-100" 
                                        onclick="viewRideDetails('${ride._id}')">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Initialize tooltips for new elements
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

// Helper functions
function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            stars += '<i class="bi bi-star text-warning"></i>';
        }
    }
    return stars;
}

function estimateArrivalTime(departureTime, duration) {
    const arrival = new Date(departureTime);
    arrival.setMinutes(arrival.getMinutes() + (duration || 45));
    return arrival.toLocaleTimeString();
}

function initiateChat(rideId) {
    // Implement chat functionality
    console.log('Chat initiated for ride:', rideId);
}

function initiateCall(phone) {
    window.location.href = `tel:${phone}`;
}

function initiateWhatsApp(phone) {
    window.open(`https://wa.me/${phone}`, '_blank');
}

function viewRideDetails(rideId) {
    window.location.href = `ride-details.html?id=${rideId}`;
}

function handleTimePreset(e) {
    const customDateTime = document.getElementById('customDateTime');
    customDateTime.style.display = e.target.value === 'custom' ? 'block' : 'none';
}

function handleViewToggle() {
    const mapView = document.getElementById('mapView');
    const listView = document.querySelector('.results-container');
    mapView.classList.toggle('active');
    
    if (mapView.classList.contains('active')) {
        initializeMapView();
    }
}

// Add this function after handleFilterApply
function applyFilters(filters) {
    try {
        const rides = document.querySelectorAll('.ride-card');
        
        rides.forEach(ride => {
            let show = true;
            
            // Price filter
            if (filters.priceRange.min || filters.priceRange.max) {
                const price = parseFloat(ride.querySelector('h4').textContent.replace('₹', ''));
                if (filters.priceRange.min && price < parseFloat(filters.priceRange.min)) show = false;
                if (filters.priceRange.max && price > parseFloat(filters.priceRange.max)) show = false;
            }

            // Time filter
            if (filters.departureTime !== 'Any Time') {
                const time = new Date(ride.querySelector('.route-preview .text-end .mb-2').textContent);
                const hour = time.getHours();
                
                switch(filters.departureTime) {
                    case 'Morning (6 AM - 12 PM)':
                        if (hour < 6 || hour >= 12) show = false;
                        break;
                    case 'Afternoon (12 PM - 5 PM)':
                        if (hour < 12 || hour >= 17) show = false;
                        break;
                    case 'Evening (5 PM - 9 PM)':
                        if (hour < 17 || hour >= 21) show = false;
                        break;
                }
            }

            // Preferences filters
            if (filters.preferences.acOnly && !ride.querySelector('.vehicle-info').textContent.includes('AC')) {
                show = false;
            }
            
            if (filters.preferences.femaleOnly && !ride.querySelector('.driver-info').textContent.includes('Female')) {
                show = false;
            }
            
            if (filters.preferences.highRated) {
                const rating = parseFloat(ride.querySelector('.rating-stars').textContent);
                if (rating < 4) show = false;
            }

            ride.style.display = show ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Filter application error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Filter Error',
            text: 'Failed to apply filters'
        });
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const geocoder = new google.maps.Geocoder();
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                geocoder.geocode({ location: latlng }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('currentLocation').value = results[0].formatted_address;
                    }
                });
            },
            error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Location Error',
                    text: 'Unable to detect your location. Please enable location services.'
                });
            }
        );
    }
}

async function bookRide(rideId) {
    try {
        const response = await fetch(`http://localhost:5000/api/rides/${rideId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                seatsRequired: document.getElementById('seatsRequired').value
            })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Ride booked successfully!'
            }).then(() => {
                window.location.href = 'history.html';
            });
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Booking Failed',
            text: error.message || 'Failed to book ride'
        });
    }
}

// Add this event listener for the search form
document.getElementById('findRideForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Show loading state
        const searchBtn = this.querySelector('button[type="submit"]');
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
        searchBtn.disabled = true;

        // Get form values
        const searchData = {
            origin: document.getElementById('currentLocation').value,
            destination: document.getElementById('destination').value,
            departureTime: document.getElementById('customDateTime').value || 'now',
            seatsNeeded: document.getElementById('seatsRequired').value
        };

        // Make API call to search rides
        // Update the fetch URL in your searchRides function
        const response = await fetch('http://localhost:5000/api/ride/search', {  // Changed from rides to ride
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(searchData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to search rides');
        }

        // Show results section
        document.getElementById('searchResults').style.display = 'block';
        
        // Display the rides
        displayRides(data.rides);

        // Scroll to results
        document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    } finally {
        // Reset button state
        const searchBtn = this.querySelector('button[type="submit"]');
        searchBtn.innerHTML = '<i class="bi bi-search me-2"></i>Find Available Rides';
        searchBtn.disabled = false;
    }
});

function displayRides(rides) {
    const container = document.querySelector('.results-container');
    container.innerHTML = '';

    if (!rides || rides.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-emoji-frown display-1 text-muted"></i>
                <h4 class="mt-3">No rides found</h4>
                <p class="text-muted">Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    rides.forEach(ride => {
        container.innerHTML += `
            <div class="card ride-card" data-aos="fade-up">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="driver-info mb-3">
                                <img src="${ride.driver.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(ride.driver.name)}" 
                                     alt="Driver" class="driver-avatar">
                                <div>
                                    <h5 class="mb-1">${ride.driver.name}</h5>
                                    <div class="rating-stars">
                                        ${generateRatingStars(ride.driver.rating)}
                                        <span class="ms-2">${ride.driver.rating} (${ride.driver.totalRides} rides)</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Rest of the ride card content -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            stars += '<i class="bi bi-star text-warning"></i>';
        }
    }
    return stars;}
