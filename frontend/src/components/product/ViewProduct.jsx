import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../../product-services/fetchProduct';
import '../styles/product/ViewProduct.css';
import { useCart } from "../cart/CartContext";

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [product, setData] = useState({});
    const [image, setImages] = useState([]);
    const [found, setState] = useState(null);
    const { addToCart } = useCart();

    async function fetch_Product() {
        const apiKey = "someKey";
        const product_id = parseInt(id);
        try {
            const response = await fetchProduct({ apiKey, product_id });
            setData(response.data);
            setImages(response.images);
            setState(true);
        } catch (error) {
            console.error("Error fetching product:", error);
            setState(false);
        }
    }

    useEffect(() => {
        fetch_Product();
    }, [id]);

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

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,      // ensures price is numeric
            image: image[0] || ""                   // fallback if no image
        });
    };


    return (
        <div className="view-product-container">
            <button className="back-button" onClick={handleGoBack}>
                ← Back
            </button>
            <div className="view-product">
                <div className="product-image-container">
                    <img src={image[0]} alt={product.name} />
                    {!product.in_stock && (
                        <div className="out-of-stock-overlay">Out of Stock</div>
                    )}
                </div>

                <div className="product-info">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <div className="product-brand">by {product.brand}</div>
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
                            <span className="meta-value">{product.category_id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Brand:</span>
                            <span className="meta-value">{product.brand}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Retailer:</span>
                            <span className="meta-value">{product.retailer_id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Availability:</span>
                            <span className={`meta-value ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <button className="add-to-cart-button" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}