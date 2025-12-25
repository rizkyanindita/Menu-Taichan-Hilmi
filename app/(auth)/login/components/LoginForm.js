"use client";
import Button from '@/components/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Static credentials for demo
        const validCredentials = {
            'owner': { password: '123', role: 'owner' },
            'staff': { password: '123', role: 'staff' }
        };

        // Simulate delay for UX
        await new Promise(r => setTimeout(r, 800));

        const user = validCredentials[username.toLowerCase()];

        if (user && user.password === password) {
            console.log("Login successful:", username);
            router.push(`/dashboard?role=${user.role}`);
        } else {
            alert('Invalid credentials! Try:\nOwner: owner / 123\nStaff: staff / 123');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                             focus:ring-4 focus:ring-primary/10 focus:border-primary 
                             outline-none transition-all duration-200 
                             placeholder:text-gray-400 font-medium"
                    placeholder="Masukkan Username Anda"
                    required
                    autoComplete="username"
                />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 text-gray-900 bg-white border-2 border-gray-200 rounded-xl 
                             focus:ring-4 focus:ring-primary/10 focus:border-primary 
                             outline-none transition-all duration-200 
                             placeholder:text-gray-400 font-medium"
                    placeholder="Masukkan Password Anda"
                    required
                    autoComplete="current-password"
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                    </div>
                ) : (
                    'Sign In'
                )}
            </Button>

            {/* Demo Credentials Info */}
            <div className="relative mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl">
                <div className="absolute -top-3 left-4 px-2 bg-white">
                    <span className="text-xs font-bold text-blue-900">🔑 Demo Credentials</span>
                </div>
                <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-900 w-14">Owner:</span>
                        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                            owner
                        </code>
                        <span className="text-xs text-blue-600">/</span>
                        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                            123
                        </code>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-900 w-14">Staff:</span>
                        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                            staff
                        </code>
                        <span className="text-xs text-blue-600">/</span>
                        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                            123
                        </code>
                    </div>
                </div>
            </div>
        </form>
    )
}
