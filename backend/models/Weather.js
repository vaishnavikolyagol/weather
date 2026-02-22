const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  temperature: { type: Number, required: true },
  condition: { type: String, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  searchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weather', weatherSchema);
