import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Video,
  Stethoscope,
  BarChart3,
  MessageSquare,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

export default function Sidebar() {
  const { user, hasAnyRole } = useAuthStore();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'],
    },
    {
      title: 'Documentos',
      icon: FileText,
      path: '/documents',
      roles: ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN'],
    },
    {
      title: 'Biblioteca',
      icon: BookOpen,
      path: '/library',
      roles: ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN'],
    },
    {
      title: 'Simulaciones AR',
      icon: Video,
      path: '/simulations',
      roles: ['STUDENT', 'TEACHER', 'IT_ADMIN'],
    },
    {
      title: 'Teleenfermería',
      icon: Stethoscope,
      path: '/telehealth',
      roles: ['STUDENT', 'TEACHER', 'IT_ADMIN'],
    },
    {
      title: 'Analíticas',
      icon: BarChart3,
      path: '/analytics',
      roles: ['TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'],
    },
    {
      title: 'Usuarios',
      icon: Users,
      path: '/users',
      roles: ['IT_ADMIN', 'ADMINISTRATIVE'],
    },
    {
      title: 'Chatbot',
      icon: MessageSquare,
      path: '/chatbot',
      roles: ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => user?.roles?.includes(role))
  );

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
