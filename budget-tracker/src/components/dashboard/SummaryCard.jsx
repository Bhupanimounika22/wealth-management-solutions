import { getAuth } from 'firebase/auth';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

export default function SummaryCard() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const idToken = await user.getIdToken();
      try {
        const response = await fetch(`http://localhost:5100/api/income/${user.uid}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();
        setIncome(data);
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoadingIncome(false);
      }
    };

    const fetchExpenses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const idToken = await user.getIdToken();
      try {
        const response = await fetch(`http://localhost:5100/api/expenses/${user.uid}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchIncome();
    fetchExpenses();
  }, []);

  const totalIncome = income.reduce((total, item) => total + parseFloat(item.amount), 0);
  const totalExpenses = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  const balance = totalIncome - totalExpenses;

  return (
    <Card className="bg-dark border-light">
      <Card.Body>
        <h5 className="mb-4 text-light">Yearly Summary</h5>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-success bg-opacity-25 p-2 me-3">
              <TrendingUp className="text-success" size={24} />
            </div>
            <div>
              <div className="text-light">Income</div>
              <div className="h5 mb-0 text-light">
                {loadingIncome ? 'Loading...' : `$${totalIncome.toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 text-light">
          <div className="d-flex align-items-center text-light">
            <div className="rounded-circle bg-danger bg-opacity-25 p-2 me-3">
              <TrendingDown className="text-danger" size={24} />
            </div>
            <div>
              <div className="text-light">Expenses</div>
              <div className="h5 mb-0">
                {loadingExpenses ? 'Loading...' : `$${totalExpenses.toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center text-light">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary bg-opacity-25 p-2 me-3">
              <DollarSign className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-light">Balance</div>
              <div className="h5 mb-0">{`$${balance.toFixed(2)}`}</div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
