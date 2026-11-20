/** A horizontally scrolling row that bleeds to the page edges on mobile. */
export function ScrollRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {children}
      </div>
    </section>
  );
}
