import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ViewRetailerProduct.css';
import FootprintTracker from '../components/product/FootprintTracker';
import EditProduct from '../components/retailer/EditProduct';

export default function ViewRetailerProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/Login');
            return;
        }
        fetchProduct();
        // eslint-disable-next-line
    }, [id, navigate]);

    const fetchProduct = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`https://api.greencart-cos301.co.za/products/FetchProduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.access_token}`
                },
                body: JSON.stringify({ product_id: parseInt(id) })
            });
            const result = await response.json();
            if (response.ok && result.status === 200 && result.data) {
                setProduct({
                    ...result.data,
                    images: result.images || [],
                    sustainability_rating: result.sustainability?.rating || 0,
                    sustainability_statistics: result.sustainability?.statistics || [],
                    sustainability_grade: result.sustainability?.grade || '',
                    sustainability_insights: result.sustainability?.insights || [],
                    units_sold: typeof result.units_sold === 'number' ? result.units_sold : 0,
                    revenue: typeof result.revenue === 'number' ? result.revenue : 0
                });
            } else {
                console.error('Failed to fetch product:', result.message);
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = () => {
        setEditModalOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        try {
            const response = await fetch(`https://api.greencart-cos301.co.za/retailer/product/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok && data.status === 200) {
                navigate('/retailer/products');
            } else {
                console.error('Failed to delete product:', data);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading Product Details...</span>
                </div>
            </div>
        );
    }

    if (!product || typeof product !== 'object' || !product.name) {
        return (
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
                    <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Product Not Found or Invalid</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        The product you're looking for could not be found or is invalid.
                    </p>
                </div>
            </div>
        );
    }

    return (
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
                        style={{ background: '#7BB540', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginLeft: '1rem' }}
                        onClick={handleEditProduct}
                    >
                        Edit Product
                    </button>
                </div>
            </div>
            <div className="product-content">
                <div className="product-image-section">
                    <img
                        src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url || product.images[0] : 'default-product-image.jpg'}
                        alt={product.name || 'Product'}
                        onError={e => { e.target.src = 'default-product-image.jpg'; }}
                    />
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
                onProductUpdated={async (updatedProduct) => {
                    try {
                        const response = await fetch(`https://api.greencart-cos301.co.za/retailer/products/${updatedProduct.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedProduct)
                        });
                        if (response.ok) {
                            setEditModalOpen(false);
                            fetchProduct();
                        } else {
                            alert('Failed to update product.');
                        }
                    } catch (err) {
                        alert('Error updating product.');
                    }
                }}
            />
        </div>
    );
}