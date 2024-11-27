import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf'; // Import jsPDF

function SavingsPage() {
  const navigate = useNavigate();
  const [savings, setSavings] = useState(() => {
    const savedSavings = localStorage.getItem('savings');
    return savedSavings ? JSON.parse(savedSavings) : [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSavings, setNewSavings] = useState({ title: '', amount: 0, date: '' });
  const [currentSavingsIndex, setCurrentSavingsIndex] = useState(null);
  const [editPaymentIndex, setEditPaymentIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('savings', JSON.stringify(savings));
  }, [savings]);

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US'); // MM/DD/YYYY format
  };

  const formatDate = (date) => {
    if (!date) return '';
    const formattedDate = new Date(date).toLocaleDateString('en-US');
    return formattedDate;
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Savings Report', 20, 20);

    let yPosition = 30; // Start position for the report content

    savings.forEach((goal, index) => {
      // Title for each goal, bolded
      doc.setFont('helvetica', 'bold');
      doc.text(`Goal: ${goal.title}`, 20, yPosition);
      yPosition += 10;

      // Reset font to normal for the rest of the content
      doc.setFont('helvetica', 'normal');

      goal.payments.forEach((payment, paymentIndex) => {
        // Indented payment details
        doc.text(`  Payment ${paymentIndex + 1}: ${formatDate(payment.date)} - $${payment.amount.toFixed(2)}`, 20, yPosition);
        yPosition += 10;
      });

      // Add total saved for the goal
      const totalGoalSaved = goal.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2);
      doc.text(`Total Saved for ${goal.title}: $${totalGoalSaved}`, 20, yPosition);
      yPosition += 10;

      // Add spacing between goals
      yPosition += 10;

      // Add a page if content is too long
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20; // Reset position to top
      }
    });

    // Add space before the total
    yPosition += 10;
    
    // Total saved across all goals
    const totalSaved = savings
      .reduce((total, goal) => total + goal.payments.reduce((sum, p) => sum + p.amount, 0), 0)
      .toFixed(2);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Savings Across All Goals: $${totalSaved}`, 20, yPosition);

    // Save the PDF
    doc.save('savings_report.pdf');
};


  const handleAddSavings = () => {
    const { title, amount, date } = newSavings;
    const paymentDate = formatDate(date || getCurrentDate());

    if (currentSavingsIndex !== null) {
      const updatedSavings = [...savings];
      if (editPaymentIndex !== null) {
        updatedSavings[currentSavingsIndex].payments[editPaymentIndex] = {
          amount: parseFloat(amount),
          date: paymentDate,
        };
      } else {
        updatedSavings[currentSavingsIndex].payments.push({
          amount: parseFloat(amount),
          date: paymentDate,
        });
      }
      setSavings(updatedSavings);
    } else {
      const newEntry = {
        title,
        payments: [
          {
            amount: parseFloat(amount),
            date: paymentDate,
          },
        ],
      };
      setSavings([...savings, newEntry]);
    }

    setShowAddModal(false);
    resetModalState();
  };

  const handleAddNewSavings = () => {
    resetModalState();
    setShowAddModal(true);
  };

  const handleAddPayment = (index) => {
    resetModalState();
    setCurrentSavingsIndex(index);
    setShowAddModal(true);
  };

  const handleEditPayment = (goalIndex, paymentIndex) => {
    const payment = savings[goalIndex].payments[paymentIndex];
    setNewSavings({ title: savings[goalIndex].title, amount: payment.amount, date: payment.date });
    setCurrentSavingsIndex(goalIndex);
    setEditPaymentIndex(paymentIndex);
    setShowAddModal(true);
  };

  const handleDeletePayment = (goalIndex, paymentIndex) => {
    const updatedSavings = [...savings];
    updatedSavings[goalIndex].payments.splice(paymentIndex, 1);
    setSavings(updatedSavings);
  };

  const handleDeleteGoal = (goalIndex) => {
    const updatedSavings = [...savings];
    updatedSavings.splice(goalIndex, 1);
    setSavings(updatedSavings);
  };

  const resetModalState = () => {
    setNewSavings({ title: '', amount: 0, date: '' });
    setCurrentSavingsIndex(null);
    setEditPaymentIndex(null);
  };

  const totalSaved = savings
    .reduce((total, goal) => total + goal.payments.reduce((sum, p) => sum + p.amount, 0), 0)
    .toFixed(2);

  return (
    <Container>
      <h1 className="my-3">Savings</h1>
      <h2>Total Saved: ${totalSaved}</h2>

      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAddNewSavings}>
          Add New Goal
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Budgets
        </Button>
        <Button variant="info" onClick={handleGenerateReport}>
          Generate Report
        </Button>
      </div>

      <Row>
        {savings.map((goal, goalIndex) => (
          <Col key={goalIndex} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{goal.title}</Card.Title>
                <Card.Text>
                  <strong>Payments:</strong>
                  <ul>
                    {goal.payments.map((payment, paymentIndex) => (
                      <li key={paymentIndex}>
                        {formatDate(payment.date)} - ${payment.amount.toFixed(2)}{' '}
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEditPayment(goalIndex, paymentIndex)}
                        >
                          Edit
                        </Button>{' '}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeletePayment(goalIndex, paymentIndex)}
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <strong>Total Saved:</strong> ${goal.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </Card.Text>
                <Button variant="success" onClick={() => handleAddPayment(goalIndex)}>
                  Add Payment
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteGoal(goalIndex)}>
                  Delete Goal
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Savings Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentSavingsIndex !== null ? 'Add/Edit Payment' : 'Add New Savings'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {currentSavingsIndex === null && (
              <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={newSavings.title}
                  onChange={(e) => setNewSavings({ ...newSavings, title: e.target.value })}
                />
              </Form.Group>
            )}
            <Form.Group controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={newSavings.amount}
                onChange={(e) => setNewSavings({ ...newSavings, amount: parseFloat(e.target.value) })}
              />
            </Form.Group>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newSavings.date}
                onChange={(e) => setNewSavings({ ...newSavings, date: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddSavings}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default SavingsPage;
