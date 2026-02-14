interface PortalLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function PortalLayout({ sidebar, children }: PortalLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="flex-1 min-[900px]:ml-[260px] max-[899px]:ml-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
