import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/retailer/AddProduct.css';

export default function AddProduct({ isOpen, onClose, onProductAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        quantity: '',
        sustainability: {
            energyEfficiency: 70,
            carbonFootprint: 60,
            recyclability: 20,
            durability: 90,
            materialSustainability: 68,
        }
    });
    const [imageFiles, setImageFiles] = useState([]); // Store actual File objects
    const [imagePreviews, setImagePreviews] = useState([]); // Object URLs for preview
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Clean up object URLs when component unmounts or images change
    useEffect(() => {
        return () => {
            // Clean up all object URLs to prevent memory leaks
            imagePreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imagePreviews]);

    const categories = [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Beauty & Personal Care',
        'Sports & Outdoors',
        'Books & Media',
        'Food & Beverages',
        'Automotive',
        'Health & Wellness',
        'Baby & Kids'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSustainabilityChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            sustainability: {
                ...prev.sustainability,
                [field]: value
            }
        }));
    };

    const handleImageUpload = (e) => {
        const newFiles = Array.from(e.target.files);
        
        console.log('Image upload triggered:', {
            newFilesCount: newFiles.length,
            existingFilesCount: imageFiles.length,
            newFileNames: newFiles.map(f => f.name),
            newFileSizes: newFiles.map(f => f.size)
        });
        
        // Check if adding new files would exceed the limit
        const totalFiles = imageFiles.length + newFiles.length;
        if (totalFiles > 5) {
            console.warn('Too many images total:', totalFiles);
            toast.error(`You can only upload a maximum of 5 images. You currently have ${imageFiles.length} images.`);
            e.target.value = ''; // Clear the file input
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        for (const file of newFiles) {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} is not a valid image type`);
                continue;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Maximum size is 5MB`);
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length === 0) {
            console.warn('No valid files after validation');
            e.target.value = ''; // Clear the file input
            return;
        }
        
        console.log('Valid files:', validFiles.length);

        // Add new files to existing files
        const updatedFiles = [...imageFiles, ...validFiles];
        setImageFiles(updatedFiles);
        
        // Create preview URLs for new files and add to existing previews
        const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
        const updatedPreviews = [...imagePreviews, ...newImageUrls];
        setImagePreviews(updatedPreviews);
        
        console.log('Images updated:', {
            totalFiles: updatedFiles.length,
            totalPreviews: updatedPreviews.length
        });
        
        // Clear error if it exists
        if (errors.images) {
            setErrors(prev => ({ ...prev, images: '' }));
        }
        
        // Clear the file input so the same file can be selected again if needed
        e.target.value = '';
    };

    const removeImage = (index) => {
        console.log('Removing image at index:', index);
        
        // Clean up the object URL to prevent memory leaks
        if (imagePreviews[index]) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        
        console.log('Image removed. Remaining:', imageFiles.length - 1);
    };

    const clearAllImages = () => {
        console.log('Clearing all images');
        // Clean up all object URLs
        imagePreviews.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        setImagePreviews([]);
        setImageFiles([]);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
        if (imageFiles.length === 0) newErrors.images = 'At least one product image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateSustainabilityScore = () => {
        const { energyEfficiency, carbonFootprint, recyclability, durability, materialSustainability } = formData.sustainability;
        return Math.round(((energyEfficiency + carbonFootprint + recyclability + durability + materialSustainability) / 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        
        console.log('Form submission started:', {
            productName: formData.name,
            imageFilesCount: imageFiles.length,
            imageFiles: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
        });
        
        try {
            // Get retailer ID from localStorage
            const retailerData = localStorage.getItem('retailer_user');
            let retailerId = 3; // Default fallback
            
            if (retailerData) {
                const retailerUser = JSON.parse(retailerData);
                retailerId = retailerUser.retailer_id || retailerUser.id || 3;
            }

            // Create FormData for multipart form submission with S3 upload
            const formDataSubmit = new FormData();
            
            // Add product data
            formDataSubmit.append('name', formData.name);
            formDataSubmit.append('description', formData.description);
            formDataSubmit.append('price', formData.price);
            formDataSubmit.append('category_id', categories.indexOf(formData.category) + 1);
            formDataSubmit.append('retailer_id', retailerId);
            formDataSubmit.append('stock_quantity', formData.quantity);
            
            // Add sustainability ratings with the field names expected by backend
            formDataSubmit.append('energy_efficiency', formData.sustainability.energyEfficiency);
            formDataSubmit.append('carbon_footprint', formData.sustainability.carbonFootprint);
            formDataSubmit.append('recyclability', formData.sustainability.recyclability);
            formDataSubmit.append('durability', formData.sustainability.durability);
            formDataSubmit.append('material_sustainability', formData.sustainability.materialSustainability);
            
            // Add image files directly for S3 upload
            console.log('Adding images to FormData for S3 upload:', imageFiles.length);
            imageFiles.forEach((file, index) => {
                console.log(`   Adding image ${index + 1}: ${file.name}`);
                formDataSubmit.append('images', file);
            });
            
            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let [key, value] of formDataSubmit.entries()) {
                if (value instanceof File) {
                    console.log(`   ${key}: [File] ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`   ${key}: ${value}`);
                }
            }
            
            // Use the S3-enabled product creation endpoint
            console.log('Sending request to S3 backend...');
            const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:8000' 
                : 'https://api.greencart-cos301.co.za';
            const endpoint = `${API_BASE_URL}/product-images/products/`;
            console.log('Using S3 endpoint:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formDataSubmit // No Content-Type header for FormData - browser sets it automatically
            });
            
            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('S3 upload error:', error);
                throw new Error(error.detail || 'Failed to create product with S3 images');
            }

            const newProduct = await response.json();
            console.log('Product created successfully with S3 images:', newProduct);
            
            if (onProductAdded) {
                onProductAdded(newProduct);
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                brand: '',
                quantity: '',
                sustainability: {
                    energyEfficiency: 70,
                    carbonFootprint: 60,
                    recyclability: 20,
                    durability: 90,
                    materialSustainability: 68,
                }
            });
            clearAllImages();
            
            toast.success('Product added successfully with S3 images!');
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.message || 'Failed to add product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const sustainabilityScore = calculateSustainabilityScore();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        ×
                    </button>
                </div>

                <form className="add-product-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3>Basic Information</h3>
                            
                            <div className="form-group">
                                <label htmlFor="name" className='label'>Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={errors.name ? 'error' : 'input'}
                                />
                                {errors.name && <span className="add-product-error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className='label'>Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product..."
                                    rows="4"
                                    className={errors.description ? 'error' : 'textarea'}
                                />
                                {errors.description && <span className="add-product-error-message">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price" className='label'>Price (ZAR) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : 'input'}
                                    />
                                    {errors.price && <span className="add-product-error-message">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="quantity" className='label'>Stock Quantity *</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className={errors.quantity ? 'error' : 'input'}
                                    />
                                    {errors.quantity && <span className="add-product-error-message">{errors.quantity}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category" className='label'>Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={errors.category ? 'error' : 'select'}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="add-product-error-message">{errors.category}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="brand" className='label'>Brand *</label>
                                    <input
                                        type="text"
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                        className={errors.brand ? 'error' : 'input'}
                                    />
                                    {errors.brand && <span className="add-product-error-message">{errors.brand}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Images - S3 Upload Only */}
                        <div className="form-section">
                            <h3>Product Images (S3 Upload)</h3>
                            
                            <div className="form-group">
                                <label htmlFor="images" className='label'>
                                    Upload Images * (Max 5) 
                                    {imageFiles.length > 0 && (
                                        <span className="image-count-badge">
                                            {imageFiles.length}/5 selected
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : 'input'}
                                />
                                {imageFiles.length === 0 && (
                                    <p className="upload-hint">
                                        You can select multiple images at once or add them one by one. Maximum 5 images per product.
                                    </p>
                                )}
                                {imageFiles.length > 0 && imageFiles.length < 5 && (
                                    <p className="upload-hint">
                                        You can add {5 - imageFiles.length} more images by clicking "Choose Files" again.
                                    </p>
                                )}
                                {errors.images && <span className="add-product-error-message">{errors.images}</span>}
                                <small style={{color: '#666', fontSize: '0.9rem'}}>
                                    Supported formats: JPEG, PNG, GIF, WEBP. Images will be uploaded to AWS S3.
                                </small>
                            </div>

                            {imagePreviews.length > 0 && (
                                <>
                                    <div className="image-preview-grid">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="image-preview">
                                                <img src={preview} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(index)}
                                                    aria-label={`Remove image ${index + 1}`}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="image-actions">
                                        <button
                                            type="button"
                                            className="clear-all-images-btn"
                                            onClick={clearAllImages}
                                        >
                                            Clear All Images
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sustainability Ratings */}
                        <div className="form-section sustainability-section">
                            <h3>
                                Sustainability Ratings
                                <span className="sustainability-score">
                                    Score: {sustainabilityScore}/100
                                </span>
                            </h3>
                            
                            <div className="sustainability-grid">
                                {Object.entries(formData.sustainability).map(([key, value]) => {
                                    const getRatingColor = (rating) => {
                                        if (rating >= 80) return '#22c55e'; // Green
                                        if (rating >= 60) return '#eab308'; // Yellow
                                        if (rating >= 40) return '#f97316'; // Orange
                                        return '#ef4444'; // Red
                                    };

                                    const getRatingLevel = (rating) => {
                                        if (rating >= 80) return 'Excellent';
                                        if (rating >= 60) return 'Good';
                                        if (rating >= 40) return 'Fair';
                                        return 'Poor';  
                                    };

                                    const ratingColor = getRatingColor(value);
                                    const ratingLevel = getRatingLevel(value);

                                    return (
                                        <div 
                                            key={key} 
                                            className="sustainability-item"
                                            style={{
                                                '--rating-color': ratingColor,
                                            }}
                                        >
                                            <div className="sustainability-header">
                                                <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                                <div className="rating-indicator">
                                                    <div 
                                                        className="rating-dot"
                                                        style={{ backgroundColor: ratingColor }}
                                                    ></div>
                                                    <span 
                                                        className="rating-text"
                                                        style={{ color: ratingColor }}
                                                    >
                                                        {ratingLevel}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="rating-slider">
                                                <div className="slider-container">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={value}
                                                        onChange={(e) => handleSustainabilityChange(key, parseInt(e.target.value))}
                                                        className="dynamic-slider"
                                                    />
                                                    <div 
                                                        className="slider-progress" 
                                                        style={{ 
                                                            width: `${value}%`, 
                                                            backgroundColor: ratingColor 
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="rating-labels">
                                                    <span>Poor (0)</span>
                                                    <span 
                                                        className="current-rating"
                                                        style={{ 
                                                            '--rating-color': ratingColor 
                                                        }}
                                                    >
                                                        {value}
                                                    </span>
                                                    <span>Excellent (100)</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="loading-spinner small"></div>
                                    Uploading to S3...
                                </>
                            ) : (
                                'Add Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}