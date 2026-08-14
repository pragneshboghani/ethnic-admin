"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    className?: string;
    labelClassName?: string;
};

const PasswordInput = ({ label, error, className = "", labelClassName = "", ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label className={labelClassName}>{label}</label>
            <div className="relative">
                <input {...props}
                    type={showPassword ? "text" : "password"}
                    className={`${className} pr-12`}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && (
                <p className="text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default PasswordInput;