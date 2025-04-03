document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    const map = new google.maps.Map(document.getElementById('routeMap'), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 12
    });

    // Initialize route display
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    // Sample route (replace with actual coordinates)
    const route = {
        origin: { lat: 20.5937, lng: 78.9629 },
        destination: { lat: 20.6037, lng: 78.9729 }
    };

    // Display route
    directionsService.route({
        origin: route.origin,
        destination: route.destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            
            // Add custom markers for start and end points
            new google.maps.Marker({
                position: route.origin,
                map: map,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }
            });

            new google.maps.Marker({
                position: route.destination,
                map: map,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });
        }
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-tooltip]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Booking confirmation handler
    document.querySelector('#bookingModal .btn-primary').addEventListener('click', function() {
        // Add your booking logic here
        alert('Booking confirmed! You will receive a confirmation shortly.');
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
    });
});