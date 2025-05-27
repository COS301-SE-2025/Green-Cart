import '@testing-library/jest-dom'

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => children,
  }
})

// Make mockNavigate available globally for tests
global.mockNavigate = mockNavigate