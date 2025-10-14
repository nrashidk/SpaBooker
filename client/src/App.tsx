import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BookingPage from "@/pages/booking";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminServices from "@/pages/admin/Services";
import AdminStaff from "@/pages/admin/Staff";
import AdminBookings from "@/pages/admin/Bookings";
import AdminInventory from "@/pages/admin/Inventory";
import AdminFinance from "@/pages/admin/Finance";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BookingPage} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/services">
        {() => (
          <AdminLayout>
            <AdminServices />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/staff">
        {() => (
          <AdminLayout>
            <AdminStaff />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/bookings">
        {() => (
          <AdminLayout>
            <AdminBookings />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/inventory">
        {() => (
          <AdminLayout>
            <AdminInventory />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/finance">
        {() => (
          <AdminLayout>
            <AdminFinance />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/reports">
        {() => (
          <AdminLayout>
            <AdminReports />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
