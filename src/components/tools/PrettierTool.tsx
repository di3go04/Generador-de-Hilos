export default function PrettierTool({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
    return (
      <div className="p-8 bg-slate-900 rounded-xl border border-slate-800 text-center text-slate-300">
        <h2 className="text-xl font-bold mb-2">PrettierTool</h2>
        <p>Herramienta en desarrollo...</p>
      </div>
    );
  }