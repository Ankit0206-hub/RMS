export default function CategoryCard({
  icon: Icon,
  title,
  color = "bg-orange-100",
}) {
  return (
    <div className="flex min-w-15.5 flex-col items-center">
      <div
        className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center shadow-sm border border-gray-100`}
      >
        <Icon size={18} className="text-orange-600" />
      </div>

      <span className="mt-2 text-[10px] font-medium text-gray-700 gap-2">
        {title}
      </span>
    </div>
  );
}