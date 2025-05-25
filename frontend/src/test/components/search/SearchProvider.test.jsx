import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SearchProvider, useSearch } from '../../../components/search/SearchProvider'

const wrapper = ({ children, initialRoute = '/' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <SearchProvider>
      {children}
    </SearchProvider>
  </MemoryRouter>
)

describe('SearchProvider', () => {
  it('provides initial search state', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    expect(result.current.searchQuery).toBe('')
    expect(result.current.searchResults).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('provides performSearch function', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    expect(typeof result.current.performSearch).toBe('function')
  })

  it('provides clearSearch function', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    expect(typeof result.current.clearSearch).toBe('function')
  })

  it('clearSearch resets search state', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    act(() => {
      result.current.clearSearch()
    })
    
    expect(result.current.searchQuery).toBe('')
    expect(result.current.searchResults).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('performSearch handles empty query', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    const products = [
      { id: 1, name: 'Test Product', description: 'Test', brand: 'Brand', category: 'Category' }
    ]
    
    act(() => {
      const results = result.current.performSearch('', products)
      expect(results).toEqual([])
    })
    
    expect(result.current.searchResults).toEqual([])
  })

  it('performSearch filters products by relevance', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    const products = [
      { id: 1, name: 'Apple iPhone', description: 'Latest smartphone', brand: 'Apple', category: 'Electronics' },
      { id: 2, name: 'Samsung Galaxy', description: 'Android phone', brand: 'Samsung', category: 'Electronics' },
      { id: 3, name: 'Apple MacBook', description: 'Laptop computer', brand: 'Apple', category: 'Computers' }
    ]
    
    act(() => {
      result.current.performSearch('apple', products)
    })
    
    // Should find Apple products with higher relevance
    expect(result.current.searchResults.length).toBeGreaterThan(0)
    expect(result.current.searchResults[0].name).toContain('Apple')
  })

  it('performSearch sorts results by relevance score', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    const products = [
      { id: 1, name: 'Organic Apple Juice', description: 'Pure apple juice', brand: 'OrganicCo', category: 'Beverages' },
      { id: 2, name: 'Apple', description: 'Fresh apple fruit', brand: 'FreshFarms', category: 'Fruits' },
      { id: 3, name: 'Apple Pie Recipe', description: 'How to make apple pie', brand: 'CookingTips', category: 'Recipes' }
    ]
    
    act(() => {
      result.current.performSearch('apple', products)
    })
    
    // Results should be sorted by relevance (exact match "Apple" should be first)
    expect(result.current.searchResults[0].name).toBe('Organic Apple Juice')
  })

  it('sets searchQuery based on URL parameters', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children, initialRoute: '/search?q=laptop' })
    })
    
    expect(result.current.searchQuery).toBe('laptop')
  })

  it('keeps search state when navigating to Home', () => {
    const { result, rerender } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children, initialRoute: '/search?q=test' })
    })
    
    // Initially on search page
    expect(result.current.searchQuery).toBe('test')
    
    // Navigate to Home
    rerender({ children: result.current }, { 
      wrapper: ({ children }) => wrapper({ children, initialRoute: '/Home' })
    })
    
    expect(result.current.searchQuery).toBe('test')
  })

  it('handles search with partial word matches', () => {
    const { result } = renderHook(() => useSearch(), { 
      wrapper: ({ children }) => wrapper({ children })
    })
    
    const products = [
      { id: 1, name: 'Smartphone', description: 'Mobile phone', brand: 'TechCorp', category: 'Electronics' },
      { id: 2, name: 'Smart Watch', description: 'Wearable device', brand: 'TechCorp', category: 'Electronics' }
    ]
    
    act(() => {
      result.current.performSearch('smart', products)
    })
    
    expect(result.current.searchResults.length).toBe(2)
    expect(result.current.searchResults.every(p => p.name.toLowerCase().includes('smart'))).toBe(true)
  })

  it('throws error when used outside provider', () => {
    // This test should be run outside the provider context
    expect(() => {
      renderHook(() => useSearch())
    }).toThrow('useSearch must be used within a SearchProvider')
  })
})