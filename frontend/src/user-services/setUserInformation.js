const API_URL = "https://api.greencart-cos301.co.za/users/setUserInformation";

export const setUserInformation = async (userData, user_id) => {
  try {
    const response = await fetch(API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        name: userData.name,
        email: userData.email,
        telephone: userData.phone,
        country_code: userData.countryCode,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postalCode,
        date_of_birth: userData.dateOfBirth
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if(typeof errorData.detail === 'string') throw new Error(errorData.detail);
        else if (Array.isArray(errorData.detail)) throw new Error(errorData.detail[0].msg);        

    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user information:", error);
    throw error;
  }
};

