import { NavigationWrapper } from "@/components/navigation-wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[-1] h-full w-full bg-[#0a0a0a] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Dual Glow Background */}
      <div className="absolute top-0 z-[-1] w-full h-full flex justify-between overflow-hidden opacity-50">
        <div className="w-[500px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="w-[500px] h-[400px] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
      </div>

      <NavigationWrapper>
        {children}
      </NavigationWrapper>
    </>
  );
}
