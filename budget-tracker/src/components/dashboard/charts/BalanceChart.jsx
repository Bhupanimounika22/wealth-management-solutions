import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BalanceChart({ userId }) {
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income (Salary)',
        data: Array(12).fill(0), // Initialize with zeros
        backgroundColor: 'rgba(25, 135, 84, 0.8)',
        borderColor: 'rgba(25, 135, 84, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: Array(12).fill(0),
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
      },
      {
        label: 'Savings',
        data: Array(12).fill(0),
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 14 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.raw.toFixed(2)}`,
        },
      },
      title: {
        display: true,
        text: 'Monthly Budget Overview',
        color: '#ffffff',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: '#ffffff',
          callback: (value) => `$${value}`,
        },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#ffffff' },
      },
    },
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      try {
        // Fetch income (assuming salary is categorized as 'income')
        const incomeResponse = await fetch(`http://localhost:5100/api/income/${user.uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const incomeData = await incomeResponse.json();

        // Fetch expenses
        const expensesResponse = await fetch(`http://localhost:5100/api/expenses/${user.uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const expensesData = await expensesResponse.json();

        // Process data by month
        const monthlyIncome = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);
        const monthlySavings = Array(12).fill(0);

        incomeData.forEach((item) => {
          const month = new Date(item.date).getMonth(); // 0-11 for Jan-Dec
          monthlyIncome[month] += parseFloat(item.amount);
        });

        expensesData.forEach((item) => {
          const month = new Date(item.date).getMonth();
          monthlyExpenses[month] += parseFloat(item.amount);
        });

        // Calculate savings as income - expenses
        for (let i = 0; i < 12; i++) {
          monthlySavings[i] = monthlyIncome[i] - monthlyExpenses[i];
        }

        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Income (Salary)',
              data: monthlyIncome,
              backgroundColor: 'rgba(25, 135, 84, 0.8)',
              borderColor: 'rgba(25, 135, 84, 1)',
              borderWidth: 1,
            },
            {
              label: 'Expenses',
              data: monthlyExpenses,
              backgroundColor: 'rgba(220, 53, 69, 0.8)',
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 1,
            },
            {
              label: 'Savings',
              data: monthlySavings,
              backgroundColor: 'rgba(0, 123, 255, 0.8)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [userId]);

  return (
    <Card className="bg-dark border-light shadow-sm">
      <Card.Body>
        <Bar data={chartData} options={options} />
      </Card.Body>
    </Card>
  );
}