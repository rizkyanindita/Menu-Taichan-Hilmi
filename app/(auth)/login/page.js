import Link from 'next/link';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage orders</p>
                </div>
                <LoginForm />
                <Link
                    href={`/menu/${process.env.NEXT_PUBLIC_CAFE_ID}`}
                    className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                    Lihat menu tanpa login
                    <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    )
}
