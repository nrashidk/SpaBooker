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
  ChevronUp,
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

interface SalesSummaryRow {
  type: string;
  salesQty: number;
  itemsSold: number;
  grossSales: number;
  totalDiscounts: number;
  refunds: number;
  netSales: number;
  taxes: number;
  totalSales: number;
}

interface SalesSummaryData {
  total?: SalesSummaryRow;
  service?: SalesSummaryRow;
  product?: SalesSummaryRow;
  memberships?: SalesSummaryRow;
}

interface SalesListItem {
  saleNo: string;
  saleDate: string;
  saleStatus: string;
  location: string;
  client: string;
  channel: string;
  itemsSold: number;
  totalSales: number;
  giftCard: number;
  serviceCharges: number;
  amountDue: number;
}

interface SalesListData {
  total?: {
    itemsSold: number;
    totalSales: number;
    giftCard: number;
    serviceCharges: number;
    amountDue: number;
  };
  sales?: SalesListItem[];
}

interface AppointmentsSummaryRow {
  location: string;
  appointments: number;
  services: number;
  percentRequested: number;
  totalApptValue: number;
  averageApptValue: number;
  percentOnline: number;
  percentCancelled: number;
  percentNoShow: number;
  totalClients: number;
  newClients: number;
  percentNewClients: number;
  percentReturningClients: number;
}

interface AppointmentsSummaryData {
  total?: AppointmentsSummaryRow;
  locations?: AppointmentsSummaryRow[];
}

interface PaymentSummaryRow {
  paymentMethod: string;
  paymentsCount: number;
  paymentAmount: number;
  refundsCount: number;
  refundsAmount: number;
  netPayments: number;
}

interface PaymentSummaryData {
  total?: PaymentSummaryRow;
  payments?: PaymentSummaryRow[];
}

// Helper functions to format currency and percentages
const formatCurrency = (amount: number) => {
  return `AED ${amount.toFixed(2)}`;
};

const formatPercent = (value: number | string | null | undefined) => {
  // Handle null/undefined - show dash for missing data
  if (value === null || value === undefined) {
    return '—';
  }
  // Convert string to number (backend returns percentages as strings like "23.5")
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  // Guard against NaN
  if (isNaN(numeric)) {
    return '—';
  }
  // Backend returns percentages as whole numbers (23.5 for 23.5%)
  // Just format with 2 decimal places and add % suffix
  return `${numeric.toFixed(2)}%`;
};

export default function AdminFinanceAccounting() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("finance-summary");
  const [dateRange, setDateRange] = useState("last-6-months");
  const [monthToDate, setMonthToDate] = useState(format(new Date(), "yyyy-MM"));
  
  // Sorting state for Sales Summary
  const [salesSummarySortColumn, setSalesSummarySortColumn] = useState<string | null>(null);
  const [salesSummarySortDirection, setSalesSummarySortDirection] = useState<'asc' | 'desc'>('desc');
  
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

  const renderAppointmentsSummary = () => {
    if (isLoadingAppointmentsSummary) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Safely extract data with proper type validation
    const data = (appointmentsSummaryData as AppointmentsSummaryData) || {};
    const total = {
      appointments: data.total?.appointments ?? 0,
      services: data.total?.services ?? 0,
      percentRequested: data.total?.percentRequested ?? 0,
      totalApptValue: data.total?.totalApptValue ?? 0,
      averageApptValue: data.total?.averageApptValue ?? 0,
      percentOnline: data.total?.percentOnline ?? 0,
      percentCancelled: data.total?.percentCancelled ?? 0,
      percentNoShow: data.total?.percentNoShow ?? 0,
      totalClients: data.total?.totalClients ?? 0,
      newClients: data.total?.newClients ?? 0,
      percentNewClients: data.total?.percentNewClients ?? 0,
      percentReturningClients: data.total?.percentReturningClients ?? 0,
    };
    const locations = data.locations ?? [];

    return (
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
                  <td className="p-3">{total.appointments}</td>
                  <td className="p-3">{total.services}</td>
                  <td className="p-3">{formatPercent(total.percentRequested)}</td>
                  <td className="p-3">{formatCurrency(total.totalApptValue)}</td>
                  <td className="p-3">{formatCurrency(total.averageApptValue)}</td>
                  <td className="p-3">{formatPercent(total.percentOnline)}</td>
                  <td className="p-3">{formatPercent(total.percentCancelled)}</td>
                  <td className="p-3">{formatPercent(total.percentNoShow)}</td>
                  <td className="p-3">{total.totalClients}</td>
                  <td className="p-3">{total.newClients}</td>
                  <td className="p-3">{formatPercent(total.percentNewClients)}</td>
                  <td className="p-3">{formatPercent(total.percentReturningClients)}</td>
                </tr>
                {locations.length === 0 ? (
                  <tr className="text-center text-sm text-muted-foreground">
                    <td colSpan={13} className="p-8">
                      No appointment data available for the selected period
                    </td>
                  </tr>
                ) : (
                  locations.map((loc, index) => (
                    <tr key={loc.location || index} className="border-b hover-elevate">
                      <td className="p-3">{loc.location}</td>
                      <td className="p-3">{loc.appointments}</td>
                      <td className="p-3">{loc.services}</td>
                      <td className="p-3">{formatPercent(loc.percentRequested)}</td>
                      <td className="p-3">{formatCurrency(loc.totalApptValue)}</td>
                      <td className="p-3">{formatCurrency(loc.averageApptValue)}</td>
                      <td className="p-3">{formatPercent(loc.percentOnline)}</td>
                      <td className="p-3">{formatPercent(loc.percentCancelled)}</td>
                      <td className="p-3">{formatPercent(loc.percentNoShow)}</td>
                      <td className="p-3">{loc.totalClients}</td>
                      <td className="p-3">{loc.newClients}</td>
                      <td className="p-3">{formatPercent(loc.percentNewClients)}</td>
                      <td className="p-3">{formatPercent(loc.percentReturningClients)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const renderPaymentSummary = () => {
    if (isLoadingPaymentSummary) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Safely extract data with proper type validation
    const data = (paymentSummaryData as PaymentSummaryData) || {};
    const total = {
      paymentsCount: data.total?.paymentsCount ?? 0,
      paymentAmount: data.total?.paymentAmount ?? 0,
      refundsCount: data.total?.refundsCount ?? 0,
      refundsAmount: data.total?.refundsAmount ?? 0,
      netPayments: data.total?.netPayments ?? 0,
    };
    const payments = data.payments ?? [];

    return (
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
                  <td className="p-3">{total.paymentsCount}</td>
                  <td className="p-3">{formatCurrency(total.paymentAmount)}</td>
                  <td className="p-3">{total.refundsCount}</td>
                  <td className="p-3">{formatCurrency(total.refundsAmount)}</td>
                  <td className="p-3">{formatCurrency(total.netPayments)}</td>
                </tr>
                {payments.map((payment, index) => (
                  <tr key={payment.paymentMethod || index} className="border-b hover-elevate">
                    <td className="p-3">{payment.paymentMethod}</td>
                    <td className="p-3">{payment.paymentsCount}</td>
                    <td className="p-3">{formatCurrency(payment.paymentAmount)}</td>
                    <td className="p-3">{payment.refundsCount}</td>
                    <td className="p-3">{formatCurrency(payment.refundsAmount)}</td>
                    <td className="p-3">{formatCurrency(payment.netPayments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

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

  const renderSalesList = () => {
    if (isLoadingSalesList) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Safely extract data with proper type validation
    const data = (salesListData as SalesListData) || {};
    const total = {
      itemsSold: data.total?.itemsSold ?? 0,
      totalSales: data.total?.totalSales ?? 0,
      giftCard: data.total?.giftCard ?? 0,
      serviceCharges: data.total?.serviceCharges ?? 0,
      amountDue: data.total?.amountDue ?? 0,
    };
    const sales = data.sales ?? [];

    return (
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
                  <td className="p-3">{total.itemsSold}</td>
                  <td className="p-3">{formatCurrency(total.totalSales)}</td>
                  <td className="p-3">{formatCurrency(total.giftCard)}</td>
                  <td className="p-3">{formatCurrency(total.serviceCharges)}</td>
                  <td className="p-3">{formatCurrency(total.amountDue)}</td>
                </tr>
                {sales.length === 0 ? (
                  <tr className="text-center text-muted-foreground">
                    <td colSpan={11} className="p-8">
                      No sales data available for the selected period
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.saleNo || index} className="border-b hover-elevate">
                      <td className="p-3">{sale.saleNo}</td>
                      <td className="p-3">{sale.saleDate}</td>
                      <td className="p-3">{sale.saleStatus}</td>
                      <td className="p-3">{sale.location}</td>
                      <td className="p-3">{sale.client}</td>
                      <td className="p-3">{sale.channel}</td>
                      <td className="p-3">{sale.itemsSold}</td>
                      <td className="p-3">{formatCurrency(sale.totalSales)}</td>
                      <td className="p-3">{formatCurrency(sale.giftCard)}</td>
                      <td className="p-3">{formatCurrency(sale.serviceCharges)}</td>
                      <td className="p-3">{formatCurrency(sale.amountDue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const renderSalesSummary = () => {
    if (isLoadingSalesSummary) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Safely extract data with proper type validation
    const data = (salesSummaryData as SalesSummaryData) || {};
    const total = {
      type: 'Total',
      salesQty: data.total?.salesQty ?? 0,
      itemsSold: data.total?.itemsSold ?? 0,
      grossSales: data.total?.grossSales ?? 0,
      totalDiscounts: data.total?.totalDiscounts ?? 0,
      refunds: data.total?.refunds ?? 0,
      netSales: data.total?.netSales ?? 0,
      taxes: data.total?.taxes ?? 0,
      totalSales: data.total?.totalSales ?? 0,
    };
    const service = {
      type: 'Service',
      salesQty: data.service?.salesQty ?? 0,
      itemsSold: data.service?.itemsSold ?? 0,
      grossSales: data.service?.grossSales ?? 0,
      totalDiscounts: data.service?.totalDiscounts ?? 0,
      refunds: data.service?.refunds ?? 0,
      netSales: data.service?.netSales ?? 0,
      taxes: data.service?.taxes ?? 0,
      totalSales: data.service?.totalSales ?? 0,
    };
    const product = {
      type: 'Product',
      salesQty: data.product?.salesQty ?? 0,
      itemsSold: data.product?.itemsSold ?? 0,
      grossSales: data.product?.grossSales ?? 0,
      totalDiscounts: data.product?.totalDiscounts ?? 0,
      refunds: data.product?.refunds ?? 0,
      netSales: data.product?.netSales ?? 0,
      taxes: data.product?.taxes ?? 0,
      totalSales: data.product?.totalSales ?? 0,
    };
    const memberships = {
      type: 'Memberships',
      salesQty: data.memberships?.salesQty ?? 0,
      itemsSold: data.memberships?.itemsSold ?? 0,
      grossSales: data.memberships?.grossSales ?? 0,
      totalDiscounts: data.memberships?.totalDiscounts ?? 0,
      refunds: data.memberships?.refunds ?? 0,
      netSales: data.memberships?.netSales ?? 0,
      taxes: data.memberships?.taxes ?? 0,
      totalSales: data.memberships?.totalSales ?? 0,
    };

    // Sort data rows (excluding Total)
    const dataRows = [service, product, memberships];
    if (salesSummarySortColumn) {
      dataRows.sort((a, b) => {
        const aVal = a[salesSummarySortColumn as keyof typeof a];
        const bVal = b[salesSummarySortColumn as keyof typeof b];
        const comparison = typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return salesSummarySortDirection === 'asc' ? comparison : -comparison;
      });
    }

    const handleSort = (column: string) => {
      if (salesSummarySortColumn === column) {
        setSalesSummarySortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSalesSummarySortColumn(column);
        setSalesSummarySortDirection('desc');
      }
    };

    return (
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('type')}
                      data-testid="button-sort-type"
                    >
                      Type 
                      {salesSummarySortColumn === 'type' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('salesQty')}
                      data-testid="button-sort-sales-qty"
                    >
                      Sales qty
                      {salesSummarySortColumn === 'salesQty' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('itemsSold')}
                      data-testid="button-sort-items-sold"
                    >
                      Items sold
                      {salesSummarySortColumn === 'itemsSold' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('grossSales')}
                      data-testid="button-sort-gross-sales"
                    >
                      Gross sales
                      {salesSummarySortColumn === 'grossSales' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('totalDiscounts')}
                      data-testid="button-sort-discounts"
                    >
                      Total discounts
                      {salesSummarySortColumn === 'totalDiscounts' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('refunds')}
                      data-testid="button-sort-refunds"
                    >
                      Refunds
                      {salesSummarySortColumn === 'refunds' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('netSales')}
                      data-testid="button-sort-net-sales"
                    >
                      Net sales
                      {salesSummarySortColumn === 'netSales' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('taxes')}
                      data-testid="button-sort-taxes"
                    >
                      Taxes
                      {salesSummarySortColumn === 'taxes' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-semibold">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort('totalSales')}
                      data-testid="button-sort-total-sales"
                    >
                      Total sales
                      {salesSummarySortColumn === 'totalSales' ? (
                        salesSummarySortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover-elevate font-semibold">
                  <td className="p-3" data-testid="text-type-total">Total</td>
                  <td className="p-3">{total.salesQty}</td>
                  <td className="p-3">{total.itemsSold}</td>
                  <td className="p-3">{formatCurrency(total.grossSales)}</td>
                  <td className="p-3">{formatCurrency(total.totalDiscounts)}</td>
                  <td className="p-3">{formatCurrency(total.refunds)}</td>
                  <td className="p-3">{formatCurrency(total.netSales)}</td>
                  <td className="p-3">{formatCurrency(total.taxes)}</td>
                  <td className="p-3">{formatCurrency(total.totalSales)}</td>
                </tr>
                {dataRows.map((row) => (
                  <tr key={row.type} className="border-b hover-elevate text-primary">
                    <td className="p-3">
                      <a href="#" className="hover:underline">{row.type}</a>
                    </td>
                    <td className="p-3">{row.salesQty}</td>
                    <td className="p-3">{row.itemsSold}</td>
                    <td className="p-3">{formatCurrency(row.grossSales)}</td>
                    <td className="p-3">{formatCurrency(row.totalDiscounts)}</td>
                    <td className="p-3">{formatCurrency(row.refunds)}</td>
                    <td className="p-3">{formatCurrency(row.netSales)}</td>
                    <td className="p-3">{formatCurrency(row.taxes)}</td>
                    <td className="p-3">{formatCurrency(row.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

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
