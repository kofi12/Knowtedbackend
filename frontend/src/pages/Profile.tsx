import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';

interface User {
    id: string;
    name: string;
    email: string;
    Degree: string;
    avatar?: string;
    Plan: string;
}

export function Profile() {
    const { theme } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with API call
        const fetchUser = async () => {
            try {
                setUser({
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    Plan: 'Basic',
                    Degree: 'Bachelor of Science in Computer Science',
                });
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;
    if (!user) return <div className="p-4">User not found</div>;

    return (
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow border border-border">
            <h1 className="text-2xl font-bold mb-4 text-foreground">{user.name}</h1>
            <p className="text-muted-foreground mb-2">{user.email}</p>
            {user.Degree && <p className="text-foreground/80">{user.Degree}</p>}
            {user.Plan && <p className="text-foreground/80">Plan: {user.Plan}</p>}

        </div>
    );
}