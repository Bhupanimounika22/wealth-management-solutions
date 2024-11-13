import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { getAuth } from 'firebase/auth'; // Add this import
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensesChart() {
    const [data, setData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                '#dc3545',
                '#fd7e14',
                '#ffc107',
                '#20c997',
                '#0dcaf0',
            ],
            borderWidth: 0,
        }],
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#ffffff80',
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
    };

    useEffect(() => {
        const fetchExpenses = async () => {
          const auth = getAuth();  // Now 'getAuth' is defined
          const user = auth.currentUser;
      
          if (!user) {
            console.error('User not authenticated');
            return;
          }
      
          try {
            const idToken = await user.getIdToken();
      
            const response = await fetch(`http://localhost:5100/api/expenses/${user.uid}`, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });
      
            const data = await response.json();
      
            const filteredData = data.filter(item => item.category !== 'salary');
            const labels = filteredData.map(item => item.category || "Other Category");
            const values = filteredData.map(item => item.amount);
      
            setData({
              labels,
              datasets: [{
                data: values,
                backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#0dcaf0'],
                borderWidth: 0,
              }],
            });
          } catch (error) {
            console.error('Error fetching expense data:', error);
          }
        };
      
        fetchExpenses();
      }, []);
      
    return (
        <Card className="bg-dark border-light h-100">
            <Card.Body>
                <h5 className="mb-4 text-light">Expense Distribution</h5>
                <Doughnut data={data} options={options} />
            </Card.Body>
        </Card>
    );
}
