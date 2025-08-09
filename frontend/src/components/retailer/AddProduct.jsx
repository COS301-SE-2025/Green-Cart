import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../styles/retailer/AddProduct.css';

// Image compression utility
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
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
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        
        // Limit to 5 images
        if (files.length > 5) {
            toast.error('You can upload a maximum of 5 images');
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            toast.error('Please upload only JPEG or PNG images');
            return;
        }

        try {
            // Convert files to base64
            const base64Images = await Promise.all(
                files.map(file => convertFileToBase64(file))
            );
            
            setImages(base64Images);
        } catch (error) {
            console.error('Error converting images to base64:', error);
            toast.error('Failed to process images. Please try again.');
        }
    };

    const convertFileToBase64 = async (file) => {
        // Compress image first to reduce base64 string size
        const compressedDataUrl = await compressImage(file, 800, 0.8);
        
        // Validate size (base64 adds ~33% overhead)
        const sizeInBytes = (compressedDataUrl.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 2) {
            throw new Error(`Image too large: ${sizeInMB.toFixed(2)}MB (max: 2MB)`);
        }
        
        console.log(`Compressed image: ${sizeInMB.toFixed(2)}MB`);
        return compressedDataUrl;
    };

    // Helper function to check if a string is a valid URL
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Helper function to check if a string is base64 data URL
    const isBase64DataUrl = (string) => {
        return typeof string === 'string' && string.startsWith('data:image/');
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
        if (images.length === 0) newErrors.images = 'At least one product image is required';

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
        try {
            // Get retailer ID from localStorage
            const retailerData = localStorage.getItem('retailer_user');
            let retailerId = 3; // Default fallback
            
            if (retailerData) {
                const retailerUser = JSON.parse(retailerData);
                retailerId = retailerUser.retailer_id || retailerUser.id || 3;
            }

            // Convert sustainability ratings to the expected format
            const sustainabilityMetrics = [
                { id: 1, value: formData.sustainability.energyEfficiency },
                { id: 2, value: formData.sustainability.carbonFootprint },
                { id: 3, value: formData.sustainability.recyclability },
                { id: 4, value: formData.sustainability.durability },
                { id: 5, value: formData.sustainability.materialSustainability }
            ];

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                brand: formData.brand,
                category_id: categories.indexOf(formData.category) + 1,
                retailer_id: retailerId,
                sustainability_metrics: sustainabilityMetrics,
                images: images // Add base64 images to the payload
            };
            
            console.log('Creating product with data:', {
                ...productData,
                images: productData.images.map((img, idx) => 
                    `Image ${idx + 1}: ${img.startsWith('data:') ? 'Base64' : 'URL'} (${img.length} chars)`
                )
            });
            
            const response = await fetch('http://localhost:8000/retailer/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) {
                const error = await response.json();
                console.error('Product creation failed:', error);
                
                // Handle different types of errors
                if (response.status === 422) {
                    // Validation errors
                    const validationErrors = error.detail || error.message || 'Validation failed';
                    if (Array.isArray(validationErrors)) {
                        const errorMessages = validationErrors.map(err => 
                            `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
                        ).join(', ');
                        throw new Error(`Validation Error: ${errorMessages}`);
                    } else {
                        throw new Error(`Validation Error: ${validationErrors}`);
                    }
                } else {
                    throw new Error(error.detail || error.message || 'Failed to create product');
                }
            }
            const newProduct = await response.json();
            if (onProductAdded) {
                onProductAdded(newProduct);
            }
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
            setImages([]);
            
            toast.success('Product added successfully!');
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product. Please try again.');
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
                        ✕
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

                        {/* Images */}
                        <div className="form-section">
                            <h3>Product Images</h3>
                            
                            <div className="form-group">
                                <label htmlFor="images" className='label'>Upload Images * (Max 5)</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : 'input'}
                                />
                                {errors.images && <span className="add-product-error-message">{errors.images}</span>}
                                <small style={{color: '#666', fontSize: '0.9rem'}}>
                                    Supported formats: JPEG, PNG. Images will be converted to base64 for storage.
                                </small>
                            </div>

                            {images.length > 0 && (
                                <div className="image-preview-grid">
                                    {images.map((image, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={image} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                                aria-label={`Remove image ${index + 1}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                            
                            {/* <div className="sustainability-grid">
                                {Object.entries(formData.sustainability).map(([key, value]) => {
                                const getRatingColor = (rating) => {
                                    if (rating >= 80) return '#22c55e';
                                    if (rating >= 60) return '#eab308';
                                    if (rating >= 40) return '#f97316';
                                    return '#ef4444';
                                };

                                const ratingColor = getRatingColor(value);
                                const percentage = value / 100;

                                return (
                                    <div 
                                        key={key} 
                                        className="sustainability-item"
                                        style={{
                                            '--rating-color': ratingColor,
                                            '--rating-percentage': `${percentage * 100}%`
                                        }}
                                    >
                                        <div className="sustainability-header">
                                            <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                            <div className="rating-indicator">
                                                <div 
                                                    className="rating-dot"
                                                    style={{ backgroundColor: ratingColor }}
                                                ></div>
                                                <span className="rating-text">
                                                    {value >= 80 ? 'Excellent' : 
                                                    value >= 60 ? 'Good' : 
                                                    value >= 40 ? 'Fair' : 'Poor'}
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
                                                    className="slider dynamic-slider"
                                                />
                                                <div className="slider-progress" style={{ width: `${value}%`, backgroundColor: ratingColor }}></div>
                                            </div>
                                            <div className="rating-labels">
                                                <span>0</span>
                                                <span 
                                                    className="current-rating"
                                                    style={{ backgroundColor: ratingColor }}
                                                >
                                                    {value}
                                                </span>
                                                <span>100</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })} */}
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
                                    Adding Product...
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