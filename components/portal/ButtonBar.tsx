interface ButtonBarProps {
  children: React.ReactNode;
}

export function ButtonBar({ children }: ButtonBarProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-[#e5e5e5] pt-5 mt-6">
      {children}
    </div>
  );
}
