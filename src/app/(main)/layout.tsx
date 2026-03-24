import { NavigationWrapper } from "@/components/navigation-wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Clean solid Navy background — no grid, no patterns */}
      <div className="fixed inset-0 z-[-1] h-full w-full bg-[#1c2438]"></div>

      <NavigationWrapper>
        {children}
      </NavigationWrapper>
    </>
  );
}
