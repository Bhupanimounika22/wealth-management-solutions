import { getAuth } from 'firebase/auth';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

export default function Reports() {
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [transactionData, setTransactionData] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      const fetchTransactionData = async () => {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`http://localhost:5100/api/transactions/${userId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch transaction data');
          }

          const data = await response.json();
          setTransactionData(data);
        } catch (error) {
          console.error('Error fetching transaction data:', error);
        }
      };
      fetchTransactionData();
    }
  }, [userId, dateRange, user]);

  const generateCSV = (data) => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = data.map(item => `${item.date},${item.type},${item.category},${item.amount},${item.description}`);
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = () => {
    const csv = generateCSV(transactionData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transaction_report.csv';
    link.click();
  };

  return (
    <Container>
      <h2 className="mb-4 text-light">Financial Reports</h2>

      <Card className="bg-dark border-light mb-4 text-light">
        <Card.Body>
          <Form className="row">
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Report Type</Form.Label>
                <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {reportType === 'custom' && (
              <>
                <Col md={3}>
                  <Form.Group className="mb-3 text-light">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" className="mb-3">
                Generate Report
              </Button>
            </Col>
          </Form>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="bg-dark border-light h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 text-light">
                <h5>Transaction Report</h5>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={downloadCSV}
                >
                  <Download size={16} className="me-2" />
                  Export
                </Button>
              </div>
              <p className="text-light">Transaction report visualization placeholder</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
