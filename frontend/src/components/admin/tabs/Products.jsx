import React, { useState } from 'react';
import '../../styles/admin/tabs/Products.css';

const Products = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
  };

  const products = [
    {
      id: 1,
      image: 'https://placehold.co/600x400',
      description: 'Stihl TS 800 cut-off machine incl. 5x diamond cutting discs',
      category: 'Grinding Equipment',
      sold: 19,
      unitPrice: 1500,
      addedDate: '2024-03-15',
      retailer: 'PowerTools Ltd'
    },
    {
      id: 2,
      image: 'https://placehold.co/600x400',
      description: 'Gasoline generator EYG 7500i (inverter)',
      category: 'Power generators',
      sold: 12,
      unitPrice: 1500,
      addedDate: '2024-03-10',
      retailer: 'GenCorp'
    },
    {
      id: 3,
      image: 'https://placehold.co/600x400',
      description: 'Reversible vibratory plate TSS-WP160H',
      category: 'Vibration equipment',
      sold: 6,
      unitPrice: 1500,
      addedDate: '2024-02-28',
      retailer: 'VibroTech'
    },
    {
      id: 4,
      image: 'https://placehold.co/600x400',
      description: 'Prompower P2S-300-4-320-B soft starter',
      category: 'Circuit breakers',
      sold: 4,
      unitPrice: 1500,
      addedDate: '2024-02-20',
      retailer: 'ElectroMax'
    },
    {
      id: 5,
      image: 'https://placehold.co/600x400',
      description: 'Thermal Imaging sight iRay Saim SCT 35 V2',
      category: 'Thermal imaging cameras',
      sold: 7,
      unitPrice: 1500,
      addedDate: '2024-02-15',
      retailer: 'ThermalPro'
    }
  ];

  return (
    <div className="products-content">
      <div className="content-header">
        <h1>Products</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">1,582</div>
          <div className="stat-label">Total Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">R1.9M</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">6.82</div>
          <div className="stat-label">Unverified Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['All', 'Verified', 'Promoted', 'Unverified'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        {/* <button className="add-tab">+</button> */}
      </div>

      {/* Products Table */}
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Description</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Sold</th>
              <th>Added Date</th>
              <th>Retailer</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.description}
                    className="product-image"
                    onClick={() => handleImageClick(product.image)}
                  />
                </td>
                <td className="product-description">{product.description}</td>
                <td>{product.category}</td>
                <td>{product.unitPrice}</td>
                <td>{product.sold}</td>
                <td>{product.addedDate}</td>
                <td>{product.retailer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Overlay */}
      {selectedImage && (
        <div className="image-overlay" onClick={closeImageOverlay}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeImageOverlay}>
              ×
            </button>
            <img src={selectedImage} alt="Product" className="overlay-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;