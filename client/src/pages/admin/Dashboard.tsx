import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, TrendingUp, Package, Clock } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Today's Revenue",
      value: "AED 3,240",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Today's Bookings",
      value: "18",
      change: "+3 from yesterday",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Active Customers",
      value: "256",
      change: "+8 this week",
      icon: Users,
      trend: "up",
    },
    {
      title: "Low Stock Items",
      value: "7",
      change: "Needs attention",
      icon: Package,
      trend: "warning",
    },
  ];

  const recentBookings = [
    { id: 1, customer: "Ahmed Ali", service: "Express Haircut", time: "10:30 AM", staff: "Saqib", status: "Confirmed" },
    { id: 2, customer: "Sarah Johnson", service: "Manicure", time: "11:00 AM", staff: "Sarah", status: "Pending" },
    { id: 3, customer: "Mohammed Khan", service: "Beard Styling", time: "11:30 AM", staff: "Saqib", status: "Confirmed" },
    { id: 4, customer: "Emily Davis", service: "Pedicure", time: "12:00 PM", staff: "Sarah", status: "Completed" },
  ];

  const topServices = [
    { name: "Express Haircut", bookings: 45, revenue: "AED 2,250" },
    { name: "Beard Styling", bookings: 38, revenue: "AED 1,900" },
    { name: "Executive Pedicure", bookings: 22, revenue: "AED 1,760" },
    { name: "Manicure", bookings: 18, revenue: "AED 1,170" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="admin-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                stat.trend === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                'text-muted-foreground'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4" data-testid={`booking-${booking.id}`}>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{booking.customer}</p>
                    <p className="text-sm text-muted-foreground">{booking.service} • {booking.staff}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{booking.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      booking.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Services (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-4" data-testid={`top-service-${index}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.bookings} bookings</p>
                  </div>
                  <p className="font-semibold">{service.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate active-elevate-2"
              data-testid="quick-action-new-booking"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">New Booking</span>
            </button>
            <button
              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate active-elevate-2"
              data-testid="quick-action-add-customer"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Add Customer</span>
            </button>
            <button
              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate active-elevate-2"
              data-testid="quick-action-update-inventory"
            >
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Update Inventory</span>
            </button>
            <button
              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate active-elevate-2"
              data-testid="quick-action-view-reports"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">View Reports</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
