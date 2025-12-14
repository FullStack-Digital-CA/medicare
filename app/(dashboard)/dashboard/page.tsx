"use client";

import { useSession } from "next-auth/react";
import {
  Calendar,
  Users,
  Stethoscope,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  {
    name: "Today's Appointments",
    value: "24",
    icon: Calendar,
    change: "+12%",
    changeType: "positive",
    color: "bg-blue-500",
  },
  {
    name: "Total Patients",
    value: "1,284",
    icon: Users,
    change: "+8%",
    changeType: "positive",
    color: "bg-emerald-500",
  },
  {
    name: "Consultations",
    value: "18",
    icon: Stethoscope,
    change: "+23%",
    changeType: "positive",
    color: "bg-violet-500",
  },
  {
    name: "Pending Reports",
    value: "7",
    icon: Activity,
    change: "-5%",
    changeType: "negative",
    color: "bg-amber-500",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const user = session?.user;
  const greeting = getGreeting();

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {user?.firstName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening at Medicare today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    stat.changeType === "positive"
                      ? "text-emerald-500"
                      : "text-red-500 rotate-180"
                  }`}
                />
                <span
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New patient registered", time: "5 min ago" },
                { action: "Appointment completed", time: "12 min ago" },
                { action: "Lab results uploaded", time: "25 min ago" },
                { action: "Prescription issued", time: "1 hour ago" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{item.action}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { patient: "John Smith", time: "09:00 AM", type: "Checkup" },
                { patient: "Sarah Johnson", time: "10:30 AM", type: "Follow-up" },
                { patient: "Mike Brown", time: "11:00 AM", type: "Consultation" },
                { patient: "Emily Davis", time: "02:00 PM", type: "Lab Review" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.patient}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Database", status: "Operational", color: "bg-emerald-500" },
                { name: "API Services", status: "Operational", color: "bg-emerald-500" },
                { name: "Backup System", status: "Operational", color: "bg-emerald-500" },
                { name: "Email Service", status: "Operational", color: "bg-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
