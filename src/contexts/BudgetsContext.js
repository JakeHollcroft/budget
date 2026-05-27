import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import { useData } from "./DataContext";

const BudgetsContext = React.createContext();

export const UNCATEGORIZED_BUDGET_ID = "Uncategorized";

export function useBudgets() {
  return useContext(BudgetsContext);
}

export const BudgetsProvider = ({ children }) => {
  const { budgets, expenses, updateBudgets, updateExpenses } = useData();

  const getBudgetExpenses = (budgetId) =>
    expenses.filter((expense) => expense.budgetId === budgetId);

  const getTotalMaxBudget = () =>
    budgets.reduce((total, budget) => total + budget.max, 0);

  const addExpense = ({ description, amount, budgetId, date }) => {
    updateExpenses((prevExpenses) => [
      ...prevExpenses,
      { id: uuidV4(), description, amount, budgetId, date },
    ]);
  };

  const addBudget = ({ name, max, dueDate }) => {
    updateBudgets((prevBudgets) => {
      if (prevBudgets.find((budget) => budget.name === name)) {
        return prevBudgets;
      }
      return [
        ...prevBudgets,
        { id: uuidV4(), name, max, dueDate: dueDate || null },
      ];
    });
    return true;
  };

  const editBudget = ({ id, name, max, dueDate }) => {
    updateBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.id === id
          ? { ...budget, name, max, dueDate }
          : budget
      )
    );
    return true;
  };

  const deleteBudget = ({ id }) => {
    updateExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.budgetId === id
          ? { ...expense, budgetId: UNCATEGORIZED_BUDGET_ID }
          : expense
      )
    );

    updateBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== id));
  };

  const deleteExpense = ({ id }) => {
    updateExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
    );
  };

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        expenses,
        getBudgetExpenses,
        addExpense,
        addBudget,
        editBudget,
        deleteBudget,
        deleteExpense,
        getTotalMaxBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};
