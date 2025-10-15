import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, FileText, Download, Calendar, Plus, Receipt, Home, Zap, Package as PackageIcon, Users as UsersIcon, MoreHorizontal, Trash2, Building2, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const expenseFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
});

const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: Date;
  status: string;
}

interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  paymentTerms?: string;
  notes?: string;
  active: boolean;
}

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const expenseCategories = [
    { value: "rent", label: "Rent", icon: Home },
    { value: "utilities", label: "Utilities", icon: Zap },
    { value: "materials", label: "Raw Materials", icon: PackageIcon },
    { value: "salaries", label: "Salaries & Wages", icon: UsersIcon },
    { value: "marketing", label: "Marketing", icon: FileText },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  const vendorCategories = [
    { value: "supplier", label: "Supplier" },
    { value: "utility_provider", label: "Utility Provider" },
    { value: "landlord", label: "Landlord" },
    { value: "service_provider", label: "Service Provider" },
    { value: "contractor", label: "Contractor" },
    { value: "other", label: "Other" },
  ];

  const paymentTermOptions = [
    { value: "immediate", label: "Immediate" },
    { value: "net_15", label: "Net 15" },
    { value: "net_30", label: "Net 30" },
    { value: "net_60", label: "Net 60" },
    { value: "net_90", label: "Net 90" },
  ];

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 1,
      name: "Spa Supplies Co.",
      email: "sales@spasupplies.ae",
      phone: "+971 50 123 4567",
      address: "Dubai, UAE",
      category: "supplier",
      paymentTerms: "net_30",
      notes: "Premium spa products supplier",
      active: true,
    },
    {
      id: 2,
      name: "DEWA",
      email: "support@dewa.gov.ae",
      phone: "+971 4 601 9999",
      category: "utility_provider",
      paymentTerms: "immediate",
      active: true,
    },
    {
      id: 3,
      name: "Al Barsha Properties",
      email: "info@albarsha.ae",
      phone: "+971 4 555 1234",
      category: "landlord",
      paymentTerms: "net_15",
      active: true,
    },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      category: "rent",
      description: "Monthly Office Rent",
      amount: 8500,
      date: new Date(2025, 9, 1),
      status: "paid",
    },
    {
      id: 2,
      category: "utilities",
      description: "Electricity & Water Bill",
      amount: 1200,
      date: new Date(2025, 9, 10),
      status: "paid",
    },
    {
      id: 3,
      category: "materials",
      description: "Spa Products & Supplies",
      amount: 3400,
      date: new Date(2025, 9, 12),
      status: "paid",
    },
    {
      id: 4,
      category: "salaries",
      description: "Staff Salaries (Oct)",
      amount: 15200,
      date: new Date(2025, 9, 5),
      status: "paid",
    },
    {
      id: 5,
      category: "marketing",
      description: "Social Media Ads",
      amount: 850,
      date: new Date(2025, 9, 8),
      status: "pending",
    },
  ]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const handleAddExpense = (values: ExpenseFormValues) => {
    const newExpense: Expense = {
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
      category: values.category,
      description: values.description,
      amount: Number(values.amount),
      date: new Date(values.date),
      status: "paid",
    };
    setExpenses([...expenses, newExpense]);
    form.reset();
    setIsAddExpenseOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: format(expense.date, "yyyy-MM-dd"),
    });
    setIsAddExpenseOpen(true);
  };

  const handleUpdateExpense = (values: ExpenseFormValues) => {
    if (!editingExpense) return;
    
    const updatedExpenses = expenses.map(exp =>
      exp.id === editingExpense.id
        ? {
            ...exp,
            category: values.category,
            description: values.description,
            amount: Number(values.amount),
            date: new Date(values.date),
          }
        : exp
    );
    setExpenses(updatedExpenses);
    form.reset();
    setEditingExpense(null);
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddExpenseOpen(open);
    if (!open) {
      setEditingExpense(null);
      form.reset({
        category: "",
        description: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  };

  // Vendor form and handlers
  const vendorForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      paymentTerms: "",
      notes: "",
    },
  });

  const handleAddVendor = (values: VendorFormValues) => {
    const newVendor: Vendor = {
      id: vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 1,
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      category: values.category,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      active: true,
    };
    setVendors([...vendors, newVendor]);
    vendorForm.reset();
    setIsAddVendorOpen(false);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    vendorForm.reset({
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      category: vendor.category,
      paymentTerms: vendor.paymentTerms || "",
      notes: vendor.notes || "",
    });
    setIsAddVendorOpen(true);
  };

  const handleUpdateVendor = (values: VendorFormValues) => {
    if (!editingVendor) return;
    
    const updatedVendors = vendors.map(v =>
      v.id === editingVendor.id
        ? {
            ...v,
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            category: values.category,
            paymentTerms: values.paymentTerms,
            notes: values.notes,
          }
        : v
    );
    setVendors(updatedVendors);
    vendorForm.reset();
    setEditingVendor(null);
    setIsAddVendorOpen(false);
  };

  const handleDeleteVendor = (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const handleVendorDialogClose = (open: boolean) => {
    setIsAddVendorOpen(open);
    if (!open) {
      setEditingVendor(null);
      vendorForm.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        paymentTerms: "",
        notes: "",
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenue = 45230;
  const netProfit = totalRevenue - totalExpenses;

  const expensesByCategory = expenseCategories.map(cat => {
    const categoryExpenses = expenses.filter(e => e.category === cat.value);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : "0";
    return {
      ...cat,
      total,
      percentage,
      count: categoryExpenses.length,
    };
  }).filter(cat => cat.total > 0);

  const getCategoryIcon = (category: string) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat?.icon || MoreHorizontal;
  };

  const getCategoryLabel = (category: string) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat?.label || category;
  };

  const financialStats = [
    {
      title: "Total Revenue (Month)",
      value: `AED ${totalRevenue.toLocaleString()}`,
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
      value: `AED ${totalExpenses.toLocaleString()}`,
      change: `${expenses.length} expenses`,
      icon: Receipt,
    },
    {
      title: "Net Profit (Month)",
      value: `AED ${netProfit.toLocaleString()}`,
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

  const getVendorCategoryLabel = (category: string) => {
    const cat = vendorCategories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getPaymentTermsLabel = (terms?: string) => {
    const term = paymentTermOptions.find(t => t.value === terms);
    return term?.label || terms || "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="finance-title">Finance & Accounting</h1>
          <p className="text-muted-foreground">Manage expenses, vendors, bills and financial reports</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="tab-expenses">Expenses</TabsTrigger>
          <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bills" data-testid="tab-bills">Bills</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">

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
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Tracking</CardTitle>
            <Dialog open={isAddExpenseOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-expense">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(editingExpense ? handleUpdateExpense : handleAddExpense)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-expense-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter expense description" data-testid="input-expense-description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (AED)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" data-testid="input-expense-amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" data-testid="input-expense-date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" data-testid="button-save-expense">
                        {editingExpense ? "Update Expense" : "Save Expense"}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={() => handleDialogClose(false)} data-testid="button-cancel-expense">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`expense-${expense.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{getCategoryLabel(expense.category)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">AED {expense.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(expense.date, "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditExpense(expense)}
                      data-testid={`button-edit-expense-${expense.id}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteExpense(expense.id)}
                      data-testid={`button-delete-expense-${expense.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesByCategory.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{category.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">AED {category.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage}% ({category.count} items)</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendor Management</CardTitle>
                <Dialog open={isAddVendorOpen} onOpenChange={handleVendorDialogClose}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-vendor">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                    </DialogHeader>
                    <Form {...vendorForm}>
                      <form onSubmit={vendorForm.handleSubmit(editingVendor ? handleUpdateVendor : handleAddVendor)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={vendorForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Vendor Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter vendor name" data-testid="input-vendor-name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-vendor-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {vendorCategories.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="paymentTerms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Terms</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-vendor-payment-terms">
                                      <SelectValue placeholder="Select terms" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentTermOptions.map((term) => (
                                      <SelectItem key={term.value} value={term.value}>
                                        {term.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="vendor@example.com" data-testid="input-vendor-email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+971 50 123 4567" data-testid="input-vendor-phone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter address" data-testid="input-vendor-address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional notes about the vendor" data-testid="textarea-vendor-notes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" data-testid="button-save-vendor">
                            {editingVendor ? "Update Vendor" : "Save Vendor"}
                          </Button>
                          <Button type="button" variant="outline" className="flex-1" onClick={() => handleVendorDialogClose(false)} data-testid="button-cancel-vendor">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`vendor-${vendor.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{getVendorCategoryLabel(vendor.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Payment Terms:</p>
                        <p className="text-sm font-medium">{getPaymentTermsLabel(vendor.paymentTerms)}</p>
                      </div>
                      {vendor.email && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Email:</p>
                          <p className="text-sm">{vendor.email}</p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditVendor(vendor)}
                        data-testid={`button-edit-vendor-${vendor.id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteVendor(vendor.id)}
                        data-testid={`button-delete-vendor-${vendor.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab - Placeholder */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bills & Purchase Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Bills management coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Track and manage purchase invoices from vendors</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
