import { Card, Button, Row, Col } from "react-bootstrap";
import { useBudgets } from "../contexts/BudgetsContext"; // Import the useBudgets hook

export default function ChecksCard({ checks, gray, onAddCheckClick }) {
  const { resetChecks } = useBudgets(); // Access resetChecks from the context

  const classNames = [];
  if (gray) {
    classNames.push("bg-light");
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      // If no date is provided, set it to today's date
      dateString = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    }
  
    // Extract the year, month, and day from the dateString
    const [year, month, day] = dateString.split('-');
    
    // Create a new Date object using the extracted values (months are 0-indexed)
    const date = new Date(year, month - 1, day);
  
    // Return the formatted date string in MM/DD/YYYY format
    return date.toLocaleDateString("en-US"); // MM/DD/YYYY format
  };
  
  
  // Sort the checks by date from newest to oldest
  const sortedChecks = [...checks].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Handle Reset Checks with confirmation
  const handleResetChecks = () => {
    const confirmation = window.confirm("Are you sure you want to reset all checks?");
    if (confirmation) {
      resetChecks(); // Proceed with the reset if confirmed
    }
  };

  return (
    <Card className={classNames.join(" ")}>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-baseline fw-normal mb-3">
          <div>Checks</div>
          <div className="d-flex align-items-baseline">
            <Button
              variant="outline-primary"
              className="ms-auto"
              onClick={onAddCheckClick}
            >
              Add Check
            </Button>
            {/* Add spacing between buttons */}
            <div style={{ marginLeft: "10px" }}>
              <Button variant="danger" onClick={handleResetChecks}>
                Reset Checks
              </Button>
            </div>
          </div>
        </Card.Title>

        {sortedChecks.length > 0 ? (
          <Row>
            {sortedChecks.map((check, index) => {
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

              return (
                <Col key={index} xs={12} sm={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div>
                        <strong>Check {index + 1}:</strong> ${checkAmount.toFixed(2)}
                      </div>
                      <div className="text-muted">Title: {check.title}</div>
                      <div className="text-muted">Date: {formatDate(check.date)}</div>
                      <div className="text-muted">7% Deducted: ${totalDeduction}</div>
                      <div className="text-muted">
                        Jake's Personal Amount: ${firstHalf} | Miguel's Personal Amount: ${secondHalf}
                      </div>
                      <div className="text-muted">
                        Community Amount: ${communityAmount}
                      </div>
                    </div>
                  </div>
                  <hr />
                </Col>
              );
            })}
          </Row>
        ) : (
          <div>No checks available.</div>
        )}
      </Card.Body>
    </Card>
  );
}
