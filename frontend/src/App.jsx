import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import ViewProduct from './components/product/ViewProduct';
import Home from './pages/Home';
import Splash from './pages/Splash';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';
import Register from './pages/Register';
import Navigation from './components/navigation/Navigation';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout'; // ✅ ADDED
import { SearchProvider } from './components/search/SearchProvider';
import { CartProvider } from "./components/cart/CartContext";

// APP Will also be used to define the routes for the application
function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <div className="App">
          <Routes>
            {/* pages routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/Home" element={
              <React.Fragment key="home">
                <Navigation />
                <Home />
              </React.Fragment>
            } />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/search" element={
              <React.Fragment key="search">
                <Navigation />
                <SearchResults />
              </React.Fragment>
            } />
            <Route path="/Product/:id" element={
              <React.Fragment key="product">
                <Navigation />
                <ViewProduct />
              </React.Fragment>
            } />
            <Route path="/cart" element={
              <React.Fragment key="cart">
                <Navigation />
                <Cart />
              </React.Fragment>
            } />
            <Route path="/orders" element={
              <React.Fragment key="orders">
                <Navigation />
                <Orders />
              </React.Fragment>
            } />
            <Route path="/checkout" element={   // ✅ ADDED THIS ROUTE
              <React.Fragment key="checkout">
                <Navigation />
                <Checkout />
              </React.Fragment>
            } />
            {/* catch-all */}
            <Route path="*" element={<Navigate to="/Home" replace />} />
          </Routes>
        </div>
      </CartProvider>
    </SearchProvider>
  );
}

export default App;
