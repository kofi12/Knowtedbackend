import { useState, useEffect } from 'react';
import { Mail, Shield, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { fetchCurrentUser, UserProfile } from '../lib/api';
import { mockCurrentUser } from '../lib/mockData';

interface ProfileUser extends UserProfile {
  authProvider?: string;
  createdAt?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function Profile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const apiUser = await fetchCurrentUser();
        setUser(apiUser);
      } catch {
        setUser({
          studentId: mockCurrentUser.studentId,
          email: mockCurrentUser.email,
          displayName: mockCurrentUser.displayName,
          authProvider: mockCurrentUser.authProvider,
          createdAt: mockCurrentUser.createdAt,
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>

      <Card>
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            {user.authProvider && (
              <Badge variant="secondary" className="mt-2 capitalize">
                {user.authProvider}
              </Badge>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium font-mono text-sm">{user.studentId}</p>
            </div>
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
