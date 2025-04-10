import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import SalaryPredictorTabs from '../components/prediction/SalaryPredictorTabs';
import { CssBaseline } from '@mui/material';

const LinearRegression = () => {
    // Стили для клякс (зеленая гамма)
    const blobStyle = {
        position: 'fixed',
        filter: 'blur(70px)',
        opacity: 0.25,
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
            <CssBaseline />

            {/* Кляксы */}
            <Box sx={{
                ...blobStyle,
                width: '500px',
                height: '300px',
                background: '#c8e6c9',
                top: '15%',
                left: '-100px',
                transform: 'rotate(30deg)'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '600px',
                height: '250px',
                background: '#a5d6a7',
                bottom: '10%',
                right: '-150px',
                borderRadius: '70% 30% 30% 70% / 60% 60% 40% 40%'
            }} />

            {/* Основной контент */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Заголовок страницы */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 6,
                    background: 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)',
                    color: 'white',
                    py: 4,
                    borderRadius: 2,
                    boxShadow: 2
                }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}>
                        Прогнозирование зарплат
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9 }}>
                        Линейная регрессия на основе данных вакансий и резюме
                    </Typography>
                </Box>

                {/* Описание раздела */}
                <Box sx={{
                    mb: 6,
                    p: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 2,
                    border: '1px solid rgba(129, 199, 132, 0.1)',
                    boxShadow: 1
                }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'black' }}>
                        О модели
                    </Typography>
                    <Typography paragraph sx={{ color: '#424242' }}>
                        Этот инструмент использует алгоритмы машинного обучения для прогнозирования зарплатных ожиданий.
                        Выберите тип данных (вакансии или резюме) и укажите параметры для расчета.
                    </Typography>
                    <Typography paragraph sx={{ color: '#424242' }}>
                        Модель учитывает опыт, навыки, регион и другие ключевые факторы.
                    </Typography>
                </Box>

                {/* Компонент с табами */}
                <SalaryPredictorTabs />
            </Container>
        </Box>
    );
};

export default LinearRegression;