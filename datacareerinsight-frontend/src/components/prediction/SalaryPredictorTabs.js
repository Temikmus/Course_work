import React, { useState } from 'react';
import { Box, Button, Paper, Fade } from '@mui/material';
import VacancySalaryPredictor from './vacancy_salary';
import ResumeSalaryPredictor from './resume_salary';

const SalaryPredictorTabs = () => {
    const [activeTab, setActiveTab] = useState('vacancies');

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
            {/* Кнопки переключения */}
            <Box sx={{ display: 'flex', mb: 2 }}>
                <Button
                    variant={activeTab === 'vacancies' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('vacancies')}
                    sx={{
                        flex: 1,
                        py: 1.5,
                        mr: 1,
                        backgroundColor: activeTab === 'vacancies' ? '#1976d2' : 'inherit',
                        color: activeTab === 'vacancies' ? '#fff' : '#1976d2',
                        '&:hover': {
                            backgroundColor: activeTab === 'vacancies' ? '#1565c0' : 'rgba(25, 118, 210, 0.08)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Вакансии
                </Button>

                <Button
                    variant={activeTab === 'resume' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('resume')}
                    sx={{
                        flex: 1,
                        py: 1.5,
                        ml: 1,
                        backgroundColor: activeTab === 'resume' ? '#d32f2f' : 'inherit',
                        color: activeTab === 'resume' ? '#fff' : '#d32f2f',
                        '&:hover': {
                            backgroundColor: activeTab === 'resume' ? '#c62828' : 'rgba(211, 47, 47, 0.08)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Резюме
                </Button>
            </Box>

            {/* Контент с анимацией */}
            <Paper elevation={3}>
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
            </Paper>
        </Box>
    );
};

export default SalaryPredictorTabs;