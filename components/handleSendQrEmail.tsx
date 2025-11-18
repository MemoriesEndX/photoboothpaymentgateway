/**
 * HandleSendQrEmail Component
 * UI component untuk mengirim QR Code ke email
 * 
 * Features:
 * - Email validation
 * - Loading state
 * - Error handling
 * - Success feedback
 * - Clean modern UI
 * 
 * @author Senior Fullstack Engineer
 * @version 2.0.0 - Production Ready
 */

'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface HandleSendQrEmailProps {
  sessionId: string;
  placeholder?: string;
  onSuccess?: (email: string) => void;
  className?: string;
  userName?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function HandleSendQrEmail({
  sessionId,
  placeholder = 'your.email@example.com',
  onSuccess,
  className = '',
  userName,
}: HandleSendQrEmailProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);

  const handleSendEmail = useCallback(async () => {
    if (!email || !email.trim()) {
      toast({
        title: '📧 Email Required',
        description: 'Please enter an email address to send the QR code.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: '⚠️ Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!sessionId) {
      toast({
        title: '❌ Error',
        description: 'No session ID available. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);

      console.log(`📤 Sending QR code to: ${email}`);

      const response = await fetch('/api/send-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          email: email.trim(),
          userName,
        }),
      });

      let data: ApiResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid server response');
      }

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || 'Failed to send email';
        throw new Error(errorMessage);
      }

      console.log(`✅ Email sent successfully to ${email}`);
      
      setLastSentEmail(email);
      setEmail('');

      toast({
        title: '✅ Email Sent!',
        description: `QR code has been sent to ${email}. Check your inbox 📬`,
        duration: 5000,
      });

      onSuccess?.(email);

    } catch (error: unknown) {
      console.error('❌ Send email error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Could not send email. Please try again.';
      
      toast({
        title: '❌ Send Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [email, sessionId, userName, onSuccess]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isSending) {
        e.preventDefault();
        handleSendEmail();
      }
    },
    [handleSendEmail, isSending]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">
          Send QR Code via Email
        </h3>
      </div>

      <p className="text-sm text-gray-600">
        Enter your email address and we&apos;ll send you the QR code to access your photo gallery.
      </p>

      <div className="space-y-2">
        <Label htmlFor="qr-email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              id="qr-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="pr-10"
            />
            {email && isValidEmail(email) && !isSending && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>

          <Button
            onClick={handleSendEmail}
            disabled={isSending || !email || !isValidEmail(email)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          We&apos;ll send you a QR code attachment you can scan to view your photos.
        </p>
      </div>

      {lastSentEmail && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">
                Previously sent to:
              </p>
              <p className="text-sm text-green-700 font-mono">
                {lastSentEmail}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Session ID:</span>{' '}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">
                {sessionId.slice(0, 16)}...
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
