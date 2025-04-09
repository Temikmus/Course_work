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

const getBarOptions = (title, yAxisTitle) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,

            font: {
                size: 16,
                weight: 'bold'
            }
        },
        tooltip: {
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
                    weight: 'bold'
                }
            }
        },
        y: {
            title: {
                display: true,
                text: yAxisTitle,
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

export const MetricColumnBarChart = ({ labels, values, countValues, title }) => {
    const data = {
        labels,
        datasets: [{
            label: title,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            countValues: countValues
        }]
    };

    return <Bar data={data} options={getBarOptions(title, title)} />;
};

export const MetricColumnLineChart = ({ labels, values, countValues, title }) => {
    const data = {
        labels,
        datasets: [{
            label: title,
            data: values,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            borderWidth: 2,
            countValues: countValues
        }]
    };

    return <Line data={data} options={getBarOptions(title, title)} />;
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

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    const data = {
        labels: labels.map(label => String(label)), // Преобразуем в строки
        datasets: [{
            label: title,
            data: values,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 1,
            countValues: countValues
        }]
    };

    return <Pie ref={chartRef} data={data} options={getPieOptions(title)} />;
};