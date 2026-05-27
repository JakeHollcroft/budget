import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { fetchData, saveData } from "../services/gistStorage";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [savings, setSavings] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const saveTimeoutRef = useRef(null);
  const dataRef = useRef({ budgets, expenses, debts, savings });

  useEffect(() => {
    dataRef.current = { budgets, expenses, debts, savings };
  }, [budgets, expenses, debts, savings]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchData();
      setBudgets(data.budgets);
      setExpenses(data.expenses);
      setDebts(data.debts);
      setSavings(data.savings);
      setLastSynced(new Date());
    } catch (err) {
      setError("Failed to load data. Please check your connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveData(dataRef.current);
        setLastSynced(new Date());
        setError(null);
      } catch (err) {
        setError("Failed to save data. Changes may not be synced.");
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, []);

  const updateBudgets = useCallback((updater) => {
    setBudgets((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue;
    });
    debouncedSave();
  }, [debouncedSave]);

  const updateExpenses = useCallback((updater) => {
    setExpenses((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue;
    });
    debouncedSave();
  }, [debouncedSave]);

  const updateDebts = useCallback((updater) => {
    setDebts((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue;
    });
    debouncedSave();
  }, [debouncedSave]);

  const updateSavings = useCallback((updater) => {
    setSavings((prev) => {
      const newValue = typeof updater === "function" ? updater(prev) : updater;
      return newValue;
    });
    debouncedSave();
  }, [debouncedSave]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider
      value={{
        budgets,
        expenses,
        debts,
        savings,
        updateBudgets,
        updateExpenses,
        updateDebts,
        updateSavings,
        isLoading,
        isSaving,
        error,
        lastSynced,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
