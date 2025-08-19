import { API_BASE_URL as BASE_URL } from '../config/api.js';


const API_BASE_URL = BASE_URL + '/admin';

export const adminSignin = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Invalid credentials');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Admin sign-in failed');
  }
};
