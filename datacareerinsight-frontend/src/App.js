import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { Container } from '@mui/material';
import Home from './pages/Home';
import Vacancies from './pages/Vacancies';
import Resumes from './pages/Resumes';
import LinearRegression from './pages/LinearRegression';
import ScrollToTop from './components/ScrollToTop';


const App = () => {
    return (
        <Router>
            <ScrollToTop />
            <Header />
            <Container maxWidth="xl" sx={{ pt:0, pb: 4 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/vacancies" element={<Vacancies />} />
                    <Route path="/resumes" element={<Resumes />} />
                    <Route path="/linear-regression" element={<LinearRegression />} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;