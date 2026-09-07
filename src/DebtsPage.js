import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useData } from './contexts/DataContext';

function DebtsPage() {
  const { debts, updateDebts } = useData();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({ debtor: '', amount: '' });
  const [debtToDeleteIndex, setDebtToDeleteIndex] = useState(null);

  const handleEdit = (index) => {
    setCurrentDebt({ ...debts[index], index });
    setShowEditModal(true);
  };

  const handleAddNewDebt = () => {
    setNewDebt({ debtor: '', amount: '' });
    setShowAddModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDebt({ ...currentDebt, [name]: value });
  };

  const handleNewDebtInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt({ ...newDebt, [name]: value });
  };

  const getCurrentDateInCST = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const cstDate = new Date(now.getTime() + offset - 6 * 3600000);
    return cstDate.toLocaleDateString();
  };
  
  const handleSaveEdit = () => {
    updateDebts((prevDebts) => {
      const updatedDebts = [...prevDebts];
      const { index, originalIndex, ...debtData } = currentDebt;
      updatedDebts[index] = {
        ...debtData,
        amount: parseFloat(currentDebt.amount),
        lastPayment: getCurrentDateInCST(),
      };
      if (updatedDebts[index].amount === 0) {
        return updatedDebts.filter((_, i) => i !== index);
      }
      return updatedDebts;
    });
    setShowEditModal(false);
  };

  const handleAddDebt = () => {
    const newDebtEntry = {
      ...newDebt,
      amount: parseFloat(newDebt.amount),
      lastPayment: getCurrentDateInCST(),
    };
    updateDebts((prevDebts) => [...prevDebts, newDebtEntry]);
    setShowAddModal(false);
  };

  const handleDeleteDebt = (index) => {
    updateDebts((prevDebts) => prevDebts.filter((_, i) => i !== index));
    setShowDeleteModal(false);
  };

  const handleDeleteConfirmation = (index) => {
    setDebtToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const totalDebt = debts.reduce((total, debt) => total + debt.amount, 0);

  const mostRecentDate = debts.length
    ? new Date(Math.max(...debts.map(debt => new Date(debt.lastPayment)))).toLocaleDateString()
    : 'No payments made';

  const sortedDebts = debts
    .map((debt, originalIndex) => ({ ...debt, originalIndex }))
    .sort((a, b) => a.amount - b.amount);

  const formatCurrency = (amount) => {
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const todayDate = getCurrentDateInCST();
    
    doc.setFontSize(16);
    doc.text(`Debt Report - ${todayDate}`, 20, 20);

    doc.setFontSize(14);
    doc.text(`Total Debt: ${formatCurrency(totalDebt)}`, 20, 40);

    sortedDebts.forEach((debt, index) => {
      doc.setFontSize(12);
      doc.text(
        `${index + 1}. Debtor: ${debt.debtor}, Amount: ${formatCurrency(debt.amount)}, Last Payment: ${new Date(debt.lastPayment).toLocaleDateString()}`,
        20,
        60 + (index * 10)
      );
    });

    doc.save(`Debt_Report_${todayDate}.pdf`);
  };

  return (
    <Container className="py-4">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h1 className="mb-0">Debts</h1>
          <Link to="/">
            <Button variant="outline-secondary" size="sm">
              Back
            </Button>
          </Link>
        </div>
        <h2 className="total-amount text-danger">{formatCurrency(totalDebt)}</h2>
        <p className="text-muted mb-0">Last Modified: {mostRecentDate}</p>
      </div>

      <div className="action-buttons mb-4">
        <Button variant="primary" onClick={handleAddNewDebt}>
          Add Debt
        </Button>
        <Button variant="outline-success" onClick={generateReport}>
          Report
        </Button>
      </div>

      <Row>
        {sortedDebts.map((debt) => (
          <Col key={debt.originalIndex} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{debt.debtor}</Card.Title>
                <Card.Text>
                  <strong>Amount:</strong> {formatCurrency(debt.amount)} <br />
                  <strong>Last Payment Made:</strong> {new Date(debt.lastPayment).toLocaleDateString()}
                </Card.Text>
                <Button variant="secondary" onClick={() => handleEdit(debt.originalIndex)} style={{ marginRight: '10px' }}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteConfirmation(debt.originalIndex)}>
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Debt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDebt && (
            <Form>
              <Form.Group controlId="formDebtor">
                <Form.Label>Debtor</Form.Label>
                <Form.Control
                  type="text"
                  name="debtor"
                  value={currentDebt.debtor}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formAmount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={currentDebt.amount}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Debt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDebtor">
              <Form.Label>Debtor</Form.Label>
              <Form.Control
                type="text"
                name="debtor"
                value={newDebt.debtor}
                onChange={handleNewDebtInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={newDebt.amount}
                onChange={handleNewDebtInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDebt}>
            Add Debt
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this debt?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteDebt(debtToDeleteIndex)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DebtsPage;
