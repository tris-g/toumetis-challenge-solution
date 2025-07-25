import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import Navbar from './components/Navbar.jsx'
import EmployeeDashboard from './routes/EmployeeDashboard.jsx';
import UploadEmployees from './routes/UploadEmployees.jsx';
import UpdateEmployee from './routes/UpdateEmployee.jsx';
import CreateEmployee from './routes/CreateEmployee.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/employees/upload-csv" element={<UploadEmployees />} />
        <Route path="/employees/new" element={<CreateEmployee />} />
        <Route path="/employees/:id" element={<UpdateEmployee />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)