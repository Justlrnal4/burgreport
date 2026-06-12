export default function SearchLoading() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-14 max-w-3xl animate-pulse rounded-2xl bg-surface" />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[2rem] bg-surface" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-surface" />
        </div>
      </div>
    </section>
  );
}
