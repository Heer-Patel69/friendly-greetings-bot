import { useAuth, type AppRole } from "@/hooks/use-auth";

interface RoleGateProps {
  allowed: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const { role, isConfigured } = useAuth();
  if (!isConfigured) return <>{children}</>;
  if (!allowed.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
