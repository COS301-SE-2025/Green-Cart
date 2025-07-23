import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/retailer/ProductCarousel.css';

export default function ProductCarousel({ products, onEditProduct }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const productsPerView = 4; // Show 4 products at a time

    const navigate = useNavigate();

    const nextProducts = () => {
        const maxIndex = Math.max(0, products.length - productsPerView);
        setCurrentIndex((prev) => Math.min(prev+ productsPerView, maxIndex));
    };

    const prevProducts = () => {
        setCurrentIndex((prev) => Math.max(prev - productsPerView, 0));
    };

    const canGoNext = currentIndex + productsPerView < products.length;
    const canGoPrev = currentIndex > 0;

    // Calculate how many products are actually visible
    const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

    const handleEditClick = (product) => {
        if (onEditProduct) {
            onEditProduct(product);
        }
    };

    const handleViewClick = (product) => {
        // Navigate to product details page or perform view action
        console.log(`Viewing product: ${product.name}`);
        //navigate
        navigate(`/Product/${product.id}`);

    }

    return (
        <div className="product-carousel-section">
            <div className="carousel-header">
                <h2>Your Products</h2>
                <div className="carousel-controls">
                    <button 
                        className={`carousel-btn ${!canGoPrev ? 'disabled' : ''}`}
                        onClick={prevProducts} 
                        disabled={!canGoPrev}
                        aria-label="Previous products"
                    >
                        ←
                    </button>
                    <button 
                        className={`carousel-btn ${!canGoNext ? 'disabled' : ''}`}
                        onClick={nextProducts} 
                        disabled={!canGoNext}
                        aria-label="Next products"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="carousel-container">
                <div className="carousel-track">
                    {visibleProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-image">
                                <img src={product.image || product.images?.[0]} alt={product.name} />
                                <div className="product-overlay">
                                    <span className="sustainability-badge">
                                        🌱 {product.sustainability}
                                    </span>
                                </div>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    {Number(product.price).toLocaleString("en-ZA", {
                                        style: "currency",
                                        currency: "ZAR"
                                    })}
                                </div>
                                <div className="product-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Stock:</span>
                                        <span className="stat-value">{product.stock || product.quantity}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Sold:</span>
                                        <span className="stat-value">{product.sold || 0}</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => handleEditClick(product)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
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

            <div className="carousel-indicators">
                <span className="indicator-text">
                    Showing {currentIndex + 1}-{Math.min(currentIndex + productsPerView, products.length)} of {products.length} products
                </span>
            </div>
        </div>
    );
}