import { Routes, Route } from 'react-router-dom';
import './App.css';
import ViewProduct from './components/product/ViewProduct';
import Home from './pages/Home';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Navigation from './components/navigation/Navigation';

//APP Will also be used to define the routes for the application
function App() {
  return (
    <div className="App">
      <Routes>
        {/* pages routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/Home" element={<><Navigation /><Home /></>}/>
        <Route path="/Login" element={<Login />}/>
        {/* components routes */}
        <Route path="/Product/:id" element={<><Navigation /><ViewProduct /></>} />
      </Routes>
    </div>
  )
}

export default App;
