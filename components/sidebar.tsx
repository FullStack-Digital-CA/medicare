"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  UserCog,
  List,
  FolderTree,
  Heart,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Consultations", href: "/dashboard/consultations", icon: Stethoscope },
  { name: "Employees", href: "/dashboard/employees", icon: UserCog },
  { name: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { name: "Services", href: "/dashboard/services", icon: List },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">Medicare</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 rounded-lg bg-accent/50">
          <p className="text-xs font-medium text-muted-foreground">Medicare Admin</p>
          <p className="text-xs text-muted-foreground/70">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
