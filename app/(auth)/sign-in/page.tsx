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
            className={`${authFont.className} relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(73,112,164,0.22),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(80,62,128,0.18),_transparent_24%),linear-gradient(180deg,#0b1018_0%,#0e1622_52%,#091019_100%)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8`}
        >
            <div className="absolute bottom-[-3rem] left-[-4rem] h-60 w-60 rounded-full bg-[#36527b]/24 blur-3xl" />
            <div className="absolute right-[6%] top-[14%] h-28 w-28 rounded-full bg-[#5c3b8d]/16 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:88px_88px]" />

            <Link
                href="/"
                className="absolute left-4 top-5 z-10 sm:left-6 sm:top-6 lg:left-8 lg:top-8"
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
                <div className="rounded-[20px] sm:rounded-[25px] md:rounded-[30px] border border-white/10 bg-[#101826]/92 p-5 md:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8 overflow-y-auto max-h-[85vh]">
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <span className="inline-flex items-center rounded-full border border-[#223046] bg-[#121c2c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8fa3be]">
                            Sign In
                        </span>

                        <h2 className="mt-2 sm:mt-4 md:mt-5 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white">
                            Access dashboard
                        </h2>
                        <p className="mt-1 sm:mt-2 md:mt-3 text-sm leading-5 md:leading-7 text-[#92a2b8]">
                            Use your admin username and password to continue.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-2xl border border-[#4a2530] bg-[#24141a] px-4 py-3 text-sm text-[#efb8c2]"
                        >
                            {error}
                        </div>
                    )}

                    <form className="space-y-3 md:space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1 md:space-y-2.5">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-[#d8deea]"
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
                                className="w-full rounded-xl md:rounded-2xl border border-[#243246] bg-[#0d1522] p-2 sm:p-3 md:px-4 md:py-3.5 text-white placeholder:text-[#67788f] transition focus:border-[#58749a] focus:outline-none focus:ring-4 focus:ring-[#58749a]/20"
                            />
                        </div>

                        <div className="space-y-1 md:space-y-2.5 relative">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[#d8deea]"
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
                                className="w-full rounded-xl md:rounded-2xl border border-[#243246] bg-[#0d1522] p-2 sm:p-3 md:px-4 md:py-3.5 text-white placeholder:text-[#67788f] transition focus:border-[#58749a] focus:outline-none focus:ring-4 focus:ring-[#58749a]/20"
                            />
                            <span
                                className="absolute text-black right-3 top-[47%] md:top-1/2 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {PasswordIcon}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-xl md:rounded-2xl bg-[#8ea2bf] p-2 sm:p-3 md:px-4 md:py-3.5 text-sm font-semibold text-[#0d1522] shadow-[0_14px_28px_rgba(90,116,154,0.18)] transition hover:bg-[#a0b1ca] focus:outline-none focus:ring-4 focus:ring-[#8ea2bf]/25 disabled:cursor-not-allowed disabled:bg-[#5d6d82] disabled:text-[#c9d1dc]"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#1e2b3d] bg-[#0d1522] px-4 py-3">
                        <CheckCircle2 className="text-[#8ea2bf]" size={18} />
                        <p className="text-sm text-[#8f8074]">
                            Secure admin access for authorized team members only.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
