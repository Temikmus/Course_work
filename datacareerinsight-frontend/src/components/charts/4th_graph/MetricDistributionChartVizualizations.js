import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
);

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

const formatRangeLabel = (range) => {
    return `${range.min_value} - ${range.max_value}`;
};

const getBarOptions = (title, model = 'vacancies') => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
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
                        return `Количество: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Диапазоны значений',
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
                    color: colors.text
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Количество',
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
                    color: colors.text
                },
                beginAtZero: true
            }
        }
    };
};

const getPieOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                generateLabels: (chart) => {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => ({
                            text: label,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            hidden: false,
                            index: i
                        }));
                    }
                    return [];
                }
            }
        },
        title: {
            display: true,
            text: title,
            font: {
                size: 16,
                weight: 'bold'
            }
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    // Показываем только количество, без дублирования диапазона
                    return `Количество: ${context.raw}`;
                }

            }
        }
    }
});

export const MetricDistributionBarChart = ({ labels, values, title, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels: labels.map(formatRangeLabel),
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: colors.main,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: colors.hover
        }]
    };

    return <Bar data={data} options={getBarOptions(title, model)} />;
};

export const MetricDistributionPieChart = ({ labels, values, title }) => {
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    const colors = labels.map((_, i) => backgroundColors[i % backgroundColors.length]);

    const data = {
        labels: labels.map(formatRangeLabel),
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: colors,
            borderWidth: 1
        }]
    };

    return <Pie data={data} options={getPieOptions(title)} />;
};