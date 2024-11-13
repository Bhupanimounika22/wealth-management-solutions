import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BalanceChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        backgroundColor: 'rgba(25, 135, 84, 0.7)',
      },
      {
        label: 'Expenses',
        data: [],
        backgroundColor: 'rgba(220, 53, 69, 0.7)',
      },
      {
        label: 'Savings',
        data: [],
        backgroundColor: 'rgba(0, 123, 255, 0.7)', // Blue for savings
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff80',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff80',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff80',
        },
      },
    },
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        return;
      }
  
      const idToken = await user.getIdToken();
      try {
        const response = await fetch(`http://localhost:5100/transactions-summary/${user.uid}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
  
        const { income, expenses, savings } = await response.json();
  
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Income',
              data: income,
              backgroundColor: 'rgba(25, 135, 84, 0.7)',
            },
            {
              label: 'Expenses',
              data: expenses,
              backgroundColor: 'rgba(220, 53, 69, 0.7)',
            },
            {
              label: 'Savings',
              data: savings,
              backgroundColor: 'rgba(0, 123, 255, 0.7)', // Blue for savings
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching transactions summary:', error);
      }
    };
  
    fetchTransactions();
  }, []);

  return (
    <Card className="bg-dark border-light">
      <Card.Body>
        <h5 className="mb-4 text-light">Income vs Expenses</h5>
        <Bar data={chartData} options={options} />
      </Card.Body>
    </Card>
  );
}
