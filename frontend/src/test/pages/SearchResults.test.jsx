import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchResults from '../../pages/SearchResults'
import { SearchProvider } from '../../components/search/SearchProvider'

// Mock the searchProducts service
vi.mock('../../product-services/searchProducts', () => ({
  searchProducts: vi.fn()
}))

import { searchProducts } from '../../product-services/searchProducts'

const mockSearchResponse = {
  data: [
    {
      id: 1,
      name: 'Apple iPhone 15',
      price: 999.99,
      in_stock: true,
      description: 'Latest iPhone model with eco-friendly materials',
      brand: 'Apple'
    },
    {
      id: 2,
      name: 'Apple MacBook Pro',
      price: 1299.99,
      in_stock: true,
      description: 'Powerful laptop with sustainable design',
      brand: 'Apple'
    }
  ],
  images: [
    'https://example.com/iphone.jpg',
    'https://example.com/macbook.jpg'
  ]
}

const mockEmptyResponse = {
  data: [],
  images: []
}

const renderWithProviders = (initialRoute = '/search?q=apple') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    </MemoryRouter>
  )
}

describe('SearchResults Page', () => {
  beforeEach(() => {
    searchProducts.mockClear()
    global.mockNavigate.mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  it('renders search results page with search bar', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders()
    })
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search eco-friendly products...')).toBeInTheDocument()
  })

  it('displays search query in heading', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Search Results for "apple"')).toBeInTheDocument()
    })
  })

  it('displays searching state initially', () => {
    searchProducts.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders('/search?q=apple')
    
    expect(screen.getByText('Searching products...')).toBeInTheDocument()
  })

  it('renders search results after successful search', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('2 products found')).toBeInTheDocument()
      expect(screen.getByText('Apple iPhone 15')).toBeInTheDocument()
      expect(screen.getByText('Apple MacBook Pro')).toBeInTheDocument()
    })
  })

  it('displays no results message when no products found', async () => {
    searchProducts.mockResolvedValue(mockEmptyResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=nonexistent')
    })
    
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
      expect(screen.getByText('We couldn\'t find any products matching "nonexistent". Try using different keywords or browse our categories.')).toBeInTheDocument()
    })
  })

  it('calls searchProducts with correct parameters', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledWith({
        apiKey: 'someKey',
        search: 'apple',
        fromItem: 0,
        count: 20
      })
    })
  })

  it('handles search error gracefully', async () => {
    searchProducts.mockRejectedValue(new Error('Search failed'))
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again later.')).toBeInTheDocument()
    })
  })

  it('displays "All Products" when no search query', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search')
    })
    
    await waitFor(() => {
      expect(screen.getByText('All Products')).toBeInTheDocument()
      expect(screen.getByText('2 products available')).toBeInTheDocument()
    })
  })

   it('updates search results when URL query changes', async () => {
    // First, test initial search
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    const { unmount } = await act(async () => {
      return renderWithProviders('/search?q=iphone')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Search Results for "iphone"')).toBeInTheDocument()
    })
    
    // Clean up the first render
    unmount()
    
    // Set up for second search
    searchProducts.mockClear()
    searchProducts.mockResolvedValue({
      data: [{ 
        id: 3, 
        name: 'Samsung Galaxy', 
        price: 899.99, 
        in_stock: true, 
        description: 'Android phone', 
        brand: 'Samsung' 
      }],
      images: ['https://example.com/samsung.jpg']
    })
    
    // Render with new route
    await act(async () => {
      renderWithProviders('/search?q=samsung')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Search Results for "samsung"')).toBeInTheDocument()
      expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
    })
  })

  it('shows stock status for products', async () => {
    const mixedStockResponse = {
      data: [
        { ...mockSearchResponse.data[0], in_stock: true },
        { ...mockSearchResponse.data[1], in_stock: false }
      ],
      images: mockSearchResponse.images
    }
    
    searchProducts.mockResolvedValue(mixedStockResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('In Stock')).toBeInTheDocument()
      expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    })
  })

  it('renders products in grid layout', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      const productList = document.querySelector('.product-list')
      expect(productList).toBeInTheDocument()
      expect(productList).toHaveClass('product-list')
      
      const productCards = document.querySelectorAll('.product')
      expect(productCards).toHaveLength(2)
    })
  })

  it('has proper page structure and CSS classes', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      const searchResultsContainer = document.querySelector('.search-results')
      expect(searchResultsContainer).toBeInTheDocument()
      expect(searchResultsContainer).toHaveClass('search-results')
      
      const container = document.querySelector('.search-results-container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('search-results-container')
      
      const searchBar = document.querySelector('.search-results-bar')
      expect(searchBar).toBeInTheDocument()
      expect(searchBar).toHaveClass('search-bar-container', 'search-results-bar')
    })
  })

  it('calls searchProducts only once per query change', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledTimes(1)
    })
  })

  it('handles URL decode for special characters in search query', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=eco%20friendly%20%26%20organic')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Search Results for "eco friendly & organic"')).toBeInTheDocument()
    })
    
    expect(searchProducts).toHaveBeenCalledWith({
      apiKey: 'someKey',
      search: 'eco friendly & organic',
      fromItem: 0,
      count: 20
    })
  })

  it('shows loading state during search', async () => {
    let resolvePromise
    const searchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    searchProducts.mockReturnValue(searchPromise)
    
    renderWithProviders('/search?q=apple')
    
    expect(screen.getByText('Searching products...')).toBeInTheDocument()
    
    await act(async () => {
      resolvePromise(mockSearchResponse)
      await searchPromise
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Searching products...')).not.toBeInTheDocument()
      expect(screen.getByText('2 products found')).toBeInTheDocument()
    })
  })

  it('displays product images with correct src', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      const iphoneImage = screen.getByAltText('Apple iPhone 15')
      const macbookImage = screen.getByAltText('Apple MacBook Pro')
      
      expect(iphoneImage).toHaveAttribute('src', 'https://example.com/iphone.jpg')
      expect(macbookImage).toHaveAttribute('src', 'https://example.com/macbook.jpg')
    })
  })

  it('handles empty search query gracefully', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=')
    })
    
    await waitFor(() => {
      expect(screen.getByText('All Products')).toBeInTheDocument()
    })
    
    expect(searchProducts).toHaveBeenCalledWith({
      apiKey: 'someKey',
      search: '',
      fromItem: 0,
      count: 20
    })
  })


  //ADDITIONAL
  it('handles network timeout gracefully', async () => {
    const timeoutError = new Error('Network timeout')
    timeoutError.name = 'TimeoutError'
    searchProducts.mockRejectedValue(timeoutError)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again later.')).toBeInTheDocument()
    })
  })

  it('displays correct results count for single product', async () => {
    searchProducts.mockResolvedValue({
      data: [mockSearchResponse.data[0]], // Only one product
      images: [mockSearchResponse.images[0]]
    })
    
    await act(async () => {
      renderWithProviders('/search?q=iphone')
    })
    
    await waitFor(() => {
      expect(screen.getByText('1 products found')).toBeInTheDocument()
    })
  })

  it('handles products with missing images', async () => {
    searchProducts.mockResolvedValue({
      data: mockSearchResponse.data,
      images: [] // No images
    })
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Apple iPhone 15')).toBeInTheDocument()
      expect(screen.getByText('Apple MacBook Pro')).toBeInTheDocument()
      
      // Images should still render but with undefined src
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
    })
  })

  it('handles very long search queries', async () => {
    const longQuery = 'a'.repeat(100) // 100 character query
    searchProducts.mockResolvedValue(mockEmptyResponse)
    
    await act(async () => {
      renderWithProviders(`/search?q=${longQuery}`)
    })
    
    await waitFor(() => {
      expect(screen.getByText(`Search Results for "${longQuery}"`)).toBeInTheDocument()
      expect(screen.getByText('No products found')).toBeInTheDocument()
    })
  })

  it('maintains search state during loading', async () => {
    let resolvePromise
    const searchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    searchProducts.mockReturnValue(searchPromise)
    
    renderWithProviders('/search?q=apple')
    
    // Should show searching state
    expect(screen.getByText('Searching products...')).toBeInTheDocument()
    expect(screen.getByText('Search Results for "apple"')).toBeInTheDocument()
    
    await act(async () => {
      resolvePromise(mockSearchResponse)
      await searchPromise
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Searching products...')).not.toBeInTheDocument()
      expect(screen.getByText('2 products found')).toBeInTheDocument()
    })
  })

//   it('clears error state when new search is performed', async () => {
//     // First search fails
//     searchProducts.mockRejectedValue(new Error('First search failed'))
    
//     await act(async () => {
//       renderWithProviders('/search?q=apple')
//     })
    
//     await waitFor(() => {
//       expect(screen.getByText('Failed to load products. Please try again later.')).toBeInTheDocument()
//     })
    
//     // Mock successful search for second attempt
//     searchProducts.mockClear()
//     searchProducts.mockResolvedValue(mockSearchResponse)
    
//     // Simulate new search by re-rendering with different query
//     const { rerender } = render(
//       <MemoryRouter initialEntries={['/search?q=iphone']}>
//         <SearchProvider>
//           <SearchResults />
//         </SearchProvider>
//       </MemoryRouter>
//     )
    
//     await waitFor(() => {
//       expect(screen.queryByText('Failed to load products. Please try again later.')).not.toBeInTheDocument()
//       expect(screen.getByText('Search Results for "iphone"')).toBeInTheDocument()
//     })
//   })

//   it('handles search with only whitespace', async () => {
//     searchProducts.mockResolvedValue(mockSearchResponse)
    
//     await act(async () => {
//       renderWithProviders('/search?q=%20%20%20') // URL encoded spaces
//     })
    
//     await waitFor(() => {
//       // Should treat as empty search
//       expect(screen.getByText('All Products')).toBeInTheDocument()
//     })
//   })

  it('preserves search query in search bar input', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=sustainable%20products')
    })
    
    await waitFor(() => {
      const searchInput = screen.getByRole('textbox')
      expect(searchInput.value).toBe('sustainable products')
    })
  })

  it('handles API response with null data', async () => {
    searchProducts.mockResolvedValue({
      data: null,
      images: null
    })
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
    })
  })

  it('displays proper accessibility attributes', async () => {
    searchProducts.mockResolvedValue(mockSearchResponse)
    
    await act(async () => {
      renderWithProviders('/search?q=apple')
    })
    
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Search Results for "apple"')
      
      const productList = document.querySelector('.product-list')
      expect(productList).toBeInTheDocument()
      
      // Check that product images have proper alt text
      expect(screen.getByAltText('Apple iPhone 15')).toBeInTheDocument()
      expect(screen.getByAltText('Apple MacBook Pro')).toBeInTheDocument()
    })
  })
})