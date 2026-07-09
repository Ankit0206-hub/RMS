import MobileContainer from "./MobileContainer";

export default function PageLayout({ children, className = "" }) {
  return (
    <MobileContainer>
      <div className={`h-full w-full ${className}`}>
        {children}
      </div>
    </MobileContainer>
  );
}