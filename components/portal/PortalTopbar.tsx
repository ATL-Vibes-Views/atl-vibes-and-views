interface PortalTopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function PortalTopbar({ title, actions }: PortalTopbarProps) {
  return (
    <header className="sticky top-0 max-[899px]:top-[44px] z-50 bg-white border-b border-[#e5e5e5] px-4 min-[900px]:px-8 py-3.5 flex items-center justify-between">
      <h1 className="font-display text-[22px] font-semibold text-black">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
