import { Modal, Form, Button } from "react-bootstrap";
import { useRef, useEffect } from "react";
import { useBudgets } from "../contexts/BudgetsContext";

export default function EditBudgetModal({ show, handleClose, budgetId }) {
  const nameRef = useRef();
  const maxRef = useRef();
  const dueDateRef = useRef();
  const { budgets, editBudget, deleteBudget } = useBudgets();
  const budget = budgets.find(b => b.id === budgetId);

  useEffect(() => {
    if (budget) {
      nameRef.current.value = budget.name;
      maxRef.current.value = budget.max;
      
      // Check if dueDate exists before trying to split
      if (budget.dueDate) {
        dueDateRef.current.value = budget.dueDate.split('T')[0]; // Set the date input value
      } else {
        dueDateRef.current.value = ''; // Set empty value if no dueDate
      }
    }
  }, [budget]);

  function handleSubmit(e) {
    e.preventDefault();

    const selectedDate = new Date(dueDateRef.current.value);

    // Adjust the selected date to avoid the timezone shift issue.
    const adjustedDate = new Date(selectedDate.setDate(selectedDate.getDate() + 1));

    const updatedBudget = {
      id: budgetId,
      name: nameRef.current.value,
      max: parseFloat(maxRef.current.value),
      dueDate: adjustedDate.toISOString().split('T')[0], // Only return the date part (YYYY-MM-DD)
    };

    // Directly save the budget without validation checks
    editBudget(updatedBudget);
    handleClose();
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
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control ref={nameRef} type="text" required defaultValue={budget.name} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="max">
            <Form.Label>Maximum Spending</Form.Label>
            <Form.Control ref={maxRef} type="number" required min={0} step={0.01} defaultValue={budget.max} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="dueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              ref={dueDateRef}
              type="date"
              required
            />
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
