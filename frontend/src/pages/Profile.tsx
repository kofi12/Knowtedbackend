import { useState, useEffect } from 'react';
import { Mail, Shield, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { fetchCurrentUser, UserProfile } from '../lib/api';
import { mockCurrentUser } from '../lib/mockData';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
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

interface ProfileUser extends UserProfile {
  authProvider?: string;
  createdAt?: string;
}

export function Profile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchCurrentUser();
        setUser(data);
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
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded mb-6" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="p-4 text-muted-foreground">User not found</div>;

  const initials = getInitials(user.displayName || 'U');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold truncate">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Auth Provider</p>
                <Badge variant="secondary" className="mt-0.5 capitalize">
                  {user.authProvider || 'email'}
                </Badge>
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
