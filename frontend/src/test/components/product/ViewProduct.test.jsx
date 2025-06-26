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
  
  images: ['https://example.com/test-image.jpg'],
  sustainability: {
    rating: 75.5,
    statistics: [
      {
        id: 1,
        type: 'Energy Efficiency',
        value: 4.2
      },
      {
        id: 2,
        type: 'Material Sustainability',
        value: 3.8
      },
      {
        id: 3,
        type: 'Durability',
        value: 4.5
      },
      {
        id: 4,
        type: 'Recyclability',
        value: 3.5
      }
    ]
  }
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
})