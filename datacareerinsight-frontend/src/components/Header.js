import React from 'react';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="sticky" sx={{
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: 'none',
            borderBottom: '1px solid #e0e0e0'
        }}>
            <Container maxWidth="xl">
                <Toolbar>
                    <Box sx={{ display: 'flex', gap: '20px' }}>
                        <Button
                            component={NavLink}
                            to="/"
                            sx={{
                                color: 'inherit',
                                '&.active': { fontWeight: 'bold' }
                            }}
                        >
                            Главная
                        </Button>
                        <Button
                            component={NavLink}
                            to="/vacancies"
                            sx={{
                                color: 'inherit',
                                '&.active': { fontWeight: 'bold' }
                            }}
                        >
                            Вакансии
                        </Button>
                        <Button
                            component={NavLink}
                            to="/resumes"
                            sx={{
                                color: 'inherit',
                                '&.active': { fontWeight: 'bold' }
                            }}
                        >
                            Резюме
                        </Button>
                        <Button
                            component={NavLink}
                            to="/linear-regression"
                            sx={{
                                color: 'inherit',
                                '&.active': { fontWeight: 'bold' }
                            }}
                        >
                            Прогнозирование
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;