import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, FileText, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminFinance() {
  const financialStats = [
    {
      title: "Total Revenue (Month)",
      value: "AED 45,230",
      change: "+18.2%",
      icon: DollarSign,
    },
    {
      title: "Pending Payments",
      value: "AED 3,420",
      change: "12 invoices",
      icon: FileText,
    },
    {
      title: "Expenses (Month)",
      value: "AED 18,650",
      change: "+5.1%",
      icon: TrendingUp,
    },
    {
      title: "Net Profit (Month)",
      value: "AED 26,580",
      change: "+22.4%",
      icon: TrendingUp,
    },
  ];

  const recentInvoices = [
    {
      id: 1,
      invoiceNumber: "INV-001",
      customer: "Ahmed Ali",
      amount: 180,
      status: "paid",
      date: new Date(2025, 9, 14),
      paymentMethod: "Card",
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      customer: "Sarah Johnson",
      amount: 145,
      status: "pending",
      date: new Date(2025, 9, 15),
      paymentMethod: null,
    },
    {
      id: 3,
      invoiceNumber: "INV-003",
      customer: "Mohammed Khan",
      amount: 50,
      status: "paid",
      date: new Date(2025, 9, 15),
      paymentMethod: "Cash",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "overdue":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="finance-title">Finance & Accounting</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial reports</p>
        </div>
        <Button data-testid="button-create-invoice">
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-invoices">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`invoice-${invoice.id}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">AED {invoice.amount}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(invoice.date, "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                  {invoice.paymentMethod && (
                    <Badge variant="secondary">{invoice.paymentMethod}</Badge>
                  )}
                  <Button variant="outline" size="sm" data-testid={`button-view-invoice-${invoice.id}`}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-record-payment">
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-add-expense">
              <FileText className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-generate-report">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cash</span>
                <div className="text-right">
                  <p className="font-semibold">AED 18,500</p>
                  <p className="text-xs text-muted-foreground">41%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Card</span>
                <div className="text-right">
                  <p className="font-semibold">AED 22,100</p>
                  <p className="text-xs text-muted-foreground">49%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Online</span>
                <div className="text-right">
                  <p className="font-semibold">AED 4,630</p>
                  <p className="text-xs text-muted-foreground">10%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
