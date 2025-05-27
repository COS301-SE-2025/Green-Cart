import { useNavigate } from 'react-router-dom';
import '../styles/product/Product.css';

export default function Product({ product, image}) {
    const navigate = useNavigate();

    const viewProduct = () => {
        //Redirect to product details page
        navigate(`/Product/${product.id}`);
    };

    return (
        // when clicked, redirect to the product details page
        <div className="product" onClick={viewProduct}>
            <div className="product-image">
                <img src={image} alt={product.name} />
                {/* Stock status badge */}
                <div className={`product-badge ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </div>
            </div>
            <div className="product-details">
                <h2>{product.name}</h2>
                <p>Price: R{product.price}</p>
            </div>
        </div>
    );
}