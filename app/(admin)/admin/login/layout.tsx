// This layout ensures the login page is not wrapped by AdminLayout
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

