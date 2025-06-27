import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User2, Mail, KeyRound, ShieldCheck, Copy, Trash2, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { authAPI } from '../services/api';

function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name = user?.name || 'User';
  const email = user?.email || 'Not provided';
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  const formattedUserNumber = user?.userNumber ? user.userNumber.toString().padStart(4, '0') : 'N/A';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      toast.error('Please fill all fields');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(passwords.old, passwords.new);
      setShowChangePassword(false);
      setPasswords({ old: '', new: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied!');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      toast.success('Account deleted (demo only)');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 py-10 px-2">
      <Card className="w-full max-w-md shadow-2xl border-green-200 border bg-white/90 dark:bg-gray-900/90 backdrop-blur-md animate-fade-in rounded-2xl overflow-hidden">
        {/* Banner/Cover */}
        <div className="h-28 w-full bg-gradient-to-r from-green-400 via-green-600 to-green-800 flex items-end justify-center relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg absolute left-1/2 -bottom-12 -translate-x-1/2 bg-white">
            {/* If you have user image, use <AvatarImage src={user.image} /> */}
            <AvatarFallback className="bg-green-100 text-green-700 text-3xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardHeader className="flex flex-col items-center gap-2 pt-16 pb-2">
          <CardTitle className="text-green-700 text-2xl font-bold flex items-center gap-2">
            <User2 className="text-green-600" size={28} />
            {name}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground flex items-center gap-1">
            <Mail className="w-4 h-4 text-green-600" />
            {email}
            <Button size="icon" variant="ghost" className="ml-1" onClick={handleCopyEmail} title="Copy email">
              <Copy className="w-4 h-4 text-green-600" />
            </Button>
          </CardDescription>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <CalendarDays className="w-4 h-4 text-green-600" />
            Joined: {joinDate}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="font-mono">ID: {formattedUserNumber}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowChangePassword((v) => !v)}
              className="flex items-center gap-2 w-full justify-center"
            >
              <KeyRound className="w-4 h-4" /> Change Password
            </Button>
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-2 mt-2 animate-fade-in">
                <Input
                  type="password"
                  placeholder="Old password"
                  value={passwords.old}
                  onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  disabled={loading}
                />
                <div className="flex gap-2 mt-1">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowChangePassword(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Password must be at least 6 characters.
                </div>
              </form>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="destructive"
                onClick={logout}
                className="flex items-center gap-2 w-full justify-center bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold border-none shadow-md hover:from-red-600 hover:to-red-800 hover:scale-[1.02] transition-all"
              >
                <LogOut size={18} /> Logout
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 w-full justify-center border-red-400 text-red-700 hover:bg-red-50 hover:border-red-600"
                disabled={deleting}
              >
                <Trash2 size={18} /> {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.56,1) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
