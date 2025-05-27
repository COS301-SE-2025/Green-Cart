import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import SearchBar from '../../../components/search/SearchBar'
import { SearchProvider } from '../../../components/search/SearchProvider'

const renderWithProviders = (component, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SearchProvider>
        {component}
      </SearchProvider>
    </MemoryRouter>
  )
}

describe('SearchBar Component', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
  })

  it('renders search input correctly', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search eco-friendly products...')
    expect(searchInput).toHaveAttribute('aria-label', 'Search products')
  })

  it('renders search button correctly', () => {
    renderWithProviders(<SearchBar />)
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    expect(searchButton).toBeInTheDocument()
    expect(searchButton).toHaveAttribute('type', 'submit')
    expect(searchButton).toHaveAttribute('aria-label', 'Search')
  })

  it('allows user to type in search input', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    fireEvent.change(searchInput, { target: { value: 'eco-friendly' } })
    
    expect(searchInput.value).toBe('eco-friendly')
  })

  it('navigates to search page when form is submitted', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchForm = searchInput.closest('form')
    
    fireEvent.change(searchInput, { target: { value: 'apple' } })
    fireEvent.submit(searchForm)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/search?q=apple')
  })

  it('navigates to search page when search button is clicked', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.change(searchInput, { target: { value: 'organic' } })
    fireEvent.click(searchButton)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/search?q=organic')
  })

  it('trims whitespace from search query', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchForm = searchInput.closest('form')
    
    fireEvent.change(searchInput, { target: { value: '  apple  ' } })
    fireEvent.submit(searchForm)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/search?q=apple')
  })

  it('navigates to home when empty search is submitted', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchForm = searchInput.closest('form')
    
    fireEvent.change(searchInput, { target: { value: '' } })
    fireEvent.submit(searchForm)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/Home')
  })

  it('navigates to home when whitespace-only search is submitted', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchForm = searchInput.closest('form')
    
    fireEvent.change(searchInput, { target: { value: '   ' } })
    fireEvent.submit(searchForm)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/Home')
  })

  it('syncs with URL query parameters on search page', () => {
    renderWithProviders(<SearchBar />, '/search?q=laptop')
    
    const searchInput = screen.getByRole('textbox')
    expect(searchInput.value).toBe('laptop')
  })

  it('clears input when not on search page', () => {
    renderWithProviders(<SearchBar />, '/Home')
    
    const searchInput = screen.getByRole('textbox')
    expect(searchInput.value).toBe('')
  })

  it('applies custom className correctly', () => {
    renderWithProviders(<SearchBar className="custom-search" />)
    
    const searchContainer = screen.getByRole('textbox').closest('.search-bar-container')
    expect(searchContainer).toHaveClass('search-bar-container', 'custom-search')
  })

  it('handles special characters in search query', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    const searchForm = searchInput.closest('form')
    
    fireEvent.change(searchInput, { target: { value: 'eco-friendly & organic' } })
    fireEvent.submit(searchForm)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/search?q=eco-friendly%20%26%20organic')
  })

  it('has proper form structure', () => {
    renderWithProviders(<SearchBar />)
    
    const form = screen.getByRole('textbox').closest('form')
    expect(form).toBeInTheDocument()
    
    const searchBar = form.closest('.search-bar')
    expect(searchBar).toHaveClass('search-bar')
    
    const container = searchBar.closest('.search-bar-container')
    expect(container).toHaveClass('search-bar-container')
  })

  it('maintains focus after typing', () => {
    renderWithProviders(<SearchBar />)
    
    const searchInput = screen.getByRole('textbox')
    searchInput.focus()
    
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    expect(document.activeElement).toBe(searchInput)
  })
})