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

  const addOneMonth = (dateString) => {
    if (!dateString) return null;
    
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const lastDayOfCurrentMonth = new Date(year, month + 1, 0).getDate();
    const isLastDayOfMonth = day === lastDayOfCurrentMonth;
    
    let newYear = year;
    let newMonth = month + 1;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    let newDay;
    if (isLastDayOfMonth) {
      newDay = new Date(newYear, newMonth + 1, 0).getDate();
    } else {
      newDay = day;
    }
    
    const pad = (n) => n.toString().padStart(2, '0');
    return `${newYear}-${pad(newMonth + 1)}-${pad(newDay)}`;
  };

  const rollBudgets = () => {
    updateExpenses([]);
    updateBudgets((prevBudgets) =>
      prevBudgets.map((budget) => ({
        ...budget,
        dueDate: addOneMonth(budget.dueDate),
      }))
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
        rollBudgets,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};
