import { Button, Container, Navbar, Nav, Offcanvas, Spinner, Modal } from "react-bootstrap";
import AddBudgetModal from "./components/AddBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import BudgetCard from "./components/BudgetCard";
import ViewExpensesModal from "./components/ViewExpensesModal";
import UncategorizedBudgetCard from "./components/UncategorizedBudgetCard";
import EditBudgetModal from "./components/EditBudgetModal";
import { useState } from "react";
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "./contexts/BudgetsContext";
import { useData } from "./contexts/DataContext";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import DebtsPage from "./DebtsPage";
import SavingsPage from "./Savings";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();
  const [editBudgetId, setEditBudgetId] = useState();
  const { budgets, getBudgetExpenses, rollBudgets } = useBudgets();
  const { isLoading, isSaving, error, refresh } = useData();
  const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState();
  const [showRollErrorModal, setShowRollErrorModal] = useState(false);
  const [showRollConfirmModal, setShowRollConfirmModal] = useState(false);
  const [unpaidBudgets, setUnpaidBudgets] = useState([]);

  function getUnpaidBudgets() {
    return budgets.filter((budget) => {
      const totalExpenses = getBudgetExpenses(budget.id).reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      return totalExpenses !== budget.max;
    });
  }

  function handleRollClick() {
    const unpaid = getUnpaidBudgets();
    if (unpaid.length > 0) {
      setUnpaidBudgets(unpaid);
      setShowRollErrorModal(true);
    } else {
      setShowRollConfirmModal(true);
    }
  }

  function executeRoll() {
    rollBudgets();
    setShowRollConfirmModal(false);
  }

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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Spinner animation="border" variant="primary" />
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <Router>
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={refresh}>Retry</button>
        </div>
      )}
      <Navbar expand="md" className="navbar-dark mb-3" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-text">
            My Budget
            {isSaving && <span className="sync-indicator">Syncing...</span>}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Offcanvas
            id="main-navbar"
            placement="end"
            className="offcanvas-dark"
          >
            <Offcanvas.Header closeButton className="offcanvas-header-dark">
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" className="nav-link-dark">
                  Budget
                </Nav.Link>
                <Nav.Link as={Link} to="/debts" className="nav-link-dark nav-debts">
                  Debts
                </Nav.Link>
                <Nav.Link as={Link} to="/savings" className="nav-link-dark nav-savings">
                  Savings
                </Nav.Link>
              </Nav>
              <div className="nav-actions">
                <Button
                  className="nav-btn"
                  onClick={() => setShowAddBudgetModal(true)}
                >
                  Add Budget
                </Button>
                <Button
                  className="nav-btn nav-btn-secondary"
                  onClick={openAddExpenseModal}
                >
                  Add Expense
                </Button>
                <Button
                  className="nav-btn nav-btn-secondary"
                  onClick={generateReport}
                >
                  Report
                </Button>
                <Button
                  className="nav-btn nav-btn-secondary"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
                <Button
                  className="nav-btn nav-btn-warning"
                  onClick={handleRollClick}
                >
                  Roll Budgets
                </Button>
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <Routes>
        <Route
          path="/"
          element={
            <Container className="main-content">
              <div className="budget-summary">
                {(() => {
                  const totalExpenses = budgets.reduce((sum, budget) => {
                    return sum + getBudgetExpenses(budget.id).reduce(
                      (total, expense) => total + expense.amount, 0
                    );
                  }, 0);
                  const totalBudget = budgets.reduce((sum, budget) => sum + budget.max, 0);
                  return (
                    <span>
                      ${totalExpenses.toFixed(2)} of ${totalBudget.toFixed(2)} paid
                    </span>
                  );
                })()}
              </div>
              <div className="budget-grid">
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

      {/* Roll Budgets Error Modal */}
      <Modal show={showRollErrorModal} onHide={() => setShowRollErrorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cannot Roll Budgets</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The following budgets do not have expenses matching their budget amount:</p>
          <ul>
            {unpaidBudgets.map((budget) => {
              const spent = getBudgetExpenses(budget.id).reduce(
                (sum, exp) => sum + exp.amount,
                0
              );
              return (
                <li key={budget.id}>
                  <strong>{budget.name}</strong>: ${spent.toFixed(2)} of ${budget.max.toFixed(2)}
                </li>
              );
            })}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRollErrorModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Roll Budgets Confirmation Modal */}
      <Modal show={showRollConfirmModal} onHide={() => setShowRollConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Roll Budgets?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will:</p>
          <ul>
            <li>Delete all expenses (including uncategorized)</li>
            <li>Advance all budget due dates by 1 month</li>
          </ul>
          <p><strong>Are you sure you want to continue?</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRollConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={executeRoll}>
            Roll Budgets
          </Button>
        </Modal.Footer>
      </Modal>
    </Router>
  );
}

export default App;
