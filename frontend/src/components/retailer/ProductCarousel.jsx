import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';
import '../styles/retailer/ProductCarousel.css';
// import EditProduct from './EditProduct';

export default function ProductCarousel({ products, onEditProduct }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // const [editModalOpen, setEditModalOpen] = useState(false);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    const productsPerView = 4;

    const navigate = useNavigate();

    const nextProducts = () => {
        const maxIndex = Math.max(0, products.length - productsPerView);
        setCurrentIndex((prev) => Math.min(prev + productsPerView, maxIndex));
    };

    const prevProducts = () => {
        setCurrentIndex((prev) => Math.max(prev - productsPerView, 0));
    };

    const canGoNext = currentIndex + productsPerView < products.length;
    const canGoPrev = currentIndex > 0;

    const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

    const handleEditClick = (product) => {
        // setSelectedProduct(product);
        // setEditModalOpen(true);
        if (onEditProduct) {
            onEditProduct(product);
        }
    };

    const handleViewClick = (product) => {
        navigate(`/retailer/product/${product.id}`);
    };

    return (
        <div className="product-carousel-section">
            <div className="product-carousel-header">
                <h2>Your Products</h2>
                <div className="product-carousel-controls">
                    <button
                        className={`product-carousel-btn ${!canGoPrev ? 'disabled' : ''}`}
                        onClick={prevProducts}
                        disabled={!canGoPrev}
                        aria-label="Previous products"
                    >
                        ←
                    </button>
                    <button
                        className={`product-carousel-btn ${!canGoNext ? 'disabled' : ''}`}
                        onClick={nextProducts}
                        disabled={!canGoNext}
                        aria-label="Next products"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="product-carousel-container">
                <div className="product-carousel-track">
                    {visibleProducts.map((product) => (
                        <div key={product.id} className="product-carousel-card">
                            <div className="product-carousel-product-image">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/fallback-image.jpg';
                                    }}
                                />
                                <div className="product-carousel-overlay">
                                    <span className="product-carousel-sustainability-badge">
                                        🌱 {product.sustainability_rating ?? 'N/A'}
                                    </span>
                                    {product.verified ? (
                                        <span className="product-carousel-verified-badge">✓ Verified</span>
                                    ) : (
                                        <span className="product-carousel-unverified-badge">⚠ Unverified</span>
                                    )}
                                </div>
                            </div>
                            <div className="product-carousel-info">
                                <h3 className="product-carousel-name">{product.name}</h3>
                                <div className="product-carousel-price">
                                    {Number(product.price).toLocaleString("en-ZA", {
                                        style: "currency",
                                        currency: "ZAR"
                                    })}
                                </div>
                                <div className="product-carousel-stats">
                                    <div className="product-carousel-stat-item">
                                        <span className="product-carousel-stat-label">Stock:</span>
                                        <span className="product-carousel-stat-value">{product.stock_quantity ?? product.quantity ?? 'N/A'}</span>
                                    </div>
                                    <div className="product-carousel-stat-item">
                                        <span className="product-carousel-stat-label">Sold:</span>
                                        <span className="product-carousel-stat-value">{product.units_sold ?? product.sold ?? 0}</span>
                                    </div>
                                </div>
                                <div className="product-carousel-actions">
                                    <button
                                        className={`product-carousel-btn-action ${
                                            product.verified 
                                                ? 'product-carousel-btn-verified' 
                                                : 'product-carousel-btn-primary'
                                        }`}
                                        onClick={() => handleEditClick(product)}
                                    >
                                        {product.verified ? '💰 Update Price & Stock' : 'Edit'}
                                    </button>
                                    <button
                                        className="product-carousel-btn-action product-carousel-btn-secondary"
                                        onClick={() => handleViewClick(product)}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="product-carousel-indicators">
                <span className="product-carousel-indicator-text">
                    Showing {currentIndex + 1}-{Math.min(currentIndex + productsPerView, products.length)} of {products.length} products
                </span>
            </div>

            {/* <EditProduct
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                product={selectedProduct}
                onProductUpdated={async (updatedProduct) => {
                    try {
                        const response = await fetch(`${API_BASE_URL}/retailer/products/${updatedProduct.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedProduct)
                        });
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            alert('Failed to update product.');
                        }
                    } catch (err) {
                        alert('Error updating product.');
                    }
                    setEditModalOpen(false);
                }}
            /> */}
        </div>
    );
}