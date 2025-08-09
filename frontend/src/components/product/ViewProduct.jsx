import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'
import { fetchProduct } from '../../product-services/fetchProduct';
import '../styles/product/ViewProduct.css';
import { useCart } from "../cart/CartContext";
import FootprintTracker from './FootprintTracker';
import { addToCart } from '../../cart-services/addToCart';

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [product, setData] = useState({});
    const [image, setImages] = useState([]);
    const [found, setState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { refreshCart } = useCart();
    const [sustainability, setSustainability] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [categoryName, setCategoryName] = useState('');
    const [retailerName, setRetailerName] = useState('');

    async function fetch_Product() {
        const product_id = parseInt(id);
        
        //set isLoading to true while fetching
        setIsLoading(true);

        try {
            const response = await fetchProduct({product_id });
            setData(response.data);
            setImages(response.images);
            setSustainability(response.sustainability);
            setCategoryName(response.category_name || 'Uncategorized');
            setRetailerName(response.retailer_name || 'No retailer specified');
            setState(true);
        } catch (error) {
            console.error("Error fetching product:", error);
            setState(false);
        } finally {
            setIsLoading(false); // End loading
        }
    }

    useEffect(() => {
        fetch_Product();
        //set image load
        setImageLoaded(false);
        setCurrentImageIndex(0); // Reset image index when product changes
    }, [id]);

    const handlImageLoad = () => {
        setImageLoaded(true);
    }

    if (found === false) {
        return (
            <div className="product-not-found">
                <h2>Product Not Found</h2>
                <p>We couldn't find the product you're looking for.</p>
                <button onClick={() => navigate('/Home')}>Back to Home</button>
            </div>
        );
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAddToCart = async () => {
        if (!product.in_stock) {
            toast.error("This item is out of stock and cannot be added to cart.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("userData"));
        try {
            if (user && user.id) {
                await addToCart({ user_id: user.id, product_id: product.id, quantity });
                toast.success("Item added to cart!");
                refreshCart(user.id); // Refresh the cart after adding an item
            } else {
                // Optionally handle the case where user is not found
                toast.error("Please log in to add items to your cart.");
                navigate("/login");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            // Show the specific error message from the backend
            toast.error(error.message || "Failed to add item to cart. Please try again.");
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === image.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? image.length - 1 : prevIndex - 1
        );
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    // if (isLoading) {
    //     return (
    //         <div className="view-product-container">
    //             <div className="product-loading">
    //                 <div className="loading-spinner"></div>
    //                 <h2>Loading Product...</h2>
    //                 <p>Please wait while we fetch the product details</p>
    //             </div>
    //         </div>
    //     );
    // }

    //Product skeleton for laodiung state
    const ProductSkeleton = () => (
    <div className="view-product">
        <div className="product-image-container skeleton" style={{ height: '500px' }}></div>
        
        <div className="product-info">
        <div className="product-header">
            <div className="skeleton" style={{ height: '2rem', width: '70%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: '1rem' }}></div>
        </div>
        
        <div className="skeleton" style={{ height: '2rem', width: '30%', margin: '1.5rem 0' }}></div>
        
        <div style={{ margin: '1.5rem 0' }}>
            <div className="skeleton" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '80%' }}></div>
        </div>
        
        <div className="skeleton" style={{ height: '3rem', width: '100%', margin: '2rem 0' }}></div>
        </div>
    </div>
    );

    if (isLoading) {
    return (
        <div className="view-product-container">
        <div className="skeleton" style={{ height: '2rem', width: '6rem', marginBottom: '1.5rem' }}></div>
        <ProductSkeleton />
        </div>
    );
    }


    return (
        <div className="view-product-container">
            <button className="back-button" onClick={handleGoBack}>
                ← Back
            </button>
            <div className="view-product">
                <div className="product-image-container">
                    {image && image.length > 0 ? (
                        <div className="image-gallery">
                            <div className="main-image-container">
                                <img 
                                    src={image[currentImageIndex]} 
                                    alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                                    className="main-product-image"
                                />
                                {!product.in_stock && (
                                    <div className="out-of-stock-overlay">Out of Stock</div>
                                )}
                                
                                {/* Navigation arrows for multiple images */}
                                {image.length > 1 && (
                                    <>
                                        <button 
                                            className="image-nav-btn prev-btn" 
                                            onClick={prevImage}
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                        <button 
                                            className="image-nav-btn next-btn" 
                                            onClick={nextImage}
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Thumbnail navigation for multiple images */}
                            {image.length > 1 && (
                                <div className="image-thumbnails">
                                    {image.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => goToImage(index)}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${index + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {/* Image counter */}
                            {image.length > 1 && (
                                <div className="image-counter">
                                    {currentImageIndex + 1} of {image.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-image-placeholder">
                            <span>No image available</span>
                        </div>
                    )}
                </div>

                <div className="product-info">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <div className="product-brand">by {product.brand}</div>
                        {/* Verification Badge */}
                        {sustainability?.statistics && sustainability.statistics.length > 0 && (
                            <div className="verification-status">
                                {sustainability.statistics.some(stat => stat.verification) ? (
                                    <div className="verification-badge verified">
                                        <span className="verification-icon">✓</span>
                                        <span className="verification-text">Verified Sustainability Data</span>
                                    </div>
                                ) : (
                                    <div className="verification-badge unverified">
                                        <span className="verification-icon">⚠</span>
                                        <span className="verification-text">Unverified Data</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="product-price">
                        <span className="current-price">
                            {Number(product.price).toLocaleString("en-ZA", {
                                style: "currency",
                                currency: "ZAR"
                            })}
                        </span>
                    </div>

                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="meta-label">Category:</span>
                            <span className="meta-value">{categoryName}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Brand:</span>
                            <span className="meta-value">{product.brand || 'No brand specified'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Retailer:</span>
                            <span className="meta-value">{retailerName}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Availability:</span>
                            <span className={`meta-value ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        {sustainability?.statistics && sustainability.statistics.length > 0 && (
                            <div className="meta-item">
                                <span className="meta-label">Sustainability Data:</span>
                                <span className="meta-value verification-details">
                                    {sustainability.statistics.some(stat => stat.verification) 
                                        ? `${sustainability.statistics.filter(stat => stat.verification).length}/${sustainability.statistics.length} metrics verified`
                                        : 'No verified metrics'
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    <button 
                        className={`add-to-cart-button ${!product.in_stock ? 'disabled' : ''}`}
                        onClick={handleAddToCart}
                        disabled={!product.in_stock}
                    >
                        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div> 
            </div>
           <div>
                    <FootprintTracker sustainability={sustainability} />
            </div>
        </div>
    );
}
