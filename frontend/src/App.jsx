import { Routes, Route } from 'react-router-dom';
import './App.css';

import ViewProduct from './components/product/ViewProduct';
import Home from './pages/Home';
import Splash from './pages/Splash';

//APP Will also be used to define the routes for the application
function App() {
  return (
    <div className="App">
      <Routes>
        {/* pages routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/Home" element={<Home/>}/>
        {/* components routes */}
        <Route path="/Product/:id" element={<ViewProduct />} />
      </Routes>
    </div>
  )
}

export default App;
