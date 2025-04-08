// src/pages/Home.js
import React from 'react';
import Vacancies from '../components/tables/VacanciesTable';  // Импорт компонента вакансий
import Resume from '../components/tables/ResumeTable';
import { ColumnCountChart } from '../components/charts/1st_graph/ColumnCountChart';
import { TimeDistributionChart } from '../components/charts/2nd_graph/TimeDistributionChart';
import { MetricColumnChart } from '../components/charts/3rd_graph/MetricColumnChart';
import { MetricDistributionChart } from '../components/charts/4th_graph/MetricDistributionChart';
import VacanciesSalaryPredictor from '../components/prediction/vacancy_salary';
import ResumeSalaryPredictor  from '../components/prediction/resume_salary';

// import '../styles/VacanciesTable.css';
// import '../styles/ResumeTable.css';

const Home = () => {
    return (
        <div>

            {/* Компоненты вакансий и графиков */}
            <Vacancies />
            <Resume />
            <ColumnCountChart model="vacancies" />
            <TimeDistributionChart model="resume" />
            <MetricColumnChart model="vacancies" />
            <MetricDistributionChart model="vacancies" />
            <VacanciesSalaryPredictor />
            <ResumeSalaryPredictor />
        </div>
    );
};

export default Home;
