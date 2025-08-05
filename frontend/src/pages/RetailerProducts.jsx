import React, { useState, useEffect } from 'react';
import EditProduct from '../components/retailer/EditProduct';
import { useNavigate } from 'react-router-dom';
import '../components/styles/retailer/ProductCarousel.css';
import './styles/RetailerDashboard.css';
import './styles/RetailerProducts.css';

export default function RetailerProducts() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const retailerId = 3; // Hardcoded for now
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/Login');
            return;
        }
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`http://localhost:8000/retailer/products/${retailerId}`);
            const data = await response.json();
            if (response.ok && data.status === 200) {
                setProducts(data.data || []);
            } else {
                setProducts([]);
            }
        } catch (err) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading Products...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Your Products</h1>
                <button className="add-product-button" style={{marginLeft: 'auto'}} onClick={() => navigate('/retailer-dashboard')}>Back to Dashboard</button>
            </div>
            <div className="products-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', padding: '1rem 0'}}>
                {products.length === 0 ? (
                    <div className="dashboard-error">No products found.</div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="retailer-product-image">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    onError={e => { e.target.onerror = null; e.target.src = '/fallback-image.jpg'; }}
                                />
                                <div className="product-overlay">
                                    <span className="sustainability-badge">🌱 {product.sustainability_rating ?? 'N/A'}</span>
                                </div>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    R{Number(product.price).toFixed(2)}
                                </div>
                                <div className="product-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Stock:</span>
                                        <span className="stat-value">{product.stock_quantity ?? product.quantity ?? 'N/A'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Sold:</span>
                                        <span className="stat-value">{product.units_sold ?? 0}</span>
                                    </div>
                                    <div className="stat-item" style={{textAlign: 'center', width: '100%'}}>
                                        <span className="stat-label">Revenue:</span>
                                        <span className="stat-value">R{Number(product.revenue ?? 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className="view-details-button" 
                                        onClick={() => navigate(`/retailer/product/${product.id}`)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="edit-product-button"
                                        onClick={() => { setSelectedProduct(product); setEditModalOpen(true); }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <EditProduct
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                product={selectedProduct}
                onProductUpdated={async (updatedProduct) => {
                    // Send update to backend
                    try {
                        const response = await fetch(`http://localhost:8000/retailer/products/${updatedProduct.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedProduct)
                        });
                        if (response.ok) {
                            fetchProducts();
                        } else {
                            alert('Failed to update product.');
                        }
                    } catch (err) {
                        alert('Error updating product.');
                    }
                    setEditModalOpen(false);
                }}
            />
        </div>
    );
}
