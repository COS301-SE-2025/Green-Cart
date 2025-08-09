const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? "http://127.0.0.1:8000" 
  : "https://api.greencart-cos301.co.za";

export async function signupRetailer(retailerData) {
  console.log('🔄 Starting retailer signup for:', retailerData.email);
  console.log('🌐 Using API URL:', API_BASE_URL);
  
  try {
    // Step 1: Try to create a regular user account first (if it doesn't exist)
    let userExists = false;
    
    console.log('📝 Step 1: Attempting user signup...');
    const userResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: retailerData.name,
        email: retailerData.email,
        password: retailerData.password
      }),
    });

    console.log('📥 User signup response status:', userResponse.status);

    if (userResponse.status === 400) {
      // Check if the error is "Email already registered"
      const userError = await userResponse.json();
      if (userError.detail && userError.detail.includes("already registered")) {
        userExists = true;
        console.log("✅ User already exists, proceeding to retailer conversion...");
      } else {
        console.log('❌ User signup failed:', userError.detail);
        throw new Error(userError.detail || "User account creation failed");
      }
    } else if (!userResponse.ok) {
      const userError = await userResponse.json();
      console.log('❌ User signup failed:', userError.detail);
      throw new Error(userError.detail || "User account creation failed");
    } else {
      console.log('✅ User created successfully');
    }

    // Step 2: Convert the user to a retailer (whether they existed or were just created)
    console.log('🏪 Step 2: Attempting retailer conversion...');
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
        if (userExists) {
          throw new Error("The password you entered doesn't match your existing account. Please use your current account password.");
        } else {
          throw new Error("Authentication failed. Please check your credentials.");
        }
      } else if (retailerResponse.status === 400) {
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
      message: userExists ? "Existing account converted to retailer successfully" : "Retailer account created successfully"
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
