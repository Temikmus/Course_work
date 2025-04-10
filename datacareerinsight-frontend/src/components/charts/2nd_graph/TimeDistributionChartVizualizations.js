import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Title,
    TimeScale
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Title,
    TimeScale
);

const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const colorSchemes = {
    vacancies: {
        main: 'rgba(93, 156, 236, 0.7)',      // #5d9cec с прозрачностью (основной цвет)
        border: 'rgba(59, 120, 204, 1)',      // #3b78cc (более тёмный оттенок)
        hover: 'rgba(77, 143, 232, 0.8)',     // #4d8fe8 (промежуточный насыщенный)
        text: '#1a3d6b'                       // Тёмно-синий для контраста
    },
    resume: {
        main: 'rgba(179, 157, 219, 0.7)',     // Оставляем как было (фиолетовая схема)
        border: 'rgba(149, 117, 205, 1)',
        hover: 'rgba(156, 126, 211, 0.8)',
        text: '#512da8'
    }
};

const formatDateLabel = (labels) => {
    return labels.map(item => `${months[item.month - 1]} ${item.year}`);
};

const getTimeOptions = (title, yAxisTitle, isNumeric, model = 'vacancies') => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Roboto', sans-serif"
                },
                color: colors.text
            },
            tooltip: {
                backgroundColor: '#34495e',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 4,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        const value = context.raw.y ?? context.raw;
                        const count = context.dataset.countValues?.[context.dataIndex];
                        const modeValue = context.dataset.modeValues?.[context.dataIndex];

                        if (isNumeric) {
                            return [
                                `Значение: ${Number(value).toLocaleString()}`,
                                `Наблюдений с этим значением: ${count}`
                            ];
                        } else {
                            return [
                                `Мода: ${modeValue}`,
                                `Наблюдений с этим значением: ${count}`
                            ];
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                title: {
                    display: true,
                    text: yAxisTitle,
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text,
                    callback: isNumeric ? (value) => Number(value).toLocaleString() : undefined
                },
                beginAtZero: true
            }
        }
    };
};

export const TimeBarChart = ({ labels, values, countValues, title, isNumeric, modeValues, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels: formatDateLabel(labels),
        datasets: [{
            label: title,
            data: isNumeric ? values.map(Number) : countValues,
            backgroundColor: colors.main,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: colors.hover,
            countValues: countValues,
            modeValues: !isNumeric ? values : null
        }]
    };

    const yAxisTitle = isNumeric ? title : 'Количество наблюдений с этим значением';
    return <Bar data={data} options={getTimeOptions(title, yAxisTitle, isNumeric, model)} />;
};

export const TimeLineChart = ({ labels, values, countValues, title, isNumeric, modeValues, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels: formatDateLabel(labels),
        datasets: [{
            label: title,
            data: isNumeric ? values.map(Number) : countValues,
            borderColor: colors.border,
            backgroundColor: colors.main,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: colors.border,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            countValues: countValues,
            modeValues: !isNumeric ? values : null
        }]
    };

    const yAxisTitle = isNumeric ? title : 'Количество наблюдений с этим значением';
    return <Line data={data} options={getTimeOptions(title, yAxisTitle, isNumeric, model)} />;
};

export const TimeScatterChart = ({ labels, values, countValues, title, isNumeric, modeValues, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;
    const formattedLabels = formatDateLabel(labels);

    const scatterData = labels.map((_, index) => ({
        x: index,
        y: isNumeric ? Number(values[index]) : countValues[index]
    }));

    const data = {
        labels: formattedLabels,
        datasets: [{
            label: title,
            data: scatterData,
            backgroundColor: colors.main,
            borderColor: colors.border,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: isNumeric,
            borderWidth: 2,
            lineTension: isNumeric ? 0.3 : undefined,
            countValues: countValues,
            modeValues: !isNumeric ? values : null
        }]
    };

    const options = {
        ...getTimeOptions(title, isNumeric ? title : 'Количество наблюдений с этим значением', isNumeric, model),
        scales: {
            x: {
                type: 'category',
                labels: formattedLabels,
                title: {
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                title: {
                    display: true,
                    text: isNumeric ? title : 'Количество наблюдений с этим значением',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif"
                    },
                    color: colors.text
                },
                beginAtZero: true
            }
        }
    };

    return <Scatter data={data} options={options} />;
};