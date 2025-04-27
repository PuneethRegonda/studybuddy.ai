"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Redirect() {
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1>Redirecting to dashboard...</h1>
        </div>
    );
}