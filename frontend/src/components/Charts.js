import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const lineData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    {
      label: 'Inscriptions',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    },
  ],
};

const barData = {
  labels: ['Concours A', 'Concours B', 'Concours C', 'Concours D'],
  datasets: [
    {
      label: 'Nombre de participants',
      data: [65, 59, 80, 81],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
    },
  ],
};

const pieData = {
  labels: ['Documents', 'Vidéos', 'Quiz', 'Exercices'],
  datasets: [
    {
      data: [30, 20, 25, 25],
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(239, 68, 68, 0.6)',
      ],
    },
  ],
};

export function LineChart() {
  return <Line options={options} data={lineData} />;
}

export function BarChart() {
  return <Bar options={options} data={barData} />;
}

export function PieChart() {
  return <Pie data={pieData} />;
}

