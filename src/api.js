require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const fetchEvents = async (query, city) => {
    const apiKey = process.env.SERP_API_KEY || '';    try {
        const response = await axios.get(`https://serpapi.com/search.json`, {
            params: {
                q: `${encodeURIComponent(query)}+events`,
                location: city,
                hl: 'en',
                gl: 'us',
                google_domain: 'google.com',
                api_key: apiKey,
            },
        });
        return response.data;
    } catch (error) {
        console.error('SERP API error:', error);
        return null;
    }
};

async function fetchOpenAIResponse(openaiApiKey, query, additionalContext = '') {
    const prompt = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `${query}${additionalContext}` },
        ],
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', prompt, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.choices && response.data.choices.length > 0
               ? response.data.choices[0].message.content.trim()
               : "No suggestions could be found.";
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        return "I encountered an error while processing your request.";
    }
}

const isWeatherQuery = (query) => {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate'];
    return weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));
};

const isEventQuery = (query) => {
    const eventKeywords = ['event', 'concert', 'exhibition', 'show'];
    return eventKeywords.some(keyword => query.toLowerCase().includes(keyword));
};

app.post('/api/getSuggestions', async (req, res) => {
    const { query } = req.body;
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
        let additionalContext = '';

    if (isWeatherQuery(query)) {
        const city = "Chicago"; // Example city, could be dynamic
        const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY || '';
                try {
            const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: city,
                    appid: weatherApiKey,
                    units: 'metric',
                },
            });
            const weatherData = weatherResponse.data;
            const description = weatherData.weather[0].description;
            const temp = weatherData.main.temp;
            additionalContext = `The current weather in ${city} is ${description} with a temperature of ${temp}°C.`;
        } catch (error) {
            console.error('OpenWeatherMap API error:', error);
        }
    } else if (isEventQuery(query)) {
        const city = "Chicago"; // Example city
        try {
            const eventsData = await fetchEvents(query, city);
            // Process and format your eventsData here to integrate into the additionalContext
        } catch (error) {
            console.error('Event fetch error:', error);
        }
    }

    try {
        const suggestion = await fetchOpenAIResponse(openaiApiKey, query, additionalContext);
        res.json({ suggestion });
    } catch (error) {
        console.error('Error fetching suggestion:', error);
        res.status(500).json({ error: 'Error processing your query', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
