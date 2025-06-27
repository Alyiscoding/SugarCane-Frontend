import React, { useState } from 'react';
import { feedbackAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MessageCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function validateEmail(email) {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Feedback() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (f) => {
    if (!f.username.trim()) return 'Username is required.';
    if (!f.email.trim()) return 'Email is required.';
    if (!validateEmail(f.email.trim())) return 'Please enter a valid email address.';
    if (!f.message.trim()) return 'Feedback cannot be empty.';
    if (f.message.trim().length < 10) return 'Feedback must be at least 10 characters.';
    if (f.message.length > 1000) return 'Feedback cannot exceed 1000 characters.';
    return '';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const response = await feedbackAPI.submitFeedback({
          username: form.username.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
      });
      setSuccess('Thank you for your feedback!');
      toast.success('Thank you for your feedback!');
      setForm({ username: user?.username || '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('You must be logged in to submit feedback.');
        } else {
          setError(err.response.data?.message || 'Failed to submit feedback.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 bg-transparent">
      <Card className="w-full max-w-lg shadow-xl border-green-600 border bg-white/90 dark:bg-gray-900/90">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <span className="rounded-full bg-green-100 p-2 mb-1">
            <MessageCircle className="text-green-600" size={36} />
          </span>
          <CardTitle className="text-green-700 text-2xl font-bold">Feedback</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            We value your thoughts! Please let us know about any issues, suggestions, or questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                name="username"
                placeholder="Your name"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                className="border-green-400 focus:border-green-600 focus:ring-green-600"
                autoComplete="username"
              />
              <Input
                name="email"
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="border-green-400 focus:border-green-600 focus:ring-green-600"
                autoComplete="email"
              />
              <Input
                name="subject"
                placeholder="Subject (optional)"
                value={form.subject}
                onChange={handleChange}
                disabled={loading}
                className="border-green-400 focus:border-green-600 focus:ring-green-600"
                autoComplete="off"
              />
              <Textarea
                name="message"
                placeholder="Your feedback or issue..."
                value={form.message}
                onChange={handleChange}
                minLength={10}
                maxLength={1000}
                required
                disabled={loading}
                className="resize-none min-h-[120px] border-green-400 focus:border-green-600 focus:ring-green-600"
              />
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Info size={16} className="text-green-600" />
                <span>Your feedback helps us improve the platform for everyone.</span>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !!validateForm(form)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded shadow"
                aria-busy={loading ? 'true' : 'false'}
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Feedback;
