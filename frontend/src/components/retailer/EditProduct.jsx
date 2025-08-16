import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api.js';
import { fileSize } from '../../config/image_upload.js';
import '../styles/retailer/EditProduct.css';

export default function EditProduct({ isOpen, onClose, onProductUpdated, product, retailerId }) {
    console.log("On edit modal OPEN:",product);
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
    const [imageFiles, setImageFiles] = useState([]); // Store File objects for new uploads
    const [imagePreviews, setImagePreviews] = useState([]); // Object URLs for preview
    const [existingImages, setExistingImages] = useState([]); // S3 URLs from backend
    const [imagesModified, setImagesModified] = useState(false);
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
        'Baby & Kids',
        'Toys & Kids'
    ];

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imagePreviews]);

    // Map category names to IDs
    const getCategoryId = (categoryName) => {
        const index = categories.indexOf(categoryName);
        return index !== -1 ? index + 1 : 1;
    };

    // Populate form when product prop changes
    useEffect(() => {
        if (product && isOpen) {
            setImagesModified(false);
            
            // Fetch detailed sustainability ratings for this product
            const fetchSustainabilityRatings = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/sustainability/ratings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: product.id })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.status === 200 && result.statistics) {
                            const sustainabilityData = {
                                energyEfficiency: 70,
                                carbonFootprint: 60,
                                recyclability: 20,
                                durability: 90,
                                materialSustainability: 68,
                            };
                            
                            result.statistics.forEach(stat => {
                                switch(stat.type) {
                                    case 'Energy Efficiency':
                                        sustainabilityData.energyEfficiency = stat.value;
                                        break;
                                    case 'Carbon Footprint':
                                        sustainabilityData.carbonFootprint = stat.value;
                                        break;
                                    case 'Recyclability':
                                        sustainabilityData.recyclability = stat.value;
                                        break;
                                    case 'Durability':
                                        sustainabilityData.durability = stat.value;
                                        break;
                                    case 'Material Sustainability':
                                        sustainabilityData.materialSustainability = stat.value;
                                        break;
                                }
                            });
                            
                            setFormData(prev => ({
                                ...prev,
                                sustainability: sustainabilityData
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching sustainability ratings:', error);
                }
            };

            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                category: product.category || null,
                category_id: product.category_id,
                brand: product.brand || '',
                quantity: product.stock?.toString() || product.quantity?.toString() || '',
                sustainability: {
                    energyEfficiency: 70,
                    carbonFootprint: 60,
                    recyclability: 20,
                    durability: 90,
                    materialSustainability: 68,
                }
            });
            
            fetchSustainabilityRatings();
            
            // Set existing S3 images
            let imageUrls = [];
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                imageUrls = product.images.map(img => 
                    typeof img === 'string' ? img : (img.url || img.image_url || img)
                ).filter(Boolean);
            } else if (product.image_url) {
                imageUrls = [product.image_url];
            }
            
            setExistingImages([...imageUrls]);
            setImageFiles([]);
            setImagePreviews([]);
            setImagesModified(false);
        }
    }, [product, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        validateForm();
    
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
        
        console.log('Image upload triggered for edit:', {
            newFilesCount: newFiles.length,
            existingImagesCount: existingImages.length,
            currentNewFilesCount: imageFiles.length
        });
        
        // Check total limit (existing + new files)
        const totalImages = existingImages.length + imageFiles.length + newFiles.length;
        if (totalImages > 5) {
            console.warn('Too many images total:', totalImages);
            toast.error(`You can only have a maximum of 5 images total. You currently have ${existingImages.length + imageFiles.length} images.`);
            e.target.value = '';
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        const maxSize = fileSize; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        for (const file of newFiles) {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} is not a valid image type`);
                continue;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Maximum size is ${maxSize}B`);
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length === 0) {
            console.warn('No valid files after validation');
            e.target.value = '';
            return;
        }
        
        console.log('Valid files for edit:', validFiles.length);

        // Add new files
        const updatedFiles = [...imageFiles, ...validFiles];
        setImageFiles(updatedFiles);
        
        // Create preview URLs
        const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
        const updatedPreviews = [...imagePreviews, ...newImageUrls];
        setImagePreviews(updatedPreviews);
        
        setImagesModified(true);
        e.target.value = '';
    };

    const removeExistingImage = (index) => {
        console.log('Removing existing image at index:', index);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setImagesModified(true);
    };

    const removeNewImage = (index) => {
        console.log('Removing new image at index:', index);
        
        // Clean up the object URL
        if (imagePreviews[index]) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagesModified(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateSustainabilityScore = () => {
        const { energyEfficiency, carbonFootprint, recyclability, durability, materialSustainability } = formData.sustainability;
        return Math.round(((energyEfficiency + carbonFootprint + recyclability + durability + materialSustainability) / 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            Object.keys(errors).forEach(key => {
                toast.error(errors[key] === '' ? `Please fix the ${key} field` : errors[key]);
            });
            return;
        }
        setIsSubmitting(true);
        
        console.log('Edit form submission started:', {
            productName: formData.name,
            existingImagesCount: existingImages.length,
            newImageFilesCount: imageFiles.length,
            imagesModified
        });
        
        try {                // Use S3-enabled endpoint for image updates
            const formDataSubmit = new FormData();
            
            // Add product data
            formDataSubmit.append('name', formData.name);
            formDataSubmit.append('description', formData.description);
            formDataSubmit.append('price', formData.price);
            formDataSubmit.append('category_id', getCategoryId(formData.category));
            formDataSubmit.append('retailer_id', product.retailer_id);
            formDataSubmit.append('stock_quantity', formData.quantity);
            
            // Add sustainability ratings
            formDataSubmit.append('energy_efficiency', formData.sustainability.energyEfficiency);
            formDataSubmit.append('carbon_footprint', formData.sustainability.carbonFootprint);
            formDataSubmit.append('recyclability', formData.sustainability.recyclability);
            formDataSubmit.append('durability', formData.sustainability.durability);
            formDataSubmit.append('material_sustainability', formData.sustainability.materialSustainability);
            
            // Add existing images URLs to preserve them
            existingImages.forEach(imageUrl => {
                formDataSubmit.append('existing_images', imageUrl);
            });
            
            // Add new image files for S3 upload
            imageFiles.forEach((file, index) => {
                console.log(`Adding new image ${index + 1}: ${file.name}`);
                formDataSubmit.append('images', file);
            });
            
            console.log('Using S3 endpoint for product update with new images');
            const response = await fetch(`${API_BASE_URL}/product-images/products/${product.id}`, {
                method: 'PUT',
                body: formDataSubmit
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('S3 update error:', error);
                toast.error('Failed to update product data');
                throw new Error(error.detail || 'Failed to update product with S3 images');
            }
            
            const result = await response.json();
            console.log('Product updated successfully with S3 images:', result);
            toast.success('Product updated successfully!');
            
            if (onProductUpdated) {
                // Fetch updated product data
                try {
                    const updatedProductRes = await fetch(`${API_BASE_URL}/retailer/products/${retailerId}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (updatedProductRes.ok) {
                        const updatedProduct = await updatedProductRes.json();
                        onProductUpdated(updatedProduct.data);
                        console.log('Updated product data:', updatedProduct.data);
                    }
                } catch (error) {
                    console.error('Error fetching updated product:', error);
                    onProductUpdated(product);
                }
            }
            
            onClose();
            
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.message || 'Failed to update product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Clean up object URLs
        imagePreviews.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        
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
        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);
        setImagesModified(false);
        setErrors({});
        onClose();
    };

    if (!isOpen || !product) return null;

    const sustainabilityScore = calculateSustainabilityScore();
    const totalImages = existingImages.length + imageFiles.length;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Product</h2>
                    <button className="close-btn" onClick={handleClose} aria-label="Close modal">
                        ×
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
                                        value={formData.category || categories[formData.category_id-1]}
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

                        {/* Images - S3 Upload Only */}
                        <div className="form-section">
                            <h3>Product Images (S3 Upload)</h3>
                            
                            <div className="form-group">
                                <label htmlFor="edit-images" className='label'>
                                    Add More Images (Max 5 total)
                                    {totalImages > 0 && (
                                        <span className="image-count-badge">
                                            {totalImages}/5 images
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="edit-images"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    multiple
                                    onChange={handleImageUpload}
                                    className={errors.images ? 'error' : 'input'}
                                    disabled={totalImages >= 5}
                                />
                                {totalImages >= 5 && (
                                    <p className="upload-hint" style={{color: '#f97316'}}>
                                        You have reached the maximum of 5 images. Remove some to add new ones.
                                    </p>
                                )}
                                {totalImages < 5 && (
                                    <p className="upload-hint">
                                        You can add {5 - totalImages} more images. New images will be uploaded to AWS S3.
                                    </p>
                                )}
                                <small style={{color: '#666', fontSize: '0.9rem'}}>
                                    Supported formats: JPEG, PNG, GIF, WEBP. New images will be uploaded to AWS S3.
                                </small>
                            </div>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <>
                                    <h4 style={{margin: '16px 0 8px', color: '#374151'}}>Current Images</h4>
                                    <div className="image-preview-grid">
                                        {existingImages.map((image, index) => (
                                            <div key={`existing-${index}`} className="image-preview">
                                                <img src={image} alt={`Existing ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeExistingImage(index)}
                                                    aria-label={`Remove existing image ${index + 1}`}
                                                >
                                                    Remove
                                                </button>
                                                <span className="image-type-badge">Existing</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* New Images */}
                            {imagePreviews.length > 0 && (
                                <>
                                    <h4 style={{margin: '16px 0 8px', color: '#374151'}}>New Images (to upload)</h4>
                                    <div className="image-preview-grid">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`new-${index}`} className="image-preview">
                                                <img src={preview} alt={`New ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeNewImage(index)}
                                                    aria-label={`Remove new image ${index + 1}`}
                                                >
                                                    Remove
                                                </button>
                                                <span className="image-type-badge new">New</span>
                                            </div>
                                        ))}
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
                                        if (rating >= 80) return '#22c55e';
                                        if (rating >= 60) return '#eab308';
                                        if (rating >= 40) return '#f97316';
                                        return '#ef4444';
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
                                    Updating...
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