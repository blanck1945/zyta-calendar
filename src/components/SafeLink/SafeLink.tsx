// src/components/SafeLink.tsx
import { Link, useInRouterContext } from "react-router";

type SafeLinkProps = {
  to: string;
  className?: string;
  children: React.ReactNode;
};

export function SafeLink({ to, className, children }: SafeLinkProps) {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
