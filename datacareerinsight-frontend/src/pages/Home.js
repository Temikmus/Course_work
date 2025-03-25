// src/pages/Home.js
import React from 'react';
import Vacancies from '../components/VacanciesTable';  // Импорт компонента вакансий
import Resume from '../components/ResumeTable';

const Home = () => {
    return (
        <div>
            <h1>Главная страница</h1>

            {/* Компоненты вакансий и графиков */}
            <Vacancies />
            <Resume />
        </div>
    );
};

export default Home;
