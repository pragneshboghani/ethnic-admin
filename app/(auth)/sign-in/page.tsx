"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

const authFont = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function SignIn() {
    const { setUser } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
            const res = await UserActions.loginUser(formData);

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

    const PasswordIcon = showPassword ? <EyeOff /> : <Eye />;
    return (
        <section
            className={`${authFont.className} relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(26,115,232,0.10),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(161,66,244,0.08),_transparent_24%),linear-gradient(180deg,#eef1f6_0%,#f4f6fa_52%,#eaeef5_100%)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8`}
        >
            <div className="absolute bottom-[-3rem] left-[-4rem] h-60 w-60 rounded-full bg-[var(--bg-selected)]/24 blur-3xl" />
            <div className="absolute right-[6%] top-[14%] h-28 w-28 rounded-full bg-[var(--status-purple-bg)]/16 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] [background-size:88px_88px]" />

            <Link
                href="/"
                className="absolute left-4 top-5 z-10 rounded-2xl bg-[#0f1724] px-4 py-3 sm:left-6 sm:top-6 lg:left-8 lg:top-8"
            >
                <Image
                    src="/assets/Logo.svg"
                    alt="Ethnic Infotech"
                    width={188}
                    height={62}
                    priority
                    className="h-auto w-[148px] sm:w-[182px]"
                />
            </Link>

            <div className="relative w-full max-w-md">
                <div className="rounded-[20px] sm:rounded-[25px] md:rounded-[30px] border border-[var(--border)] bg-[var(--bg-inset)]/92 p-5 md:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8 overflow-y-auto max-h-[85vh]">
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <span className="inline-flex items-center rounded-full border border-[#c1cee1] bg-[var(--bg-selected)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#2a476f]">
                            Sign In
                        </span>

                        <h2 className="mt-2 sm:mt-4 md:mt-5 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
                            Access dashboard
                        </h2>
                        <p className="mt-1 sm:mt-2 md:mt-3 text-sm leading-5 md:leading-7 text-[#2a476f]">
                            Use your admin username and password to continue.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-2xl border border-[#e0c2cb] bg-[var(--status-purple-bg)] px-4 py-3 text-sm text-[#7d1c2e]"
                        >
                            {error}
                        </div>
                    )}

                    <form className="space-y-3 md:space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1 md:space-y-2.5">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-[#2a416f]"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                                className="w-full rounded-xl md:rounded-2xl border border-[#c2cfe0] bg-[var(--bg-selected)] p-2 sm:p-3 md:px-4 md:py-3.5 text-[var(--text-strong)] placeholder:text-[#2a476f] transition focus:border-[#c5cfde] focus:outline-none focus:ring-4 focus:ring-[#c5cfde]/20"
                            />
                        </div>

                        <div className="space-y-1 md:space-y-2.5 relative">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[#2a416f]"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                                className="w-full rounded-xl md:rounded-2xl border border-[#c2cfe0] bg-[var(--bg-selected)] p-2 sm:p-3 md:px-4 md:py-3.5 text-[var(--text-strong)] placeholder:text-[#2a476f] transition focus:border-[#c5cfde] focus:outline-none focus:ring-4 focus:ring-[#c5cfde]/20"
                            />
                            <span
                                className="absolute text-[var(--text-muted)] right-3 top-[47%] md:top-1/2 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {PasswordIcon}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-xl md:rounded-2xl bg-[var(--bg-selected)] p-2 sm:p-3 md:px-4 md:py-3.5 text-sm font-semibold text-[#2a446f] shadow-[0_14px_28px_rgba(90,116,154,0.18)] transition hover:bg-[var(--bg-selected)] focus:outline-none focus:ring-4 focus:ring-[#c4cfde]/25 disabled:cursor-not-allowed disabled:bg-[var(--bg-selected)] disabled:text-[#2a476f]"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#c1cfe1] bg-[var(--bg-selected)] px-4 py-3">
                        <CheckCircle2 className="text-[#2a466f]" size={18} />
                        <p className="text-sm text-[var(--text-muted)]">
                            Secure admin access for authorized team members only.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
