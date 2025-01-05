import { useBudgets } from "../contexts/BudgetsContext";
import BudgetCard from "./BudgetCard";
import {  ProgressBar } from "react-bootstrap";

export default function TotalBudgetCard() {
  const { expenses, budgets, checks } = useBudgets();
  const amount = expenses.reduce((total, expense) => total + expense.amount, 0);
  const max = budgets.reduce((total, budget) => total + budget.max, 0);

  // Calculate the total community amount
  const totalCommunityAmount = checks.reduce((total, check) => {
    const checkAmount = check.amount;
    const sevenPercent = checkAmount * 0.07; // 7% of the check amount
    let totalDeduction = sevenPercent.toFixed(2); // Round to 2 decimal places

    // Divide the 7% deduction between Jake and Miguel
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

    // Adjust the community amount by the penny difference
    const communityAmount = (checkAmount - totalDeduction - (parseFloat(secondHalf) - parseFloat(firstHalf))).toFixed(2);

    return total + parseFloat(communityAmount);
  }, 0);

  const spentPercentage = totalCommunityAmount > 0 ? (amount / totalCommunityAmount) * 100 : 0; // Calculate spent percentage

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
        <h3>Total Community Amount: ${totalCommunityAmount.toFixed(2)}</h3>
        <h3>
          Remaining: $
          {(
            totalCommunityAmount - budgets.reduce((total, budget) => total + budget.max, 0)
          ).toFixed(2)}
        </h3>
        <ProgressBar
          now={spentPercentage}
          label={`${spentPercentage.toFixed(2)}%`}
          striped
          variant={variant}
        />

      </div>
    </div>
  );
}
