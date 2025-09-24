import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '../../../components/login/LoginForm'
import { loginUser } from '../../../user-services/loginService'

// Mock the loginService
vi.mock('../../../user-services/loginService', () => ({
  loginUser: vi.fn()
}))

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

const renderWithRouter = (component, initialRoute = '/login') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  )
}

describe('LoginForm Component', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear()
    mockAlert.mockClear()
    loginUser.mockClear()
    localStorage.clear()
  })

  it('renders login form correctly', () => {
    renderWithRouter(<LoginForm />)
    
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument()
  })

  it('renders all form elements with correct attributes', () => {
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const rememberCheckbox = screen.getByRole('checkbox')
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
  })

  it('renders navigation links correctly', () => {
    renderWithRouter(<LoginForm />)
    
    const forgotPasswordLink = screen.getByText('forgot your password?')
    const signUpLink = screen.getByText('Sign up')
    
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    expect(signUpLink).toHaveAttribute('href', '/Register')
  })



  it('updates input values when typing', () => {
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('toggles remember me checkbox', () => {
    renderWithRouter(<LoginForm />)
    
    const checkbox = screen.getByRole('checkbox')
    
    expect(checkbox).not.toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('handles successful login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    loginUser.mockResolvedValue(mockUser)
    
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in$/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123')
    })
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Login success:', mockUser)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    expect(global.mockNavigate).toHaveBeenCalledWith('/Home')
  })

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials'
    loginUser.mockRejectedValue(new Error(errorMessage))
    
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in$/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword')
    })
    
    expect(mockConsoleError).toHaveBeenCalledWith('Login failed:', errorMessage)
    expect(mockAlert).toHaveBeenCalledWith(errorMessage)
    expect(localStorage.getItem('user')).toBeNull()
    expect(global.mockNavigate).not.toHaveBeenCalled()
  })

  it('handles Google sign-in click', () => {
    renderWithRouter(<LoginForm />)
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    
    fireEvent.click(googleButton)
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Google sign in clicked')
  })

  it('has proper form structure and classes', () => {
    renderWithRouter(<LoginForm />)
    
    expect(document.querySelector('.login-form-container')).toBeInTheDocument()
    expect(document.querySelector('.login-form-content')).toBeInTheDocument()
    expect(document.querySelector('.login-form-title')).toBeInTheDocument()
    expect(document.querySelector('.login-form')).toBeInTheDocument()
  })

  it('has correct form accessibility attributes', () => {
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toHaveAccessibleName('Email address')
    expect(passwordInput).toHaveAccessibleName('Password')
  })

  it('renders divider with correct text', () => {
    renderWithRouter(<LoginForm />)
    
    const divider = screen.getByText('or')
    expect(divider).toBeInTheDocument()
  })

  it('has proper button types', () => {
    renderWithRouter(<LoginForm />)
    
    const signInButton = screen.getByRole('button', { name: /sign in$/i })
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    
    expect(signInButton).toHaveAttribute('type', 'submit')
    expect(googleButton).toHaveAttribute('type', 'button')
  })

  it('maintains form state after failed submission', async () => {
    loginUser.mockRejectedValue(new Error('Login failed'))
    
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const checkbox = screen.getByRole('checkbox')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(checkbox)
    
    const submitButton = screen.getByRole('button', { name: /sign in$/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled()
    })
    
    // Form should maintain its state
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(checkbox).toBeChecked()
  })
});