import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="w-full border-b border-border bg-background shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
          >
            <span role="img" aria-label="Invoicer Logo" className="mr-2">
              🧾
            </span>
            Invoicer
          </Link>
        </div>
        <nav className="flex items-center space-x-6"></nav>
      </div>
    </header>
  );
}
