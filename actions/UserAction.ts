import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const UserActions = {
  createUser: async (data: any) => {
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

  loginUser: async (data: any) => {
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

  getAllUsers: async () => {
    try {
      const token = UserActions.getToken();

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

  getUserById: async (id: number) => {
    try {
      const token = UserActions.getToken();

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

  updateUser: async (id: number, data: any) => {
    try {
      const token = UserActions.getToken();

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

  deleteUser: async (id: number) => {
    try {
      const token = UserActions.getToken();

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

  logout: () => {
    Cookies.remove("token");
  },

  setToken: (token: string) => {
    Cookies.set("token", token, {
      expires: 1,
      secure: false,
      sameSite: "strict",
    });
  },

  isLogin: (router: any) => {
    const token = UserActions.getToken();

    if (!token) {
      router.push("/");
      Cookies.remove("token");
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        Cookies.remove("token");
        router.push("/");
        return false;
      }

      return true;
    } catch (error) {
      Cookies.remove("token");
      router.push("/");
      return false;
    }
  },

  getToken: () => {
    const token = Cookies.get("token");
    // if (!token) throw new Error("User not logged in");
    return token;
  },
};

export default UserActions;
