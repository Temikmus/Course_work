import React, { useEffect, useRef } from 'react';
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
import { Bar, Line, Pie } from 'react-chartjs-2';

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

const getBarOptions = (title, yAxisTitle, model = 'vacancies') => {
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
                        const value = context.raw.y ?? context.raw;
                        const count = context.dataset.countValues?.[context.dataIndex];
                        return [
                            `Значение: ${value}`,
                            `Наблюдений: ${count}`
                        ];
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
                    color: colors.text
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
                    const label = context.label || '';
                    const value = context.raw;
                    const count = context.dataset.countValues?.[context.dataIndex];
                    return [
                        `${label}: ${value}`,
                        `Наблюдений: ${count}`
                    ];
                }
            }
        }
    }
});

export const MetricColumnBarChart = ({ labels, values, countValues, title, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels,
        datasets: [{
            label: title,
            data: values,
            backgroundColor: colors.main,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: colors.hover,
            countValues: countValues
        }]
    };

    return <Bar data={data} options={getBarOptions(title, title, model)} />;
};

export const MetricColumnLineChart = ({ labels, values, countValues, title, model = 'vacancies' }) => {
    const colors = colorSchemes[model] || colorSchemes.vacancies;

    const data = {
        labels,
        datasets: [{
            label: title,
            data: values,
            borderColor: colors.border,
            backgroundColor: colors.main,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: colors.border,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            countValues: countValues
        }]
    };

    return <Line data={data} options={getBarOptions(title, title, model)} />;
};

export const MetricColumnPieChart = ({ labels, values, countValues, title }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    // Улучшенная палитра с циклическим повторением цветов
    const baseColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    // Генерируем достаточное количество цветов для всех элементов
    const backgroundColors = labels.map((_, index) =>
        baseColors[index % baseColors.length]
    );

    const data = {
        labels: labels.map(label => String(label)),
        datasets: [{
            label: title,
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 1,
            countValues: countValues
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
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
                    },
                    // Добавляем padding для лучшего отображения
                    padding: 20,
                    // Убедимся, что цвета не пропадают
                    usePointStyle: true,
                    pointStyle: 'rect',
                    boxWidth: 20,
                    boxHeight: 20
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
                        const label = context.label || '';
                        const value = context.raw;
                        const count = context.dataset.countValues?.[context.dataIndex];
                        return [
                            `${label}: ${value}`,
                            `Наблюдений: ${count}`
                        ];
                    }
                }
            }
        }
    };

    return <Pie ref={chartRef} data={data} options={options} />;
};