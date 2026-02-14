interface PortalTopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function PortalTopbar({ title, actions }: PortalTopbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] px-8 py-3.5 flex items-center justify-between">
      <h1 className="font-display text-[22px] font-semibold text-black">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
