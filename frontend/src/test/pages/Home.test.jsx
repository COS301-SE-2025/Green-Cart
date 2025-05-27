import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../../pages/Home'
import { SearchProvider } from '../../components/search/SearchProvider'

// Mock the fetchAllProducts service
vi.mock('../../product-services/fetchAllProducts', () => ({
  fetchAllProducts: vi.fn()
}))

import { fetchAllProducts } from '../../product-services/fetchAllProducts'

const mockProductsResponse = {
  data: [
    {
      id: 1,
      name: 'Eco-Friendly Water Bottle',
      price: 25.99,
      in_stock: true,
      description: 'Reusable stainless steel water bottle',
      brand: 'EcoLife'
    },
    {
      id: 2,
      name: 'Organic Cotton T-Shirt',
      price: 35.50,
      in_stock: false,
      description: 'Sustainable organic cotton shirt',
      brand: 'GreenWear'
    },
    {
      id: 3,
      name: 'Bamboo Phone Case',
      price: 18.99,
      in_stock: true,
      description: 'Biodegradable bamboo phone case',
      brand: 'BambooTech'
    }
  ],
  images: [
    'https://example.com/water-bottle.jpg',
    'https://example.com/tshirt.jpg',
    'https://example.com/phone-case.jpg'
  ]
}

const renderWithProviders = (component, initialRoute = '/Home') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SearchProvider>
        {component}
      </SearchProvider>
    </MemoryRouter>
  )
}

describe('Home Page', () => {
  beforeEach(() => {
    fetchAllProducts.mockClear()
    global.mockNavigate.mockClear()
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
    window.alert.mockRestore()
  })

  it('renders home page with search bar', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search eco-friendly products...')).toBeInTheDocument()
  })

  it('displays loading state initially', async () => {
    fetchAllProducts.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<Home />)
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument()
  })

  it('renders products after successful fetch', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Just In')).toBeInTheDocument()
      expect(screen.getByText('Eco-Friendly Water Bottle')).toBeInTheDocument()
      expect(screen.getByText('Organic Cotton T-Shirt')).toBeInTheDocument()
      expect(screen.getByText('Bamboo Phone Case')).toBeInTheDocument()
    })
  })

  it('calls fetchAllProducts with correct parameters on mount', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      expect(fetchAllProducts).toHaveBeenCalledWith({
        apiKey: 'someKey',
        fromItem: 0,
        count: 20
      })
    })
  })

  it('handles fetch error gracefully', async () => {
    fetchAllProducts.mockRejectedValue(new Error('API Error'))
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
        expect(screen.getByText('Just In')).toBeInTheDocument()

        // The product list should be empty
        const productList = document.querySelector('.product-list')
        expect(productList).toBeInTheDocument()
        
        const productCards = document.querySelectorAll('.product')
        expect(productCards).toHaveLength(0)

        // Verify the loading state is no longer shown
        expect(screen.queryByText('Loading products...')).not.toBeInTheDocument()

    //   expect(window.alert).toHaveBeenCalledWith('Failed to load products. Please try again later.')
    })

    // Verify the error was logged (console.error should be called)
    expect(console.error).toHaveBeenCalledWith('Error fetching products:', expect.any(Error))
  })

  it('displays product prices correctly', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Price: R25.99')).toBeInTheDocument()
      expect(screen.getByText('Price: R35.5')).toBeInTheDocument()
      expect(screen.getByText('Price: R18.99')).toBeInTheDocument()
    })
  })

  it('shows stock status for products', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      const inStockBadges = screen.getAllByText('In Stock')
      const outOfStockBadges = screen.getAllByText('Out of Stock')
      
      expect(inStockBadges).toHaveLength(2) // Two products in stock
      expect(outOfStockBadges).toHaveLength(1) // One product out of stock
    })
  })

  it('renders products in grid layout', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      const productList = document.querySelector('.product-list')
      expect(productList).toBeInTheDocument()
      expect(productList).toHaveClass('product-list')
      
      const productCards = document.querySelectorAll('.product')
      expect(productCards).toHaveLength(3)
    })
  })

  it('displays product images with correct src', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      const waterBottleImage = screen.getByAltText('Eco-Friendly Water Bottle')
      const tshirtImage = screen.getByAltText('Organic Cotton T-Shirt')
      const phoneCaseImage = screen.getByAltText('Bamboo Phone Case')
      
      expect(waterBottleImage).toHaveAttribute('src', 'https://example.com/water-bottle.jpg')
      expect(tshirtImage).toHaveAttribute('src', 'https://example.com/tshirt.jpg')
      expect(phoneCaseImage).toHaveAttribute('src', 'https://example.com/phone-case.jpg')
    })
  })

  it('handles empty products response', async () => {
    fetchAllProducts.mockResolvedValue({ data: [], images: [] })
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Just In')).toBeInTheDocument()
      
      const productList = document.querySelector('.product-list')
      expect(productList).toBeInTheDocument()
      
      const productCards = document.querySelectorAll('.product')
      expect(productCards).toHaveLength(0)
    })
  })

  it('has proper page structure and CSS classes', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      const homeContainer = document.querySelector('.home')
      expect(homeContainer).toBeInTheDocument()
      expect(homeContainer).toHaveClass('home')
      
      const searchBarContainer = document.querySelector('.home-search-bar')
      expect(searchBarContainer).toBeInTheDocument()
      expect(searchBarContainer).toHaveClass('search-bar-container', 'home-search-bar')
    })
  })

  it('calls fetchAllProducts only once on mount', async () => {
    fetchAllProducts.mockResolvedValue(mockProductsResponse)
    
    await act(async () => {
      renderWithProviders(<Home />)
    })
    
    await waitFor(() => {
      expect(fetchAllProducts).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading state during fetch', async () => {
    let resolvePromise
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    fetchAllProducts.mockReturnValue(fetchPromise)
    
    renderWithProviders(<Home />)
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument()
    
    await act(async () => {
      resolvePromise(mockProductsResponse)
      await fetchPromise
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument()
      expect(screen.getByText('Just In')).toBeInTheDocument()
    })
  })
})