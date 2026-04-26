export default function LoadingProject() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
