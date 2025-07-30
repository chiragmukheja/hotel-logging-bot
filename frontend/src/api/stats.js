import axios from 'axios';

// Base URL for all statistics-related API calls
const STATS_BASE_URL = 'https://hotel-logging-bot.onrender.com/stats';

/**
 * Fetches the calculated dashboard stats (Avg. Response Time, Highest Priority Room).
 */
export const getDashboardStats = async () => {
  try {
    // This removes the incorrect authorization headers and uses the same
    // simple pattern as your other working API calls.
    const response = await axios.get(`${STATS_BASE_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
};