import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const UserActions = {

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
