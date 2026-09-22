import { useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { useToast } from '../contexts/ToastContext';
import { button, buttonGhost, fieldLabel, muted, selectInput, textInput } from '../styles';
import type { Role } from '../types/lms';

type AuthScreen = 'login' | 'register' | 'verify' | 'forgot' | 'reset' | 'onboarding';

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
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('ngozi@circlehq.co');
  const [password, setPassword] = useState('circleacademy');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [error, setError] = useState('');

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setError('');
    toast(`Welcome back. Opening the ${role} workspace.`);
    onComplete(role);
  };

  const submitRegister = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes('@') || password.length < 8) {
      setError('Add your full name, a valid email, and a password of at least 8 characters.');
      return;
    }
    setError('');
    setScreen('verify');
    toast('Verification code sent. Use 246810 for this prototype.');
  };

  const verify = (event: FormEvent) => {
    event.preventDefault();
    if (code.replace(/\s/g, '') !== '246810') {
      setError('That code is not correct. Use 246810 for this prototype.');
      return;
    }
    setError('');
    setScreen('onboarding');
  };

  const authTitle = screen === 'login' ? 'Welcome back' :
    screen === 'register' ? 'Create your learning account' :
    screen === 'verify' ? 'Verify your account' :
    screen === 'forgot' ? 'Recover your account' :
    screen === 'reset' ? 'Choose a new password' : 'Set up your profile';

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-hq-red-ink p-12 text-hq-bone lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-40 [background-image:repeating-radial-gradient(circle_at_15%_110%,transparent_0_52px,rgba(224,20,44,.5)_52px_54px)]" />
        <div className="relative flex items-center gap-2.5 text-xl font-[750]">
          <span className="relative size-8 rounded-full bg-accent after:absolute after:-right-0.5 after:-bottom-0.5 after:size-3 after:rounded-full after:bg-reward after:shadow-[0_0_0_3px_var(--hq-red-ink)]" />
          HQ Learn
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
          <div className="mb-10 flex items-center gap-2.5 text-xl font-[750] lg:hidden">
            <span className="relative size-8 rounded-full bg-accent after:absolute after:-right-0.5 after:-bottom-0.5 after:size-3 after:rounded-full after:bg-reward after:shadow-[0_0_0_3px_var(--bg)]" />
            HQ Learn
          </div>
          <p className="mb-2 text-sm font-semibold text-accent-text">{screen === 'onboarding' ? `PROFILE SETUP · ${onboardingStep + 1} OF 3` : 'CIRCLE HQ ACADEMY'}</p>
          <h2 className="text-[clamp(32px,5vw,48px)] leading-none font-[750] tracking-[-0.035em]">{authTitle}</h2>
          <p className="mt-3 mb-8 text-muted">
            {screen === 'login' ? 'Sign in to continue your next learning action.' :
              screen === 'register' ? 'Your course progress, feedback, and certificates live here.' :
              screen === 'verify' ? `Enter the six-digit code sent to ${email}.` :
              screen === 'forgot' ? 'We will send a secure reset link to your account email.' :
              screen === 'reset' ? 'Use at least eight characters and avoid a reused password.' :
              'A few details help us tailor your learning workspace.'}
          </p>

          {screen === 'login' && (
            <form className="grid gap-5" onSubmit={submitLogin}>
              <div>
                <label className={fieldLabel} htmlFor="login-role">Workspace</label>
                <select id="login-role" className={selectInput} value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="student">Student</option><option value="facilitator">Facilitator</option><option value="admin">Admin</option>
                </select>
              </div>
              <div><label className={fieldLabel} htmlFor="login-email">Email address</label><input id="login-email" className={`${textInput} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div>
                <div className="flex items-center justify-between"><label className={fieldLabel} htmlFor="login-password">Password</label><button className="text-sm font-semibold text-accent-text" type="button" onClick={() => setScreen('forgot')}>Forgot password?</button></div>
                <div className="relative"><input id="login-password" className={`${textInput} w-full pr-12`} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted" aria-label="Show password" onClick={() => setShowPassword((v) => !v)}><Icon name="eye" /></button></div>
              </div>
              {error && <p role="alert" className="rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] p-3 text-sm text-accent-text">{error}</p>}
              <button className={`${button} w-full`} type="submit">Sign in</button>
              <p className="text-center text-sm text-muted">New to Circle HQ Academy? <button type="button" className="font-semibold text-foreground" onClick={() => { setError(''); setScreen('register'); }}>Create an account</button></p>
            </form>
          )}

          {screen === 'register' && (
            <form className="grid gap-5" onSubmit={submitRegister}>
              <div><label className={fieldLabel} htmlFor="register-name">Full name</label><input id="register-name" className={`${textInput} w-full`} value={name} placeholder="e.g. Ngozi Eze" onChange={(e) => setName(e.target.value)} /></div>
              <div><label className={fieldLabel} htmlFor="register-email">Email address</label><input id="register-email" className={`${textInput} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><label className={fieldLabel} htmlFor="register-password">Create password</label><input id="register-password" className={`${textInput} w-full`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><p className={`mt-1.5 text-xs ${muted}`}>At least 8 characters with a number or symbol.</p></div>
              <label className="flex items-start gap-3 text-sm"><input className="mt-1 accent-[var(--accent)]" type="checkbox" required /><span>I agree to the learner code of conduct and privacy policy.</span></label>
              {error && <p role="alert" className="rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] p-3 text-sm text-accent-text">{error}</p>}
              <button className={`${button} w-full`} type="submit">Create account</button>
              <button className="text-sm font-semibold text-muted" type="button" onClick={() => setScreen('login')}>Already registered? Sign in</button>
            </form>
          )}

          {screen === 'verify' && (
            <form className="grid gap-5" onSubmit={verify}>
              <div><label className={fieldLabel} htmlFor="verify-code">Verification code</label><input id="verify-code" className={`${textInput} w-full text-center text-2xl tracking-[0.45em] [font-variant-numeric:tabular-nums]`} inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></div>
              {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
              <button className={`${button} w-full`} type="submit">Verify account</button>
              <button className="text-sm font-semibold text-muted" type="button" onClick={() => toast('A fresh code was sent. Use 246810.')}>Resend code</button>
            </form>
          )}

          {screen === 'forgot' && (
            <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); setScreen('reset'); toast('Reset link confirmed for this prototype.'); }}>
              <div><label className={fieldLabel} htmlFor="recover-email">Account email</label><input id="recover-email" className={`${textInput} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <button className={`${button} w-full`} type="submit">Send reset link</button><button className="text-sm font-semibold text-muted" type="button" onClick={() => setScreen('login')}>Back to sign in</button>
            </form>
          )}

          {screen === 'reset' && (
            <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); setScreen('login'); toast('Password updated. Sign in with your new password.'); }}>
              <div><label className={fieldLabel} htmlFor="new-password">New password</label><input id="new-password" className={`${textInput} w-full`} type="password" minLength={8} required /></div>
              <div><label className={fieldLabel} htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" className={`${textInput} w-full`} type="password" minLength={8} required /></div>
              <button className={`${button} w-full`} type="submit">Update password</button>
            </form>
          )}

          {screen === 'onboarding' && <Onboarding step={onboardingStep} onBack={() => setOnboardingStep((s) => Math.max(0, s - 1))} onNext={() => onboardingStep === 2 ? onComplete('student') : setOnboardingStep((s) => s + 1)} />}
        </div>
      </section>
    </main>
  );
}

function Onboarding({ step, onBack, onNext }: { step: number; onBack: () => void; onNext: () => void }) {
  return (
    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <div className="mb-2 flex gap-2" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-surface-2'}`} />)}</div>
      {step === 0 && <>
        <div className="grid gap-5 sm:grid-cols-2"><div><label className={fieldLabel}>Phone number</label><input className={`${textInput} w-full`} type="tel" placeholder="+234 800 000 0000" required /></div><div><label className={fieldLabel}>Time zone</label><select className={selectInput} defaultValue="wat"><option value="wat">West Africa Time</option><option>Greenwich Mean Time</option><option>East Africa Time</option></select></div></div>
        <div><label className={fieldLabel}>What should we call you?</label><input className={`${textInput} w-full`} defaultValue="Ngozi" required /></div>
        <div><label className={fieldLabel}>Short bio</label><textarea className="min-h-24 w-full rounded-2xl border-[1.5px] border-line bg-surface px-4 py-3.5 outline-none focus:border-accent" placeholder="Tell your facilitator what you are working toward." /></div>
      </>}
      {step === 1 && <>
        <div><label className={fieldLabel}>Primary learning goal</label><select className={selectInput}><option>Grow into a senior frontend role</option><option>Ship a new product</option><option>Lead a product team</option><option>Change careers</option></select></div>
        <fieldset><legend className={fieldLabel}>Current experience</legend><div className="grid gap-2 sm:grid-cols-3">{['Starting out', '1–3 years', '4+ years'].map((item) => <label key={item} className="rounded-xl border border-line bg-surface p-3 text-center text-sm font-semibold has-[:checked]:border-accent has-[:checked]:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]"><input className="sr-only" type="radio" name="experience" defaultChecked={item === '1–3 years'} />{item}</label>)}</div></fieldset>
        <fieldset><legend className={fieldLabel}>Weekly study target</legend><div className="grid gap-2 sm:grid-cols-3">{['2 hours', '4 hours', '6+ hours'].map((item) => <label key={item} className="rounded-xl border border-line bg-surface p-3 text-center text-sm font-semibold has-[:checked]:border-accent"><input className="sr-only" type="radio" name="target" defaultChecked={item === '4 hours'} />{item}</label>)}</div></fieldset>
      </>}
      {step === 2 && <>
        <div className="rounded-[18px] border border-line bg-surface p-5"><h3 className="font-[650]">Stay on track</h3><p className="mt-1 text-sm text-muted">Choose the reminders that help without creating noise.</p><div className="mt-4 grid gap-3">{['Class reminders', 'Assignment deadlines', 'Facilitator feedback', 'Weekly progress summary'].map((item) => <label key={item} className="flex items-center justify-between gap-4"><span>{item}</span><input className="size-4 accent-[var(--accent)]" type="checkbox" defaultChecked /></label>)}</div></div>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 accent-[var(--accent)]" type="checkbox" defaultChecked /><span>Show my progress to my assigned facilitator.</span></label>
      </>}
      <div className="mt-2 flex gap-3">{step > 0 && <button className={buttonGhost} type="button" onClick={onBack}>Back</button>}<button className={`${button} flex-1`} type="submit">{step === 2 ? 'Open my dashboard' : 'Continue'}</button></div>
    </form>
  );
}
