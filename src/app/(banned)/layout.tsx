export default function BannedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050a0c]">
      {children}
    </div>
  );
}
