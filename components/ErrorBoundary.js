"use client";
import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-8 text-center bg-red-50 rounded-xl my-4">
                    <p className="text-red-500 font-medium">Something went wrong.</p>
                    <button onClick={() => this.setState({ hasError: false })} className="text-sm underline mt-2 text-red-600">Try again</button>
                </div>
            );
        }

        return this.props.children;
    }
}
