import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SalaryPredictionResult = ({ data }) => {
    if (!data) return null;

    // Функция для форматирования чисел
    const formatNumber = (num) => {
        if (num === undefined || num === null) return 'N/A';
        return typeof num === 'number' ? num.toLocaleString('ru-RU', { maximumFractionDigits: 4 }) : num;
    };

    return (
        <Paper elevation={2} sx={{
            p: 3,
            mt: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            border: '1px solid rgba(129, 199, 132, 0.2)'
        }}>
            {/* Заголовок с результатом */}
            <Box textAlign="center" mb={3}>
                <Typography variant="h5" sx={{
                    color: '#2e7d32',
                    fontWeight: 'bold',
                    mb: 1
                }}>
                    Результаты предсказания
                </Typography>
                <Typography variant="h3" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    py: 1
                }}>
                    {data.predicted_salary.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#616161', mt: 1 }}>
                    Доверительный интервал: {formatNumber(data.model_info.prediction_summary.confidence_interval.lower)} - {formatNumber(data.model_info.prediction_summary.confidence_interval.upper)} ₽
                </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(129, 199, 132, 0.3)' }} />

            

            {/* Детали модели */}
            <Accordion defaultExpanded sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                mt: 2
            }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2e7d32' }} />}>
                    <Typography variant="h6" sx={{ color: 'black' }}>
                        Детали модели
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        {/* Метрики модели */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{
                                p: 2,
                                height: '100%',
                                border: '1px solid rgba(129, 199, 132, 0.2)',
                                borderRadius: 2
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{
                                    fontWeight: 'bold',
                                    color: '#2e7d32'
                                }}>
                                    Основные метрики
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            {[
                                                { name: 'R²', value: data.model_info.model_metrics.r_squared.value, desc: data.model_info.model_metrics.r_squared.interpretation },
                                                { name: 'Скорректированный R²', value: data.model_info.model_metrics.adj_r_squared.value },
                                                { name: 'RMSE', value: data.model_info.model_metrics.rmse.value, desc: data.model_info.model_metrics.rmse.interpretation },
                                                { name: 'Среднее предсказание', value: data.model_info.prediction_summary.mean },
                                                { name: 'Медианное предсказание', value: data.model_info.prediction_summary.median }
                                            ].map((metric) => (
                                                <TableRow key={metric.name}>
                                                    <TableCell sx={{ color: '#616161' }}>{metric.name}</TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: '#2e7d32',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {formatNumber(metric.value)}
                                                        {metric.desc && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {metric.desc}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Анализ остатков */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{
                                p: 2,
                                height: '100%',
                                border: '1px solid rgba(129, 199, 132, 0.2)',
                                borderRadius: 2
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{
                                    fontWeight: 'bold',
                                    color: '#2e7d32'
                                }}>
                                    Анализ остатков
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            {[
                                                { name: 'Тест на нормальность', value: data.model_info.residual_analysis.normality.test, desc: data.model_info.residual_analysis.normality.interpretation },
                                                { name: 'Статистика', value: data.model_info.residual_analysis.normality.statistic },
                                                { name: 'p-value', value: data.model_info.residual_analysis.normality.p_value },
                                                { name: 'Гетероскедастичность', value: data.model_info.residual_analysis.heteroskedasticity.test, desc: data.model_info.residual_analysis.heteroskedasticity.interpretation },
                                                { name: 'p-value', value: data.model_info.residual_analysis.heteroskedasticity.p_value }
                                            ].map((item) => (
                                                <TableRow key={item.name}>
                                                    <TableCell sx={{ color: '#616161' }}>{item.name}</TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: '#2e7d32',
                                                        fontWeight: item.desc ? 'bold' : 'normal'
                                                    }}>
                                                        {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                                                        {item.desc && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {item.desc}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Влияющие факторы */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{
                                p: 2,
                                border: '1px solid rgba(129, 199, 132, 0.2)',
                                borderRadius: 2
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{
                                    fontWeight: 'bold',
                                    color: '#2e7d32'
                                }}>
                                    Влияющие факторы
                                </Typography>
                                <Grid container spacing={2}>
                                    {/* Положительные факторы */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{
                                            color: '#2e7d32',
                                            fontWeight: 'bold',
                                            mb: 1
                                        }}>
                                            Положительное влияние:
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Фактор</TableCell>
                                                        <TableCell align="right">Коэффициент</TableCell>
                                                        <TableCell align="right">p-value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.model_info.feature_analysis.top_positive.map(factor => (
                                                        <TableRow key={factor.feature}>
                                                            <TableCell>{factor.feature}</TableCell>
                                                            <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                                                {formatNumber(factor.coefficient)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatNumber(factor.p_value)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    {/* Отрицательные факторы */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{
                                            color: '#d32f2f',
                                            fontWeight: 'bold',
                                            mb: 1
                                        }}>
                                            Отрицательное влияние:
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Фактор</TableCell>
                                                        <TableCell align="right">Коэффициент</TableCell>
                                                        <TableCell align="right">p-value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.model_info.feature_analysis.top_negative.map(factor => (
                                                        <TableRow key={factor.feature}>
                                                            <TableCell>{factor.feature}</TableCell>
                                                            <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                                                {formatNumber(factor.coefficient)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatNumber(factor.p_value)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Метаинформация */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{
                                p: 2,
                                border: '1px solid rgba(129, 199, 132, 0.2)',
                                borderRadius: 2
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{
                                    fontWeight: 'bold',
                                    color: '#2e7d32'
                                }}>
                                    Метаинформация о модели
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" sx={{ color: '#424242' }}>
                                            <Box component="span" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Название:</Box> {data.model_info.model_info.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" sx={{ color: '#424242' }}>
                                            <Box component="span" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Признаков:</Box> {data.model_info.model_info.features_count}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2" sx={{ color: '#424242' }}>
                                            <Box component="span" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Выборка:</Box> {data.model_info.model_info.sample_size}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ color: '#424242' }}>
                                            <Box component="span" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Уравнение:</Box> {data.model_info.model_info.equation}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default SalaryPredictionResult;