import { API_BASE_URL } from "../../Util";

export const fetchTodos = async ({ pageParam, userId }) => {
  const limit = 9;

  const params = new URLSearchParams({ limit });

  if (pageParam !== null && pageParam !== undefined) {
    params.append("cursor", pageParam);
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/todo/user/${userId}?${params.toString()}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) throw new Error("Failed to fetch todos");

  return response.json(); // { data, nextCursor }
};

export const createTodo = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create todo: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
};

// PATCH is better than PUT
export const updateTodo = async (id, data) => {
  try {
    console.log("SENDING TO BACKEND UPDATE ", id, data);
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/update/${id}`, {
      method: 'PATCH',
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
}

export const deleteTodo = async ({id}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
};

export const deleteManyTodo = async ({id}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/delete/${id}/clear-completed`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting many todo:", error);
    throw error;
  }
}

export const reorderTodo = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/reorder`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // { order: [...] }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reorder todos: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result; // ✅ backend returns success + message

  } catch (error) {
    console.error("Error reordering todos:", error);
    throw error;
  }
};

