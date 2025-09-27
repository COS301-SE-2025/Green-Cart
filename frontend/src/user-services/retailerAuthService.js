import { API_BASE_URL } from '../config/api.js';

export async function signupRetailer(retailerData) {
  console.log('🔄 Starting retailer signup for existing user:', retailerData.email);
  console.log('🌐 Using API URL:', API_BASE_URL);
  
  try {
    // Step 1: Verify user credentials by attempting to sign in
    console.log('🔐 Step 1: Verifying user credentials...');
    const userSigninResponse = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: retailerData.email,
        password: retailerData.password
      }),
    });

    if (!userSigninResponse.ok) {
      const userError = await userSigninResponse.json();
      console.log('❌ User credential verification failed:', userError);
      
      if (userSigninResponse.status === 401) {
        throw new Error("Invalid email or password. Please check your credentials.");
      } else if (userSigninResponse.status === 404) {
        throw new Error("No account found with this email. Please sign up as a customer first.");
      }
      
      throw new Error("Unable to verify your credentials. Please try again.");
    }

    console.log('✅ User credentials verified successfully');

    // Step 2: Create retailer account for verified user
    console.log('🏪 Step 2: Creating retailer account...');
    const retailerResponse = await fetch(`${API_BASE_URL}/auth/retailer/signup`, {
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

    console.log('📥 Retailer signup response status:', retailerResponse.status);

    if (!retailerResponse.ok) {
      const retailerError = await retailerResponse.json();
      console.log('❌ Retailer signup failed:', retailerError);
      
      // Provide specific error messages based on the response
      if (retailerResponse.status === 401) {
        throw new Error("The password you entered doesn't match your existing account. Please use your current account password.");
      } else if (retailerResponse.status === 400) {
        const errorDetail = retailerError.detail || "";
        if (errorDetail.includes("User not found") || errorDetail.includes("not found")) {
          throw new Error("You must be a registered user to create a shop. Please sign up as a customer first.");
        }
        throw new Error("Invalid data provided. Please check all fields are filled correctly.");
      } else if (retailerResponse.status === 409) {
        throw new Error("You already have a retailer account with this email. Please sign in instead.");
      }
      
      throw new Error(retailerError.detail || "Retailer signup failed. Please try again.");
    }

    const retailerResult = await retailerResponse.json();
    console.log('🎉 Retailer signup successful:', retailerResult);
    
    // Return result
    return {
      ...retailerResult,
      message: "Retailer account created successfully"
    };
    
  } catch (error) {
    console.log('💥 Retailer signup error:', error.message);
    throw new Error(error.message || "Retailer signup failed");
  }
}

export async function signinRetailer(retailerData) {
  try {
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
      let errorMessage = "Retailer signin failed";
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If response isn't JSON, use status-based message
        if (response.status === 404) {
          errorMessage = "Retailer account not found. Please check your email or create an account.";
        } else if (response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (response.status === 422) {
          errorMessage = "Invalid input data. Please check your email and password.";
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error("Network error occurred. Please check your connection and try again.");
  }
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
