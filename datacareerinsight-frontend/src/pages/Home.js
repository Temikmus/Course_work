import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import InsightsIcon from '@mui/icons-material/Insights';
import WorkIcon from '@mui/icons-material/Work';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import TimelineIcon from '@mui/icons-material/Timeline';

const Home = () => {
    const theme = useTheme();

    // Стили для клякс неправильной формы
    const blobStyle = {
        position: 'fixed',
        filter: 'blur(60px)',
        opacity: 0.2,
        zIndex: 0,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' // Форма кляксы
    };

    const features = [
        {
            icon: <WorkIcon fontSize="large" color="primary" />,
            title: "Анализ вакансий",
            description: "Таблица с 5,500+ вакансий в сфере Data science с HeadHunter (ноябрь 2024 - апрель 2025), а также интерактивные графики для анализа ситуации",
            path: "/vacancies"
        },
        {
            icon: <PersonSearchIcon fontSize="large" color="primary" />,
            title: "Анализ резюме",
            description: "Таблица с 9,000+ резюме аналитиков данных с HeadHunter (январь 2024 - март 2025), а также интерактивные графики для анализа ситуации",
            path: "/resumes"
        },
        {
            icon: <TimelineIcon fontSize="large" color="primary" />,
            title: "Прогнозирование ЗП",
            description: "Модель линейной регрессии для предсказания зарплаты на основе параметров вакансий или резюме",
            path: "/linear-regression"
        }
    ];

    return (
        <Box sx={{

            pb: 6,
            position: 'relative',
            minHeight: '100vh',
            backgroundColor: '#fff' // Чисто белый фон
        }}>
            {/* Кляксы неправильной формы */}
            <Box sx={{
                ...blobStyle,
                width: '400px',
                height: '300px',
                background: theme.palette.primary.light,
                top: '10%',
                left: '5%',
                transform: 'rotate(45deg)'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '500px',
                height: '200px',
                background: theme.palette.secondary.light,
                bottom: '15%',
                right: '5%',
                borderRadius: '70% 30% 30% 70% / 60% 60% 40% 40%'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '350px',
                height: '400px',
                background: '#ffcc80',
                top: '60%',
                left: '20%',
                borderRadius: '40% 60% 60% 40% / 70% 50% 50% 30%'
            }} />

            <Box sx={{
                ...blobStyle,
                width: '600px',
                height: '250px',
                background: '#a5d6a7',
                top: '20%',
                right: '15%',
                borderRadius: '60% 40% 40% 60% / 50% 50% 50% 50%'
            }} />

            {/* Основной контент */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Hero секция */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 6,
                    background: 'linear-gradient(135deg, #3f51b580 0%, #9c27b080 100%)',
                    color: 'white',
                    py: 8,
                    borderRadius: 2,
                    boxShadow: 3,
                    mx: 2
                }}>
                    <InsightsIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        DataCareerInsight
                    </Typography>
                    <Typography variant="h5" component="h2" sx={{ maxWidth: '800px', margin: '0 auto' }}>
                        Интеллектуальный анализ рынка труда для специалистов по данным
                    </Typography>
                </Box>

                {/* Описание системы */}
                <Box sx={{
                    mb: 6,
                    px: 2,
                    textAlign: 'center'
                }}>
                    <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                        О проекте
                    </Typography>
                    <Typography paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                        DataCareerInsight - это инновационная платформа для анализа рынка труда в сфере Data Science и аналитики данных в России.
                        Мы агрегируем данные с HH.ru, ведущего job-портала в России, и предоставляем инструменты для визуализации ситуации на рынке труда, а также прогнозирование заработной платы на основе параметров.
                    </Typography>
                    <Typography paragraph sx={{ fontSize: '1.1rem' }}>
                        Основная цель проекта - дать соискателям и работодателям объективную картину рынка труда через интерактивные
                        инструменты анализа и машинного обучения.
                    </Typography>
                </Box>

                {/* Фичи */}
                <Box sx={{ px: 2, mb: 8 }}>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                        Возможности системы
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={10} md={6} lg={4} key={index}>
                                <Card sx={{
                                    width: '100%',
                                    maxWidth: 400,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'scale(1.03)' },
                                    margin: '0 auto'
                                }}>
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        {feature.icon}
                                        <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography paragraph sx={{ mb: 3 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Button
                                            component={Link}
                                            to={feature.path}
                                            variant="contained"
                                            size="large"
                                        >
                                            Перейти
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Статистика */}
                <Box sx={{
                    textAlign: 'center',
                    px: 2,
                    mb: 8
                }}>
                    <Typography variant="h4" gutterBottom>
                        Охват данных
                    </Typography>
                    <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '800px', margin: '0 auto' }}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="h3" color="primary">5.5K+</Typography>
                            <Typography>Вакансий</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="h3" color="primary">9K+</Typography>
                            <Typography>Резюме</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="h3" color="primary">13+</Typography>
                            <Typography>Параметров у вакансий</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="h3" color="primary">20+</Typography>
                            <Typography>Параметров у резюме</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="h3" color="primary">16</Typography>
                            <Typography>Месяцев</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;