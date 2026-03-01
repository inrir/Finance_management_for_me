import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '대시보드', icon: '📊', end: true },
  { to: '/assets', label: '자산 관리', icon: '🏦' },
  { to: '/transactions', label: '거래 내역', icon: '📝' },
  { to: '/portfolio', label: '포트폴리오', icon: '🥧' },
  { to: '/history', label: '자산 추이', icon: '📈' },
  { to: '/settings', label: '설정', icon: '⚙️' },
];

export function Sidebar() {
  return (
    <nav className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col pt-6 pb-4 shrink-0">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold text-gray-900">💰 Finance</h1>
        <p className="text-xs text-gray-400 mt-0.5">자산 관리</p>
      </div>
      <ul className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
