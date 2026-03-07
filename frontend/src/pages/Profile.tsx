import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
}

export function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your API call
        const fetchUser = async () => {
            try {
                setUser({
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    bio: 'Software developer',
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
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
            <p className="text-gray-600 mb-2">{user.email}</p>
            {user.bio && <p className="text-gray-700">{user.bio}</p>}
        </div>
    );
}