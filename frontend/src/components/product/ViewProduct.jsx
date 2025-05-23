import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
import '../styles/product/ViewProduct.css';

//This mock data will be replaced with the data from the backend
const products = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description of Product 1',
    price: 100,
    category: 'Category 1',
    in_stock: true,
    quantity: 10,
    brand: 'Brand 1',
    retailer: 'Retailer 1',
    image: 'https://picsum.photos/200/300'
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description of Product 2',
    price: 200,
    category: 'Category 2',
    in_stock: true,
    quantity: 1,
    brand: 'Brand 2',
    retailer: 'Retailer 2',
    image: 'https://picsum.photos/200/300'
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'Description of Product 3',
    price: 300,
    category: 'Category 3',
    in_stock: false,
    quantity: 0,
    brand: 'Brand 3',
    retailer: 'Retailer 3',
    image: 'https://picsum.photos/200/300'
  }
];

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    // Find product by ID from the URL parameter
    const product = products.find(product => product.id === parseInt(id));
    if (!product) {
        return (
            <div className="product-not-found">
                <h2>Product Not Found</h2>
                <p>We couldn't find the product you're looking for.</p>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= product.quantity) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        if (quantity < product.quantity) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAddToCart = () => {
        console.log(`Added ${quantity} of ${product.name} to cart`);
        // Future integration with cart context/state
    };

    const handleBuyNow = () => {
        console.log(`Buying ${quantity} of ${product.name}`);
        navigate('/checkout');
    };

    const handleAddToWishlist = () => {
        console.log(`Added ${product.name} to wishlist`);
    };

    // Calculate if product is low in stock (less than 20% of inventory or less than 10 items)
    const isLowStock = product.in_stock && (product.quantity < 10 || product.quantity < 0.2 * 100);

    return (
        <div className="view-product-container">
            <button className="back-button" onClick={handleGoBack}>
                ← Back
            </button>
            
            <div className="view-product">
                <div className="product-image-container">
                    <img src={product.image} alt={product.name} />
                    {!product.in_stock && (
                        <div className="out-of-stock-overlay">Out of Stock</div>
                    )}
                </div>
                
                <div className="product-info">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <div className="product-brand">by {product.brand}</div>

                        {/* REVIEWS */}
                        {/* <div className="product-rating">
                            <span className="stars">★★★★☆</span>
                            <span className="rating-count">(42 reviews)</span>
                        </div> */}
                    </div>

                    <div className="product-price">
                        <span className="current-price">R {product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>
                    
                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="meta-label">Category:</span>
                            <span className="meta-value">{product.category}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Brand:</span>
                            <span className="meta-value">{product.brand}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Retailer:</span>
                            <span className="meta-value">{product.retailer}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Availability:</span>
                            <span className={`meta-value ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.in_stock ? isLowStock ? 'Low Stock' : 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                    
                    {/* {product.in_stock && (
                        <div className="quantity-selector">
                            <h3>Quantity</h3>
                            <div className="quantity-controls">
                                <button 
                                    onClick={decrementQuantity} 
                                    disabled={quantity <= 1}
                                    className="quantity-btn"
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    min="1" 
                                    max={product.quantity} 
                                    onChange={handleQuantityChange} 
                                />
                                <button 
                                    onClick={incrementQuantity} 
                                    disabled={quantity >= product.quantity}
                                    className="quantity-btn"
                                >
                                    +
                                </button>
                            </div>
                            <span className="stock-info">
                                {isLowStock ? `Only ${product.quantity} left!` : `${product.quantity} available`}
                            </span>
                        </div>
                    )}
                    
                    <div className="product-actions">
                        <button 
                            className="add-to-cart-btn" 
                            onClick={handleAddToCart}
                            disabled={!product.in_stock}
                        >
                            Add to Cart
                        </button>
                        <button 
                            className="buy-now-btn" 
                            onClick={handleBuyNow}
                            disabled={!product.in_stock}
                        >
                            Buy Now
                        </button>
                        <button 
                            className="wishlist-btn" 
                            onClick={handleAddToWishlist}
                        >
                            ♡ Wishlist
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
