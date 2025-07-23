import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/retailer/EditProduct.css';

export default function EditProduct({ isOpen, onClose, onProductUpdated, product }) {
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

    // Populate form when product prop changes
    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                category: product.category || '',
                brand: product.brand || '',
                quantity: product.stock?.toString() || product.quantity?.toString() || '',
                sustainability: {
                    energyEfficiency: product.sustainability?.energyEfficiency || 70,
                    carbonFootprint: product.sustainability?.carbonFootprint || 60,
                    recyclability: product.sustainability?.recyclability || 20,
                    durability: product.sustainability?.durability || 90,
                    materialSustainability: product.sustainability?.materialSustainability || 68,
                }
            });
            
            // Set existing images
            if (product.images) {
                setImages(Array.isArray(product.images) ? product.images : [product.image]);
            } else if (product.image) {
                setImages([product.image]);
            }
        }
    }, [product, isOpen]);

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
        
        // Limit to 5 images total
        if (images.length + files.length > 5) {
            alert('You can have a maximum of 5 images');
            return;
        }

        // Create preview URLs for new files
        const newImageUrls = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImageUrls]);
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
            
            const updatedProduct = {
                ...product,
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.quantity),
                quantity: parseInt(formData.quantity),
                sustainability: calculateSustainabilityScore(),
                images: images,
                dateUpdated: new Date().toISOString()
            };

            console.log('Updated product:', updatedProduct);
            
            // Call parent callback if provided
            if (onProductUpdated) {
                onProductUpdated(updatedProduct);
            }
            
            alert('Product updated successfully!');
            onClose();

        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
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
        setErrors({});
        onClose();
    };

    if (!isOpen || !product) return null;

    const sustainabilityScore = calculateSustainabilityScore();

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Product</h2>
                    <button className="close-btn" onClick={handleClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <form className="edit-product-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3>Basic Information</h3>
                            
                            <div className="form-group">
                                <label htmlFor="edit-name">Product Name *</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="edit-product-error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-description">Description *</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product..."
                                    rows="4"
                                    className={errors.description ? 'error' : ''}
                                />
                                {errors.description && <span className="edit-product-error-message">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-price">Price (ZAR) *</label>
                                    <input
                                        type="number"
                                        id="edit-price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : ''}
                                    />
                                    {errors.price && <span className="edit-product-error-message">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-quantity">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        id="edit-quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className={errors.quantity ? 'error' : ''}
                                    />
                                    {errors.quantity && <span className="edit-product-error-message">{errors.quantity}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-category">Category *</label>
                                    <select
                                        id="edit-category"
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
                                    {errors.category && <span className="edit-product-error-message">{errors.category}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-brand">Brand *</label>
                                    <input
                                        type="text"
                                        id="edit-brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                        className={errors.brand ? 'error' : ''}
                                    />
                                    {errors.brand && <span className="edit-product-error-message">{errors.brand}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-section">
                            <h3>Product Images</h3>
                            
                            <div className="form-group">
                                <label htmlFor="edit-images">Add More Images (Max 5 total)</label>
                                <input
                                    type="file"
                                    id="edit-images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : ''}
                                />
                                {errors.images && <span className="edit-product-error-message">{errors.images}</span>}
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
                            onClick={handleClose}
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
                                    Updating Product...
                                </>
                            ) : (
                                'Update Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}