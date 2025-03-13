// src/components/Chart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Январь', value: 4000 },
    { name: 'Февраль', value: 3000 },
    { name: 'Март', value: 2000 },
    { name: 'Апрель', value: 2780 },
    { name: 'Май', value: 1890 },
];

const Chart = () => {
    return (
        <div>
            <h2>График зарплат</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;
