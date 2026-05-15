import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ParvaPage } from './pages/ParvaPage';
import { SectionPage } from './pages/SectionPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/parva/:parvaNumber" element={<ParvaPage />} />
          <Route
            path="/parva/:parvaNumber/section/:sectionNumber"
            element={<SectionPage />}
          />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-2xl px-6 py-20 text-center">
                <h1 className="font-serif text-3xl text-ink-900">
                  Lost in the forest
                </h1>
                <p className="mt-3 text-ink-600">
                  This page does not exist. Even Yudhishthira would turn back.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-ink-200 bg-white/60 py-6 text-center text-xs text-ink-500">
        Mahabharata Recital &middot; Translation by Kisari Mohan Ganguli (public
        domain)
      </footer>
    </div>
  );
}
