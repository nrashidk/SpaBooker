import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone } from "lucide-react";
import { format } from "date-fns";

export default function AdminBookings() {
  const bookings = [
    {
      id: 1,
      customer: "Ahmed Ali",
      phone: "+971 50 123 4567",
      service: "Express Haircut",
      staff: "Saqib",
      date: new Date(2025, 9, 15, 10, 30),
      duration: 25,
      amount: 50,
      status: "confirmed",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      phone: "+971 50 234 5678",
      service: "Manicure + Pedicure",
      staff: "Sarah",
      date: new Date(2025, 9, 15, 11, 0),
      duration: 70,
      amount: 145,
      status: "pending",
    },
    {
      id: 3,
      customer: "Mohammed Khan",
      phone: "+971 50 345 6789",
      service: "Beard Styling",
      staff: "Saqib",
      date: new Date(2025, 9, 15, 11, 30),
      duration: 25,
      amount: 50,
      status: "confirmed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="bookings-title">Bookings</h1>
          <p className="text-muted-foreground">View and manage customer bookings</p>
        </div>
        <Button data-testid="button-new-booking">
          <Calendar className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg" data-testid={`booking-customer-${booking.id}`}>
                        {booking.customer}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.phone}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)} data-testid={`booking-status-${booking.id}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(booking.date, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(booking.date, "h:mm a")} ({booking.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.staff}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">AED {booking.amount}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">{booking.service}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" data-testid={`button-view-booking-${booking.id}`}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-edit-booking-${booking.id}`}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
