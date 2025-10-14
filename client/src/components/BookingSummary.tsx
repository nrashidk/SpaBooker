import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

interface BookingSummaryProps {
  date: Date | null;
  time: string | null;
  staffName: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export default function BookingSummary({
  date,
  time,
  staffName,
  customerName,
  customerPhone,
  customerEmail,
}: BookingSummaryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
      
      <div className="space-y-4">
        {date && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium" data-testid="summary-date">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        )}

        {time && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium" data-testid="summary-time">{time}</p>
            </div>
          </div>
        )}

        {staffName !== undefined && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Specialist</p>
              <p className="font-medium" data-testid="summary-staff">
                {staffName || "Any Available"}
              </p>
            </div>
          </div>
        )}

        {customerName && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium" data-testid="summary-customer-name">{customerName}</p>
              </div>
            </div>

            {customerPhone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium" data-testid="summary-customer-phone">{customerPhone}</p>
                </div>
              </div>
            )}

            {customerEmail && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="summary-customer-email">{customerEmail}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!date && !time && !staffName && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start by selecting a date to see your booking details
          </p>
        )}
      </div>
    </Card>
  );
}
