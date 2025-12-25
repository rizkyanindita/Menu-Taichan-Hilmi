import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-500 mb-8">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-black text-white rounded-xl">Return Home</Link>
        </div>
    );
}
