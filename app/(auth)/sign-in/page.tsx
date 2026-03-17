"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";

export default function SignIn() {
    const { setUser } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log('formData', formData)
            const res = await UserActions.LoginUser(formData);

            if (res.success) {
                UserActions.setToken(res.token);

                setUser(res?.user);

                router.push("/account/dashboard");
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex justify-center items-center min-h-[80vh] px-4">
            <div className="w-full max-w-md glass-card p-5">
                <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Sign in to access the blog admin panel
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <Link href="#" className="text-blue-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6">
                    Don't have an account?{" "}
                    <Link href="/sign-up" className="text-blue-600 font-medium hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}