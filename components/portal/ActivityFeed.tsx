interface ActivityItem {
  icon: React.ReactNode;
  iconColor: "gold" | "blue" | "green" | "red" | "purple";
  text: React.ReactNode;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

const iconBgMap: Record<ActivityItem["iconColor"], string> = {
  gold: "bg-[#fee198]",
  blue: "bg-[#dbeafe]",
  green: "bg-[#dcfce7]",
  red: "bg-[#fee2e2]",
  purple: "bg-[#f3e8ff]",
};

export function ActivityFeed({ items, title }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-[#e5e5e5]">
      {title && (
        <div className="px-5 py-3.5 border-b border-[#e5e5e5]">
          <h3 className="font-display text-[18px] font-semibold text-black">
            {title}
          </h3>
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-5 py-3.5 border-b border-[#f0f0f0] last:border-b-0"
        >
          <span
            className={`flex-shrink-0 w-[34px] h-[34px] rounded-full flex items-center justify-center ${iconBgMap[item.iconColor]} [&>svg]:w-4 [&>svg]:h-4`}
          >
            {item.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-body text-[#374151]">{item.text}</p>
          </div>
          <span className="flex-shrink-0 text-[11px] text-[#6b7280] whitespace-nowrap">
            {item.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}
