const API_BASE_URL = "http://127.0.0.1:8000"; // Or your WSL IP

export async function signupRetailer(retailerData) {
  const response = await fetch(`${API_BASE_URL}/auth/retailer/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: retailerData.name,
      description: retailerData.description,
      email: retailerData.email,
      password: retailerData.password
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Retailer signup failed");
  }

  return response.json();
}

export async function signinRetailer(retailerData) {
  const response = await fetch(`${API_BASE_URL}/auth/retailer/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: retailerData.email,
      password: retailerData.password
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Retailer signin failed");
  }

  return response.json();
}

export function logoutRetailer() {
  // Clear ALL authentication-related data from localStorage
  localStorage.removeItem('retailer_user');
  localStorage.removeItem('retailer_token');
  localStorage.removeItem('selected_shop');
  localStorage.removeItem('user'); // Clear regular user data too
  localStorage.removeItem('token'); // Clear any general tokens
  localStorage.removeItem('access_token'); // Clear access tokens
  localStorage.removeItem('auth_token'); // Clear auth tokens
  
  // Clear any other potential auth-related items
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('auth') || key.includes('token') || key.includes('user')) {
      localStorage.removeItem(key);
    }
  });
  
  // You can also call a backend logout endpoint if needed
  // await fetch(`${API_BASE_URL}/auth/retailer/logout`, { method: "POST" });
  
  return true;
}

export function getRetailerUser() {
  const retailerData = localStorage.getItem('retailer_user');
  return retailerData ? JSON.parse(retailerData) : null;
}

export function isRetailerAuthenticated() {
  const retailerUser = getRetailerUser();
  return retailerUser && retailerUser.id;
}

export async function selectShop(shopId) {
  const response = await fetch(`${API_BASE_URL}/auth/retailer/select-shop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shop_id: shopId
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Shop selection failed");
  }

  return response.json();
}

export async function fetchUserShops(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/retailer/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch shops");
  }

  const result = await response.json();
  return result.shops || [];
}
