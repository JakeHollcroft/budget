import { Button, Card, ProgressBar, Stack } from "react-bootstrap";
import { currencyFormatter } from "../utils";
import { format } from "date-fns";

export default function BudgetCard({
  name,
  amount,
  max,
  dueDate, // New prop for the due date
  gray,
  hideButtons,
  onAddExpenseClick,
  onViewExpensesClick,
  onEditBudgetClick, // Existing prop for handling the edit button click
}) {
  const classNames = [];

  // Highlight individual card in green if the amount equals the max
  if (amount === max) {
    classNames.push("bg-success", "bg-opacity-10"); // Green
  } else {
    // Check if the due date is within certain ranges and apply a background color
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      const timeDifference = dueDateObj - today; // Difference in milliseconds
      const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days

      if (daysLeft <= 7) {
        classNames.push("bg-danger", "bg-opacity-10"); // Red
      } else if (daysLeft <= 14) {
        classNames.push("bg-warning", "bg-opacity-10"); // Yellow
      } else {
        classNames.push("bg-info", "bg-opacity-10"); // Blue
      }
    }

    // If amount exceeds max, show red
    if (amount > max) {
      classNames.push("bg-danger", "bg-opacity-10");
    } else if (gray) {
      classNames.push("bg-light");
    }
  }

  return (
    <Card className={classNames.join(" ")}>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-baseline fw-normal mb-3">
          <div className="me-2">
            {name}
            <div className="text-muted fs-6">
              {dueDate && <p>Due Date: {format(new Date(dueDate), "MM/dd/yyyy")}</p>}
            </div>
          </div>
          <div className="d-flex align-items-baseline">
            {currencyFormatter.format(amount)}
            {max && (
              <span className="text-muted fs-6 ms-1">
                / {currencyFormatter.format(max)}
              </span>
            )}
          </div>
        </Card.Title>
        {max && (
          <ProgressBar
            className="rounded-pill"
            variant={getProgressBarVariant(amount, max)}
            min={0}
            max={max}
            now={amount}
          />
        )}
        {!hideButtons && (
          <Stack direction="horizontal" gap="2" className="mt-4">
            <Button
              variant="outline-primary"
              className="ms-auto"
              onClick={onAddExpenseClick}
            >
              Add Expense
            </Button>
            <Button onClick={onViewExpensesClick} variant="outline-secondary">
              View Expenses
            </Button>
            <Button onClick={onEditBudgetClick} variant="outline-secondary">
              Edit Budget
            </Button>
          </Stack>
        )}
      </Card.Body>
    </Card>
  );
}

function getProgressBarVariant(amount, max) {
  const ratio = amount / max;
  if (ratio < 0.5) return "primary";
  if (ratio < 0.75) return "warning";
  return "danger";
}
