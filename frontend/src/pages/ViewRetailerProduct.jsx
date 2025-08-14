import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetailerNavbar from '../components/RetailerNavbar';
import { isRetailerAuthenticated } from '../user-services/retailerAuthService';
import { API_BASE_URL } from '../config/api.js';
import './styles/ViewRetailerProduct.css';
import FootprintTracker from '../components/product/FootprintTracker';
import EditProduct from '../components/retailer/EditProduct';

export default function ViewRetailerProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState(new Set());

    useEffect(() => {
        if (!isRetailerAuthenticated()) {
            navigate('/retailer-auth');
            return;
        }
        fetchProduct();
    }, [id, navigate]);

    // Enhanced image URL cleaner function
    const cleanImageUrl = (url) => {
        if (!url || typeof url !== 'string') return '/fallback-image.jpg';
        
        // Check for duplicate paths in S3 URLs
        const s3Pattern = /(.+\.amazonaws\.com\/[^\/]+\/\d+\/)(.+)\/(.+)/;
        const match = url.match(s3Pattern);
        
        if (match) {
            // If we find a pattern like: base/path/file.jpg/another-file.jpg
            // We want to keep only: base/path/file.jpg
            const [, basePath, firstFile, secondFile] = match;
            
            // Check if firstFile has an extension (is a complete filename)
            if (firstFile.includes('.')) {
                console.log('Cleaning duplicate S3 path:', url);
                console.log('Using cleaned URL:', basePath + firstFile);
                return basePath + firstFile;
            }
        }
        
        return url;
    };

    const fetchProduct = async () => {
        try {
            const retailerData = localStorage.getItem('retailer_user');
            let userData = null;
            
            if (retailerData) {
                userData = JSON.parse(retailerData);
                console.log('Using retailer user data for product fetch');
            } else {
                const fallbackData = localStorage.getItem('userData');
                if (fallbackData) {
                    userData = JSON.parse(fallbackData);
                    console.log('Using fallback user data for product fetch');
                }
            }
            
            if (!userData) {
                console.error('No user data found for product fetch');
                setProduct(null);
                setLoading(false);
                return;
            }

            console.log('Fetching product from deployed API:', id);
            const response = await fetch(`${API_BASE_URL}/products/FetchProduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.access_token || ''}`
                },
                body: JSON.stringify({ product_id: parseInt(id) })
            });

            const result = await response.json();
            console.log('Product fetch response from deployed API:', result);

            if (response.ok && result.status === 200 && result.data) {
                const productData = result;
                let processedImages = [];

                // Enhanced image processing with URL cleaning
                if (productData.images && Array.isArray(productData.images)) {
                    processedImages = productData.images
                        .map(img => {
                            const rawUrl = typeof img === 'string' ? img : (img.url || img.image_url || img);
                            return cleanImageUrl(rawUrl);
                        })
                        .filter(url => url && url !== '/fallback-image.jpg');
                } else if (productData.image_url) {
                    const cleanedUrl = cleanImageUrl(productData.image_url);
                    if (cleanedUrl !== '/fallback-image.jpg') {
                        processedImages = [cleanedUrl];
                    }
                }

                console.log('Processed and cleaned S3 images:', processedImages);

                setProduct({
                    ...productData.data,
                    images: productData.images,//processedImages,
                    primary_image: processedImages.length > 0 ? processedImages[0] : '/fallback-image.jpg',
                    sustainability_rating: result.sustainability?.rating || productData.sustainability_rating || 0,
                    sustainability_statistics: result.sustainability?.statistics || productData.sustainability_statistics || [],
                    sustainability_grade: result.sustainability?.grade || productData.sustainability_grade || '',
                    sustainability_insights: result.sustainability?.insights || productData.sustainability_insights || [],
                    units_sold: typeof result.units_sold === 'number' ? result.units_sold : 
                               typeof productData.units_sold === 'number' ? productData.units_sold : 0,
                    revenue: typeof result.revenue === 'number' ? result.revenue : 
                            typeof productData.revenue === 'number' ? productData.revenue : 0,
                    quantity: productData.stock_quantity || productData.quantity || 0
                });
                
                setImageErrors(new Set());
            } else {
                console.error('Failed to fetch product from deployed API:', result.message);
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product from deployed API:', error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = () => {
        setEditModalOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!window.confirm('Are you sure you want to delete this product? This will also remove all associated S3 images.')) {
            return;
        }
        
        try {
            console.log('Deleting product from deployed API:', id);
            const response = await fetch(`${API_BASE_URL}/retailer/product/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            console.log('Delete response from deployed API:', data);
            
            if (response.ok && data.status === 200) {
                console.log('Product deleted successfully, redirecting to products list');
                navigate('/retailer/products');
            } else {
                console.error('Failed to delete product from deployed API:', data);
                alert('Failed to delete product. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting product from deployed API:', error);
            alert('Error deleting product. Please try again.');
        }
    };

    const handleProductUpdate = async (updatedProduct) => {
        console.log('Product update completed, refreshing product data');
        setEditModalOpen(false);
        await fetchProduct();
    };

    const getProductImage = (product, index = 0) => {
        if (!product) return '/fallback-image.jpg';
        
        if (product.images && Array.isArray(product.images) && product.images.length > index) {
            return product.images[index];
        }
        
        if (index === 0) {
            if (product.primary_image && product.primary_image !== '/fallback-image.jpg') {
                return product.primary_image;
            }
            
            if (product.image_url) {
                return cleanImageUrl(product.image_url);
            }
        }
        
        return '/fallback-image.jpg';
    };

    const handleImageError = (e, imageUrl, isMainImage = false) => {
        const currentSrc = e.target.src;
        
        if (imageErrors.has(imageUrl) || currentSrc.includes('fallback-image.jpg')) {
            console.warn('Image already failed or is fallback, hiding element:', imageUrl);
            e.target.style.opacity = '0.3';
            e.target.style.background = '#f3f4f6';
            return;
        }
        
        setImageErrors(prev => new Set([...prev, imageUrl]));
        e.target.onerror = null;
        e.target.src = '/fallback-image.jpg';
        
        console.warn('Failed to load image, using fallback:', imageUrl);
    };

    if (loading) {
        return (
            <>
                <RetailerNavbar />
                <div className="view-retailer-product-main">
                    <div className="view-retailer-product-loading-container">
                        <div className="view-retailer-product-loading">
                            <div className="view-retailer-product-loading-spinner"></div>
                            <span>Loading Product Details...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!product || typeof product !== 'object' || !product.name) {
        return (
            <>
                <RetailerNavbar />
                <div className="view-retailer-product-main">
                    <div className="view-retailer-product-container">
                        <div className="view-retailer-product-header">
                            <div className="view-retailer-product-header-left">
                                <button
                                    className="view-retailer-product-back-button"
                                    onClick={() => navigate('/retailer/products')}
                                >
                                    ← Back to Products
                                </button>
                            </div>
                        </div>
                        <div className="view-retailer-product-error">
                            <h2>Product Not Found</h2>
                            <p>The product you're looking for could not be found or failed to load from the server.</p>
                            <button onClick={() => navigate('/retailer/products')}>
                                Back to Products
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const currentProductImage = getProductImage(product, selectedImageIndex);
    const isS3Image = currentProductImage && currentProductImage.includes('s3.amazonaws.com');
    const totalImages = product.images ? product.images.length : 0;

    return (
        <>
            <RetailerNavbar />
            <div className="view-retailer-product-main">
                <div className="view-retailer-product-container">
                    <div className="view-retailer-product-header">
                        <div className="view-retailer-product-header-left">
                            <button
                                className="view-retailer-product-back-button"
                                onClick={() => navigate('/retailer/products')}
                            >
                                ← Back to Products
                            </button>
                        </div>
                        <div className="view-retailer-product-header-right">
                            <button
                                className="view-retailer-product-edit-button"
                                onClick={handleEditProduct}
                            >
                                Edit Product
                            </button>
                            {/* <button
                                className="view-retailer-product-delete-button"
                                onClick={handleDeleteProduct}
                            >
                                Delete Product
                            </button> */}
                        </div>
                    </div>
                    
                    {/* UPDATED LAYOUT: Two-column layout with image on left, details on right */}
                    <div className="view-retailer-product-content">
                        {/* Image Section - Left Column */}
                        <div className="view-retailer-product-image-section">
                            <div className="view-retailer-product-main-image">
                                <img
                                    src={currentProductImage}
                                    alt={product.name || 'Product'}
                                    onError={(e) => handleImageError(e, currentProductImage, true)}
                                />
                                <div className="view-retailer-product-image-overlay">
                                    {isS3Image && (
                                        <span className="view-retailer-product-s3-badge">
                                            S3 Stored
                                        </span>
                                    )}
                                    {totalImages > 1 && (
                                        <span className="view-retailer-product-image-count-badge">
                                            {selectedImageIndex + 1} of {totalImages}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Image gallery for multiple images */}
                            {product.images && product.images.length > 1 && (
                                <div className="view-retailer-product-image-gallery">
                                    <h4 className="view-retailer-product-gallery-title">
                                        All Images ({product.images.length})
                                    </h4>
                                    <div className="view-retailer-product-gallery-grid">
                                        {product.images.map((image, index) => {
                                            const imageUrl = typeof image === 'string' ? image : (image.url || image.image_url || image);
                                            const isThisS3 = imageUrl && imageUrl.includes('s3.amazonaws.com');
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`view-retailer-product-gallery-item ${index === selectedImageIndex ? 'active' : ''}`}
                                                    onClick={() => setSelectedImageIndex(index)}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${product.name} ${index + 1}`}
                                                        onError={(e) => handleImageError(e, imageUrl, false)}
                                                    />
                                                    {isThisS3 && (
                                                        <span className="view-retailer-product-gallery-s3-indicator">
                                                            S3
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Details Section - Right Column */}
                        <div className="view-retailer-product-details-section">
                            <h1 className="view-retailer-product-title">{product.name}</h1>
                            
                            <div className="view-retailer-product-metrics-grid">
                                <div className="view-retailer-product-metric-item">
                                    <span className="view-retailer-product-metric-label">Price</span>
                                    <p className="view-retailer-product-metric-value price">R{Number(product.price).toFixed(2)}</p>
                                </div>
                                <div className="view-retailer-product-metric-item">
                                    <span className="view-retailer-product-metric-label">Available Stock</span>
                                    <p className="view-retailer-product-metric-value stock">{product.quantity}</p>
                                </div>
                                <div className="view-retailer-product-metric-item">
                                    <span className="view-retailer-product-metric-label">Total Units Sold</span>
                                    <p className="view-retailer-product-metric-value sold">{typeof product.units_sold === 'number' ? product.units_sold : 0}</p>
                                </div>
                                <div className="view-retailer-product-metric-item">
                                    <span className="view-retailer-product-metric-label">Total Revenue</span>
                                    <p className="view-retailer-product-metric-value revenue">R{Number(product.revenue || 0).toFixed(2)}</p>
                                </div>
                                {totalImages > 0 && (
                                    <div className="view-retailer-product-metric-item">
                                        <span className="view-retailer-product-metric-label">S3 Images</span>
                                        <p className="view-retailer-product-metric-value">{totalImages} stored</p>
                                    </div>
                                )}
                                <div className="view-retailer-product-metric-item">
                                    <span className="view-retailer-product-metric-label">Category</span>
                                    <p className="view-retailer-product-metric-value">{product.category || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="view-retailer-product-description-section">
                                <span className="view-retailer-product-description-label">Description</span>
                                <p className="view-retailer-product-description-text">{product.description || 'No description available'}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Sustainability Section - Full Width Below */}
                    <div className="view-retailer-product-sustainability-section">
                        <FootprintTracker
                            sustainability={{
                                rating: typeof product.sustainability_rating === 'number' ? product.sustainability_rating : 0,
                                statistics: Array.isArray(product.sustainability_statistics)
                                    ? product.sustainability_statistics.map(stat => ({
                                        id: stat.id,
                                        type: stat.type,
                                        value: stat.value
                                    }))
                                    : [],
                                grade: product.sustainability_grade,
                                insights: product.sustainability_insights
                            }}
                        />
                    </div>
                    
                    <EditProduct
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        product={product}
                        onProductUpdated={handleProductUpdate}
                    />
                </div>
            </div>
        </>
    );
}