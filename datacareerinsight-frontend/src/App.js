import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Resumes from './pages/Resumes';
import LinearRegression from './pages/LinearRegression';
import Vacancies from './pages/Vacancies';
//import Header from './components/Header'; // Если у тебя есть Header

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />  {/* Главная страница */}
                <Route path="/resumes" element={<Resumes />} />  {/* Резюме */}
                <Route path="/linear-regression" element={<LinearRegression />} />  {/* Линейная регрессия */}
                <Route path="/clustering" element={<Vacancies />} />  {/* Кластеризация */}
            </Routes>
        </Router>
    );
};

export default App;
