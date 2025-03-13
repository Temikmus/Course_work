// src/pages/Home.js
import React from 'react';
import Vacancies from '../components/VacanciesTable';  // Импорт компонента вакансий
import Chart from '../components/Chart';  // Импорт компонента графика

const Home = () => {
    return (
        <div>
            <h1>Главная страница</h1>
            <p>Здесь будут отображаться вакансии, графики и описание проекта.</p>

            {/* Компоненты вакансий и графиков */}
            <Vacancies />
            <Chart />
        </div>
    );
};

export default Home;
