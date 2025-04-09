// src/pages/Home.js
import React from 'react';
import Vacancies from '../components/tables/VacanciesTable';  // Импорт компонента вакансий
import Resume from '../components/tables/ResumeTable';
import { ColumnCountChart } from '../components/charts/1st_graph/ColumnCountChart';
import { TimeDistributionChart } from '../components/charts/2nd_graph/TimeDistributionChart';
import { MetricColumnChart } from '../components/charts/3rd_graph/MetricColumnChart';
import { MetricDistributionChart } from '../components/charts/4th_graph/MetricDistributionChart';

import SalaryPredictorTabs from '../components/prediction/SalaryPredictorTabs';
import {CssBaseline, Container, Typography} from '@mui/material';



const Home = () => {
    return (
        <div>
            <CssBaseline />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                    Калькулятор зарплат
                </Typography>
                <SalaryPredictorTabs />
            </Container>
            <Vacancies />
            <Resume />
            <ColumnCountChart model="vacancies" />
            <TimeDistributionChart model="resume" />
            <MetricColumnChart model="vacancies" />
            <MetricDistributionChart model="vacancies" />
        </div>
    );
};

export default Home;
