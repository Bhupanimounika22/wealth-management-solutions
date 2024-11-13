import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const initialFormData = {
  type: 'expense',
  account: '',
  category: '',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  isRecurring: false,
  recurringFrequency: 'monthly',
};

export default function TransactionForm() {
  const [formData, setFormData] = useState(initialFormData);

  const addTransaction = async (data) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User is not authenticated');
      }

      const idToken = await user.getIdToken();

      // Sending transaction data with the user's uid
      const response = await fetch(`http://localhost:5100/transactions/${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      toast.success('Transaction added successfully');
    } catch (error) {
      console.error(error);
      toast.error('Error adding transaction');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If the category is 'salary', set the type to 'income'
    const transactionData = {
      ...formData,
      type: formData.category === 'salary' ? 'income' : formData.type,
    };

    await addTransaction(transactionData);
  };

  return (
    <Card className="bg-dark border-success mb-4">
      <Card.Body>
        <h5 className="text-light">Add Transaction</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 text-light">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 text-light">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="salary">Salary</option>
              <option value="rent">Rent</option>
              <option value="groceries">Groceries</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 text-light">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
          </Form.Group>

          <Form.Group className="mb-3 text-light">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3 text-light">
            <Form.Check
              type="checkbox"
              label="Recurring Transaction"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            />
          </Form.Group>

          {formData.isRecurring && (
            <Form.Group className="mb-3 text-light">
              <Form.Label>Frequency</Form.Label>
              <Form.Select  
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Form.Select>
            </Form.Group>
          )}

          <Button variant="success" type="submit" className="w-100 text-light">
            Add Transaction
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
