import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ViewProduct from './components/product/ViewProduct';
import Home from './pages/Home';
import Splash from './pages/Splash';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';
import Navigation from './components/navigation/Navigation';
import { SearchProvider } from './components/search/SearchProvider';

//APP Will also be used to define the routes for the application
function App() {
  return (
    <SearchProvider>
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
          <Route path="/search" element={
            <React.Fragment key="search">
              <Navigation />
              <SearchResults />
            </React.Fragment>
          } />
          {/* components routes */}
          <Route path="/Product/:id" element={
            <React.Fragment key="product">
              <Navigation />
              <ViewProduct />
            </React.Fragment>
          } />
          {/* Handle 404s */}
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </div>
    </SearchProvider>
  );
}

export default App;