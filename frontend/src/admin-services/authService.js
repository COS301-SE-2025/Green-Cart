import { API_BASE_URL as BASE_URL } from '../config/api.js';


const API_BASE_URL = BASE_URL + '/admin';

export const adminSignin = async (email, password) => {

  const res = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Admin sign-in failed');
  }
  // persist minimal session
  sessionStorage.setItem('adminSession', JSON.stringify({
    user_id: data.user_id,
  name: data.name,
    email: data.email,
    role: data.role
  }));
  return data;
};
