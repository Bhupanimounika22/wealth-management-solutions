const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK with environment variable for security
const serviceAccount = require('Enter-url-json file');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'enter-your-realtime database url',
});

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
app.use(bodyParser.json());
const goalsDatabase = {};

// Middleware for authenticating Firebase ID token
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Route to handle adding transactions
// Route to fetch income and expense transactions for a user
app.post('/transactions/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;

  // Ensure the userId from URL matches the authenticated user
  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const transactionData = req.body;

    // Add transaction data to Firebase Realtime Database
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);
    const newTransactionRef = transactionsRef.push();
    await newTransactionRef.set({
      type: transactionData.type,
      category: transactionData.category,
      amount: transactionData.amount,
      description: transactionData.description,
      date: transactionData.date,
      isRecurring: transactionData.isRecurring,
      recurringFrequency: transactionData.recurringFrequency,
    });

    res.status(200).json({ message: 'Transaction added successfully' });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error adding transaction', error: error.message });
  }
});






// Route to handle fetching income transactions
app.get('/api/income/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;

  // Ensure the userId from URL matches the authenticated user
  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    // Fetch income data from the user's specific data in Firebase
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);
    const snapshot = await transactionsRef.orderByChild('type').equalTo('income').once('value');

    const incomeData = [];
    snapshot.forEach(childSnapshot => {
      const transaction = childSnapshot.val();
      incomeData.push({
        date: transaction.date,
        amount: transaction.amount,
      });
    });

    res.status(200).json(incomeData);
  } catch (error) {
    console.error('Error fetching income data:', error);
    res.status(500).json({ message: 'Error fetching income data', error: error.message });
  }
});

// Route to handle fetching expense transactions
app.get('/api/expenses/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;

  // Ensure the userId matches the authenticated user
  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);
    const snapshot = await transactionsRef.orderByChild('type').equalTo('expense').once('value');

    const expensesData = [];
    snapshot.forEach(childSnapshot => {
      const transaction = childSnapshot.val();
      expensesData.push({
        id: childSnapshot.key,
        category: transaction.category,
        amount: transaction.amount,
      });
    });

    res.status(200).json(expensesData);
  } catch (error) {
    console.error('Error fetching expense data:', error);
    res.status(500).json({ message: 'Error fetching expense data', error: error.message });
  }
});
app.get('/transactions-summary/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;

  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);

    // Fetch income
    const incomeSnapshot = await transactionsRef.orderByChild('type').equalTo('income').once('value');
    const income = [];
    incomeSnapshot.forEach(childSnapshot => {
      income.push(childSnapshot.val().amount);
    });

    // Fetch expenses
    const expensesSnapshot = await transactionsRef.orderByChild('type').equalTo('expense').once('value');
    const expenses = [];
    expensesSnapshot.forEach(childSnapshot => {
      expenses.push(childSnapshot.val().amount);
    });

    // Fetch savings (optional logic for savings)
    const savings = income.map((inc, idx) => inc - (expenses[idx] || 0));

    res.status(200).json({ income, expenses, savings });
  } catch (error) {
    console.error('Error fetching transactions summary:', error);
    res.status(500).json({ message: 'Error fetching transactions summary', error: error.message });
  }
});
 // POST route to create a new goal for a user
app.post('/goals/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;
  const newGoal = {
    id: Date.now().toString(), // Unique ID for the goal
    name: req.body.name,
    target: req.body.target,
    current: req.body.current,
    deadline: req.body.deadline,
  };

  try {
    // Store the new goal in Firebase Realtime Database
    const goalRef = admin.database().ref(`users/${userId}/goals`);
    await goalRef.push(newGoal);

    res.status(201).json({ goalId: newGoal.id });
  } catch (error) {
    console.error('Error saving goal:', error);
    res.status(500).json({ message: 'Error saving goal', error: error.message });
  }
});

// GET route to fetch goals for a user
app.get('/goals/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch goals from Firebase Realtime Database
    const goalRef = admin.database().ref(`users/${userId}/goals`);
    const snapshot = await goalRef.once('value');

    const goals = [];
    snapshot.forEach(childSnapshot => {
      const goal = childSnapshot.val();
      goals.push({
        id: childSnapshot.key,
        name: goal.name,
        target: goal.target,
        current: goal.current,
        deadline: goal.deadline,
      });
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
});

// PUT route to update a specific goal for a user
app.put('/goals/:userId/:goalId', authenticate, async (req, res) => {
  const { userId, goalId } = req.params;
  const goalData = req.body;

  try {
    // Update the goal in Firebase Realtime Database
    const goalRef = admin.database().ref(`users/${userId}/goals/${goalId}`);
    await goalRef.update(goalData);

    res.status(200).json({ message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

// DELETE route to remove a specific goal for a user
app.delete('/goals/:userId/:goalId', authenticate, async (req, res) => {
  const { userId, goalId } = req.params;

  try {
    // Delete the goal from Firebase Realtime Database
    const goalRef = admin.database().ref(`users/${userId}/goals/${goalId}`);
    await goalRef.remove();

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
});
// Route to fetch transactions for a user within a date range
app.get('/api/transactions/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;
  const { startDate, endDate } = req.query;

  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);
    const snapshot = await transactionsRef.once('value');
    const transactions = snapshot.val() || {};

    const filteredTransactions = Object.values(transactions).filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate >= new Date(startDate) &&
        transactionDate <= new Date(endDate)
      );
    });

    res.status(200).json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Route to generate report and download as CSV
app.get('/api/report/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;
  const { startDate, endDate } = req.query;

  if (req.user.uid !== userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const transactionsRef = admin.database().ref(`users/${userId}/transactions`);
    const snapshot = await transactionsRef.once('value');
    const transactions = snapshot.val() || {};

    const filteredTransactions = Object.values(transactions).filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate >= new Date(startDate) &&
        transactionDate <= new Date(endDate)
      );
    });

    const headers = 'Date,Type,Category,Amount,Description\n';
    const rows = filteredTransactions.map(transaction => (
      `${transaction.date},${transaction.type},${transaction.category},${transaction.amount},${transaction.description}`
    )).join('\n');

    const csv = headers + rows;
    const filePath = path.join(__dirname, 'reports', `report_${userId}.csv`);
    fs.writeFileSync(filePath, csv);

    res.download(filePath, `report_${userId}.csv`, err => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error generating report' });
      } else {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

 app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});