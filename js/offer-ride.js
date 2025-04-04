// Remove flatpickr initialization for datetime inputs since we're using native datetime-local
// Instead, set min date for the inputs

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true
    });

    const offerRideForm = document.getElementById('offerRideForm');

    offerRideForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!offerRideForm.checkValidity()) {
            event.stopPropagation();
            offerRideForm.classList.add('was-validated');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-ride-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to offer a ride');
            }

            // Structure data exactly as per backend schema
            const rideData = {
                vehicleDetails: {
                    type: document.getElementById('vehicleType').value,
                    number: document.getElementById('vehicleNumber').value.toUpperCase(),
                    seatsAvailable: parseInt(document.getElementById('seatsAvailable').value)
                },
                route: {
                    origin: document.getElementById('currentLocation').value,
                    destination: document.getElementById('destination').value,
                    departureTime: document.getElementById('departureDateTime').value,  // Send as is
                    arrivalTime: document.getElementById('arrivalDateTime').value,      // Send as is
                    preferredRoutes: Array.from(document.getElementById('preferredRoutes').selectedOptions).map(option => option.value)
                },
                preferences: {
                    ac: document.getElementById('ac').checked,
                    music: document.getElementById('music').checked,
                    smoking: document.getElementById('smoking').checked
                },
                contactPreferences: {
                    call: document.getElementById('call').checked,
                    chat: document.getElementById('chat').checked,
                    whatsapp: document.getElementById('whatsapp').checked
                },
                fare: parseFloat(document.getElementById('fare').value) || 0
            };

           console.log('Request payload:', JSON.stringify(rideData, null, 2));

           const response = await fetch('http://localhost:5000/api/rides/create', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(rideData)
           });

           const data = await response.json();
           
           if (!response.ok) {
               console.error('Error Status:', response.status);
               console.error('Error Response:', data);
               console.error('Request Headers:', response.headers);
               throw new Error(data.message || `Server Error: ${response.status}`);
           }
            await Swal.fire({
                title: 'Success!',
                text: 'Your ride has been posted successfully',
                icon: 'success',
                confirmButtonText: 'View All Rides'
            });

            window.location.href = 'find-ride.html';

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Offer Ride';
        }
    });

    // Set minimum date for datetime inputs
    const now = new Date();
    const nowString = now.toISOString().slice(0, 16);
    
    const departureDateInput = document.getElementById('departureDateTime');
    const arrivalDateInput = document.getElementById('arrivalDateTime');
    
    departureDateInput.min = nowString;
    arrivalDateInput.min = nowString;

    // Update arrival min time when departure time changes
    departureDateInput.addEventListener('change', function() {
        arrivalDateInput.min = this.value;
    });

    // Update vehicle-specific options based on vehicle type
    document.getElementById('vehicleType').addEventListener('change', function() {
        const acOption = document.querySelector('.ac-option');
        const seatsSelect = document.getElementById('seatsAvailable');
        
        // Clear existing options
        seatsSelect.innerHTML = '';
        
        if (this.value === 'car') {
            acOption.style.display = 'inline-block';
            // Add seat options for car (1-4)
            for (let i = 1; i <= 4; i++) {
                seatsSelect.add(new Option(i.toString(), i));
            }
        } else if (this.value === 'bike') {
            acOption.style.display = 'none';
            // Only 1 seat for bike
            seatsSelect.add(new Option('1', 1));
        } else if (this.value === 'van') {
            acOption.style.display = 'inline-block';
            // Add seat options for van (1-8)
            for (let i = 1; i <= 8; i++) {
                seatsSelect.add(new Option(i.toString(), i));
            }
        }
    });
});

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        // User is logged in
        document.querySelector('.guest-view').classList.add('d-none');
        document.querySelector('.user-view').classList.remove('d-none');
        document.querySelector('#themeToggle').classList.remove('d-none');
        
        // Update user name and image if available
        document.querySelector('.user-name').textContent = user.name;
        if (user.profileImage) {
            document.querySelector('#userDropdown img').src = user.profileImage;
        }
    } else {
        // Not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});