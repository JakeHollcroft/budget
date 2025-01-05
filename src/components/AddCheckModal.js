import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useBudgets } from "../contexts/BudgetsContext"; // Assuming this is the context

export default function AddCheckModal({ show, handleClose }) {
  const [checkAmount, setCheckAmount] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const { addCheck } = useBudgets(); // Assuming this function adds the check to the context or state

  function handleSubmit(e) {
    e.preventDefault();

    const totalAmount = parseFloat(checkAmount);
    const sevenPercent = totalAmount * 0.07; // 7% deduction
    let totalDeduction = sevenPercent.toFixed(2); // Round to 2 decimal places
    
    let firstHalf = totalDeduction / 2;
    let secondHalf = firstHalf;
    
    // Round both halves to 2 decimal places
    firstHalf = firstHalf.toFixed(2);
    secondHalf = secondHalf.toFixed(2);
    
    // Handle rounding issue: If there's a difference of 0.01 between the two amounts, fix it
    const diff = (parseFloat(firstHalf) + parseFloat(secondHalf) - parseFloat(totalDeduction)).toFixed(2);
    if (parseFloat(diff) !== 0) {
      secondHalf = (parseFloat(secondHalf) + 0.01).toFixed(2); // Add the extra penny to the second amount
    }

    // Calculate community amount after the deductions
    const communityAmount = (totalAmount - totalDeduction - (parseFloat(secondHalf) - parseFloat(firstHalf))).toFixed(2);

    // Add the new check with title and date
    addCheck({
      amount: totalAmount,
      communityAmount: parseFloat(communityAmount), // Add the community amount here
      title,
      date,
    });

    setCheckAmount("");
    setTitle("");
    setDate("");
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

          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
