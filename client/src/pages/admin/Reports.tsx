import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Users, Calendar } from "lucide-react";

export default function AdminReports() {
  const reports = [
    {
      title: "Sales Report",
      description: "Daily, weekly, and monthly sales performance",
      icon: TrendingUp,
      lastGenerated: "Today at 9:00 AM",
    },
    {
      title: "Staff Performance",
      description: "Service completion, revenue, and customer ratings",
      icon: Users,
      lastGenerated: "Yesterday",
    },
    {
      title: "Service Analytics",
      description: "Most popular services and booking trends",
      icon: BarChart3,
      lastGenerated: "2 days ago",
    },
    {
      title: "Financial Summary",
      description: "Revenue, expenses, profit & loss statements",
      icon: TrendingUp,
      lastGenerated: "Today at 8:00 AM",
    },
    {
      title: "Customer Insights",
      description: "Customer retention, loyalty points, and spending patterns",
      icon: Users,
      lastGenerated: "3 days ago",
    },
    {
      title: "Tax Reports",
      description: "Sales tax, VAT calculations, and compliance reports",
      icon: BarChart3,
      lastGenerated: "Last week",
    },
  ];

  const quickStats = [
    { label: "Avg. Daily Revenue", value: "AED 1,508", change: "+12%" },
    { label: "Customer Retention", value: "78%", change: "+5%" },
    { label: "Staff Utilization", value: "85%", change: "+3%" },
    { label: "Product Sales", value: "AED 8,420", change: "+18%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="reports-title">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate insights and export business reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className="text-sm text-green-600 dark:text-green-400">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover-elevate">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Last generated: {report.lastGenerated}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-generate-${report.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-download-${report.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Export to PDF</p>
                <p className="text-sm text-muted-foreground">Professional formatted reports</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-export-pdf">
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Export to CSV</p>
                <p className="text-sm text-muted-foreground">Data for Excel and spreadsheets</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-export-csv">
                <Download className="h-3 w-3 mr-1" />
                CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Schedule Reports</p>
                <p className="text-sm text-muted-foreground">Automated email delivery</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-schedule-reports">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
