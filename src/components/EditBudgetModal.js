import { Modal, Form, Button } from "react-bootstrap";
import { useRef, useEffect, useState } from "react";
import { useBudgets } from "../contexts/BudgetsContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditBudgetModal({ show, handleClose, budgetId }) {
  const nameRef = useRef();
  const maxRef = useRef();
  const [dueDate, setDueDate] = useState(new Date());
  const { budgets, editBudget, deleteBudget } = useBudgets();
  const budget = budgets.find(b => b.id === budgetId);

  useEffect(() => {
    if (budget) {
      nameRef.current.value = budget.name;
      maxRef.current.value = budget.max;
      
      if (budget.dueDate) {
        setDueDate(new Date(budget.dueDate));
      } else {
        setDueDate(new Date());
      }
    }
  }, [budget]);

  function handleSubmit(e) {
    e.preventDefault();

    const updatedBudget = {
      id: budgetId,
      name: nameRef.current.value,
      max: parseFloat(maxRef.current.value),
      dueDate: dueDate.toISOString().split('T')[0],
    };

    editBudget(updatedBudget);
    handleClose();
  }

  function handleDelete() {
    deleteBudget({ id: budgetId });
    handleClose();
  }

  if (!budget) return null;

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
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              className="form-control"
              dateFormat="MM/dd/yyyy"
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
