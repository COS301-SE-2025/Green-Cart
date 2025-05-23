import { Routes, Route } from 'react-router-dom'
import './App.css'
import ViewProduct from './components/product/ViewProduct'
import Home from './pages/Home'
import Navigation from './components/navigation/Navigation'

//APP Will also be used to define the routes for the application
function App() {
  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ViewProduct />} />
        {/* 
          Login
          Signup
          Cart
          Checkout
          Order History
          etc...
        */}
      </Routes>
    </div>
  )
}

export default App
