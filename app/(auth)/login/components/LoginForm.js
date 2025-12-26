"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function LoginForm() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validCredentials = {
        owner: { password: "123", role: "owner" },
        staff: { password: "123", role: "staff" },
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate API delay
        await new Promise((r) => setTimeout(r, 800));

        const user = validCredentials[username.toLowerCase()];

        if (user && user.password === password) {
            router.push(`/dashboard?role=${user.role}`);
        } else {
            setError("Password atau username salah");
            setUsername("");
            setPassword("");
        }

        setLoading(false);
    };

    /* ======================
       Tailwind Input Styles
       ====================== */
    const inputBase =
        "w-full px-4 py-3.5 rounded-xl border text-gray-900 bg-white " +
        "placeholder:text-gray-400 font-medium outline-none " +
        "transition-all duration-200";

    const inputNormal =
        "border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10";

    const inputError =
        "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200";

    const inputDisabled = "opacity-60 cursor-not-allowed";

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-3
                     text-sm font-semibold text-red-700"
                >
                    {error}
                </div>
            )}

            {/* Username */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    disabled={loading}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError("");
                    }}
                    className={`${inputBase} ${error ? inputError : inputNormal
                        } ${loading ? inputDisabled : ""}`}
                    placeholder="Masukkan Username Anda"
                    autoComplete="username"
                    required
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                    }}
                    className={`${inputBase} ${error ? inputError : inputNormal
                        } ${loading ? inputDisabled : ""}`}
                    placeholder="Masukkan Password Anda"
                    autoComplete="current-password"
                    required
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full
                             border-2 border-white border-t-transparent" />
                        Signing in...
                    </span>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
}
