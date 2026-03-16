"use client";

import { useState } from "react";
import Link from "next/link";
import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const { setUser } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.role) {
            setError("Email, Password and Role are required!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Password and Confirm Password do not match!");
            return;
        }

        setError("");

        try {
            const res = await UserActions.CreateUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            console.log('res', res)

            if (res.success) {
                UserActions.setToken(res?.token);

                setUser(res?.user);

                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "",
                });

                router.replace('/account/dashboard')
            }
        } catch (error: any) {
            setError(error?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <>
            <div className="w-full max-w-md glass-card p-5">

                <h2 className="text-2xl font-bold text-center mb-2">
                    Create Account
                </h2>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Register to access the blog admin panel
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email Address *
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password *
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Select Role *
                        </label>

                        <select
                            name="role"
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                        >
                            <option value="" className="text-black">Select Role</option>
                            <option value="super_admin" className="text-black">Super Admin</option>
                            <option value="editor" className="text-black">Editor</option>
                            <option value="writer" className="text-black">Content Writer</option>
                            <option value="seo_manager" className="text-black">SEO Manager</option>
                        </select>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Sign Up
                    </button>

                </form>

                <p className="text-sm text-center mt-6">
                    Already have an account?{" "}
                    <Link
                        href="/"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

            </div>
        </>
    );
}