import axios from "axios";
import Cookies from "js-cookie";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const UserActions = {
  CreateUser: async (data: any) => {
    try {
      const res = await axios.post(`${BACKEND_DOMAIN}/api/user/create`, data);
      return res.data;
    } catch (error) {
      console.error("Create User Error:", error);
      throw error;
    }
  },
  LoginUser: async (data: any) => {
    try {
      const res = await axios.post(`${BACKEND_DOMAIN}/api/user/login`, data);
      return res.data;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },
  GetAllUsers: async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BACKEND_DOMAIN}/api/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      console.error("Get Users Error:", error);
      throw error;
    }
  },
  GetUserById: async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BACKEND_DOMAIN}/api/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      console.error("Get User Error:", error);
      throw error;
    }
  },
  UpdateUser: async (id: number, data: any) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BACKEND_DOMAIN}/api/user/update/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    } catch (error) {
      console.error("Update User Error:", error);
      throw error;
    }
  },
  DeleteUser: async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${BACKEND_DOMAIN}/api/user/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    } catch (error) {
      console.error("Delete User Error:", error);
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
