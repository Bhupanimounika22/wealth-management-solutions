import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { getAuth } from 'firebase/auth'; // Import getAuth for Firebase authentication
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function IncomeChart() {
    const [data, setData] = useState({
        labels: [],
        datasets: [{
            label: 'Income',
            data: [],
            fill: true,
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            tension: 0.4,
        }],
    });

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true },
            x: {},
        },
    };

    useEffect(() => {
        const fetchIncome = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error('User not authenticated');
                return;
            }

            try {
                const idToken = await user.getIdToken();
                const response = await fetch(`http://localhost:5100/api/income/${user.uid}`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                const data = await response.json();

                // Assuming the income data contains the date and amount
                const labels = data.map(item => item.date);
                const values = data.map(item => item.amount);

                setData(prev => ({
                    ...prev,
                    labels,
                    datasets: [{ ...prev.datasets[0], data: values }],
                }));

            } catch (error) {
                console.error('Error fetching income data:', error);
            }
        };

        fetchIncome();
    }, []);

    return (
        <Card className="bg-dark border-light h-100">
            <Card.Body>
                <h5 className="mb-4 text-light">Income Trend</h5>
                <Line data={data} options={options} />
            </Card.Body>
        </Card>
    );
}
