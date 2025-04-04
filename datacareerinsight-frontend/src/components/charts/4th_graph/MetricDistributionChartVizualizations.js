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

const formatRangeLabel = (range) => {
    return `${range.min_value} - ${range.max_value}`;
};

const getBarOptions = (title) => ({
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
                weight: 'bold'
            }
        },
        tooltip: {
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
                    weight: 'bold'
                }
            }
        },
        y: {
            title: {
                display: true,
                text: 'Количество',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            },
            beginAtZero: true
        }
    }
});

const getPieOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right'
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
                    return `${context.label}: ${context.raw}`;
                }
            }
        }
    }
});

export const MetricDistributionBarChart = ({ labels, values, title }) => {
    const data = {
        labels: labels.map(formatRangeLabel),
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    return <Bar data={data} options={getBarOptions(title)} />;
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

    const data = {
        labels: labels.map(formatRangeLabel),
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 1
        }]
    };

    return <Pie data={data} options={getPieOptions(title)} />;
};