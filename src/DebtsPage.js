import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function DebtsPage() {
  const navigate = useNavigate(); 
  const [debts, setDebts] = useState(() => {
    const savedDebts = localStorage.getItem('debts');
    return savedDebts ? JSON.parse(savedDebts) : []; // Initialize with an empty array
  });

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({ debtor: '', amount: '' });
  const [debtToDeleteIndex, setDebtToDeleteIndex] = useState(null);

  // Effect to store debts in local storage whenever debts state is updated
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  // Open the modal to edit a specific debt
  const handleEdit = (index) => {
    setCurrentDebt({ ...debts[index], index });
    setShowEditModal(true);
  };

  // Open the modal to add a new debt
  const handleAddNewDebt = () => {
    setNewDebt({ debtor: '', amount: '' });
    setShowAddModal(true);
  };

  // Handle form input changes for editing
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDebt({ ...currentDebt, [name]: value });
  };

  // Handle form input changes for adding new debt
  const handleNewDebtInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt({ ...newDebt, [name]: value });
  };

  // Function to get current date in US CST
const getCurrentDateInCST = () => {
    const now = new Date();
    // Get the UTC time and adjust for CST (UTC-6 for standard time, UTC-5 for daylight saving)
    const offset = now.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const cstDate = new Date(now.getTime() + offset - 6 * 3600000); // Adjust for CST
    return cstDate.toLocaleDateString(); // Format to locale date string
  };
  
  // Save the updated debt information
  const handleSaveEdit = () => {
    const updatedDebts = [...debts];
    updatedDebts[currentDebt.index] = {
      ...currentDebt,
      amount: parseFloat(currentDebt.amount),
      lastPayment: getCurrentDateInCST(), // Use CST date
    };
    setDebts(updatedDebts);
    setShowEditModal(false);
    // Remove debt if amount is zero
    if (updatedDebts[currentDebt.index].amount === 0) {
      handleDeleteDebt(currentDebt.index);
    }
  };
  
  // Add a new debt
  const handleAddDebt = () => {
    const newDebtEntry = {
      ...newDebt,
      amount: parseFloat(newDebt.amount),
      lastPayment: getCurrentDateInCST(), // Use CST date
    };
    setDebts([...debts, newDebtEntry]);
    setShowAddModal(false);
  };
  

  // Delete a debt
  const handleDeleteDebt = (index) => {
    const updatedDebts = debts.filter((_, i) => i !== index);
    setDebts(updatedDebts);
    setShowDeleteModal(false);
  };

  // Open delete confirmation modal
  const handleDeleteConfirmation = (index) => {
    setDebtToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  // Calculate the total amount of all debts
  const totalDebt = debts.reduce((total, debt) => total + debt.amount, 0);

  // Sort debts by amount (lowest to highest)
  const sortedDebts = debts.sort((a, b) => a.amount - b.amount);

  return (
    <Container>
      <h1 className="my-3">Debts</h1>
      <h2>Total: ${totalDebt.toFixed(2)}</h2>
      
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAddNewDebt}>
          Add New Debt
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')} style={{ marginLeft: 'auto' }}>
          Back to Budgets
        </Button>
      </div>

      <Row>
        {sortedDebts.map((debt, index) => (
          <Col key={index} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{debt.debtor}</Card.Title>
                <Card.Text>
                  <strong>Amount:</strong> ${debt.amount.toFixed(2)} <br />
                  <strong>Last Payment Made:</strong> {new Date(debt.lastPayment).toLocaleDateString()}
                </Card.Text>
                <Button variant="secondary" onClick={() => handleEdit(index)} style={{ marginRight: '10px' }}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteConfirmation(index)}>
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit Debt Modal */}
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

      {/* Add New Debt Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this debt?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            handleDeleteDebt(debtToDeleteIndex);
            setDebtToDeleteIndex(null);
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DebtsPage;
