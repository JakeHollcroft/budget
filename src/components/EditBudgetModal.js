import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useRef, useState } from "react";
import { useBudgets } from "../contexts/BudgetsContext";

export default function EditBudgetModal({ show, handleClose, budgetId }) {
  const nameRef = useRef();
  const maxRef = useRef();
  const [error, setError] = useState(null);
  const { budgets, editBudget, deleteBudget } = useBudgets();
  const budget = budgets.find(b => b.id === budgetId);

  function handleSubmit(e) {
    e.preventDefault();

    const newBudget = {
      id: budgetId,
      name: nameRef.current.value,
      max: parseFloat(maxRef.current.value)
    };

    const isValid = editBudget(newBudget);

    if (!isValid) {
      setError("Total maximum budget exceeds total check amount!");
    } else {
      setError(null);
      handleClose();
    }
  }

  function handleDelete() {
    deleteBudget({ id: budgetId });  // Pass the ID as an object with `id` property
    handleClose();
  }

  if (!budget) return null; // Handle case when budget is not found

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control ref={nameRef} type="text" required defaultValue={budget.name} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="max">
            <Form.Label>Maximum Spending</Form.Label>
            <Form.Control ref={maxRef} type="number" required min={0} step={0.01} defaultValue={budget.max} />
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
