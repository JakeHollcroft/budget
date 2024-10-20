import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useBudgets } from "../contexts/BudgetsContext";

export default function AddCheckModal({ show, handleClose }) {
  const [checkAmount, setCheckAmount] = useState("");
  const { addCheck } = useBudgets(); // Get addCheck function from context

  function handleSubmit(e) {
    e.preventDefault();
    addCheck({ amount: parseFloat(checkAmount) }); // Add the check amount
    setCheckAmount("");
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Check</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="checkAmount">
            <Form.Label>Check Amount</Form.Label>
            <Form.Control
              type="number"
              value={checkAmount}
              onChange={(e) => setCheckAmount(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Add Check
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
