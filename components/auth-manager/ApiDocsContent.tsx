'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
      <CopyButton text={code} />
      <pre className="p-4 pr-12 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    POST: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return (
    <Badge className={`font-mono text-xs ${colors[method] || 'bg-slate-500/20 text-slate-400'}`}>
      {method}
    </Badge>
  )
}

function EndpointCard({
  method,
  path,
  description,
  requestBody,
  successResponse,
  errorResponse,
  params,
}: {
  method: string
  path: string
  description: string
  requestBody?: string
  successResponse: string
  errorResponse?: string
  params?: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/30 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-cyan-400">{path}</code>
        <span className="text-sm text-slate-500 font-jakarta ml-auto hidden sm:block">{description}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-400 font-jakarta">{description}</p>

          <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Auth Required</Badge>
            <span>Bearer token in Authorization header</span>
          </div>

          {params && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta mb-2">Query Parameters</div>
              <CodeBlock code={params} />
            </div>
          )}

          {requestBody && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta mb-2">Request Body</div>
              <CodeBlock code={requestBody} />
            </div>
          )}

          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta mb-2">Success Response</div>
            <CodeBlock code={successResponse} />
          </div>

          {errorResponse && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta mb-2">Error Response</div>
              <CodeBlock code={errorResponse} />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-outfit font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

export function ApiDocsContent({ baseUrl }: { baseUrl: string }) {
  return (
    <div className="space-y-10">
      {/* How It Works */}
      <Section title="How It Works">
        <Card className="bg-slate-900/50 border-slate-800 p-5 space-y-4">
          <p className="text-sm text-slate-300 font-jakarta">
            SimplStudios Auth Manager is a <span className="text-cyan-400 font-medium">management layer</span> that
            sits on top of your app&apos;s Turso database. Your apps keep their own users table and auth logic
            (SimplDB Auth / NextAuth). The Auth Manager adds features your database can&apos;t do alone:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-jakarta">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-cyan-400 font-medium mb-1">Password Reset Emails</div>
              <div className="text-slate-500">Generate token → send email → verify token → update password_hash</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-emerald-400 font-medium mb-1">Email Verification</div>
              <div className="text-slate-500">Generate token → send email → verify token → mark verified</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-violet-400 font-medium mb-1">Magic Link Login</div>
              <div className="text-slate-500">Generate token → send email → verify token → return user data</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-red-400 font-medium mb-1">Ban System</div>
              <div className="text-slate-500">Check ban status on login → block banned users → show reason</div>
            </div>
          </div>
          <CodeBlock code={`Your App (SimplDB Auth + Turso)
  │
  │  1. User clicks "Forgot Password"
  │  2. App calls POST ${baseUrl}/api/auth/send-reset
  │     → Auth Manager generates token, sends email via Resend
  │
  │  3. User clicks link in email, lands on YOUR app's /reset-password page
  │  4. App calls POST ${baseUrl}/api/auth/verify-reset
  │     → Auth Manager verifies token, hashes new password,
  │       updates password_hash directly in YOUR Turso database
  │
  │  5. User logs in with new password (normal SimplDB Auth flow)
  │
SimplStudios Auth Manager (PostgreSQL)
  ├── auth_tokens (reset/verify/magic tokens with expiry)
  ├── auth_user_bans (ban records per user per database)
  └── auth_email_settings (Resend API key, from email)`} />
        </Card>
      </Section>

      {/* Authentication */}
      <Section title="Authentication">
        <Card className="bg-slate-900/50 border-slate-800 p-5">
          <p className="text-sm text-slate-400 font-jakarta mb-3">
            Every API request uses your <span className="text-white font-medium">Turso auth token</span> as
            the Bearer token. This is the same <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">TURSO_AUTH_TOKEN</code> from
            your app&apos;s <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">.env</code> file.
          </p>
          <CodeBlock code={`// Your app's .env already has this:
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIs...

// Use it as the Bearer token for Auth Manager API:
headers: {
  "Authorization": "Bearer " + process.env.TURSO_AUTH_TOKEN,
  "Content-Type": "application/json"
}`} />
          <p className="text-xs text-slate-500 font-jakarta mt-3">
            The Auth Manager matches this token against the connected database to identify which app is calling.
            This means each app can only manage its own users.
          </p>
        </Card>
      </Section>

      {/* API Endpoints */}
      <Section title="Endpoints">
        <div className="space-y-3">
          <EndpointCard
            method="POST"
            path="/api/auth/send-reset"
            description="Send a password reset email"
            requestBody={`{
  "userId": "42",
  "email": "user@example.com",
  "resetUrl": "https://yourapp.com/reset-password"
}

// resetUrl is where the email link points to.
// The token gets appended as ?token=abc123...
// If omitted, defaults to the App URL in Email Settings.`}
            successResponse={`{
  "success": true,
  "expiresAt": "2025-01-15T11:30:00.000Z"
}`}
            errorResponse={`{ "error": "Resend is not configured..." }`}
          />

          <EndpointCard
            method="POST"
            path="/api/auth/verify-reset"
            description="Verify reset token and set new password"
            requestBody={`{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}

// The token comes from the URL when user clicks the email link.
// The password is hashed with bcryptjs before being stored
// in your Turso database's password_hash column.`}
            successResponse={`{
  "success": true,
  "userId": "42"
}`}
            errorResponse={`{ "error": "Token expired" }
// Possible errors: "Invalid token", "Token already used",
// "Token expired", "No password column mapped"`}
          />

          <EndpointCard
            method="POST"
            path="/api/auth/send-verification"
            description="Send an email verification link"
            requestBody={`{
  "userId": "42",
  "email": "user@example.com",
  "verifyUrl": "https://yourapp.com/verify-email"
}`}
            successResponse={`{
  "success": true,
  "expiresAt": "2025-01-16T10:30:00.000Z"
}`}
          />

          <EndpointCard
            method="POST"
            path="/api/auth/verify-email"
            description="Verify email token and mark email as verified"
            requestBody={`{
  "token": "abc123def456..."
}

// If your users table has an email_verified column,
// it gets set to true/1 automatically.`}
            successResponse={`{
  "success": true,
  "userId": "42",
  "email": "user@example.com"
}`}
          />

          <EndpointCard
            method="POST"
            path="/api/auth/send-magic-link"
            description="Send a magic sign-in link (passwordless login)"
            requestBody={`{
  "userId": "42",
  "email": "user@example.com",
  "loginUrl": "https://yourapp.com/magic-login"
}`}
            successResponse={`{
  "success": true,
  "expiresAt": "2025-01-15T10:45:00.000Z"
}`}
          />

          <EndpointCard
            method="POST"
            path="/api/auth/verify-magic-link"
            description="Verify magic link and get user data for session"
            requestBody={`{
  "token": "abc123def456..."
}`}
            successResponse={`{
  "success": true,
  "user": {
    "id": "42",
    "email": "user@example.com",
    "name": null,
    "username": "johndoe",
    "role": null
  }
}

// Use this data to create a session in your app.`}
          />

          <EndpointCard
            method="GET"
            path="/api/auth/check-ban"
            description="Check if a user is banned"
            params={`?userId=42`}
            successResponse={`// Not banned:
{ "banned": false }

// Banned:
{
  "banned": true,
  "reason": "Violated terms of service",
  "type": "permanent",
  "expiresAt": null,
  "bannedAt": "2025-01-15T10:30:00.000Z"
}`}
          />
        </div>
      </Section>

      {/* SimplDB Integration Guide */}
      <Section title="SimplDB Auth Integration">
        <p className="text-sm text-slate-400 font-jakarta mb-4">
          Copy these files into your SimplDB Auth app to add password reset, email verification, and ban checking.
        </p>
        <div className="space-y-6">

          {/* Step 1: Env var */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 1</Badge>
              Add the Auth Manager URL to your .env
            </div>
            <CodeBlock code={`# .env (add alongside your existing TURSO_ vars)
SIMPLSTUDIOS_AUTH_URL=${baseUrl}`} />
          </Card>

          {/* Step 2: Helper */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 2</Badge>
              Create app/lib/auth-manager.js
            </div>
            <CodeBlock code={`// app/lib/auth-manager.js
const AUTH_URL = process.env.SIMPLSTUDIOS_AUTH_URL;
const TOKEN = process.env.TURSO_AUTH_TOKEN;

async function authManagerFetch(path, options = {}) {
  const res = await fetch(AUTH_URL + path, {
    ...options,
    headers: {
      "Authorization": "Bearer " + TOKEN,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

export async function sendPasswordReset(userId, email) {
  return authManagerFetch("/api/auth/send-reset", {
    method: "POST",
    body: JSON.stringify({
      userId: String(userId),
      email,
      resetUrl: process.env.NEXT_PUBLIC_APP_URL + "/reset-password",
    }),
  });
}

export async function verifyPasswordReset(token, newPassword) {
  return authManagerFetch("/api/auth/verify-reset", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function sendVerificationEmail(userId, email) {
  return authManagerFetch("/api/auth/send-verification", {
    method: "POST",
    body: JSON.stringify({
      userId: String(userId),
      email,
      verifyUrl: process.env.NEXT_PUBLIC_APP_URL + "/verify-email",
    }),
  });
}

export async function verifyEmailToken(token) {
  return authManagerFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function checkBan(userId) {
  return authManagerFetch(
    "/api/auth/check-ban?userId=" + encodeURIComponent(userId)
  );
}

export async function sendMagicLink(userId, email) {
  return authManagerFetch("/api/auth/send-magic-link", {
    method: "POST",
    body: JSON.stringify({
      userId: String(userId),
      email,
      loginUrl: process.env.NEXT_PUBLIC_APP_URL + "/magic-login",
    }),
  });
}

export async function verifyMagicLink(token) {
  return authManagerFetch("/api/auth/verify-magic-link", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}`} />
          </Card>

          {/* Step 3: Forgot password API route */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 3</Badge>
              Create app/api/account/forgot-password/route.js
            </div>
            <CodeBlock code={`import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { initSchema } from "@/app/lib/schema";
import { sendPasswordReset } from "@/app/lib/auth-manager";

export async function POST(request) {
  await initSchema();
  const { email } = await request.json();
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email FROM users WHERE email = ?",
    args: [email],
  });

  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return NextResponse.json({ success: true });
  }

  const user = result.rows[0];
  const res = await sendPasswordReset(user.id, user.email);

  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}`} />
          </Card>

          {/* Step 4: Reset password API route */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 4</Badge>
              Create app/api/account/reset-password/route.js
            </div>
            <CodeBlock code={`import { NextResponse } from "next/server";
import { verifyPasswordReset } from "@/app/lib/auth-manager";

export async function POST(request) {
  const { token, newPassword } = await request.json();
  if (!token || !newPassword)
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  if (newPassword.length < 6)
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );

  const res = await verifyPasswordReset(token, newPassword);

  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

// The Auth Manager handles everything:
// 1. Validates the token hasn't expired or been used
// 2. Hashes the new password with bcryptjs
// 3. Updates password_hash in YOUR Turso database
// 4. Marks the token as used`} />
          </Card>

          {/* Step 5: Ban check in auth config */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 5</Badge>
              Add ban check to auth-config.js signIn callback
            </div>
            <CodeBlock code={`// In your auth-config.js, update the signIn callback:
async signIn({ user, account }) {
  // Check ban status before allowing login
  if (user.id) {
    try {
      const { checkBan } = await import("./auth-manager");
      const banData = await checkBan(user.id);
      if (banData.banned) {
        // Return false to block sign in
        // The error message will show on the login page
        return false;
      }
    } catch (e) {
      // If Auth Manager is down, allow login (fail-open)
      console.warn("Ban check failed:", e.message);
    }
  }

  // ... rest of your existing signIn logic
  if (account.provider === "credentials") return true;
  // ...
}`} />
          </Card>

          {/* Step 6: Pages */}
          <Card className="bg-slate-900/50 border-slate-800 p-5">
            <div className="text-sm font-medium text-white font-jakarta mb-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Step 6</Badge>
              Create the forgot/reset password pages
            </div>
            <p className="text-sm text-slate-400 font-jakarta mb-3">
              Create a <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">/forgot-password</code> page
              with an email input that calls your forgot-password API route, and
              a <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">/reset-password</code> page
              that reads the <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">?token=</code> from
              the URL and lets the user set a new password.
            </p>
            <CodeBlock code={`// Example: app/reset-password/page.js (client component)
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/account/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus("Password reset! You can now log in.");
    } else {
      setStatus(data.error || "Failed to reset password");
    }
  }

  if (!token) return <p>Invalid reset link.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 6 chars)"
        minLength={6}
        required
      />
      <button type="submit">Reset Password</button>
      {status && <p>{status}</p>}
    </form>
  );
}`} />
          </Card>
        </div>
      </Section>

      {/* Error Codes */}
      <Section title="Error Codes">
        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-3 text-slate-500 font-jakarta font-medium">Status</th>
                <th className="text-left p-3 text-slate-500 font-jakarta font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="font-jakarta">
              <tr className="border-b border-slate-800/50">
                <td className="p-3"><Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono">200</Badge></td>
                <td className="p-3 text-slate-300">Success</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="p-3"><Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono">400</Badge></td>
                <td className="p-3 text-slate-300">Bad request — missing params, invalid/expired/used token</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="p-3"><Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">401</Badge></td>
                <td className="p-3 text-slate-300">Unauthorized — missing or invalid Bearer token</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="p-3"><Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">403</Badge></td>
                <td className="p-3 text-slate-300">Forbidden — token belongs to a different database</td>
              </tr>
              <tr>
                <td className="p-3"><Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">500</Badge></td>
                <td className="p-3 text-slate-300">Server error or Resend not configured</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </Section>
    </div>
  )
}
