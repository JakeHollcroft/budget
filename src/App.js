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
import SavingsPage from "./Savings"; // Import SavingsPage
import jsPDF from "jspdf";

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCheckModal, setShowAddCheckModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();
  const [editBudgetId, setEditBudgetId] = useState();
  const { budgets, getBudgetExpenses, checks } = useBudgets();
  const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState();

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
    const pageHeight = doc.internal.pageSize.height; // Get the height of the page
    const margin = 10; // Margin from the bottom of the page

    // Adding check details if any
    if (checks && checks.length > 0) {
      const check = checks[checks.length - 1]; // Most recent check
      doc.text(`Check Amount: $${check.amount.toFixed(2)}`, 10, yPosition);
      yPosition += 10;
    }

    // Loop through each budget and list expenses with dates
    budgets.forEach((budget) => {
      doc.setFont("helvetica", "bold"); // Set font to bold for budget names
      doc.text(`Budget: ${budget.name}`, 10, yPosition);
      yPosition += 10;

      const expenses = getBudgetExpenses(budget.id);
      if (expenses.length === 0) {
        doc.setFont("helvetica", "normal"); // Reset font to normal for "No expenses" message
        doc.text("  No expenses", 10, yPosition);
        yPosition += 10;
      } else {
        expenses.forEach((expense) => {
          const expenseDate = expense.date
            ? new Date(expense.date).toLocaleDateString("en-US")
            : "N/A";
          doc.setFont("helvetica", "normal"); // Reset font to normal for expenses
          const expenseText = `  ${expense.description}: $${expense.amount.toFixed(2)} | ${expenseDate}`;

          // Check if the next line fits in the page
          if (yPosition + 10 > pageHeight - margin) {
            doc.addPage(); // Create a new page
            yPosition = 10; // Reset yPosition for the new page
          }

          doc.text(expenseText, 10, yPosition);
          yPosition += 10;
        });
      }
    });

    // Add a section for uncategorized expenses with dates if they exist
    const uncategorizedExpenses = getBudgetExpenses(UNCATEGORIZED_BUDGET_ID);
    if (uncategorizedExpenses.length > 0) {
      doc.setFont("helvetica", "bold"); // Set font to bold for Uncategorized section
      doc.text("Uncategorized Expenses:", 10, yPosition);
      yPosition += 10;
      uncategorizedExpenses.forEach((expense) => {
        const expenseDate = expense.date
          ? new Date(expense.date).toLocaleDateString("en-US")
          : "N/A";
        doc.setFont("helvetica", "normal"); // Reset font to normal for uncategorized expenses
        const expenseText = `  ${expense.description}: $${expense.amount.toFixed(2)} | ${expenseDate}`;

        // Check if the next line fits in the page
        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage(); // Create a new page
          yPosition = 10; // Reset yPosition for the new page
        }

        doc.text(expenseText, 10, yPosition);
        yPosition += 10;
      });
    }

    // Save the PDF with the current date in the filename
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
                <Button variant="outline-primary" onClick={() => setShowAddCheckModal(true)}>
                  Add Check
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
                {budgets.map((budget) => {
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
