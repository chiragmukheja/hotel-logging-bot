import axios from 'axios';

// The base URL for your request-related endpoints
const BASE_URL = 'https://hotel-logging-bot.onrender.com/requests';

// We create an authenticated API instance. This is a secure practice for admin actions.
const api = axios.create({
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` 
  }
});

/**
 * Checks out a guest from a specific stay (Admin Action).
 * @param {string} stayId The ID of the stay to check out.
 */
export const adminCheckoutStay = async (stayId) => {
  const response = await api.put(`${BASE_URL}/admin/stays/${stayId}/checkout`);
  return response.data;
};

/**
 * Transfers a guest to a new room (Admin Action).
 * @param {string} stayId The ID of the current stay.
 * @param {string} newRoomNumber The new room number to transfer the guest to.
 */
export const adminTransferStay = async (stayId, newRoomNumber) => {
  const response = await api.put(`${BASE_URL}/admin/stays/${stayId}/transfer`, { newRoomNumber });
  return response.data;
};