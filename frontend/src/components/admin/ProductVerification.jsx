import React, { useState, useEffect, useCallback } from 'react';
import { getUnverifiedProducts, verifyProduct, updateProduct, getProductSustainability } from '../../admin-services/adminProductService';
import toast from 'react-hot-toast';
import './ProductVerification.css';

const ProductVerification = ({ isOpen, onClose, onProductVerified }) => {
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [skippedProductIds, setSkippedProductIds] = useState(new Set());
    const [allUnverifiedProducts, setAllUnverifiedProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [sustainabilityData, setSustainabilityData] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    

    useEffect(() => {
        if (isOpen) {
            loadUnverifiedProducts();
        } else {
            // Reset state when modal closes
            setCurrentProduct(null);
            setSkippedProductIds(new Set());
            setAllUnverifiedProducts([]);
            setCurrentIndex(0);
        }
    }, [isOpen]);

    // Initialize form data when entering edit mode - only once
    useEffect(() => {
        if (isEditing && currentProduct && Object.keys(sustainabilityData).length > 0) {
            // Only set initial data if form is empty or sustainability not set
            setEditFormData(prev => {
                const hasData = prev && (prev.sustainability || prev.price || prev.brand || prev.quantity);
                if (!hasData) {
                    return {
                        brand: currentProduct.brand || '',
                        price: currentProduct.price || '',
                        quantity: currentProduct.quantity || '',
                        sustainability: {
                            energyEfficiency: sustainabilityData.energyefficiency || 70,
                            carbonFootprint: sustainabilityData.carbonfootprint || 60,
                            recyclability: sustainabilityData.recyclability || 20,
                            durability: sustainabilityData.durability || 90,
                            materialSustainability: sustainabilityData.materialsustainability || 68
                        }
                    };
                }
                return prev;
            });
        }
    }, [isEditing, currentProduct, sustainabilityData]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (selectedImage) {
                    closeImageLightbox();
                } else if (isOpen) {
                    onClose();
                }
            }
        };

        if (isOpen || selectedImage) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            if (!isOpen && !selectedImage) {
                document.body.style.overflow = 'unset'; // Restore scrolling
            }
        };
    }, [isOpen, selectedImage, onClose]);

    const loadUnverifiedProducts = async () => {
        setLoading(true);
        try {
            const response = await getUnverifiedProducts();
            if (response.status === 200 && response.data && response.data.length > 0) {
                setAllUnverifiedProducts(response.data);
                setCurrentIndex(0);
                setCurrentProduct(response.data[0]);
                // Load sustainability data for the first product
                await loadSustainabilityData(response.data[0].id);
            } else {
                setAllUnverifiedProducts([]);
                setCurrentProduct(null);
                toast.success('No more products to verify!');
            }
        } catch (error) {
            console.error('Error loading unverified products:', error);
            toast.error('Failed to load products for verification');
        } finally {
            setLoading(false);
        }
    };

    const loadSustainabilityData = async (productId) => {
        try {
            const response = await getProductSustainability(productId);
            if (response.status === 200) {
                setSustainabilityData(response.data);
            }
        } catch (error) {
            console.error('Error loading sustainability data:', error);
            // Set default values if no sustainability data exists
            setSustainabilityData({
                energyefficiency: 70,
                carbonfootprint: 60,
                recyclability: 20,
                durability: 90,
                materialsustainability: 68
            });
        }
    };

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc);
    };

    const closeImageLightbox = () => {
        setSelectedImage(null);
    };

    const loadNextProduct = async () => {
        const availableProducts = allUnverifiedProducts.filter(
            product => !skippedProductIds.has(product.id)
        );

        if (availableProducts.length === 0) {
            setCurrentProduct(null);
            toast.success('No more products to verify!');
            return;
        }

        // Find the next product that hasn't been skipped
        let nextIndex = currentIndex + 1;
        while (nextIndex < allUnverifiedProducts.length && 
               skippedProductIds.has(allUnverifiedProducts[nextIndex].id)) {
            nextIndex++;
        }

        if (nextIndex >= allUnverifiedProducts.length) {
            // Start from beginning if we've reached the end
            nextIndex = 0;
            while (nextIndex < allUnverifiedProducts.length && 
                   skippedProductIds.has(allUnverifiedProducts[nextIndex].id)) {
                nextIndex++;
            }
        }

        if (nextIndex < allUnverifiedProducts.length) {
            setCurrentIndex(nextIndex);
            setCurrentProduct(allUnverifiedProducts[nextIndex]);
            // Load sustainability data for the new product
            await loadSustainabilityData(allUnverifiedProducts[nextIndex].id);
        } else {
            setCurrentProduct(null);
            toast.success('No more products to verify!');
        }
    };

    const handleVerifyProduct = async () => {
        if (!currentProduct) return;

        setVerifying(true);
        try {
            await verifyProduct(currentProduct.id);
            toast.success('Product verified successfully!');
            
            // Notify parent component
            if (onProductVerified) {
                onProductVerified(currentProduct.id);
            }

            // Remove this product from our list since it's now verified
            const updatedProducts = allUnverifiedProducts.filter(p => p.id !== currentProduct.id);
            setAllUnverifiedProducts(updatedProducts);
            
            // Load next product
            if (updatedProducts.length > 0) {
                // Adjust current index if needed
                if (currentIndex >= updatedProducts.length) {
                    setCurrentIndex(0);
                }
                const nextProduct = updatedProducts[currentIndex] || updatedProducts[0];
                setCurrentProduct(nextProduct);
            } else {
                setCurrentProduct(null);
                toast.success('All products have been verified!');
            }
        } catch (error) {
            console.error('Error verifying product:', error);
            toast.error('Failed to verify product');
        } finally {
            setVerifying(false);
        }
    };

    const handleSkipProduct = async () => {
        if (!currentProduct) return;
        
        // Add current product to skipped list
        setSkippedProductIds(prev => new Set([...prev, currentProduct.id]));
        
        // Load next available product
        await loadNextProduct();
    };

    const handleEditProduct = () => {
        if (!currentProduct) {
            return;
        }
        
        const newFormData = {
            // name/description shown read-only while editing
            price: String(currentProduct.price || ''),
            quantity: String(currentProduct.quantity || ''),
            brand: currentProduct.brand || '',
            sustainability: {
                energyEfficiency: sustainabilityData?.energyefficiency || 70,
                carbonFootprint: sustainabilityData?.carbonfootprint || 60,
                recyclability: sustainabilityData?.recyclability || 20,
                durability: sustainabilityData?.durability || 90,
                materialSustainability: sustainabilityData?.materialsustainability || 68
            }
        };
        
        setEditFormData(newFormData);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const handleInputChange = useCallback((field, value) => {
        if (field.startsWith('sustainability.')) {
            const sustainabilityField = field.split('.')[1];
            setEditFormData(prev => ({
                ...prev,
                sustainability: {
                    ...prev.sustainability,
                    [sustainabilityField]: parseFloat(value) || 0
                }
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    }, []);

    const handleSaveEdit = async () => {
        if (!currentProduct) return;

        setSaving(true);
        try {
            const updateData = {
                // name/description are read-only in the edit form; omit from update
                price: parseFloat(editFormData.price) || 0,
                quantity: parseInt(editFormData.quantity) || 0,
                brand: editFormData.brand?.trim(),
                sustainability_metrics: {
                    "Energy Efficiency": editFormData.sustainability?.energyEfficiency || 70,
                    "Carbon Footprint": editFormData.sustainability?.carbonFootprint || 60,
                    "Recyclability": editFormData.sustainability?.recyclability || 20,
                    "Durability": editFormData.sustainability?.durability || 90,
                    "Material Sustainability": editFormData.sustainability?.materialSustainability || 68
                }
            };

            const response = await updateProduct(currentProduct.id, updateData);
            
            if (response.status === 200) {
                // Update the current product with new data
                setCurrentProduct(response.data);
                
                // Reload sustainability data from the backend to ensure accuracy
                await loadSustainabilityData(currentProduct.id);
                
                // Update the product in our list as well
                setAllUnverifiedProducts(prev => 
                    prev.map(p => p.id === currentProduct.id ? response.data : p)
                );
                
                setIsEditing(false);
                toast.success('Product updated successfully!');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const handleOverlayClick = (event) => {
        // Close modal if clicking on the overlay (not the modal content)
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="verification-modal-overlay" onClick={handleOverlayClick}>
            <div className="verification-modal">
                <div className="verification-header">
                    <h2>Product Verification</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {loading ? (
                    <div className="verification-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading product...</span>
                    </div>
                ) : currentProduct ? (
                    <div className="verification-content">
                        <div className="admin-productverification-product-details">
                            <div className="product-info">
                                {isEditing ? (
                                    <div className="edit-form">
                                        <div className="form-group">
                                            <label>Product Name:</label>
                                            <div className="readonly-text">{currentProduct.name || ''}</div>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Description:</label>
                                            <div className="readonly-text">{currentProduct.description || ''}</div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Brand:</label>
                                                <input
                                                    type="text"
                                                    value={editFormData.brand || ''}
                                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                                    className="edit-input"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Price (R):</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editFormData.price || ''}
                                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                                    className="edit-input"
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Quantity:</label>
                                                <input
                                                    type="number"
                                                    value={editFormData.quantity || ''}
                                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                    className="edit-input"
                                                />
                                            </div>
                                        </div>

                                        {/* Sustainability Ratings Section */}
                                        <div className="sustainability-section">
                                            <h4>Sustainability Ratings</h4>
                                            <div className="sustainability-grid">
                                                <div className="sustainability-item">
                                                    <label>Energy Efficiency:</label>
                                                    <div className="slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={editFormData.sustainability?.energyEfficiency || 70}
                                                            onChange={(e) => handleInputChange('sustainability.energyEfficiency', e.target.value)}
                                                            className="sustainability-slider"
                                                        />
                                                        <span className="slider-value">{editFormData.sustainability?.energyEfficiency || 70}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-item">
                                                    <label>Carbon Footprint:</label>
                                                    <div className="slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={editFormData.sustainability?.carbonFootprint || 60}
                                                            onChange={(e) => handleInputChange('sustainability.carbonFootprint', e.target.value)}
                                                            className="sustainability-slider"
                                                        />
                                                        <span className="slider-value">{editFormData.sustainability?.carbonFootprint || 60}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-item">
                                                    <label>Recyclability:</label>
                                                    <div className="slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={editFormData.sustainability?.recyclability || 20}
                                                            onChange={(e) => handleInputChange('sustainability.recyclability', e.target.value)}
                                                            className="sustainability-slider"
                                                        />
                                                        <span className="slider-value">{editFormData.sustainability?.recyclability || 20}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-item">
                                                    <label>Durability:</label>
                                                    <div className="slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={editFormData.sustainability?.durability || 90}
                                                            onChange={(e) => handleInputChange('sustainability.durability', e.target.value)}
                                                            className="sustainability-slider"
                                                        />
                                                        <span className="slider-value">{editFormData.sustainability?.durability || 90}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-item">
                                                    <label>Material Sustainability:</label>
                                                    <div className="slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={editFormData.sustainability?.materialSustainability || 68}
                                                            onChange={(e) => handleInputChange('sustainability.materialSustainability', e.target.value)}
                                                            className="sustainability-slider"
                                                        />
                                                        <span className="slider-value">{editFormData.sustainability?.materialSustainability || 68}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="edit-actions">
                                            <button 
                                                type="button"
                                                className="cancel-edit-button"
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="button"
                                                className="save-edit-button"
                                                onClick={handleSaveEdit}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="product-header">
                                            <h3>{currentProduct.name}</h3>
                                            <button 
                                                type="button"
                                                className="edit-product-button"
                                                onClick={handleEditProduct}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="product-description">{currentProduct.description}</p>
                                        
                                        <div className="product-meta">
                                            <div className="meta-item">
                                                <label>Brand:</label>
                                                <span>{currentProduct.brand}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Price:</label>
                                                <span>R {parseFloat(currentProduct.price || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Quantity:</label>
                                                <span>{currentProduct.quantity}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Category ID:</label>
                                                <span>{currentProduct.category_id}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Retailer ID:</label>
                                                <span>{currentProduct.retailer_id}</span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Created:</label>
                                                <span>{new Date(currentProduct.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Sustainability Display */}
                                        <div className="sustainability-display">
                                            <h4>Sustainability Ratings</h4>
                                            <div className="sustainability-bars">
                                                <div className="sustainability-bar">
                                                    <label>Energy Efficiency</label>
                                                    <div className="bar-container">
                                                        <div 
                                                            className="bar-fill" 
                                                            style={{width: `${sustainabilityData.energyefficiency || 70}%`}}
                                                        ></div>
                                                        <span className="bar-value">{sustainabilityData.energyefficiency || 70}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-bar">
                                                    <label>Carbon Footprint</label>
                                                    <div className="bar-container">
                                                        <div 
                                                            className="bar-fill" 
                                                            style={{width: `${sustainabilityData.carbonfootprint || 60}%`}}
                                                        ></div>
                                                        <span className="bar-value">{sustainabilityData.carbonfootprint || 60}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-bar">
                                                    <label>Recyclability</label>
                                                    <div className="bar-container">
                                                        <div 
                                                            className="bar-fill" 
                                                            style={{width: `${sustainabilityData.recyclability || 20}%`}}
                                                        ></div>
                                                        <span className="bar-value">{sustainabilityData.recyclability || 20}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-bar">
                                                    <label>Durability</label>
                                                    <div className="bar-container">
                                                        <div 
                                                            className="bar-fill" 
                                                            style={{width: `${sustainabilityData.durability || 90}%`}}
                                                        ></div>
                                                        <span className="bar-value">{sustainabilityData.durability || 90}%</span>
                                                    </div>
                                                </div>

                                                <div className="sustainability-bar">
                                                    <label>Material Sustainability</label>
                                                    <div className="bar-container">
                                                        <div 
                                                            className="bar-fill" 
                                                            style={{width: `${sustainabilityData.materialsustainability || 68}%`}}
                                                        ></div>
                                                        <span className="bar-value">{sustainabilityData.materialsustainability || 68}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Product Images */}
                            <div className="product-images">
                                <h4>Product Images</h4>
                                {currentProduct.images && currentProduct.images.length > 0 ? (
                                    <div className="images-grid">
                                        {currentProduct.images.map((imageUrl, index) => (
                                            <div key={index} className="image-container">
                                                <img 
                                                    src={imageUrl} 
                                                    alt={`${currentProduct.name} - Image ${index + 1}`}
                                                    className="product-image"
                                                    onClick={() => handleImageClick(imageUrl)}
                                                    onError={(e) => {
                                                        console.log(`Failed to load image: ${imageUrl}`);
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/200x200/7BB540/FFFFFF?text=No+Image';
                                                    }}
                                                    onLoad={() => {
                                                        console.log(`Successfully loaded image: ${imageUrl}`);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="image-placeholder">
                                        <span>No Images Available</span>
                                        <small>This product doesn't have any images uploaded</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="verification-actions">
                            <button 
                                type="button"
                                className="skip-button"
                                onClick={handleSkipProduct}
                                disabled={verifying}
                            >
                                Skip
                            </button>
                            <button 
                                type="button"
                                className="verify-button"
                                onClick={handleVerifyProduct}
                                disabled={verifying}
                            >
                                {verifying ? (
                                    <>
                                        <div className="loading-spinner small"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Product'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="no-products">
                        <h3>No Products to Verify</h3>
                        <p>All products have been verified!</p>
                        <button type="button" className="close-button-alt" onClick={onClose}>
                            Close
                        </button>
                    </div>
                )}
            </div>
            
            {/* Image Lightbox */}
            {selectedImage && (
                <div className="image-lightbox-overlay" onClick={closeImageLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close-button" onClick={closeImageLightbox}>
                            ×
                        </button>
                        <img src={selectedImage} alt="Product Image" className="lightbox-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductVerification;
