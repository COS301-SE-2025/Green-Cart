import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast  from 'react-hot-toast';
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
            toast.error('You can have a maximum of 5 images');
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
        // Do NOT require images
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
            // Build payload for backend (with correct sustainability field)
            const sustainabilityTypeIds = {
                energyEfficiency: 1,
                carbonFootprint: 2,
                recyclability: 3,
                durability: 4,
                materialSustainability: 5,
            };
            const sustainability_metrics = [
                { id: sustainabilityTypeIds.energyEfficiency, value: formData.sustainability.energyEfficiency },
                { id: sustainabilityTypeIds.carbonFootprint, value: formData.sustainability.carbonFootprint },
                { id: sustainabilityTypeIds.recyclability, value: formData.sustainability.recyclability },
                { id: sustainabilityTypeIds.durability, value: formData.sustainability.durability },
                { id: sustainabilityTypeIds.materialSustainability, value: formData.sustainability.materialSustainability },
            ];
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                brand: formData.brand,
                category_id: product.category_id || product.category || '',
                retailer_id: product.retailer_id,
                sustainability_metrics,
            };
            // Update product
            const response = await fetch(`http://localhost:8000/retailer/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                // Fetch updated product data to reflect new sustainability ratings
                const updatedProductRes = await fetch(`http://localhost:8000/products/${product.id}`);
                if (updatedProductRes.ok) {
                    const updatedProduct = await updatedProductRes.json();
                    // Update form state with new sustainability ratings
                    if (updatedProduct.data && updatedProduct.data.sustainability) {
                        setFormData(prev => ({
                            ...prev,
                            sustainability: {
                                energyEfficiency: updatedProduct.data.sustainability.energyEfficiency || prev.sustainability.energyEfficiency,
                                carbonFootprint: updatedProduct.data.sustainability.carbonFootprint || prev.sustainability.carbonFootprint,
                                recyclability: updatedProduct.data.sustainability.recyclability || prev.sustainability.recyclability,
                                durability: updatedProduct.data.sustainability.durability || prev.sustainability.durability,
                                materialSustainability: updatedProduct.data.sustainability.materialSustainability || prev.sustainability.materialSustainability,
                            }
                        }));
                    }
                    if (onProductUpdated) onProductUpdated(updatedProduct.data);
                }
                alert('Product updated successfully!');
                onClose();
            } else {
                alert('Failed to update product.');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product. Please try again.');
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
                                <label htmlFor="edit-name" className='label'>Product Name *</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={errors.name ? 'error' : 'input'}
                                />
                                {errors.name && <span className="edit-product-error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-description" className='label'>Description *</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product..."
                                    rows="4"
                                    className={errors.description ? 'error' : 'textarea'}
                                />
                                {errors.description && <span className="edit-product-error-message">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-price" className='label'>Price (ZAR) *</label>
                                    <input
                                        type="number"
                                        id="edit-price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : 'input'}
                                    />
                                    {errors.price && <span className="edit-product-error-message">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-quantity" className='label'>Stock Quantity *</label>
                                    <input
                                        type="number"
                                        id="edit-quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className={errors.quantity ? 'error' : 'input'}
                                    />
                                    {errors.quantity && <span className="edit-product-error-message">{errors.quantity}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-category" className='label'>Category *</label>
                                    <select
                                        id="edit-category"
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
                                    {errors.category && <span className="edit-product-error-message">{errors.category}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-brand" className='label'>Brand *</label>
                                    <input
                                        type="text"
                                        id="edit-brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                        className={errors.brand ? 'error' : 'input'}
                                    />
                                    {errors.brand && <span className="edit-product-error-message">{errors.brand}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-section">
                            <h3>Product Images</h3>
                            <div className="form-group">
                                <label htmlFor="edit-images" className='label'>Add More Images (Max 5 total)</label>
                                <input
                                    type="file"
                                    id="edit-images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : 'input'}
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
        {Object.entries(formData.sustainability).map(([key, value]) => {
            // Function to get color based on rating value
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