import React, { useState } from 'react';
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        // Limit to 5 images
        if (files.length > 5) {
            alert('You can upload a maximum of 5 images');
            return;
        }

        // Create preview URLs
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(imageUrls);
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newProduct = {
                id: Date.now(), // Temporary ID
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                sustainability: calculateSustainabilityScore(),
                images: images,
                dateAdded: new Date().toISOString()
            };

            console.log('New product:', newProduct);
            
            // Call parent callback if provided
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
                    energyEfficiency: 3,
                    materialSustainability: 3,
                    durability: 3,
                    recyclability: 3
                }
            });
            setImages([]);
            
            alert('Product added successfully!');
            onClose();

        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
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
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="add-product-error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product..."
                                    rows="4"
                                    className={errors.description ? 'error' : ''}
                                />
                                {errors.description && <span className="add-product-error-message">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price (ZAR) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : ''}
                                    />
                                    {errors.price && <span className="add-product-error-message">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="quantity">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className={errors.quantity ? 'error' : ''}
                                    />
                                    {errors.quantity && <span className="add-product-error-message">{errors.quantity}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={errors.category ? 'error' : ''}
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
                                    <label htmlFor="brand">Brand *</label>
                                    <input
                                        type="text"
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                        className={errors.brand ? 'error' : ''}
                                    />
                                    {errors.brand && <span className="add-product-error-message">{errors.brand}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-section">
                            <h3>Product Images</h3>
                            
                            <div className="form-group">
                                <label htmlFor="images">Upload Images * (Max 5)</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : ''}
                                />
                                {errors.images && <span className="add-product-error-message">{errors.images}</span>}
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
                            
                            <div className="sustainability-grid">
                                {Object.entries(formData.sustainability).map(([key, value]) => (
                                    <div key={key} className="sustainability-item">
                                        <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                        <div className="rating-slider">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={value}
                                                onChange={(e) => handleSustainabilityChange(key, parseInt(e.target.value))}
                                                className="slider"
                                            />
                                            <div className="rating-labels">
                                                <span>Poor</span>
                                                <span className="current-rating">{value}/100</span>
                                                <span>Excellent</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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