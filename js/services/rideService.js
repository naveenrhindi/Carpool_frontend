const API_BASE_URL = 'http://localhost:5000/api';

export const searchRides = async (searchParams) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please login to search rides');
        }

        const response = await fetch(`${API_BASE_URL}/rides/search?${new URLSearchParams(searchParams)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to search rides');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const bookRide = async (rideId, seatsRequired) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please login to book a ride');
        }

        const response = await fetch(`${API_BASE_URL}/rides/${rideId}/book`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ seatsRequired })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to book ride');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};