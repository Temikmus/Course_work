import React from 'react';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
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

export const BarChart = ({ labels, values, columnName, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels,
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: colors.main,
            borderColor: colors.border,
            borderWidth: 1,
            hoverBackgroundColor: colors.hover
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: columnName,
                font: {
                    size: 16
                },
                color: colors.text
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12
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
                        weight: 'bold'
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: colors.text
                },
                beginAtZero: true
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export const PieChart = ({ labels, values, columnName }) => {
    // Новая палитра для круговой диаграммы
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    // Циклически повторяем цвета, если элементов больше чем цветов
    const colors = labels.map((_, i) => backgroundColors[i % backgroundColors.length]);

    const data = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,  // Используем стиль точек вместо прямоугольников
                    pointStyle: 'circle', // Указываем использовать кружочки
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
                text: columnName,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `Количество: ${context.raw}`;
                    }
                }
            }
        }
    };

    return <Pie data={data} options={options} />;
};

export const ScatterChart = ({ labels, values, columnName, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const scatterData = labels.map((_, index) => ({
        x: index,
        y: values[index]
    }));

    const data = {
        datasets: [{
            label: 'Количество',
            data: scatterData,
            backgroundColor: colors.main,
            borderColor: colors.border,
            pointRadius: 6,
            pointHoverRadius: 8,
            hoverBackgroundColor: colors.hover
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                labels: labels,
                title: {
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12
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
                        weight: 'bold'
                    },
                    color: colors.text
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: colors.text
                },
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: columnName,
                font: {
                    size: 16
                },
                color: colors.text
            }
        }
    };

    return <Scatter data={data} options={options} />;
};