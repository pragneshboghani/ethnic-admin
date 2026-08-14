import { jwtDecode, JwtPayload } from "jwt-decode";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

export interface CustomJwtPayload extends JwtPayload {
  role?: string;
  id?: number;
  email?: string;
  name?: string;
  can_access_calendar?: boolean;
}

type AuthorPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
  profile_image: string;
  description: string;
  can_access_calendar?: boolean;
};

const AuthorActions = {
  getCurrentUserRole: () => {
    const token = UserActions.getToken();
    if (token) {
      const user = jwtDecode<CustomJwtPayload>(token);
      return { role: user?.role, id: user?.id };
    }
    return null
  },
  getCurrentUser: () => {
    const token = UserActions.getToken();
    if (token) {
      const user = jwtDecode<CustomJwtPayload>(token);
      return {
        role: user?.role,
        id: user?.id,
        email: user?.email,
        name: user?.name,
        can_access_calendar: user?.can_access_calendar,
      };
    }
    return null
  },
  // Admins/super_admins always have calendar access — they're the ones
  // granting or revoking it for everyone else via the author form toggle.
  canAccessCalendar: () => {
    const token = UserActions.getToken();
    if (!token) return false;

    const user = jwtDecode<CustomJwtPayload>(token);
    return user?.role === "super_admin" || user?.role === "admin" || user?.can_access_calendar === true;
  },
  getAllAuthors: async () => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/all-author`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  },
  createNewAuthor: async (data: AuthorPayload) => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  },
  getAuthorById: async (id: number) => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/author/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  },
  updateAuthor: async (id: number, data: AuthorPayload) => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  },
  deleteAuthor: async (id: number) => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  },
  getAdminList: async () => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/admin-list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  },
  getSubAdminList: async () => {
    const token = UserActions.getToken();
    const res = await fetch(`${BACKEND_DOMAIN}/api/user/sub-admin-list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await res.json();
    return result;
  },
};

export default AuthorActions;
