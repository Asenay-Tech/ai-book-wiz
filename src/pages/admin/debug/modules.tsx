// src/pages/admin/debug/modules.tsx
import { MODULES } from "@/admin/debug/modules";

export default function ModuleTracker() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4 text-accent">🧱 Module Tracker</h1>
      <p className="text-muted-foreground mb-6">
        View status of development modules and features.
      </p>
      <div className="space-y-4">
        {MODULES.map((mod, i) => (
          <div key={i} className="p-4 border border-gray-700 rounded bg-black/30">
            <h2 className="text-xl font-semibold">{mod.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">Status: <span className={`font-medium ${mod.status === 'done' ? 'text-green-400' : 'text-yellow-400'}`}>{mod.status}</span></p>
            {mod.description && (
              <p className="text-sm">{mod.description}</p>
            )}
            {mod.tests && (
              <p className="text-sm mt-1">Tests: {mod.tests.join(", ")}</p>
            )}
            {mod.supportedFormats && (
              <p className="text-sm mt-1">Formats: {mod.supportedFormats.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
