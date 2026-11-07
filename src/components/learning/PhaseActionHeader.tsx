"use client";

export function PhaseActionHeader({ title, description, actions }: { title: string; description?: string; actions: { label: string; eventName: string; primary?: boolean }[] }) {
  return (
    <header className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <span className="teacher-panel-kicker">HỌC LIỆU</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {actions.map((action, i) => (
          <button 
            key={i} 
            className={`btn ${action.primary ? "primary" : ""}`} 
            onClick={() => window.dispatchEvent(new CustomEvent(action.eventName))}
          >
            {action.label}
          </button>
        ))}
      </div>
    </header>
  );
}
