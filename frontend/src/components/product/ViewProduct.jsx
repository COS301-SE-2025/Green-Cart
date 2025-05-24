import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
// import { products } from '../../data/products';
import { fetchProduct } from '../../product-services/fetchProduct';
import '../styles/product/ViewProduct.css';

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [product, setData] = useState({});
    const [image, setImages] = useState([]);
    const [found, setState] = useState(null);

    async function fetch_Product(){
        //apiKey will be removed from this request in the next iteration
        const apiKey = "someKey";
        
        const product_id = parseInt(id);

        try{
            const response = await fetchProduct({ apiKey, product_id });
            setData(response.data);
            setImages(response.images);
            setState(true);

        }catch(error) {
            console.error("Error fetching product:", error);
            setState(false);
        }

    }

    // Find product by ID from the URL parameter
    // const product = products.find(product => product.id === parseInt(id));
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

    // Rest of your component logic remains the same...
    const handleGoBack = () => {
        navigate(-1);
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
                        <span className="current-price">R {product.price}</span>
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
                </div>
            </div>
        </div>
    );
}