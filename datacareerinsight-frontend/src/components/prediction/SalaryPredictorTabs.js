import React, { useState } from 'react';
import { Box, Button, Paper, Fade } from '@mui/material';
import VacancySalaryPredictor from './vacancy_salary';
import ResumeSalaryPredictor from './resume_salary';

const SalaryPredictorTabs = () => {
    const [activeTab, setActiveTab] = useState('vacancies');

    return (
        <Box sx={{ mb: 6 }}>
            {/* Кнопки переключения */}
            <Box sx={{
                maxWidth: 800,
                margin: 'auto',
                display: 'flex',
                mb: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 2,
                p: 0,

            }}>
                <Button
                    fullWidth
                    variant={activeTab === 'vacancies' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('vacancies')}
                    sx={{
                        py: 1.5,
                        mr: 1,
                        backgroundColor: activeTab === 'vacancies' ? '#81c784' : 'inherit',
                        color: activeTab === 'vacancies' ? '#fff' : '#81c784',
                        borderColor: activeTab === 'vacancies' ? 'transparent' : '#81c784', // Явное указание цвета границы
                        '&:hover': {
                            backgroundColor: activeTab === 'vacancies' ? '#66bb6a' : 'rgba(129, 199, 132, 0.08)',
                            borderColor: activeTab === 'vacancies' ? 'transparent' : '#66bb6a' // Граница при наведении
                        },
                        '&.Mui-focusVisible': { // Убираем синюю обводку при фокусе
                            outline: 'none',
                            boxShadow: 'none'
                        },
                        transition: 'all 0.3s ease',
                        borderRadius: 1
                    }}
                >
                    Вакансии
                </Button>

                <Button
                    fullWidth
                    variant={activeTab === 'resume' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('resume')}
                    sx={{
                        py: 1.5,
                        ml: 1,
                        backgroundColor: activeTab === 'resume' ? '#81c784' : 'inherit',
                        color: activeTab === 'resume' ? '#fff' : '#81c784',
                        borderColor: activeTab === 'resume' ? 'transparent' : '#81c784', // Явное указание цвета границы
                        '&:hover': {
                            backgroundColor: activeTab === 'resume' ? '#66bb6a' : 'rgba(129, 199, 132, 0.08)',
                            borderColor: activeTab === 'resume' ? 'transparent' : '#66bb6a' // Граница при наведении
                        },
                        '&.Mui-focusVisible': { // Убираем синюю обводку при фокусе
                            outline: 'none',
                            boxShadow: 'none'
                        },
                        transition: 'all 0.3s ease',
                        borderRadius: 1
                    }}
                >
                    Резюме
                </Button>
            </Box>

            <Box sx={{ position: 'relative', minHeight: 300 }}>
                <Fade in={activeTab === 'vacancies'} unmountOnExit>
                    <Box sx={{ p: 3 }}>
                        <VacancySalaryPredictor />
                    </Box>
                </Fade>

                <Fade in={activeTab === 'resume'} unmountOnExit>
                    <Box sx={{ p: 3 }}>
                        <ResumeSalaryPredictor />
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};

export default SalaryPredictorTabs;