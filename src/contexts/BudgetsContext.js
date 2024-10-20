import React, { useContext, useState } from "react";
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

  function getBudgetExpenses(budgetId) {
    return expenses.filter(expense => expense.budgetId === budgetId);
  }

  function getTotalCheckAmount() {
    return checks.reduce((total, check) => total + check.amount, 0);
  }

  function getTotalMaxBudget() {
    return budgets.reduce((total, budget) => total + budget.max, 0);
  }

  function addExpense({ description, amount, budgetId }) {
    setExpenses(prevExpenses => {
      return [...prevExpenses, { id: uuidV4(), description, amount, budgetId }];
    });
  }

  function addBudget({ name, max }) {
    const totalMaxBudget = getTotalMaxBudget() + max;
    const totalCheckAmount = getTotalCheckAmount();

    if (totalMaxBudget > totalCheckAmount) {
      alert("Total maximum budget exceeds total check amount!");
      return false; // Validation failed
    }

    setBudgets(prevBudgets => {
      if (prevBudgets.find(budget => budget.name === name)) {
        return prevBudgets;
      }
      return [...prevBudgets, { id: uuidV4(), name, max }];
    });
    return true; // Validation passed
  }

  function editBudget({ id, name, max }) {
    const currentBudgetMax = budgets.find(b => b.id === id).max;
    const totalMaxBudget = getTotalMaxBudget() - currentBudgetMax + max;
    const totalCheckAmount = getTotalCheckAmount();

    if (totalMaxBudget > totalCheckAmount) {
      alert("Total maximum budget exceeds total check amount!");
      return false; // Validation failed
    }

    setBudgets(prevBudgets => {
      return prevBudgets.map(budget =>
        budget.id === id ? { ...budget, name, max } : budget
      );
    });
    return true; // Validation passed
  }

  function deleteBudget({ id }) {
    setExpenses(prevExpenses => {
      return prevExpenses.map(expense => {
        if (expense.budgetId !== id) return expense;
        return { ...expense, budgetId: UNCATEGORIZED_BUDGET_ID };
      });
    });

    setBudgets(prevBudgets => {
      return prevBudgets.filter(budget => budget.id !== id);
    });
  }

  function deleteExpense({ id }) {
    setExpenses(prevExpenses => {
      return prevExpenses.filter(expense => expense.id !== id);
    });
  }

  function addCheck({ amount }) {
    setChecks(prevChecks => {
      return [...prevChecks, { id: uuidV4(), amount }];
    });
  }

  function resetChecks() {
    setChecks([]);
  }

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
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};
