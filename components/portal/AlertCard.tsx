interface AlertCardProps {
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  timestamp: string;
}

export function AlertCard({ icon, iconBg, text, timestamp }: AlertCardProps) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 border-b border-[#f0f0f0]">
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${iconBg} [&>svg]:w-3.5 [&>svg]:h-3.5`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-body text-[#374151]">{text}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] text-[#6b7280] whitespace-nowrap">
        {timestamp}
      </span>
    </div>
  );
}
