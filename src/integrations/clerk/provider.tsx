import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  console.error("missing envar VITE_CLERK_PUBLISHABLE_KEY");
}

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!PUBLISHABLE_KEY) {
    // Fail fast in dev, but don't crash SSR
    return null;
  }
  return (
    <BaseClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
}
