import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RetailerNavbar from '../components/RetailerNavbar';
import { isRetailerAuthenticated } from '../user-services/retailerAuthService';
import './styles/ViewRetailerProduct.css';
import FootprintTracker from '../components/product/FootprintTracker';
import EditProduct from '../components/retailer/EditProduct';

export default function ViewRetailerProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Use deployed API URL
    const API_BASE_URL = 'https://api.greencart-cos301.co.za';

    useEffect(() => {
        // Check for retailer authentication
        if (!isRetailerAuthenticated()) {
            navigate('/retailer-auth');
            return;
        }
        fetchProduct();
    }, [id, navigate]);

    const fetchProduct = async () => {
        try {
            // Get retailer user data with fallback
            const retailerData = localStorage.getItem('retailer_user');
            let userData = null;
            
            if (retailerData) {
                userData = JSON.parse(retailerData);
                console.log('Using retailer user data for product fetch');
            } else {
                // Fallback to regular user data if retailer data not found
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
                // Process S3 images properly
                const productData = result.data;
                let processedImages = [];

                // Handle S3 images from different possible sources
                if (productData.images && Array.isArray(productData.images)) {
                    processedImages = productData.images.map(img => 
                        typeof img === 'string' ? img : (img.url || img.image_url || img)
                    ).filter(Boolean);
                } else if (productData.image_url) {
                    processedImages = [productData.image_url];
                }

                // Log S3 image information
                console.log('Processed S3 images for product:', processedImages);
                const s3Images = processedImages.filter(img => img.includes('s3.amazonaws.com'));
                console.log('S3 bucket images found:', s3Images.length);

                setProduct({
                    ...productData,
                    // Prioritize S3 images
                    images: processedImages,
                    primary_image: processedImages.length > 0 ? processedImages[0] : null,
                    // Sustainability data
                    sustainability_rating: result.sustainability?.rating || productData.sustainability_rating || 0,
                    sustainability_statistics: result.sustainability?.statistics || productData.sustainability_statistics || [],
                    sustainability_grade: result.sustainability?.grade || productData.sustainability_grade || '',
                    sustainability_insights: result.sustainability?.insights || productData.sustainability_insights || [],
                    // Sales data
                    units_sold: typeof result.units_sold === 'number' ? result.units_sold : 
                               typeof productData.units_sold === 'number' ? productData.units_sold : 0,
                    revenue: typeof result.revenue === 'number' ? result.revenue : 
                            typeof productData.revenue === 'number' ? productData.revenue : 0,
                    // Stock data
                    quantity: productData.stock_quantity || productData.quantity || 0
                });
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
        // Close modal and refresh product data to show S3 changes
        setEditModalOpen(false);
        await fetchProduct();
    };

    // Helper function to get the best S3 image
    const getProductImage = (product) => {
        if (!product) return '/fallback-image.jpg';
        
        // Prioritize S3 images
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];
            return typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage.image_url || firstImage);
        }
        
        if (product.primary_image) {
            return product.primary_image;
        }
        
        if (product.image_url) {
            return product.image_url;
        }
        
        return '/fallback-image.jpg';
    };

    if (loading) {
        return (
            <>
                <RetailerNavbar />
                <div className="dashboard-loading-container">
                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading Product Details...</span>
                    </div>
                </div>
            </>
        );
    }

    if (!product || typeof product !== 'object' || !product.name) {
        return (
            <>
                <RetailerNavbar />
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <button
                            className="back-button"
                            onClick={() => navigate('/retailer/products')}
                        >
                            ← Back to Products
                        </button>
                    </div>
                    <div className="dashboard-error" style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Product Not Found</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            The product you're looking for could not be found or failed to load from the server.
                        </p>
                        <button 
                            onClick={() => navigate('/retailer/products')}
                            style={{ 
                                padding: '0.5rem 1rem', 
                                backgroundColor: '#4CAF50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const productImage = getProductImage(product);
    const isS3Image = productImage && productImage.includes('s3.amazonaws.com');
    const totalImages = product.images ? product.images.length : 0;

    return (
        <>
            <RetailerNavbar />
            <div className="view-retailer-product-container">
                <div className="product-header">
                    <div className="header-left">
                        <button
                            className="back-button"
                            onClick={() => navigate('/retailer/products')}
                        >
                            ← Back to Products
                        </button>
                    </div>
                    <div className="header-right">
                        <button
                            className="edit-product-button"
                            style={{ 
                                background: '#7BB540', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                padding: '0.5rem 1.5rem', 
                                fontWeight: 600, 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                marginRight: '1rem' 
                            }}
                            onClick={handleEditProduct}
                        >
                            Edit Product
                        </button>
                        <button
                            className="delete-product-button"
                            style={{ 
                                background: '#ef4444', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                padding: '0.5rem 1.5rem', 
                                fontWeight: 600, 
                                fontSize: '1rem', 
                                cursor: 'pointer' 
                            }}
                            onClick={handleDeleteProduct}
                        >
                            Delete Product
                        </button>
                    </div>
                </div>
                
                <div className="product-content">
                    <div className="product-image-section">
                        <div style={{ position: 'relative' }}>
                            <img
                                src={productImage}
                                alt={product.name || 'Product'}
                                onError={e => { 
                                    e.target.src = '/fallback-image.jpg';
                                    console.warn('Failed to load S3 product image:', productImage);
                                }}
                                style={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '8px'
                                }}
                            />
                            {/* S3 and image count indicators */}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                {isS3Image && (
                                    <span style={{
                                        background: 'rgba(34, 197, 94, 0.9)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        S3 Stored
                                    </span>
                                )}
                                {totalImages > 1 && (
                                    <span style={{
                                        background: 'rgba(59, 130, 246, 0.9)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {totalImages} images
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Additional S3 images preview */}
                        {product.images && product.images.length > 1 && (
                            <div style={{ marginTop: '16px' }}>
                                <h4 style={{ color: '#374151', marginBottom: '8px' }}>
                                    All Images ({product.images.length})
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                    gap: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {product.images.map((image, index) => {
                                        const imageUrl = typeof image === 'string' ? image : (image.url || image.image_url || image);
                                        const isThisS3 = imageUrl && imageUrl.includes('s3.amazonaws.com');
                                        
                                        return (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={`${product.name} ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        border: index === 0 ? '2px solid #7BB540' : '1px solid #e5e7eb'
                                                    }}
                                                    onError={e => { 
                                                        e.target.src = '/fallback-image.jpg';
                                                    }}
                                                />
                                                {isThisS3 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        right: '2px',
                                                        background: 'rgba(34, 197, 94, 0.9)',
                                                        color: 'white',
                                                        padding: '1px 3px',
                                                        borderRadius: '2px',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 'bold'
                                                    }}>
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
                    
                    <div className="product-details-section">
                        <h1>{product.name}</h1>
                        
                        <div className="metrics-grid">
                            <div className="metric-item">
                                <label>Price</label>
                                <p>R{Number(product.price).toFixed(2)}</p>
                            </div>
                            <div className="metric-item">
                                <label>Available Stock</label>
                                <p>{product.quantity}</p>
                            </div>
                            <div className="metric-item">
                                <label>Total Units Sold</label>
                                <p>{typeof product.units_sold === 'number' ? product.units_sold : 0}</p>
                            </div>
                            <div className="metric-item">
                                <label>Total Revenue</label>
                                <p>R{Number(product.revenue).toFixed(2)}</p>
                            </div>
                            {totalImages > 0 && (
                                <div className="metric-item">
                                    <label>S3 Images</label>
                                    <p>{totalImages} stored</p>
                                </div>
                            )}
                            <div className="metric-item">
                                <label>Category</label>
                                <p>{product.category || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div className="description-section">
                            <label>Description</label>
                            <p>{product.description || 'No description available'}</p>
                        </div>
                        
                        <div className="sustainability-section">
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
                    </div>
                </div>
                
                <EditProduct
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    product={product}
                    onProductUpdated={handleProductUpdate}
                />
            </div>
        </>
    );
}