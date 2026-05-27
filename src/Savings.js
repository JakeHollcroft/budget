import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useData } from './contexts/DataContext';

function SavingsPage() {
  const { savings, updateSavings } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSavings, setNewSavings] = useState({ title: '', amount: 0, date: '' });
  const [currentSavingsIndex, setCurrentSavingsIndex] = useState(null);
  const [editPaymentIndex, setEditPaymentIndex] = useState(null);

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US');
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

    let yPosition = 30;

    savings.forEach((goal, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Goal: ${goal.title}`, 20, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');

      goal.payments.forEach((payment, paymentIndex) => {
        doc.text(`  Payment ${paymentIndex + 1}: ${formatDate(payment.date)} - $${payment.amount.toFixed(2)}`, 20, yPosition);
        yPosition += 10;
      });

      const totalGoalSaved = goal.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2);
      doc.text(`Total Saved for ${goal.title}: $${totalGoalSaved}`, 20, yPosition);
      yPosition += 10;
      yPosition += 10;

      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 10;
    
    const totalSaved = savings
      .reduce((total, goal) => total + goal.payments.reduce((sum, p) => sum + p.amount, 0), 0)
      .toFixed(2);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Savings Across All Goals: $${totalSaved}`, 20, yPosition);

    doc.save('savings_report.pdf');
  };

  const handleAddSavings = () => {
    const { title, amount, date } = newSavings;
    const paymentDate = formatDate(date || getCurrentDate());

    if (currentSavingsIndex !== null) {
      updateSavings((prevSavings) => {
        const updatedSavings = [...prevSavings];
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
        return updatedSavings;
      });
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
      updateSavings((prevSavings) => [...prevSavings, newEntry]);
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
    updateSavings((prevSavings) => {
      const updatedSavings = [...prevSavings];
      updatedSavings[goalIndex].payments.splice(paymentIndex, 1);
      return updatedSavings;
    });
  };

  const handleDeleteGoal = (goalIndex) => {
    updateSavings((prevSavings) => {
      const updatedSavings = [...prevSavings];
      updatedSavings.splice(goalIndex, 1);
      return updatedSavings;
    });
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
    <Container className="py-4">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h1 className="mb-0">Savings</h1>
          <Link to="/">
            <Button variant="outline-secondary" size="sm">
              Back
            </Button>
          </Link>
        </div>
        <h2 className="total-amount text-success">${totalSaved}</h2>
      </div>

      <div className="action-buttons mb-4">
        <Button variant="primary" onClick={handleAddNewSavings}>
          Add Goal
        </Button>
        <Button variant="outline-info" onClick={handleGenerateReport}>
          Report
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
