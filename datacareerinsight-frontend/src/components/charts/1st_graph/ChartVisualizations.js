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

export const BarChart = ({ labels, values, columnName }) => {
    const data = {
        labels,
        datasets: [{
            label: 'Количество',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
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
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Категории',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
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
                ticks: {
                    font: {
                        size: 12
                    }
                },
                beginAtZero: true
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export const PieChart = ({ labels, values, columnName }) => {
    const backgroundColors = labels.map((_, i) =>
        `hsl(${(i * 360 / labels.length)}, 70%, 50%)`);

    const data = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: columnName,
                font: {
                    size: 16
                }
            }
        }
    };

    return <Pie data={data} options={options} />;
};

export const ScatterChart = ({ labels, values, columnName }) => {
    const scatterData = labels.map((_, index) => ({
        x: index,
        y: values[index]
    }));

    const data = {
        datasets: [{
            label: 'Количество',
            data: scatterData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            pointRadius: 6,
            pointHoverRadius: 8
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
                    text: 'Категории',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 12
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
                ticks: {
                    font: {
                        size: 12
                    }
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
                }
            }
        }
    };

    return <Scatter data={data} options={options} />;
};