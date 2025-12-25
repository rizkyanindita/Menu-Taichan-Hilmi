"use client";
import NextImage from 'next/image';
import { useState } from 'react';

export default function Image({ src, alt, className, ...props }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Validate src
    // 1. Must be string
    // 2. Must start with / or http
    // 3. Must NOT be an unsplash "page" URL (often mistaken for image URL)
    const isValidSrc = src &&
        (typeof src === 'string') &&
        (src.startsWith('/') || src.startsWith('http')) &&
        !src.includes('unsplash.com/photos/');

    const imageSrc = isValidSrc && !error ? src : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'; // Fallback image

    return (
        <div className={`overflow-hidden relative ${className} bg-gray-100`}>
            <NextImage
                src={imageSrc}
                alt={alt || "Image"}
                className={`duration-700 ease-in-out ${loading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
                {...props}
            />
        </div>
    )
}
