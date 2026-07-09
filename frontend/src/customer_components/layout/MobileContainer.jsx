export default function MobileContainer({ children }) {
  return (
    <div className="flex h-screen w-full justify-center bg-white">
      <div className="h-full w-full max-w-107.5 overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}