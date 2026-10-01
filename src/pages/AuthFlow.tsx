import { useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { useToast } from '../contexts/ToastContext';
import { button, fieldLabel, textInput } from '../styles';
import type { Role } from '../types/lms';
import { useForgotPassword, useLogin, useResetPassword } from '../api/auth';
import { toRole } from '../api/types';

type AuthScreen = 'login' | 'forgot' | 'reset';

interface AuthFlowProps {
  onComplete: (role: Role) => void;
}

const benefits = [
  'Pick up exactly where you stopped',
  'Join classes and watch every replay',
  'Submit work and get facilitator feedback',
  'Unlock verified course certificates',
];

export function AuthFlow({ onComplete }: AuthFlowProps) {
  const { toast } = useToast();
  const resetToken = new URLSearchParams(window.location.search).get('token');
  const [screen, setScreen] = useState<AuthScreen>(() => resetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const loginMutation = useLogin();
  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setError('');
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const actualRole = toRole(result.account.role);
      if (!actualRole) throw new Error('This account does not have a supported LMS role.');
      toast(password === 'SecurePass123!' ? 'Welcome. Change your temporary password immediately from Account & security.' : `Welcome back. Opening the ${actualRole} workspace.`);
      onComplete(actualRole);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to sign in.');
    }
  };

  const authTitle = screen === 'login' ? 'Welcome back' : screen === 'forgot' ? 'Recover your account' : 'Choose a new password';

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-hq-red-ink p-12 text-hq-bone lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-40 [background-image:repeating-radial-gradient(circle_at_15%_110%,transparent_0_52px,rgba(224,20,44,.5)_52px_54px)]" />
        <div className="relative">
          <Logo theme="dark" subtitle="Academy" size="lg" />
        </div>
        <div className="relative my-auto max-w-[560px]">
          <p className="mb-4 text-sm font-semibold text-hq-amber">CIRCLE HQ ACADEMY</p>
          <h1 className="text-[clamp(46px,5vw,76px)] leading-[0.96] font-[780] tracking-[-0.04em] [font-stretch:86%]">
            Learn the work.<br />Do the work.<br />Show the work.
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg text-hq-bone/75">
            One focused space for classes, projects, feedback, progress, and proof of completion.
          </p>
          <ul className="mt-10 grid gap-3 text-sm text-hq-bone/85">
            {benefits.map((item) => <li key={item} className="flex items-center gap-3"><Icon name="check" className="size-4 text-hq-amber" />{item}</li>)}
          </ul>
        </div>
        <p className="relative text-sm text-hq-bone/55">Practical learning for ambitious teams and individuals.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[520px]">
          <div className="mb-10 lg:hidden">
            <Logo subtitle="Academy" size="lg" />
          </div>
          <p className="mb-2 text-sm font-semibold text-accent-text">CIRCLE HQ ACADEMY</p>
          <h2 className="text-[clamp(32px,5vw,48px)] leading-none font-[750] tracking-[-0.035em]">{authTitle}</h2>
          <p className="mt-3 mb-8 text-muted">
            {screen === 'login' ? 'Sign in once. Your account role opens the correct workspace automatically.' : screen === 'forgot' ? 'We will send a secure reset link to your account email.' : 'Use at least eight characters and avoid a reused password.'}
          </p>

          {screen === 'login' && (
            <form className="grid gap-5" onSubmit={submitLogin}>
              <div><label className={fieldLabel} htmlFor="login-email">Email address</label><input id="login-email" className={`${textInput} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div>
                <div className="flex items-center justify-between"><label className={fieldLabel} htmlFor="login-password">Password</label><button className="text-sm font-semibold text-accent-text" type="button" onClick={() => setScreen('forgot')}>Forgot password?</button></div>
                <div className="relative"><input id="login-password" className={`${textInput} w-full pr-12`} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted" aria-label="Show password" onClick={() => setShowPassword((v) => !v)}><Icon name="eye" /></button></div>
              </div>
              {error && <p role="alert" className="rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] p-3 text-sm text-accent-text">{error}</p>}
              <button className={`${button} w-full`} type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</button>
              <p className="text-center text-sm text-muted">Need access? Contact your administrator to create a student or facilitator account.</p>
            </form>
          )}

          {screen === 'forgot' && (
            <form className="grid gap-5" onSubmit={async (e) => { e.preventDefault(); try { await forgotMutation.mutateAsync(email); toast('If that account exists, a reset link has been sent.'); setScreen('login'); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to request a reset link.'); } }}>
              <div><label className={fieldLabel} htmlFor="recover-email">Account email</label><input id="recover-email" className={`${textInput} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <button className={`${button} w-full`} type="submit" disabled={forgotMutation.isPending}>{forgotMutation.isPending ? 'Sending…' : 'Send reset link'}</button><button className="text-sm font-semibold text-muted" type="button" onClick={() => setScreen('login')}>Back to sign in</button>
            </form>
          )}

          {screen === 'reset' && (
            <form className="grid gap-5" onSubmit={async (e) => { e.preventDefault(); const token = resetToken ?? code; if (!token) { setError('Open the reset link from your email, or paste its token below.'); return; } try { await resetMutation.mutateAsync({ token, password }); setScreen('login'); toast('Password updated. Sign in with your new password.'); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to reset your password.'); } }}>
              <div><label className={fieldLabel} htmlFor="reset-token">Reset token</label><input id="reset-token" className={`${textInput} w-full`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Filled automatically from your email link" /></div>
              <div><label className={fieldLabel} htmlFor="new-password">New password</label><input id="new-password" className={`${textInput} w-full`} type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <button className={`${button} w-full`} type="submit" disabled={resetMutation.isPending}>{resetMutation.isPending ? 'Updating…' : 'Update password'}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
