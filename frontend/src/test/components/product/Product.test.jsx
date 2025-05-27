import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Product from '../../../components/product/Product'

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  in_stock: true,
  description: 'Test product description',
  brand: 'Test Brand'
}

const mockImage = 'https://example.com/test-image.jpg'

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Product Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    global.mockNavigate.mockClear()
  })

  it('renders product information correctly', () => {
    renderWithRouter(<Product product={mockProduct} image={mockImage} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Price: R29.99')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByAltText('Test Product')).toBeInTheDocument()
  })

  it('displays correct stock status for in-stock product', () => {
    renderWithRouter(<Product product={mockProduct} image={mockImage} />)
    
    const stockBadge = screen.getByText('In Stock')
    expect(stockBadge).toBeInTheDocument()
    expect(stockBadge).toHaveClass('badge-in-stock')
  })

  it('displays correct stock status for out-of-stock product', () => {
    const outOfStockProduct = { ...mockProduct, in_stock: false }
    renderWithRouter(<Product product={outOfStockProduct} image={mockImage} />)
    
    const stockBadge = screen.getByText('Out of Stock')
    expect(stockBadge).toBeInTheDocument()
    expect(stockBadge).toHaveClass('badge-out-of-stock')
  })

  it('navigates to product details when clicked', () => {
    renderWithRouter(<Product product={mockProduct} image={mockImage} />)
    
    // Find the product div directly since it's clickable but not a button
    const productCard = screen.getByText('Test Product').closest('.product')
    
    fireEvent.click(productCard)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/Product/1')
  })

  it('renders product image with correct src and alt attributes', () => {
    renderWithRouter(<Product product={mockProduct} image={mockImage} />)
    
    const image = screen.getByAltText('Test Product')
    expect(image).toHaveAttribute('src', mockImage)
  })

  it('applies correct CSS classes', () => {
    renderWithRouter(<Product product={mockProduct} image={mockImage} />)
    
    const productCard = screen.getByText('Test Product').closest('.product')
    expect(productCard).toHaveClass('product')
    
    const productImage = screen.getByText('Test Product').closest('.product').querySelector('.product-image')
    expect(productImage).toHaveClass('product-image')
    
    const productDetails = screen.getByText('Test Product').closest('.product').querySelector('.product-details')
    expect(productDetails).toHaveClass('product-details')
  })

  it('handles missing image gracefully', () => {
    renderWithRouter(<Product product={mockProduct} image={undefined} />)
    
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    // When image is undefined, src will be falsy
    expect(image.getAttribute('src')).toBeFalsy()
  })

  it('formats price correctly', () => {
    const productWithDecimalPrice = { ...mockProduct, price: 123.45 }
    renderWithRouter(<Product product={productWithDecimalPrice} image={mockImage} />)
    
    expect(screen.getByText('Price: R123.45')).toBeInTheDocument()
  })
})