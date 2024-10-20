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
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DebtsPage from "./DebtsPage"; // Import the new DebtsPage component

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCheckModal, setShowAddCheckModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();
  const [editBudgetId, setEditBudgetId] = useState();
  const { budgets, getBudgetExpenses } = useBudgets();
  const [viewExpensesModalBudgetId, setViewExpensesModalBudgetId] = useState();

  function openAddExpenseModal(budgetId) {
    setShowAddExpenseModal(true);
    setAddExpenseModalBudgetId(budgetId);
  }

  function openEditBudgetModal(budgetId) {
    setEditBudgetId(budgetId);
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
                {/* New Debts Button */}
                <Link to="/debts">
                  <Button variant="outline-danger">Debts</Button>
                </Link>
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
