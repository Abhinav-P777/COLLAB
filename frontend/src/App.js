import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import DocumentForm from './components/DocumentForm';
import DocumentDetails from './components/DocumentDetails';
import CollabToolLanding from './components/LandingPage';


// import DocumentEditor from './components/DocumentEditor';

function AppContent() {
    const location = useLocation();

    return (
        <>
            {/* Show Navbar on all pages except landing page ("/") */}
           {location.pathname !== "/" && 
 location.pathname !== "/login" && 
 location.pathname !== "/register" && <Navbar />}

            <Routes>
              
                <Route path="/" element={<CollabToolLanding />} />
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/document/:id" element={<DocumentDetails />} />
                <Route path="/document/new" element={<DocumentForm />} />
 
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
