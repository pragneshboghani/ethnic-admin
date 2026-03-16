"use client";

import { createContext, useContext, useState } from "react";

export type UserType = {
    id: number;
    name: string;
    phone?: string;
    email: string;
};

type UserContextType = {
    user: UserType | null;
    setUser: (user: UserType | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

// PROVIDER
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// HOOK
export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside UserProvider");
    return ctx;
};