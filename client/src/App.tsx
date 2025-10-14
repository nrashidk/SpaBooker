import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BookingPage from "@/pages/booking";
import ProtectedRoute from "@/components/ProtectedRoute";
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
      
      {/* Admin Routes - Protected with admin role requirement */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/services">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminServices />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/staff">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminStaff />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/bookings">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBookings />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/inventory">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminInventory />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/finance">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminFinance />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/reports">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
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
