import { SignUp } from "@clerk/clerk-react";
import logo from "../assets/logo.png";
import { dark } from "@clerk/themes";
import { motion } from "motion/react";

export function SignUpPage() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-bg relative overflow-hidden px-4">
      {/* Background glowing effects */}
      <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-heat/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[60%] bg-skip/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-[400px]"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="IronLog Logo" className="w-[60px] h-[60px] object-contain mb-4" />
          <h1 className="font-display text-5xl tracking-wider text-ink mb-2">IRON<span className="text-heat">LOG</span></h1>
          <p className="font-body text-dim text-sm uppercase tracking-[0.2em]">Forge Your Legacy</p>
        </div>

        <SignUp
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#e8460a', /* heat */
              colorBackground: '#161616', /* card */
              colorInputBackground: '#1a1a1a', /* raised */
              colorInputText: '#ffffff', /* ink */
              colorText: '#ffffff',
              colorTextSecondary: '#666666', /* dim */
              borderRadius: '0.75rem',
            },
            elements: {
              header: 'hidden',
              card: 'border border-border/20 shadow-2xl bg-card/90 backdrop-blur-xl w-full',
              formButtonPrimary: 'font-body font-semibold tracking-wide shadow-lg shadow-heat/20',
              socialButtonsBlockButton: 'border-border/40 hover:bg-raised transition-colors',
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
        />
      </motion.div>
    </div>
  );
}
