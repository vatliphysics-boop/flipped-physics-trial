import Link from "next/link";

type SidebarItem = { label: string; href: string; active?: boolean };

function Navigation({ items }: { items: SidebarItem[] }) {
  return <nav className="side-links">{items.map((item) => <Link key={item.label} href={item.href} className={item.active ? "active" : ""}>{item.label}</Link>)}</nav>;
}

export function AppSidebar({ items }: { items: SidebarItem[] }) {
  return <>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">VL</div><div><div>Vật lí 12</div><small style={{ color: "#aebfe8" }}>Lớp học đảo ngược</small></div></div>
      <Navigation items={items} />
    </aside>
    <details className="sidebar-mobile">
      <summary><span className="brand-mark">VL</span><span><strong>Vật lí 12</strong><small>Menu học tập</small></span><span aria-hidden="true">☰</span></summary>
      <Navigation items={items} />
    </details>
  </>;
}
