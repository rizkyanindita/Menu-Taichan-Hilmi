import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request, { params }) {
    const { cafeId } = await params;

    try {
        const docRef = doc(db, "menus", cafeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return NextResponse.json({
                cafeId,
                name: data.name || cafeId,
                items: data.items || []
            });
        } else {
            return NextResponse.json({ error: "Menu not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Firebase error:", error);
        return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
    }
}
