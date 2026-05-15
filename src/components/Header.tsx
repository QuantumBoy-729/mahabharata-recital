import { Link, NavLink } from 'react-router-dom';
import { BookOpen, ScrollText } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur supports-[backdrop-filter]:bg-ink-50/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron-600 text-white shadow-sm transition-transform group-hover:rotate-6">
            <ScrollText className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold text-ink-900">
              Mahabharata
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Recital
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 transition-colors ${
                isActive
                  ? 'bg-saffron-100 text-saffron-800'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`
            }
          >
            Parvas
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 transition-colors ${
                isActive
                  ? 'bg-saffron-100 text-saffron-800'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`
            }
          >
            About
          </NavLink>
          <a
            href="https://sacred-texts.com/hin/maha/index.htm"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1 rounded-md px-3 py-1.5 text-ink-500 hover:text-ink-800 sm:inline-flex"
          >
            <BookOpen className="h-4 w-4" />
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
