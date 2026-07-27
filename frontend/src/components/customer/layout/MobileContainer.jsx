export default function MobileContainer({ children }) {
  return (
    <div className="flex h-screen w-full justify-center bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-900">
      <div className="relative h-full w-full max-w-7xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm sm:border-x border-gray-100 dark:border-slate-800 [&_*::-webkit-scrollbar]:hidden [&_*]:[-ms-overflow-style:none] [&_*]:[scrollbar-width:none]">
        {children}
      </div>
    </div>
  );
}