export default function Button({ children, className = "", ...props }) {
    return (
        <button
            className={`bg-primary text-white px-4 py-2 rounded-xl font-medium active:scale-95 hover:brightness-110 transition-all ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
