const API_BASE_URL = 'http://localhost:8000';

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/CreateProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const uploadImages = async (imageFiles) => {
  if (!imageFiles || imageFiles.length === 0) {
    return [];
  }

  try {
    const formData = new FormData();
    
    // Add each file to FormData
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload images');
    }

    const result = await response.json();
    return result.urls; // Return array of image URLs
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};
