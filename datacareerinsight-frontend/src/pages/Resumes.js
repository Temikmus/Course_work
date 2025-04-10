import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ResumeTable from '../components/tables/ResumeTable';
import { ColumnCountChart } from '../components/charts/1st_graph/ColumnCountChart';
import { TimeDistributionChart } from '../components/charts/2nd_graph/TimeDistributionChart';
import { MetricColumnChart } from '../components/charts/3rd_graph/MetricColumnChart';
import { MetricDistributionChart } from '../components/charts/4th_graph/MetricDistributionChart';

const ResumesPage = () => {
    // Стили для клякс (мягкие пастельные фиолетовые)
    const blobStyle = {
        position: 'fixed',
        filter: 'blur(70px)', // Увеличено размытие
        opacity: 0.25, // Слегка увеличена прозрачность
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
            {/* Кляксы (пастельные фиолетовые) */}
            <Box sx={{
                ...blobStyle,
                width: '500px',
                height: '300px',
                background: '#e1bee7', // Очень мягкий фиолетовый
                top: '15%',
                left: '-100px',
                transform: 'rotate(30deg)'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '600px',
                height: '250px',
                background: '#d1c4e9', // Светлый лавандовый
                bottom: '10%',
                right: '-150px',
                borderRadius: '70% 30% 30% 70% / 60% 60% 40% 40%'
            }} />

            {/* Основной контент */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Заголовок страницы с нежным градиентом */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 6,
                    background: 'linear-gradient(135deg, #9575cd 0%, #b39ddb 100%)', // Мягкий фиолетовый градиент
                    color: 'white',
                    py: 4,
                    borderRadius: 2,

                }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}>
                        Анализ резюме
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9 }}>
                        Данные с HeadHunter (январь 2024 - март 2025)
                    </Typography>
                </Box>

                {/* Описание раздела */}
                <Box sx={{
                    mb: 6,
                    p: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 2,
                    border: '1px solid rgba(149, 117, 205, 0.1)', // Тонкая фиолетовая граница
                    boxShadow: 1
                }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'black' }}>
                        О данных
                    </Typography>
                    <Typography paragraph sx={{ color: '#424242' }}>
                        В этом разделе представлена информация о более чем 9,000 резюме специалистов по данным.
                        Вы можете применять разные виды фильтров, группировки и исследовать данные с помощью интерактивных таблиц и графиков.
                    </Typography>
                    <Typography paragraph sx={{ color: '#424242' }}>
                        Используйте инструменты ниже, чтобы выявить тенденции среди соискателей, сравнить зарплатные ожидания
                        и определить наиболее популярные навыки.
                    </Typography>
                </Box>

                {/* Остальной код без изменений */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                        Таблица резюме
                    </Typography>
                    <ResumeTable />
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center', color: 'black' }}>
                        Визуализация данных
                    </Typography>

                    <Box sx={{ mb: 8 }}>
                        <ColumnCountChart model="resume" />
                    </Box>

                    <Box sx={{ mb: 8 }}>
                        <TimeDistributionChart model="resume" />
                    </Box>

                    <Box sx={{ mb: 8 }}>
                        <MetricColumnChart model="resume" />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <MetricDistributionChart model="resume" />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default ResumesPage;