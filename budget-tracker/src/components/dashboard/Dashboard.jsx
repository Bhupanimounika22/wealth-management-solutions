import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import TransactionForm from '../transactions/TransactionForm';
import BalanceChart from './charts/BalanceChart';
import ExpensesChart from './charts/ExpensesChart';
import IncomeChart from './charts/IncomeChart';
import SummaryCard from './SummaryCard';

export default function Dashboard() {
  const { currentUser } = useAuth(); // Access the current user

  if (!currentUser) {
    return <p>Please log in to see your dashboard.</p>;
  }

  return (
    <Container fluid>
      <h1 className="mb-4">
        <span className="text-primary">Budget</span>
        <span className="text-info"> Tracker</span>
      </h1>
      
      <h2 className="mb-4">
        Welcome to Wealth Management Solution, {currentUser.email}!
      </h2>

      <Row>
        <Col md={8}>
          <Row className="mb-4">
            <Col md={6}>
              <IncomeChart userId={currentUser.uid} />
            </Col>
            <Col md={6}>
              <ExpensesChart userId={currentUser.uid} />
            </Col>
          </Row>
          <BalanceChart userId={currentUser.uid} />
        </Col>

        <Col md={4}>
          <TransactionForm userId={currentUser.uid} />
          <SummaryCard userId={currentUser.uid} />
        </Col>
      </Row>
    </Container>
  );
}
