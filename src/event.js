require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());


// API keys setup
const IPAPI_KEY = process.env.IPAPI_KEY || 'https://ipapi.co/json/';
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

async function getLocation() {
  try {
    const response = await axios.get(`https://ipapi.co/json/?apiKey=${IPAPI_KEY}`);
    if (response.data && response.data.city) {
      return {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        city: response.data.city
      };
    } else {
      console.error("City information is missing in the location data.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}

async function getCurrentWeather(latitude, longitude) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

async function getEventsFromTicketmaster(category, city) {
  try {
    const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&classificationName=${category}&apikey=${TICKETMASTER_API_KEY}`);
    return response.data._embedded.events.map(event => ({
      name: event.name,
      type: category,
      details: {
        address: event._embedded.venues[0].address.line1,
        latitude: event._embedded.venues[0].location.latitude,
        longitude: event._embedded.venues[0].location.longitude,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime
      }
    }));
  } catch (error) {
    console.error(`Error fetching Ticketmaster data for ${category}:`, error);
    return [];
  }
}

async function getEvents(latitude, longitude) {
  let musicEvents = await getEventsFromTicketmaster('music', 'Chicago');
  let sportsEvents = await getEventsFromTicketmaster('sports', 'Chicago');
  const restaurantResults = await getRestaurants(latitude, longitude);

  // Extract only the 5th, 8th, and 10th music events from the list
  musicEvents = [musicEvents[10], musicEvents[5], musicEvents[9]].filter(event => event !== undefined);
  sportsEvents = [sportsEvents[5], sportsEvents[7], sportsEvents[11]].filter(event => event !== undefined);
  return [...musicEvents, ...sportsEvents, ...restaurantResults];
}

async function getRestaurants(latitude, longitude) {
  const formattedLatLng = `${latitude},${longitude}`;
  try {
    const searchResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: "google_maps",
        type: "search",
        q: "restaurant",
        ll: `@${formattedLatLng},15z`,
        google_maps_google_place_type: 'restaurant',
        radius: 1500,
        api_key: SERPAPI_KEY
      }
    });

    const validRestaurants = searchResponse.data.local_results || [];
    shuffleArray(validRestaurants);

    const restaurantsWithHours = validRestaurants.slice(0, 3).map(place => {
      if (!place.place_id) {
        console.error("Missing place_id for:", place);
        return null;
      }

      // Assuming latitude and longitude are always available if place exists
      const latitude = place.gps_coordinates.latitude;
      const longitude = place.gps_coordinates.longitude;

      // Handle operating hours here
      const hours = place.operating_hours ? Object.values(place.operating_hours) : ['Hours not available'];

      return {
        name: place.title || 'Unknown',
        type: 'restaurant',
        details: {
          address: place.address || 'No address provided',
          latitude: latitude,
          longitude: longitude,
          hours: hours // Use the processed hours
        }
      };
    }).filter(place => place !== null); // Filter out any nulls from missing place_ids

    return restaurantsWithHours;
  } catch (error) {
    console.error("Error fetching restaurant data with SERP API:", error);
    return [];
  }
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
async function generateRecommendations(locationData, weatherData, eventsData) {
  if (!locationData || !weatherData || eventsData.length === 0) {
    console.error("Missing data: Location, weather, or events data is not available.");
    return null;
  }

  const currentTime = new Date().toLocaleTimeString();
  const eventDescriptions = eventsData.map(event => `${event.type} named '${event.name}' at ${event.details.address}`).join(', ');

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: "You are a helpful assistant."
    }, {
      role: "user",
      content: `As of ${currentTime}, generate personalized event recommendations based on the current location at latitude ${locationData.latitude} and longitude ${locationData.longitude} with the weather being ${weatherData.weather[0].description}. Consider these events: ${eventDescriptions}.`
    }],
    max_tokens: 150
  }, {
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
  });

  return response.data.choices[0].message.content.trim();
}

app.post('/api/recommendations', async (req, res) => {
  const locationData = await getLocation();
  const weatherData = await getCurrentWeather(locationData.latitude, locationData.longitude);
  const eventsData = await getEvents(locationData.latitude, locationData.longitude);

  if (!locationData || !weatherData || eventsData.length === 0) {
    console.error('Missing necessary location or weather data.');
    res.status(404).json({ error: 'Missing necessary data for recommendations.' });
    return;
  }

  res.json({
    recommendations: await generateRecommendations(locationData, weatherData, eventsData),
    suggestedLocation: locationData.city, // Changed to provide the city name
    weather: {
      description: weatherData.weather[0].description,
      temperature: weatherData.main.temp
    },
    events: eventsData
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
