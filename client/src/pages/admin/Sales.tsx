import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Calendar, Download } from "lucide-react";
import type { Booking, BookingItem, Service } from "@shared/schema";

export default function AdminSales() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch data
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings'],
  });

  const { data: bookingItems = [] } = useQuery<BookingItem[]>({
    queryKey: ['/api/admin/booking-items'],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/admin/services'],
  });

  // Filter bookings for selected date
  const dailyBookings = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);
    return format(bookingDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  // Calculate transaction summary
  const transactionSummary = [
    {
      itemType: 'Services',
      itemsSold: dailyBookings.filter(b => b.status === 'completed').length,
      refunds: 0,
      grossTotal: dailyBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalAmount?.toString() || '0'), 0)
        .toFixed(2),
    },
    {
      itemType: 'Service with add-on',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Products',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Vouchers',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Shipping',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Gift cards',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Memberships',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Late cancellation fee',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'No show fee',
      itemsSold: dailyBookings.filter(b => b.status === 'no-show').length,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Refund amount',
      itemsSold: 0,
      refunds: 0,
      grossTotal: '0.00',
    },
    {
      itemType: 'Total Sales',
      itemsSold: 0,
      refunds: 0,
      grossTotal: dailyBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalAmount?.toString() || '0'), 0)
        .toFixed(2),
    },
  ];

  // Calculate cash movement summary
  const paymentsCollected = dailyBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount?.toString() || '0'), 0);

  const cashMovementSummary = [
    {
      type: 'Payment type',
      paymentsCollected: 'Payments collected',
      depositsCollected: 'Deposits collected',
      refundsCollected: 'Refunds collected',
      lateCancellationsFee: 'Late cancellations fee',
    },
    {
      type: 'Total online',
      paymentsCollected: '0.00',
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'Cash',
      paymentsCollected: paymentsCollected.toFixed(2),
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'Card',
      paymentsCollected: '0.00',
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'Gift card redemptions',
      paymentsCollected: '0.00',
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'UPI card redemptions',
      paymentsCollected: '0.00',
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'Payments collected',
      paymentsCollected: paymentsCollected.toFixed(2),
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
    {
      type: 'Of which tips',
      paymentsCollected: '0.00',
      depositsCollected: '0.00',
      refundsCollected: '0.00',
      lateCancellationsFee: '0.00',
    },
  ];

  const totalRevenue = dailyBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount?.toString() || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="admin-sales-title">Daily sales</h1>
          <p className="text-muted-foreground">
            View, filter and export transactions and cash movement for the day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="export-sales">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="add-sale">Add sale</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          data-testid="prev-day"
        >
          Previous
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{format(selectedDate, 'EEEE, dd MMM, yyyy')}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(new Date())}
          data-testid="today"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(subDays(selectedDate, -1))}
          data-testid="next-day"
        >
          Next
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left py-3 font-medium">Item type</th>
                    <th className="text-right py-3 font-medium">Items sold</th>
                    <th className="text-right py-3 font-medium">Refunds</th>
                    <th className="text-right py-3 font-medium">Gross total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionSummary.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b text-sm ${
                        row.itemType === 'Total Sales'
                          ? 'font-semibold bg-muted/50'
                          : ''
                      }`}
                      data-testid={`transaction-row-${index}`}
                    >
                      <td className="py-3">{row.itemType}</td>
                      <td className="text-right py-3">{row.itemsSold}</td>
                      <td className="text-right py-3">{row.refunds}</td>
                      <td className="text-right py-3">AED {row.grossTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cash Movement Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Cash movement summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="text-left py-3 font-medium min-w-[200px]">
                      {cashMovementSummary[0].type}
                    </th>
                    <th className="text-right py-3 font-medium min-w-[150px]">
                      {cashMovementSummary[0].paymentsCollected}
                    </th>
                    <th className="text-right py-3 font-medium min-w-[150px]">
                      {cashMovementSummary[0].depositsCollected}
                    </th>
                    <th className="text-right py-3 font-medium min-w-[150px]">
                      {cashMovementSummary[0].refundsCollected}
                    </th>
                    <th className="text-right py-3 font-medium min-w-[180px]">
                      {cashMovementSummary[0].lateCancellationsFee}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cashMovementSummary.slice(1).map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b text-sm ${
                        row.type === 'Payments collected' || row.type === 'Of which tips'
                          ? 'font-semibold bg-muted/50'
                          : ''
                      }`}
                      data-testid={`cash-movement-row-${index}`}
                    >
                      <td className="py-3">{row.type}</td>
                      <td className="text-right py-3">
                        {row.paymentsCollected.includes('AED') ? row.paymentsCollected : `AED ${row.paymentsCollected}`}
                      </td>
                      <td className="text-right py-3">
                        {row.depositsCollected.includes('AED') ? row.depositsCollected : `AED ${row.depositsCollected}`}
                      </td>
                      <td className="text-right py-3">
                        {row.refundsCollected.includes('AED') ? row.refundsCollected : `AED ${row.refundsCollected}`}
                      </td>
                      <td className="text-right py-3">
                        {row.lateCancellationsFee.includes('AED') ? row.lateCancellationsFee : `AED ${row.lateCancellationsFee}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
