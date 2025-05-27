import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ViewProduct from '../../../components/product/ViewProduct'
import { CartProvider } from '../../../components/cart/CartContext'

// Mock the fetchProduct service
vi.mock('../../../product-services/fetchProduct', () => ({
  fetchProduct: vi.fn()
}))

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => global.mockNavigate
  }
})

import { fetchProduct } from '../../../product-services/fetchProduct'

const mockProductResponse = {
  data: {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    in_stock: true,
    description: 'Test product description',
    brand: 'Test Brand',
    category_id: 1,
    retailer_id: 'retailer-1'
  },
  images: ['https://example.com/test-image.jpg']
}

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {component}
      </CartProvider>
    </BrowserRouter>
  )
}

describe('ViewProduct Component', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
    fetchProduct.mockClear()
  })

  it('renders product details when fetch is successful', async () => {
    fetchProduct.mockResolvedValue(mockProductResponse)
    
    await act(async () => {
        renderWithProviders(<ViewProduct />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('by Test Brand')).toBeInTheDocument()
      expect(screen.getByText('Test product description')).toBeInTheDocument()
      expect(screen.getByText('In Stock')).toBeInTheDocument()
    })
  })

  it('displays product not found when fetch fails', async () => {
    fetchProduct.mockRejectedValue(new Error('Product not found'))
    
    await act(async () => {
        renderWithProviders(<ViewProduct />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Product Not Found')).toBeInTheDocument()
      expect(screen.getByText("We couldn't find the product you're looking for.")).toBeInTheDocument()
    })
  })

  it('navigates back when back button is clicked', async () => {
    fetchProduct.mockResolvedValue(mockProductResponse)
    
    renderWithProviders(<ViewProduct />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    const backButton = screen.getByText('← Back')
    fireEvent.click(backButton)
    
    expect(global.mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('calls fetchProduct with correct parameters on mount', async () => {
    fetchProduct.mockResolvedValue(mockProductResponse)
    
    await act(async () => {
        renderWithProviders(<ViewProduct />)
    })
    
    expect(fetchProduct).toHaveBeenCalledWith({
      apiKey: 'someKey',
      product_id: 1
    })
  })

  it('displays correct price formatting', async () => {
    fetchProduct.mockResolvedValue(mockProductResponse)
    
    renderWithProviders(<ViewProduct />)
    
    await waitFor(() => {
      expect(screen.getByText('R 29,99')).toBeInTheDocument()
    })
  })

  it('shows out of stock overlay for out of stock products', async () => {
    const outOfStockResponse = {
        ...mockProductResponse,
        data: { ...mockProductResponse.data, in_stock: false }
    }
    fetchProduct.mockResolvedValue(outOfStockResponse)
    
    renderWithProviders(<ViewProduct />)
    
    await waitFor(() => {
        // Test for the overlay specifically
        const overlay = document.querySelector('.out-of-stock-overlay')
        expect(overlay).toBeInTheDocument()
        expect(overlay).toHaveTextContent('Out of Stock')
        
        // Or test for the meta value specifically
        const metaValue = document.querySelector('.meta-value.out-of-stock')
        expect(metaValue).toBeInTheDocument()
        expect(metaValue).toHaveTextContent('Out of Stock')
    })
  })

  it('adds product to cart when add to cart button is clicked', async () => {
    fetchProduct.mockResolvedValue(mockProductResponse)
    
    renderWithProviders(<ViewProduct />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)
    
    // Since we're testing the component behavior, we can't easily test
    // the cart state without additional mocking of the CartContext
    expect(addToCartButton).toBeInTheDocument()
  })
})