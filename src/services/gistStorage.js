import config from "../config";

const GITHUB_API_URL = `https://api.github.com/gists/${config.GIST_ID}`;

const headers = {
  Authorization: `token ${config.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
};

const DEFAULT_DATA = {
  budgets: [],
  expenses: [],
  debts: [],
  savings: [],
  lastUpdated: new Date().toISOString(),
};

export async function fetchData() {
  try {
    const response = await fetch(GITHUB_API_URL, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const gist = await response.json();
    const fileContent = gist.files[config.GIST_FILENAME]?.content;

    if (!fileContent) {
      console.warn("Gist file not found, returning default data");
      return DEFAULT_DATA;
    }

    const data = JSON.parse(fileContent);
    return {
      budgets: data.budgets || [],
      expenses: data.expenses || [],
      debts: data.debts || [],
      savings: data.savings || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching data from Gist:", error);
    throw error;
  }
}

export async function saveData(data) {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const response = await fetch(GITHUB_API_URL, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        files: {
          [config.GIST_FILENAME]: {
            content: JSON.stringify(dataToSave, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error saving data to Gist:", error);
    throw error;
  }
}
