import { useNavigate } from 'react-router-dom';
import '../styles/Product/Product.css';

export default function Product({ product }) {
    const navigate = useNavigate();

    const viewProduct = () => {
        //Redirect to product details page
        navigate(`/product/${product.id}`);
    };

    return (
        // when clicked, redirect to the product details page
        <div className="product" onClick={viewProduct}>
            <div className="product-image">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="product-details">
                <h2>{product.name}</h2>
                <p>Price: R{product.price}</p>
            </div>
        </div>
    );
}