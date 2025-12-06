import { Link, useInRouterContext } from "react-router";

// Componente que detecta si hay router disponible
function SafeLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    // Si hay router disponible, usar Link
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  // Si no hay router, usar un <a> tag normal
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}

function App() {
  return (
    <div>
      <header className="mb-4 p-4 bg-gray-100">
        <SafeLink
          to="/"
          className="text-blue-600 hover:underline text-lg font-semibold"
        >
          Go to Host
        </SafeLink>
      </header>
      <h1 className="text-3xl text-red-500 font-bold underline">
        Hello world! {import.meta.env.VITE_APP_NAME}
      </h1>
    </div>
  );
}

export default App;
