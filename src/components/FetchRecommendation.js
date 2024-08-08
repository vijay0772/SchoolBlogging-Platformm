import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createColoredIcon(color) {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/></svg>`;
    return new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });
}

const icons = {
    restaurant: createColoredIcon('#f54242'),
    music: createColoredIcon('#4287f5'),
    sports: createColoredIcon('#42f545'),
    user: createColoredIcon('#3fbf50')
};

const RecommendationModal = ({ open, handleClose }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [suggestedLocation, setSuggestedLocation] = useState('');
    const [weather, setWeather] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            position => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            err => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve your location.');
            }
        );
    }, []);

    useEffect(() => {
        if (currentLocation) {
            fetchRecommendations();
        }
    }, [currentLocation]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:3009/api/recommendations', {
                latitude: currentLocation.lat,
                longitude: currentLocation.lng
            });
            if (response.data) {
                setWeather(response.data.weather);
                setSuggestedLocation(response.data.suggestedLocation);  // Ensure 'suggestedLocation' is a valid key in response.data
    
                const newMarkers = response.data.events.reduce((acc, event) => {
                    if (event.details && event.details.latitude && event.details.longitude) {
                        acc.push({
                            name: event.name,
                            latitude: event.details.latitude,
                            longitude: event.details.longitude,
                            type: event.type.toLowerCase(),
                            details: event.details
                        });
                    } else {
                        console.log('Missing location details for event:', event);
                    }
                    return acc;
                }, []);
    
                newMarkers.push({
                    name: "Your Location",
                    latitude: currentLocation.lat,
                    longitude: currentLocation.lng,
                    type: 'user',
                    details: {
                        address: 'Current location',
                        date: '',
                        time: '',
                        hours: []
                    }
                });
    
                setMarkers(newMarkers);
                setRecommendations(response.data.events);
            } else {
                setError('No recommendations found');
            }
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
            setError(`Failed to fetch recommendations: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <>
            <Modal open={open} onClose={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '80vw', maxHeight: '80vh', overflow: 'auto', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Event Recommendations
                    </Typography>
                    {currentLocation && (
                        <MapContainer center={[currentLocation.lat, currentLocation.lng]} zoom={13} style={{ width: '100%', height: '50vh' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {markers.map((marker, index) => (
                                <Marker
                                    key={index}
                                    position={[marker.latitude, marker.longitude]}
                                    icon={icons[marker.type] || icons.user}
                                >
                                    <Popup>
                                        <div>
                                            <h3>{marker.name}</h3>
                                            <p>Address: {marker.details.address}</p>
                                            <p>Type: {marker.type.charAt(0).toUpperCase() + marker.type.slice(1)}</p>
                                            <p>Date: {marker.details.date} Time: {marker.details.time}</p>
                                            {marker.type === 'restaurant' && (
                                                <div>
                                                    <p>Opening Hours:</p>
                                                    <ul>
                                                        {Array.isArray(marker.details.hours) ? 
                                                            marker.details.hours.map((hour, idx) => <li key={idx}>{hour}</li>) : 
                                                            <li>{marker.details.hours}</li>
                                                        }
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Based on your current location, here are personalized recommendations for restaurants, concerts, and sports events:
                    </Typography>
                    {weather && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Current Location: {suggestedLocation || 'Determining your city...'}
          </Typography>
          <Typography variant="body2">
            Current Weather: {weather.description}, {weather.temperature}°C
          </Typography>
        </Box>
      )}
                    {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {recommendations.map((event, index) => (
                                <Card key={index} elevation={3}>
                                    <CardContent>
                                        <Typography variant="subtitle1">{event.name}</Typography>
                                        <Typography variant="body2">{event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event</Typography>
                                        <Typography variant="body2">Located at {event.details.address}</Typography>
                                        <Typography variant="body2">Details: {event.details.hours}<br></br>{event.details.date}<br></br>{event.details.time}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default RecommendationModal;
