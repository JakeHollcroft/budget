// BudgetsContext.js
import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage";

const BudgetsContext = React.createContext();

export const UNCATEGORIZED_BUDGET_ID = "Uncategorized";

export function useBudgets() {
  return useContext(BudgetsContext);
}

export const BudgetsProvider = ({ children }) => {
  const [budgets, setBudgets] = useLocalStorage("budgets", []);
  const [expenses, setExpenses] = useLocalStorage("expenses", []);
  const [checks, setChecks] = useLocalStorage("checks", []);

  const getBudgetExpenses = (budgetId) =>
    expenses.filter((expense) => expense.budgetId === budgetId);

  const getTotalCheckAmount = () =>
    checks.reduce((total, check) => total + check.amount, 0);

  const getTotalMaxBudget = () =>
    budgets.reduce((total, budget) => total + budget.max, 0);

  const addExpense = ({ description, amount, budgetId, date }) => {
    setExpenses((prevExpenses) => [
      ...prevExpenses,
      { id: uuidV4(), description, amount, budgetId, date },
    ]);
  };

  const addBudget = ({ name, max, dueDate }) => {
    setBudgets((prevBudgets) => {
      if (prevBudgets.find((budget) => budget.name === name)) {
        return prevBudgets;
      }
      return [
        ...prevBudgets,
        { id: uuidV4(), name, max, dueDate: dueDate || null }, // Include dueDate
      ];
    });
    return true;
  };

  const editBudget = ({ id, name, max, dueDate }) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.id === id
          ? { ...budget, name, max, dueDate } // Include dueDate in the update
          : budget
      )
    );
    return true;
  };

  const deleteBudget = ({ id }) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.budgetId === id
          ? { ...expense, budgetId: UNCATEGORIZED_BUDGET_ID }
          : expense
      )
    );

    setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== id));
  };

  const deleteExpense = ({ id }) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
    );
  };

  // Updated addCheck function to include title and date
  const addCheck = ({ amount, title, date }) => {
    setChecks((prevChecks) => [
      ...prevChecks,
      { id: uuidV4(), amount, title, date }, // Now stores title and date along with amount
    ]);
  };

  const resetChecks = () => {
    setChecks([]);
  };

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        expenses,
        checks,
        getBudgetExpenses,
        addExpense,
        addBudget,
        editBudget,
        deleteBudget,
        deleteExpense,
        addCheck,
        resetChecks,
        getTotalCheckAmount,
        getTotalMaxBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};
