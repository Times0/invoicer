import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Outlet,
} from "@tanstack/react-router";
import ConvexProvider from "../integrations/convex/provider";
import appCss from "../styles.css?url";
import Tabs from "@/components/tabs";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import AppClerkProvider from "../integrations/clerk/provider";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Invoicer - Invoice Management System",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppClerkProvider>
          <ConvexProvider>
            {children}
            <Toaster />
          </ConvexProvider>
        </AppClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}

const tabs = [
  { label: "Dashboard", to: "/" },
  { label: "Companies", to: "/companies" },
  { label: "Invoices", to: "/invoices" },
  { label: "API Keys", to: "/api-keys" },
];

function RootLayout() {
  return (
    <div>
      <Header />
      <SignedIn>
        <div className="p-4 ">
          <Tabs tabs={tabs} />
        </div>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <div className="p-4 ">
          <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
