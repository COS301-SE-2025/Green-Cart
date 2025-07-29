import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import Help from './pages/Help';
import Checkout from './pages/Checkout'; // ✅ ADDED
import UserAccount from './pages/UserAccount'; // Placeholder for user account page
import RetailerDashboard from './pages/RetailerDashboard'; // ✅ ADDED
import RetailerProducts from './pages/RetailerProducts'; // Importing RetailerProducts page
import Products from './pages/admin/Products';
import ViewRetailerProduct from './pages/ViewRetailerProduct'; // Importing ViewRetailerProduct page
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
            <Route path="/help" element={
              <React.Fragment key="help">
                <Navigation />
                <Help />
              </React.Fragment>
            }/>
            <Route path="/checkout" element={   // ✅ ADDED THIS ROUTE
              <React.Fragment key="checkout">
                <Navigation />
                <Checkout />
              </React.Fragment>
            } />
            <Route path="/user-account" element={
              <React.Fragment key="user-account">
                <Navigation />
                {/* User account page can be added here */}
                <UserAccount />
              </React.Fragment>
            } />
            {/* Retailer routes - more specific first */}
            <Route path="/retailer/product/:id" element={
              <React.Fragment key="view-retailer-product">
                <Navigation />
                <ViewRetailerProduct />
              </React.Fragment>
            } />
            <Route path="/retailer/products" element={
              <React.Fragment key="retailer-products">
                <Navigation />
                <RetailerProducts />
              </React.Fragment>
            } />
            <Route path="/retailer-dashboard" element={
              <React.Fragment key="retailer-dashboard"> 
                <Navigation />
                <RetailerDashboard />
              </React.Fragment>
            } />
            <Route path="/admin/products" element={
              <React.Fragment key="admin-products"> 
                <Navigation />
                <Products />
              </React.Fragment>
            } />
            {/* catch-all */}
            <Route path="*" element={<Navigate to="/Home" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                fontSize: '20px',
                fontWeight: '500',
                padding: '16px 20px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              },
              success: {
                style: {
                  border: '1px solid #22c55e',
                  backgroundColor: '#f0fdf4',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                  backgroundColor: '#fef2f2',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  border: '1px solid #7BB540',
                  backgroundColor: '#f8fafc',
                },
                iconTheme: {
                  primary: '#7BB540',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </CartProvider>
    </SearchProvider>
  );
}

export default App;
