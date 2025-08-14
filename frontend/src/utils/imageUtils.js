/**
 * Image optimization utilities for base64 storage
 */

// Client-side image compression before base64 conversion
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        
        img.src = URL.createObjectURL(file);
    });
};

// Validate image size before upload
export const validateImageSize = (base64String, maxSizeMB = 2) => {
    // Base64 adds ~33% overhead, so calculate original size
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    return {
        isValid: sizeInMB <= maxSizeMB,
        sizeMB: sizeInMB.toFixed(2),
        maxSizeMB
    };
};

// Example usage in AddProduct component
export const handleImageUploadWithCompression = async (files) => {
    const compressedImages = [];
    
    for (const file of files) {
        // Compress before converting to base64
        const compressed = await compressImage(file, 800, 0.8);
        
        // Validate size
        const validation = validateImageSize(compressed, 2);
        if (!validation.isValid) {
            throw new Error(`Image too large: ${validation.sizeMB}MB (max: ${validation.maxSizeMB}MB)`);
        }
        
        compressedImages.push(compressed);
    }
    
    return compressedImages;
};
