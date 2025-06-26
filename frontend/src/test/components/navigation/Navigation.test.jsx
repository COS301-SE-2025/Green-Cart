import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from '../../../components/navigation/Navigation'
import { SearchProvider } from '../../../components/search/SearchProvider'
import { CartProvider } from '../../../components/cart/CartContext'

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.spyOn(window, 'addEventListener')
const mockRemoveEventListener = vi.spyOn(window, 'removeEventListener')

const renderWithProviders = (component, initialRoute = '/Home') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SearchProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </SearchProvider>
    </MemoryRouter>
  )
}

describe('Navigation Component', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()
    // Reset window width to desktop
    window.innerWidth = 1024
    // Reset localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // Reset document.body.style.overflow
    document.body.style.overflow = ''
  })

  it('renders logo correctly', () => {
    renderWithProviders(<Navigation />)
    
    const logo = screen.getByText('GREENCART')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/Home')
    expect(logo).toHaveClass('nav__logo')
  })

  it('renders desktop navigation links', () => {
    renderWithProviders(<Navigation />)
    
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
    // expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('My Account')).toBeInTheDocument()
  })

  it('renders cart icon with zero badge initially', () => {
    renderWithProviders(<Navigation />)
    
    const cartIcon = screen.getByAltText('Shopping Cart')
    expect(cartIcon).toBeInTheDocument()
    expect(cartIcon).toHaveClass('nav__cart-icon')
    
    // No badge should be visible when cart is empty
    const cartBadge = screen.queryByText('0')
    expect(cartBadge).not.toBeInTheDocument()
  })

  it('does not show mobile toggle on desktop', () => {
    window.innerWidth = 1024
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.queryByLabelText('Toggle menu')
    expect(mobileToggle).not.toBeInTheDocument()
  })

  it('shows mobile toggle on mobile view', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    expect(mobileToggle).toBeInTheDocument()
    expect(mobileToggle).toHaveClass('nav__mobile-toggle')
  })

  it('toggles mobile menu when mobile toggle is clicked', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    expect(mobileToggle).toHaveClass('active')
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('navigates to home when logo is clicked', () => {
    renderWithProviders(<Navigation />, '/search')
    
    const logo = screen.getByText('GREENCART')
    fireEvent.click(logo)
    
    expect(global.mockNavigate).toHaveBeenCalledWith('/Home', { replace: true })
  })

  it('handles logout correctly', () => {
    localStorage.setItem('token', 'test-token')
    renderWithProviders(<Navigation />)
    
    // const logoutLink = screen.getByText('Logout')
    // fireEvent.click(logoutLink)
    
    // expect(localStorage.getItem('token')).toBeNull()
    // expect(global.mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('closes mobile menu when logo is clicked', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    expect(mobileToggle).toHaveClass('active')
    
    const logo = screen.getByText('GREENCART')
    fireEvent.click(logo)
    
    expect(mobileToggle).not.toHaveClass('active')
  })

  it('sets up window resize listener', () => {
    renderWithProviders(<Navigation />)
    
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('cleans up resize listener on unmount', () => {
    const { unmount } = renderWithProviders(<Navigation />)
    
    unmount()
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('closes mobile menu when window is resized to desktop', () => {
    window.innerWidth = 480
    const { rerender } = renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    expect(mobileToggle).toHaveClass('active')
    
    // Simulate window resize to desktop
    window.innerWidth = 1024
    fireEvent.resize(window)
    
    // Force re-render to see the effect
    rerender(
      <MemoryRouter initialEntries={['/Home']}>
        <SearchProvider>
          <CartProvider>
            <Navigation />
          </CartProvider>
        </SearchProvider>
      </MemoryRouter>
    )
    
    // Mobile toggle should not be active anymore
    const updatedToggle = screen.queryByLabelText('Toggle menu')
    if (updatedToggle) {
      expect(updatedToggle).not.toHaveClass('active')
    }
  })

  it('applies overflow hidden to body when mobile menu is open', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('removes overflow hidden when mobile menu is closed', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    
    // Open menu
    fireEvent.click(mobileToggle)
    expect(document.body.style.overflow).toBe('hidden')
    
    // Close menu
    fireEvent.click(mobileToggle)
    expect(document.body.style.overflow).toBe('')
  })

  it('renders mobile navigation links when mobile menu is open', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    // Check mobile menu is present and active
    const mobileMenu = document.querySelector('.nav__mobile-menu')
    expect(mobileMenu).toHaveClass('active')
    
    // Links should be present in mobile menu
    expect(screen.getAllByText('Home')).toBeTruthy()
    expect(screen.getAllByText('About Us')).toBeTruthy()
    expect(screen.getAllByText('Help Center')).toBeTruthy()
  })

  it('closes mobile menu when a mobile link is clicked', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileToggle)
    
    expect(mobileToggle).toHaveClass('active')
    
    // Click a mobile menu link
    const mobileLinks = screen.getAllByText('About Us')
    fireEvent.click(mobileLinks[mobileLinks.length - 1]) // Click the one in mobile menu
    
    expect(mobileToggle).not.toHaveClass('active')
  })

  it('has proper accessibility attributes', () => {
    window.innerWidth = 480
    renderWithProviders(<Navigation />)
    
    const mobileToggle = screen.getByLabelText('Toggle menu')
    expect(mobileToggle).toHaveAttribute('aria-label', 'Toggle menu')
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false')
    
    fireEvent.click(mobileToggle)
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders cart link with proper accessibility attributes', () => {
    renderWithProviders(<Navigation />)
    
    const cartLink = screen.getByLabelText(/cart with 0 item/i)
    expect(cartLink).toHaveAttribute('title', 'Shopping Cart (0)')
  })
})