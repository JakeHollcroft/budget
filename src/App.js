import { Button, Stack } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import AddBudgetModal from "./components/AddBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import BudgetCard from "./components/BudgetCard";
import ViewExpensesModal from "./components/ViewExpensesModal";
import UncategorizedBudgetCard from "./components/UncategorizedBudgetCard";
import TotalBudgetCard from "./components/TotalBudgetCard";
import EditBudgetModal from "./components/EditBudgetModal";
import AddCheckModal from "./components/AddCheckModal";
import { useState } from "react";
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "./contexts/BudgetsContext";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import DebtsPage from "./DebtsPage";
import SavingsPage from "./Savings";
import jsPDF from "jspdf";
import ChecksCard from "./components/ChecksCard";

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();
  const [editBudgetId, setEditBudgetId] = useState();
  const { budgets, getBudgetExpenses, checks } = useBudgets();
  const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState();
  const [showAddCheckModal, setShowAddCheckModal] = useState(false);

  function openAddExpenseModal(budgetId) {
    setShowAddExpenseModal(true);
    setAddExpenseModalBudgetId(budgetId);
  }

  function openEditBudgetModal(budgetId) {
    setEditBudgetId(budgetId);
  }

  // Function to generate the report PDF
  function generateReport() {
    const doc = new jsPDF();

    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    doc.text(`Budget Report - ${dateStr}`, 10, 10);

    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    // Adding check details if available
    doc.setFont("helvetica", "bold");
    doc.text("Check Details:", 10, yPosition);
    yPosition += 10;

    if (checks && checks.length > 0) {
      checks.forEach((check, index) => {
        doc.setFont("helvetica", "normal");
        const checkText = `Check ${index + 1}: Amount $${check.amount.toFixed(
          2
        )} | Date: ${new Date(check.date).toLocaleDateString("en-US")}`;
        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(checkText, 10, yPosition);
        yPosition += 10;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text("  No checks available.", 10, yPosition);
      yPosition += 10;
    }

    // Adding budget and expense details
    budgets.forEach((budget) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Budget: ${budget.name}`, 10, yPosition);
      yPosition += 10;

      const expenses = getBudgetExpenses(budget.id);
      if (expenses.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("  No expenses", 10, yPosition);
        yPosition += 10;
      } else {
        expenses.forEach((expense) => {
          const expenseDate = expense.date
            ? new Date(expense.date).toLocaleDateString("en-US")
            : "N/A";
          const expenseText = `  ${expense.description}: $${expense.amount.toFixed(
            2
          )} | ${expenseDate}`;

          if (yPosition + 10 > pageHeight - margin) {
            doc.addPage();
            yPosition = 10;
          }
          doc.text(expenseText, 10, yPosition);
          yPosition += 10;
        });
      }
    });

    // Add uncategorized expenses
    const uncategorizedExpenses = getBudgetExpenses(UNCATEGORIZED_BUDGET_ID);
    if (uncategorizedExpenses.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Uncategorized Expenses:", 10, yPosition);
      yPosition += 10;
      uncategorizedExpenses.forEach((expense) => {
        const expenseDate = expense.date
          ? new Date(expense.date).toLocaleDateString("en-US")
          : "N/A";
        const expenseText = `  ${expense.description}: $${expense.amount.toFixed(
          2
        )} | ${expenseDate}`;

        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(expenseText, 10, yPosition);
        yPosition += 10;
      });
    }

    // Save the report
    doc.save(`Budget_Report_${dateStr}.pdf`);
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Container className="my-3">
              <Stack direction="horizontal" gap="2" className="mb-3">
                <h1 className="me-auto">My Budget</h1>
                <Button variant="primary" onClick={() => setShowAddBudgetModal(true)}>
                  Add Budget
                </Button>
                <Button variant="outline-primary" onClick={openAddExpenseModal}>
                  Add Expense
                </Button>
                <Link to="/debts">
                  <Button variant="outline-danger">Debts</Button>
                </Link>
                <Link to="/savings">
                  <Button variant="outline-success">Savings</Button>
                </Link>
                <Button variant="outline-success" onClick={generateReport}>
                  Generate Report
                </Button>
              </Stack>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                {budgets
                  .sort((a, b) => {
                    // Sort by due date first (soonest to us)
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate) - new Date(b.dueDate);
                    }
                    // If one of the due dates is missing, treat it as a later date
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return 0;
                  })
                  .sort((a, b) => {
                    // If due dates are the same, sort by max budget (highest first)
                    if (a.dueDate === b.dueDate) {
                      return b.max - a.max;
                    }
                    return 0;
                  })
                  .map((budget) => {
                    const amount = getBudgetExpenses(budget.id).reduce(
                      (total, expense) => total + expense.amount,
                      0
                    );
                    return (
                      <BudgetCard
                        key={budget.id}
                        name={budget.name}
                        amount={amount}
                        max={budget.max}
                        dueDate={budget.dueDate} // Pass the due date
                        onAddExpenseClick={() => openAddExpenseModal(budget.id)}
                        onViewExpensesClick={() =>
                          setViewExpensesModalBudgetId(budget.id)
                        }
                        onEditBudgetClick={() => openEditBudgetModal(budget.id)}
                      />
                    );
                  })}

                <UncategorizedBudgetCard
                  onAddExpenseClick={openAddExpenseModal}
                  onViewExpensesClick={() =>
                    setViewExpensesModalBudgetId(UNCATEGORIZED_BUDGET_ID)
                  }
                />
              </div>
              <TotalBudgetCard />

              <ChecksCard
                checks={checks}
                onAddCheckClick={() => setShowAddCheckModal(true)}
              />
            </Container>
          }
        />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/savings" element={<SavingsPage />} />
      </Routes>
      <AddBudgetModal
        show={showAddBudgetModal}
        handleClose={() => setShowAddBudgetModal(false)}
      />
      <AddExpenseModal
        show={showAddExpenseModal}
        handleClose={() => setShowAddExpenseModal(false)}
        defaultBudgetId={addExpenseModalBudgetId}
      />
      <ViewExpensesModal
        budgetId={viewExpensesModalBudgetId}
        handleClose={() => setViewExpensesModalBudgetId()}
      />
      <EditBudgetModal
        show={editBudgetId != null}
        handleClose={() => setEditBudgetId(null)}
        budgetId={editBudgetId}
      />
      <AddCheckModal
        show={showAddCheckModal}
        handleClose={() => setShowAddCheckModal(false)}
      />
    </Router>
  );
}

export default App;
