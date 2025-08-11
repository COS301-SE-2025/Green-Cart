import { useNavigate } from 'react-router-dom';
import '../styles/product/Product.css';

export default function Product({ product, image, product_rating}) {
    const navigate = useNavigate();

    const viewProduct = () => {
        //Redirect to product details page
        navigate(`/Product/${product.id}`);
    };

    const sustainabilityRating = product_rating;

     const getRatingColor = (rating) => {
        if (rating >= 70) return '#22c55e'; // Green - good
        if (rating >= 50) return '#eab308'; // Yellow - fair
        return '#f97316'; // Orange - needs improvement
    };

    const getRatingLevel = (rating) => {
        if (rating >= 70) return 'Good';
        if (rating >= 50) return 'Fair';
        return 'Needs Work';
    };

    const getRatingIcon = (rating) => {
        if (rating >= 70) return '🌿';
        if (rating >= 50) return '🌱';
        return '⚠️';
    };

    return (
        // when clicked, redirect to the product details page
        <div className="product" onClick={viewProduct}>
            <div className="product-image">
                <img src={image} alt={product.name} />
                {/* Stock status badge */}
                <div className={`product-badge stock-badge ${product.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </div>
                
            </div>
            <div className="product-details">
                <h2>{product.name}</h2>
                <p>Price: R{product.price}</p>

                {/* Sustainability rating badge */}
                <div 
                    className="sustainability-badge"
                    style={{ 
                        backgroundColor: getRatingColor(sustainabilityRating),
                        borderColor: getRatingColor(sustainabilityRating)
                    }}
                    title={`Sustainability Score: ${sustainabilityRating}/100 - ${getRatingLevel(sustainabilityRating)}`}
                >
                    <span className="rating-icon">{getRatingIcon(sustainabilityRating)}</span>
                    <span className="rating-score">{sustainabilityRating}</span>
                </div>
            </div>
        </div>
    );
}