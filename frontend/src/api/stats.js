import axios from 'axios';

// Base URL for all statistics-related API calls, based on your app.js
const STATS_BASE_URL = 'https://hotel-logging-bot.onrender.com/stats';

/**
 * Fetches the calculated dashboard stats (Avg. Response Time, Highest Priority Room).
 */
export const getDashboardStats = async () => {
  try {
    // This makes a GET request to:
    // https://hotel-logging-bot.onrender.com/stats/dashboard
    const response = await axios.get(`${STATS_BASE_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return a default object or throw the error so the calling component can handle it
    throw error;
  }
};