import { useBudgets } from "../contexts/BudgetsContext";
import BudgetCard from "./BudgetCard";
import { Button, ProgressBar } from "react-bootstrap";

export default function TotalBudgetCard() {
  const { expenses, budgets, checks, resetChecks } = useBudgets();
  const amount = expenses.reduce((total, expense) => total + expense.amount, 0);
  const max = budgets.reduce((total, budget) => total + budget.max, 0);
  const totalChecks = checks.reduce((total, check) => total + check.amount, 0);
  const remainingCheckAmount = totalChecks - amount; // Calculate remaining check amount

  const spentPercentage = totalChecks > 0 ? (amount / totalChecks) * 100 : 0; // Calculate spent percentage

  // Determine the variant based on the spent percentage
  let variant = "success";
  if (spentPercentage > 50) {
    variant = "warning";
  }
  if (spentPercentage > 75) {
    variant = "danger";
  }

  if (max === 0) return null;

  return (
    <div>
      <BudgetCard amount={amount} name="Total" gray max={max} hideButtons />
      <div style={{ marginTop: "1rem" }}>
        <h5>
          Check Amount: ${totalChecks.toFixed(2)} | Remaining: ${remainingCheckAmount.toFixed(2)}
        </h5>
        <ProgressBar 
          now={spentPercentage} 
          label={`${spentPercentage.toFixed(2)}%`} 
          striped 
          variant={variant} 
        />
        <Button variant="danger" onClick={resetChecks} style={{ marginTop: "1rem" }}>
          Reset Checks
        </Button>
      </div>
    </div>
  );
}
