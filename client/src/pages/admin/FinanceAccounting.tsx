import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportHeader } from "@/components/ReportHeader";
import {
  Calendar,
  DollarSign,
  FileText,
  ListChecks,
  TrendingUp,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

type ReportType = 
  | "appointments-summary"
  | "payment-summary"
  | "finance-summary"
  | "sales-list"
  | "sales-summary";

// Helper function to calculate date range
function getDateRange(rangeType: string, monthToDate?: string): { startDate: string; endDate: string } {
  const now = new Date();
  
  if (monthToDate) {
    const [year, month] = monthToDate.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd")
    };
  }
  
  switch (rangeType) {
    case "this-month":
      return {
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd")
      };
    case "last-month":
      const lastMonth = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd")
      };
    case "last-6-months":
      return {
        startDate: format(subMonths(now, 6), "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd")
      };
    case "last-12-months":
      return {
        startDate: format(subMonths(now, 12), "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd")
      };
    default:
      return {
        startDate: format(subMonths(now, 6), "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd")
      };
  }
}

// Type definitions for report data
interface FinanceSummaryData {
  sales?: {
    grossSales: number;
    discounts: number;
    refunds: number;
    netSales: number;
  };
  totalSales?: {
    giftCardSales: number;
    serviceCharges: number;
    tips: number;
  };
  payments?: {
    card: number;
    cash: number;
    online: number;
  };
  redemptions?: number;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return `AED ${amount.toFixed(2)}`;
};

export default function AdminFinanceAccounting() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("finance-summary");
  const [dateRange, setDateRange] = useState("last-6-months");
  const [monthToDate, setMonthToDate] = useState(format(new Date(), "yyyy-MM"));
  
  // Calculate date ranges based on selected filters
  const financeDateRange = useMemo(() => getDateRange(dateRange), [dateRange]);
  const monthDateRange = useMemo(() => getDateRange("this-month", monthToDate), [monthToDate]);
  
  // Fetch Finance Summary data
  const { data: financeSummaryData, isLoading: isLoadingFinanceSummary } = useQuery({
    queryKey: ["/api/admin/reports/finance-summary", financeDateRange],
    enabled: selectedReport === "finance-summary",
  });
  
  // Fetch Sales Summary data
  const { data: salesSummaryData, isLoading: isLoadingSalesSummary } = useQuery({
    queryKey: ["/api/admin/reports/sales-summary", financeDateRange],
    enabled: selectedReport === "sales-summary",
  });
  
  // Fetch Sales List data
  const { data: salesListData, isLoading: isLoadingSalesList } = useQuery({
    queryKey: ["/api/admin/reports/sales-list", monthDateRange],
    enabled: selectedReport === "sales-list",
  });
  
  // Fetch Appointments Summary data
  const { data: appointmentsSummaryData, isLoading: isLoadingAppointmentsSummary } = useQuery({
    queryKey: ["/api/admin/reports/appointments-summary", monthDateRange],
    enabled: selectedReport === "appointments-summary",
  });
  
  // Fetch Payment Summary data
  const { data: paymentSummaryData, isLoading: isLoadingPaymentSummary } = useQuery({
    queryKey: ["/api/admin/reports/payment-summary", monthDateRange],
    enabled: selectedReport === "payment-summary",
  });

  const menuItems = [
    {
      id: "finance-summary" as ReportType,
      label: "Finance summary",
      icon: DollarSign,
      description: "High-level summary of sales, payments and liabilities",
    },
    {
      id: "sales-summary" as ReportType,
      label: "Sales summary",
      icon: TrendingUp,
      description: "Sales quantities and value, excluding tips and gift card sales",
    },
    {
      id: "sales-list" as ReportType,
      label: "Sales list",
      icon: ListChecks,
      description: "Complete listing of all sales transactions",
    },
    {
      id: "appointments-summary" as ReportType,
      label: "Appointments summary",
      icon: Calendar,
      description: "General overview of appointment trends and patterns",
    },
    {
      id: "payment-summary" as ReportType,
      label: "Payment summary",
      icon: FileText,
      description: "Payments split by payment methods",
    },
  ];

  const renderAppointmentsSummary = () => (
    <div className="space-y-6">
      <ReportHeader
        title="Appointments summary"
        description="General overview of appointment trends and patterns, including cancellations and no-shows."
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Month to date</Label>
          <Input
            type="month"
            value={monthToDate}
            onChange={(e) => setMonthToDate(e.target.value)}
            className="w-44"
            data-testid="input-month-to-date"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-filters">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Data from 12 mins ago
        </div>
        <Button variant="outline" size="sm" data-testid="button-customize">
          Customize
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Location <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Appointments <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Services <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">% requested</th>
                  <th className="text-left p-3 text-sm font-semibold">Total appt. value</th>
                  <th className="text-left p-3 text-sm font-semibold">Average appt. value</th>
                  <th className="text-left p-3 text-sm font-semibold">% online</th>
                  <th className="text-left p-3 text-sm font-semibold">% cancelled</th>
                  <th className="text-left p-3 text-sm font-semibold">% no show</th>
                  <th className="text-left p-3 text-sm font-semibold">Total clients</th>
                  <th className="text-left p-3 text-sm font-semibold">New clients</th>
                  <th className="text-left p-3 text-sm font-semibold">% new clients</th>
                  <th className="text-left p-3 text-sm font-semibold">% returning clients</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover-elevate">
                  <td className="p-3 font-semibold" data-testid="text-location-total">Total</td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">0%</td>
                </tr>
                <tr className="text-center text-sm text-muted-foreground">
                  <td colSpan={13} className="p-8">
                    No appointment data available for the selected period
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentSummary = () => (
    <div className="space-y-6">
      <ReportHeader
        title="Payments summary"
        description="Payments split by payment methods."
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Month to date</Label>
          <Input
            type="month"
            value={monthToDate}
            onChange={(e) => setMonthToDate(e.target.value)}
            className="w-44"
            data-testid="input-month-to-date"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-filters">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Data from 12 mins ago
        </div>
        <Button variant="outline" size="sm" data-testid="button-customize">
          Customize
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Payment method <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      No. of payments <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Payment amount <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">No. of refunds</th>
                  <th className="text-left p-3 text-sm font-semibold">Refunds</th>
                  <th className="text-left p-3 text-sm font-semibold">Net payments</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover-elevate font-semibold">
                  <td className="p-3" data-testid="text-payment-method-total">Total</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate">
                  <td className="p-3">Card</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate">
                  <td className="p-3">Cash</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate">
                  <td className="p-3">Online</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinanceSummary = () => {
    if (isLoadingFinanceSummary) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Safely extract data with proper type validation
    const data = (financeSummaryData as FinanceSummaryData) || {};
    const sales = {
      grossSales: data.sales?.grossSales ?? 0,
      discounts: data.sales?.discounts ?? 0,
      refunds: data.sales?.refunds ?? 0,
      netSales: data.sales?.netSales ?? 0,
    };
    const totalSales = {
      giftCardSales: data.totalSales?.giftCardSales ?? 0,
      serviceCharges: data.totalSales?.serviceCharges ?? 0,
      tips: data.totalSales?.tips ?? 0,
    };
    const payments = {
      card: data.payments?.card ?? 0,
      cash: data.payments?.cash ?? 0,
      online: data.payments?.online ?? 0,
    };
    const redemptions = data.redemptions ?? 0;
    
    const totalPayments = payments.card + payments.cash + payments.online;
    const totalSalesAmount = sales.netSales + totalSales.giftCardSales + totalSales.serviceCharges + totalSales.tips;

    return (
      <div className="space-y-6">
        <ReportHeader
          title="Finance summary"
          description="High-level summary of sales, payments and liabilities"
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Month</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-44" data-testid="select-date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-6-months">Last 6 months</SelectItem>
                <SelectItem value="last-12-months">Last 12 months</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" data-testid="button-filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            Data from moments ago
          </div>
        </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold w-64"></th>
                  <th className="text-left p-3 font-semibold">Total</th>
                  <th className="text-left p-3 font-semibold">Oct 2025</th>
                  <th className="text-left p-3 font-semibold">Sep 2025</th>
                  <th className="text-left p-3 font-semibold">Aug 2025</th>
                  <th className="text-left p-3 font-semibold">Jul 2025</th>
                  <th className="text-left p-3 font-semibold">Jun 2025</th>
                  <th className="text-left p-3 font-semibold">May 2025</th>
                </tr>
              </thead>
              <tbody>
                {/* Sales Section */}
                <tr className="font-semibold bg-muted/30">
                  <td className="p-3">Sales</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Gross sales</td>
                  <td className="p-3">{formatCurrency(sales.grossSales)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Discounts</td>
                  <td className="p-3">{formatCurrency(sales.discounts)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Refunds / Returns</td>
                  <td className="p-3">{formatCurrency(sales.refunds)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate font-semibold border-b">
                  <td className="p-3 pl-6">Net sales</td>
                  <td className="p-3">{formatCurrency(sales.netSales)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>

                {/* Total Sales Section */}
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Gift card sales</td>
                  <td className="p-3">{formatCurrency(totalSales.giftCardSales)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Service charges</td>
                  <td className="p-3">{formatCurrency(totalSales.serviceCharges)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Tips</td>
                  <td className="p-3">{formatCurrency(totalSales.tips)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate font-semibold border-b">
                  <td className="p-3">Total sales</td>
                  <td className="p-3">{formatCurrency(totalSalesAmount)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>

                {/* Payments Section */}
                <tr className="font-semibold bg-muted/30">
                  <td className="p-3">Payments</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Card</td>
                  <td className="p-3">{formatCurrency(payments.card)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Cash</td>
                  <td className="p-3">{formatCurrency(payments.cash)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Online</td>
                  <td className="p-3">{formatCurrency(payments.online)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate font-semibold border-b">
                  <td className="p-3">Total payments</td>
                  <td className="p-3">{formatCurrency(totalPayments)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>

                {/* Redemptions Section */}
                <tr className="font-semibold bg-muted/30">
                  <td className="p-3">Redemptions</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-3 pl-6">Gift card redemptions</td>
                  <td className="p-3">{formatCurrency(redemptions)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="hover-elevate font-semibold">
                  <td className="p-3">Total redemptions</td>
                  <td className="p-3">{formatCurrency(redemptions)}</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const renderSalesList = () => (
    <div className="space-y-6">
      <ReportHeader
        title="Sales list"
        description="Complete listing of all sales transactions."
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Month to date</Label>
          <Input
            type="month"
            value={monthToDate}
            onChange={(e) => setMonthToDate(e.target.value)}
            className="w-44"
            data-testid="input-month-to-date"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-filters">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Data from 10 mins ago
        </div>
        <Button variant="outline" size="sm" data-testid="button-customize">
          Customize
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Sale no. <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Sale date <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">Sale status</th>
                  <th className="text-left p-3 font-semibold">Location</th>
                  <th className="text-left p-3 font-semibold">Client</th>
                  <th className="text-left p-3 font-semibold">Channel</th>
                  <th className="text-left p-3 font-semibold">Items sold</th>
                  <th className="text-left p-3 font-semibold">Total sales</th>
                  <th className="text-left p-3 font-semibold">Gift card</th>
                  <th className="text-left p-3 font-semibold">Service charges</th>
                  <th className="text-left p-3 font-semibold">Amount due</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover-elevate font-semibold">
                  <td className="p-3" data-testid="text-sales-total">Total</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="text-center text-muted-foreground">
                  <td colSpan={11} className="p-8">
                    No sales data available for the selected period
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSalesSummary = () => (
    <div className="space-y-6">
      <ReportHeader
        title="Sales summary"
        description="Sales quantities and value, excluding tips and gift card sales."
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Type</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-44" data-testid="select-sales-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Month to date</Label>
          <Input
            type="month"
            value={monthToDate}
            onChange={(e) => setMonthToDate(e.target.value)}
            className="w-44"
            data-testid="input-month-to-date"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-filters">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Data from 8 mins ago
        </div>
        <Button variant="outline" size="sm" data-testid="button-customize">
          Customize
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      Type <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">Sales qty</th>
                  <th className="text-left p-3 font-semibold">Items sold</th>
                  <th className="text-left p-3 font-semibold">Gross sales</th>
                  <th className="text-left p-3 font-semibold">Total discounts</th>
                  <th className="text-left p-3 font-semibold">Refunds</th>
                  <th className="text-left p-3 font-semibold">Net sales</th>
                  <th className="text-left p-3 font-semibold">Taxes</th>
                  <th className="text-left p-3 font-semibold">Total sales</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover-elevate font-semibold">
                  <td className="p-3" data-testid="text-type-total">Total</td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate text-primary">
                  <td className="p-3">
                    <a href="#" className="hover:underline">Service</a>
                  </td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate text-primary">
                  <td className="p-3">
                    <a href="#" className="hover:underline">Product</a>
                  </td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
                <tr className="border-b hover-elevate text-primary">
                  <td className="p-3">
                    <a href="#" className="hover:underline">Memberships</a>
                  </td>
                  <td className="p-3">0</td>
                  <td className="p-3">0</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                  <td className="p-3">AED 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case "appointments-summary":
        return renderAppointmentsSummary();
      case "payment-summary":
        return renderPaymentSummary();
      case "finance-summary":
        return renderFinanceSummary();
      case "sales-list":
        return renderSalesList();
      case "sales-summary":
        return renderSalesSummary();
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-6">
        <h1 className="text-xl font-bold">Finance & Accounting</h1>

        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Reports
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedReport(item.id)}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                  selectedReport === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  {selectedReport === item.id && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
