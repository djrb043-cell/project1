export default function LoadingSpinner({ fullscreen = false }: { fullscreen?: boolean }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-purple-800 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Carregando…</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        {inner}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{inner}</div>;
}
