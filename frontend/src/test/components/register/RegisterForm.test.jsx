import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterForm from '../../../components/register/RegisterForm'
import { signup } from '../../../user-services/signupService'

// Mock the signupService
vi.mock('../../../user-services/signupService', () => ({
  signup: vi.fn()
}))

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

// Mock alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

// Mock setTimeout for transitions
vi.mock('setTimeout', () => vi.fn((fn) => fn()))

const renderWithRouter = (component, initialRoute = '/register') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  )
}

describe('RegisterForm Component', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
    mockConsoleLog.mockClear()
    mockAlert.mockClear()
    signup.mockClear()
    vi.clearAllTimers()
  })

  it('renders initial signup form correctly', () => {
    renderWithRouter(<RegisterForm />)
    
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument()
    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('renders navigation links in initial form', () => {
    renderWithRouter(<RegisterForm />)
    
    const termsLinks = screen.getAllByText('terms of service')
    const privacyLinks = screen.getAllByText('privacy policy')
    const cookieLink = screen.getByText('cookie use')
    const signInLink = screen.getByText('Sign in')
    
    expect(termsLinks[0]).toHaveAttribute('href', '/terms')
    expect(privacyLinks[0]).toHaveAttribute('href', '/privacy')
    expect(cookieLink).toHaveAttribute('href', '/cookies')
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('renders Google signup button with icon', () => {
    renderWithRouter(<RegisterForm />)
    
    const googleButton = screen.getByRole('button', { name: /sign up with google/i })
    const googleIcon = screen.getByAltText('Google')
    
    expect(googleButton).toBeInTheDocument()
    expect(googleIcon).toBeInTheDocument()
    expect(googleIcon).toHaveAttribute('src', './src/assets/icons/googleColored.png')
  })

  it('transitions to registration form when Create Account is clicked', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    // Should show the registration form
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up$/i })).toBeInTheDocument()
  })

  it('renders registration form with correct input types', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(nameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('required')
  })

  it('updates input values when typing in registration form', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(nameInput).toHaveValue('Test User')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('handles successful registration', async () => {
    signup.mockResolvedValue({ success: true })
    
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /sign up$/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(mockAlert).toHaveBeenCalledWith('Account created successfully!')
    expect(global.mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('validates password confirmation', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /sign up$/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
    fireEvent.click(submitButton)
    
    expect(mockAlert).toHaveBeenCalledWith('Passwords do not match')
    expect(signup).not.toHaveBeenCalled()
  })

  it('handles Google signup click', () => {
    renderWithRouter(<RegisterForm />)
    
    const googleButton = screen.getByRole('button', { name: /sign up with google/i })
    
    fireEvent.click(googleButton)
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Google sign up clicked')
  })

  it('renders terms and privacy links in registration form', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const termsLinks = screen.getAllByText('terms of service')
    const privacyLinks = screen.getAllByText('privacy policy')
    
    // Should have terms and privacy links in the registration form too
    expect(termsLinks).toBeTruthy()
    expect(privacyLinks).toBeTruthy()
  })

  it('has proper form structure and classes', () => {
    renderWithRouter(<RegisterForm />)
    
    expect(document.querySelector('.register-form-container')).toBeInTheDocument()
    expect(document.querySelector('.register-form-content')).toBeInTheDocument()
    expect(document.querySelector('.register-form-title')).toBeInTheDocument()
    expect(document.querySelector('.register-form')).toBeInTheDocument()
  })

  it('applies transition classes correctly', () => {
    renderWithRouter(<RegisterForm />)
    
    const content = document.querySelector('.register-form-content')
    expect(content).toHaveClass('slide-in')
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    // After transition, should still have the content element
    expect(document.querySelector('.register-form-content')).toBeInTheDocument()
  })

  it('has correct button types', () => {
    renderWithRouter(<RegisterForm />)
    
    const googleButton = screen.getByRole('button', { name: /sign up with google/i })
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    
    expect(googleButton).toHaveAttribute('type', 'button')
    expect(createAccountButton).toHaveAttribute('type', 'button')
    
    // Switch to registration form
    fireEvent.click(createAccountButton)
    
    const signUpButton = screen.getByRole('button', { name: /sign up$/i })
    expect(signUpButton).toHaveAttribute('type', 'submit')
  })

  it('maintains form state after validation error', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } })
    
    const submitButton = screen.getByRole('button', { name: /sign up$/i })
    fireEvent.click(submitButton)
    
    // Form should maintain its state after validation error
    expect(emailInput).toHaveValue('test@example.com')
    expect(nameInput).toHaveValue('Test User')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('different')
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const emailInput = screen.getByLabelText('Email address')
    const nameInput = screen.getByLabelText('Name')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    expect(emailInput).toHaveAccessibleName('Email address')
    expect(nameInput).toHaveAccessibleName('Name')
    expect(passwordInput).toHaveAccessibleName('Password')
    expect(confirmPasswordInput).toHaveAccessibleName('Confirm Password')
  })

  it('prevents form submission with empty fields', () => {
    renderWithRouter(<RegisterForm />)
    
    const createAccountButton = screen.getByRole('button', { name: /create an account/i })
    fireEvent.click(createAccountButton)
    
    const submitButton = screen.getByRole('button', { name: /sign up$/i })
    fireEvent.click(submitButton)
    
    // HTML5 validation should prevent submission
    expect(signup).not.toHaveBeenCalled()
  })
});