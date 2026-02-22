require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Weather = require('./models/Weather');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route to fetch weather and save to DB
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        const apiKey = process.env.API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        // Fetch from OpenWeatherMap
        const response = await axios.get(url);
        const data = response.data;

        // Format JSON to send to frontend
        const weatherData = {
            city: data.name,
            temperature: data.main.temp,
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
        };

        // Save search details into MongoDB Atlas
        const newSearch = new Weather(weatherData);
        await newSearch.save();

        res.json(weatherData);
    } catch (error) {
        console.error('Weather fetching error:', error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City not found' });
        }
        // Proper error handling
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Route to get last 5 searched cities
app.get('/api/history', async (req, res) => {
    try {
        const history = await Weather.find().sort({ searchedAt: -1 }).limit(5);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
