import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
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
        return typeof num === 'number' ? num.toFixed(4) : num;
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: '#f9f9f9' }}>
            <Box textAlign="center" mb={3}>
                <Typography variant="h5" color="primary">
                    Результаты предсказания
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                    {data.predicted_salary.toLocaleString('ru-RU')} ₽
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Основная информация о предсказании */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Использованные параметры</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {Object.entries(data.used_parameters).map(([key, value]) => {
                            if (typeof value === 'object' && value !== null) {
                                return (
                                    <Grid item xs={12} key={key}>
                                        <Typography variant="subtitle2">{key}:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                <Chip
                                                    key={subKey}
                                                    label={`${subKey}: ${subValue}`}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                );
                            }
                            return (
                                <Grid item xs={6} sm={4} key={key}>
                                    <Typography variant="body2">
                                        <strong>{key}:</strong> {value.toString()}
                                    </Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Детальная информация о модели */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Детальная информация о модели</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        {/* Метрики модели */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Основные метрики модели
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>R²</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.model_metrics.r_squared.value)}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {data.model_info.model_metrics.r_squared.interpretation}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Скорректированный R²</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.model_metrics.adj_r_squared.value)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>RMSE</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.model_metrics.rmse.value)}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {data.model_info.model_metrics.rmse.interpretation}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Среднее предсказание</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.prediction_summary.mean)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Медианное предсказание</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.prediction_summary.median)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Анализ остатков */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Анализ остатков
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Тест на нормальность</TableCell>
                                                <TableCell align="right">
                                                    {data.model_info.residual_analysis.normality.test}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {data.model_info.residual_analysis.normality.interpretation}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Статистика</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.residual_analysis.normality.statistic)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>p-value</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.residual_analysis.normality.p_value)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Гетероскедастичность</TableCell>
                                                <TableCell align="right">
                                                    {data.model_info.residual_analysis.heteroskedasticity.test}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {data.model_info.residual_analysis.heteroskedasticity.interpretation}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>p-value</TableCell>
                                                <TableCell align="right">
                                                    {formatNumber(data.model_info.residual_analysis.heteroskedasticity.p_value)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Топ влияющие факторы */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Топ влияющие факторы
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" color="success.main" gutterBottom>
                                            Положительное влияние:
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Фактор</TableCell>
                                                        <TableCell align="right">Коэффициент</TableCell>
                                                        <TableCell align="right">p-value</TableCell>
                                                        <TableCell>Доверительный интервал</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.model_info.feature_analysis.top_positive.map(factor => (
                                                        <TableRow key={factor.feature}>
                                                            <TableCell>{factor.feature}</TableCell>
                                                            <TableCell align="right" sx={{ color: 'success.main' }}>
                                                                {formatNumber(factor.coefficient)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatNumber(factor.p_value)}
                                                            </TableCell>
                                                            <TableCell>
                                                                [{formatNumber(factor.conf_lower)}, {formatNumber(factor.conf_upper)}]
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" color="error.main" gutterBottom>
                                            Отрицательное влияние:
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Фактор</TableCell>
                                                        <TableCell align="right">Коэффициент</TableCell>
                                                        <TableCell align="right">p-value</TableCell>
                                                        <TableCell>Доверительный интервал</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.model_info.feature_analysis.top_negative.map(factor => (
                                                        <TableRow key={factor.feature}>
                                                            <TableCell>{factor.feature}</TableCell>
                                                            <TableCell align="right" sx={{ color: 'error.main' }}>
                                                                {formatNumber(factor.coefficient)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatNumber(factor.p_value)}
                                                            </TableCell>
                                                            <TableCell>
                                                                [{formatNumber(factor.conf_lower)}, {formatNumber(factor.conf_upper)}]
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

                        {/* Все признаки */}
                        <Grid item xs={12}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1">Все признаки модели</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Фактор</TableCell>
                                                    <TableCell align="right">Коэффициент</TableCell>
                                                    <TableCell align="right">p-value</TableCell>
                                                    <TableCell>Значимость</TableCell>
                                                    <TableCell>Доверительный интервал</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.model_info.feature_analysis.all_features.map(factor => (
                                                    <TableRow
                                                        key={factor.feature}
                                                        sx={{
                                                            backgroundColor: factor.significant ? 'rgba(46, 125, 50, 0.05)' : 'inherit',
                                                            '&:hover': { backgroundColor: 'action.hover' }
                                                        }}
                                                    >
                                                        <TableCell>{factor.feature}</TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(factor.coefficient)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(factor.p_value)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={factor.significant ? 'Да' : 'Нет'}
                                                                size="small"
                                                                color={factor.significant ? 'success' : 'default'}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            [{formatNumber(factor.conf_lower)}, {formatNumber(factor.conf_upper)}]
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>

                        {/* Метаинформация о модели */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Метаинформация о модели
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2">
                                            <strong>Название модели:</strong> {data.model_info.model_info.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2">
                                            <strong>Количество признаков:</strong> {data.model_info.model_info.features_count}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2">
                                            <strong>Размер выборки:</strong> {data.model_info.model_info.sample_size}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="body2">
                                            <strong>Доверительный интервал:</strong> [
                                            {formatNumber(data.model_info.prediction_summary.confidence_interval.lower)},
                                            {formatNumber(data.model_info.prediction_summary.confidence_interval.upper)}]
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2">
                                            <strong>Уравнение модели:</strong> {data.model_info.model_info.equation}
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