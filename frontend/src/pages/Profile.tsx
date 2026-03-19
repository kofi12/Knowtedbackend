import { useState, useEffect, useRef } from 'react';
import { Mail, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { fetchCurrentUser, UserProfile } from '../lib/api';
import { mockCurrentUser } from '../lib/mockData';

interface ProfileUser extends UserProfile {
  authProvider?: string;
}

function getInitials(name: string = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height / 2) / 240;
    const rotateY = (x - rect.width / 2) / 240;

    el.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.01)
    `;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform =
        'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
    }
  };

  return { ref, handleMouseMove, handleMouseLeave };
}

export function Profile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const tilt = useTilt();

  useEffect(() => {
    async function loadUser() {
      try {
        const apiUser = await fetchCurrentUser();
        setUser(apiUser);
        setName(apiUser.displayName);
        setProvider(apiUser.authProvider || 'google');
      } catch {
        setUser(mockCurrentUser);
        setName(mockCurrentUser.displayName);
        setProvider(mockCurrentUser.authProvider || 'google');
      }
    }
    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-16 md:mb-20">
          Profile
        </h1>

        <div
          ref={tilt.ref}
          onMouseMove={tilt.handleMouseMove}
          onMouseLeave={tilt.handleMouseLeave}
          className="relative transition-transform duration-300"
        >
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="
              w-[500px] h-[500px]
              rounded-full blur-[120px]
              opacity-30
              bg-green-400/20
              dark:bg-blue-500/20
            " />
          </div>

          <div className="
            rounded-3xl p-[1px]
            bg-gradient-to-r
            from-green-400/30 via-emerald-400/30 to-green-500/30
            dark:from-blue-500/60 dark:via-indigo-500/60 dark:to-blue-600/60
          ">
            <div className="rounded-3xl bg-background/70 dark:bg-background/80 backdrop-blur-xl border border-border shadow-2xl p-10">
              <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-48 h-48 rounded-full bg-blue-500/20 dark:bg-blue-500/30 blur-[100px]" />
                  <div className="absolute w-36 h-36 rounded-full border border-border animate-spin-slow" />
                  <div className="
                    absolute w-36 h-36 rounded-full p-[2px]
                    bg-gradient-to-br
                    from-green-400 via-emerald-500 to-green-600
                    dark:from-blue-500 dark:via-indigo-500 dark:to-blue-600
                  ">
                    <div className="w-full h-full rounded-full bg-background" />
                  </div>
                  <Avatar className="h-32 w-32 text-4xl font-black shadow-2xl">
                    <AvatarFallback className="
                      bg-gradient-to-br
                      from-green-500 via-emerald-500 to-green-600
                      dark:from-blue-500 dark:via-indigo-500 dark:to-blue-600
                      text-white
                    ">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h2 className="text-2xl font-semibold text-center">
                  {name}
                </h2>
              </div>

              <div className="mt-8 max-w-md mx-auto space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Display Name</p>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <Input value={user.email} disabled />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Auth Provider</p>
                  <select
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="google">Google</option>
                    <option value="github">GitHub</option>
                    <option value="apple">Apple</option>
                  </select>
                </div>

                <Button className="w-full mt-4">
                  Save Changes
                </Button>
              </div>

              <Separator className="my-8" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">EMAIL</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">STUDENT ID</p>
                    <p className="font-mono text-sm break-all">
                      {user.studentId}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}