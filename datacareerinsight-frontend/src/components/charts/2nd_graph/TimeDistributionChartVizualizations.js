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

const formatDateLabel = (labels) => {
    return labels.map(item => `${months[item.month - 1]} ${item.year}`);
};

const getTimeOptions = (title, yAxisTitle, isNumeric) => ({
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
            color: '#2c3e50'
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
                color: '#2c3e50'
            },
            ticks: {
                font: {
                    size: 12,
                    family: "'Roboto', sans-serif"
                },
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
                color: '#2c3e50'
            },
            ticks: {
                font: {
                    size: 12,
                    family: "'Roboto', sans-serif"
                },
                callback: isNumeric ? (value) => Number(value).toLocaleString() : undefined
            },
            beginAtZero: true
        }
    }
});

export const TimeBarChart = ({ labels, values, countValues, title, isNumeric, modeValues }) => {
    const data = {
        labels: formatDateLabel(labels),
        datasets: [{
            label: title,
            data: isNumeric ? values.map(Number) : countValues, // Для числовых - значения, для нечисловых - количество
            backgroundColor: isNumeric ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 159, 64, 0.7)',
            borderColor: isNumeric ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: isNumeric ? 'rgba(54, 162, 235, 0.9)' : 'rgba(255, 159, 64, 0.9)',
            countValues: countValues,
            modeValues: !isNumeric ? values : null // Для тултипов
        }]
    };

    const yAxisTitle = isNumeric ? title : 'Количество наблюдений с этим значением';
    return <Bar data={data} options={getTimeOptions(title, yAxisTitle, isNumeric)} />;
};

export const TimeLineChart = ({ labels, values, countValues, title, isNumeric, modeValues }) => {
    const data = {
        labels: formatDateLabel(labels),
        datasets: [{
            label: title,
            data: isNumeric ? values.map(Number) : countValues,
            borderColor: isNumeric ? 'rgba(52, 152, 219, 1)' : 'rgba(155, 89, 182, 1)',
            backgroundColor: isNumeric ? 'rgba(52, 152, 219, 0.1)' : 'rgba(155, 89, 182, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: isNumeric ? 'rgba(52, 152, 219, 1)' : 'rgba(155, 89, 182, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            countValues: countValues,
            modeValues: !isNumeric ? values : null
        }]
    };

    const yAxisTitle = isNumeric ? title : 'Количество наблюдений с этим значением';
    return <Line data={data} options={getTimeOptions(title, yAxisTitle, isNumeric)} />;
};



export const TimeScatterChart = ({ labels, values, countValues, title, isNumeric, modeValues }) => {
    const formattedLabels = formatDateLabel(labels);

    const scatterData = labels.map((_, index) => ({
        x: index, // Оставляем индекс для позиционирования
        y: isNumeric ? Number(values[index]) : countValues[index]
    }));

    const data = {
        labels: formattedLabels, // Добавляем labels для использования в ticks
        datasets: [{
            label: title,
            data: scatterData,
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
            borderColor: 'rgba(192, 57, 43, 1)',
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
        ...getTimeOptions(title, isNumeric ? title : 'Количество наблюдений с этим значением', isNumeric),
        scales: {
            x: {
                type: 'category',
                labels: formattedLabels, // Используем отформатированные даты
                title: {
                    display: true,

                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif"
                    },
                    color: '#2c3e50'
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif"
                    },
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
                    color: '#2c3e50'
                },
                beginAtZero: true
            }
        }
    };

    return <Scatter data={data} options={options} />;
};