import { login } from "../../lib/auth-actions";

export default async function LoginPage({ searchParams }: { searchParams: { message?: string } }) {
  const message = searchParams.message;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Inloggen bij CourtFlow
          </h2>
        </div>

        {message && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-xl relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-white/10 placeholder-gray-500 text-white rounded-xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm transition-all"
                placeholder="E-mailadres"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-white/10 placeholder-gray-500 text-white rounded-xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm transition-all"
                placeholder="Wachtwoord"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-900/50 transition-all hover:scale-[1.02]"
            >
              Inloggen
            </button>
          </div>

          <div className="text-center">
            <a
              href="/signup"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Nog geen account? Registreer hier
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
