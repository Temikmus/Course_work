import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import VacanciesTable from '../components/tables/VacanciesTable';
import { ColumnCountChart } from '../components/charts/1st_graph/ColumnCountChart';
import { TimeDistributionChart } from '../components/charts/2nd_graph/TimeDistributionChart';
import { MetricColumnChart } from '../components/charts/3rd_graph/MetricColumnChart';
import { MetricDistributionChart } from '../components/charts/4th_graph/MetricDistributionChart';

const VacanciesPage = () => {
    const theme = useTheme();

    const blobStyle = {
        position: 'fixed',
        filter: 'blur(60px)',
        opacity: 0.2,
        zIndex: 0,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
    };

    return (
        <Box sx={{
            position: 'relative',
            minHeight: '100vh',
            backgroundColor: '#fff',

            pb: 6
        }}>
            {/* Кляксы в голубых тонах */}
            <Box sx={{
                ...blobStyle,
                width: '500px',
                height: '300px',
                background: '#b3e5fc', // Светлый голубой
                top: '15%',
                left: '-100px',
                transform: 'rotate(30deg)'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '600px',
                height: '250px',
                background: '#81d4fa', // Средний голубой
                bottom: '10%',
                right: '-150px',
                borderRadius: '70% 30% 30% 70% / 60% 60% 40% 40%'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Шапка с голубым градиентом */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 6,
                    background: 'linear-gradient(135deg, #5d9cec 0%, #8bbaf0 100%)', // Осветленная версия                    color: 'white',
                    py: 4,
                    borderRadius: 2

                }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{
                        fontWeight: 'bold',
                        letterSpacing: '0.5x',
                        color: 'white'
                    }}>
                        Анализ вакансий
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9, color: 'white' }}>
                        Данные с HeadHunter (ноябрь 2024 - апрель 2025)
                    </Typography>
                </Box>

                {/* Остальной код без изменений */}
                <Box sx={{
                    mb: 6,
                    p: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        О данных
                    </Typography>
                    <Typography paragraph>
                        В этом разделе представлена информация о более чем 5,500 вакансий специалистов по данным.
                        Вы можете применять разные виды фильтров, группировки и исследовать данные с помощью интерактивных таблиц и графиков.
                    </Typography>
                    <Typography paragraph>
                        Используйте инструменты ниже, чтобы выявить тенденции на рынке труда, сравнить требования
                        работодателей и определить наиболее востребованные компетенции.
                    </Typography>
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                        Таблица вакансий
                    </Typography>
                    <VacanciesTable />
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                        Визуализация данных
                    </Typography>

                    <Box sx={{ mb: 8 }}>
                        <ColumnCountChart model="vacancies" />
                    </Box>

                    <Box sx={{ mb: 8 }}>
                        <TimeDistributionChart model="vacancies" />
                    </Box>

                    <Box sx={{ mb: 8 }}>
                        <MetricColumnChart model="vacancies" />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <MetricDistributionChart model="vacancies" />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default VacanciesPage;