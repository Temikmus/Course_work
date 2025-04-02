// src/pages/Home.js
import React from 'react';
import Vacancies from '../components/tables/VacanciesTable';  // Импорт компонента вакансий
import Resume from '../components/tables/ResumeTable';
import { ColumnCountChart } from '../components/charts/1st_graph/ColumnCountChart';
import { TimeDistributionChart } from '../components/charts/2nd_graph/TimeDistributionChart';

import '../styles/VacanciesTable.css';
import '../styles/ResumeTable.css';

const Home = () => {
    return (
        <div>
            <h1>Главная страница</h1>

            {/* Компоненты вакансий и графиков */}
            <Vacancies />
            <Resume />
            <ColumnCountChart model="vacancies" />
            <TimeDistributionChart model="resume" />
        </div>
    );
};

export default Home;
