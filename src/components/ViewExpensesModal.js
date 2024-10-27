// ViewExpensesModal.js
import React from "react";
import { Modal, Button, Stack } from "react-bootstrap";
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "../contexts/BudgetsContext";
import { currencyFormatter } from "../utils";

export default function ViewExpensesModal({ budgetId, handleClose }) {
  const { getBudgetExpenses, budgets, deleteExpense } = useBudgets();

  const expenses = getBudgetExpenses(budgetId);
  const budget = budgetId === UNCATEGORIZED_BUDGET_ID 
    ? { name: "Uncategorized", id: UNCATEGORIZED_BUDGET_ID } 
    : budgets.find(b => b.id === budgetId);

  return (
    <Modal show={budgetId != null} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Expenses - {budget?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Stack direction="vertical" gap="3">
          {expenses.map(expense => (
            <Stack direction="horizontal" gap="2" key={expense.id}>
              <div className="me-auto fs-4">{expense.description}</div>
              <div className="fs-5">{currencyFormatter.format(expense.amount)}</div>
              <div className="text-muted">{expense.date ? new Date(expense.date).toLocaleDateString() : ""}</div>
              <Button
                onClick={() => deleteExpense({ id: expense.id })}
                size="sm"
                variant="outline-danger"
              >
                &times;
              </Button>
            </Stack>
          ))}
        </Stack>
      </Modal.Body>
    </Modal>
  );
}
