import Cookies from "js-cookie";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const UserActions = {
  CreateUser: async (data: any) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Create User Error:", error.message);
      throw error;
    }
  },

  LoginUser: async (data: any) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to login");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Login Error:", error.message);
      throw error;
    }
  },

  GetAllUsers: async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

      const res = await fetch(`${BACKEND_DOMAIN}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Get Users Error:", error.message);
      throw error;
    }
  },

  GetUserById: async (id: number) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

      const res = await fetch(`${BACKEND_DOMAIN}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch user");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Get User Error:", error.message);
      throw error;
    }
  },

  UpdateUser: async (id: number, data: any) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

      const res = await fetch(`${BACKEND_DOMAIN}/api/user/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Update User Error:", error.message);
      throw error;
    }
  },

  DeleteUser: async (id: number) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

      const res = await fetch(`${BACKEND_DOMAIN}/api/user/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Delete User Error:", error.message);
      throw error;
    }
  },

  Logout: () => {
    Cookies.remove("token");
  },

  setToken: (token: string) => {
    Cookies.set("token", token, {
      expires: 7, // 7 days
      secure: false,
      sameSite: "strict",
    });
  },

  getToken: () => {
    return Cookies.get("token");
  },

  removeToken: () => {
    Cookies.remove("token");
  },
};

export default UserActions;