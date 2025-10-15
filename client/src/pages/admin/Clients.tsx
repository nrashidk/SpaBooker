import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";

export default function AdminClients() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const createClientMutation = useMutation({
    mutationFn: async (data: { name: string; email?: string; phone?: string }) => {
      return apiRequest('POST', '/api/admin/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
      setIsAddClientOpen(false);
      setClientForm({ name: "", email: "", phone: "" });
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/admin/customers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
      setEditingClient(null);
      setClientForm({ name: "", email: "", phone: "" });
      toast({
        title: "Client updated",
        description: "The client has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddClient = () => {
    setClientForm({ name: "", email: "", phone: "" });
    setEditingClient(null);
    setIsAddClientOpen(true);
  };

  const handleEditClient = (client: Customer) => {
    setClientForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
    });
    setEditingClient(client);
    setIsAddClientOpen(true);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleSubmitClient = () => {
    if (!clientForm.name) {
      toast({
        title: "Validation error",
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    if (editingClient) {
      updateClientMutation.mutate({
        id: editingClient.id,
        data: clientForm,
      });
    } else {
      createClientMutation.mutate(clientForm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="admin-clients-title">Clients list</h1>
          <p className="text-muted-foreground">
            Grow, track and analyze your client's data.{" "}
            <a href="#" className="text-primary hover:underline">Learn more</a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="options-btn">Options</Button>
          <Button onClick={handleAddClient} data-testid="add-client">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, email or mobile number"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-clients"
              />
            </div>
            <Button variant="outline" size="icon" data-testid="filter-btn">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Created on newest first
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-3 font-medium">Client name</th>
                  <th className="text-left py-3 font-medium">Mobile number</th>
                  <th className="text-left py-3 font-medium">Reviews</th>
                  <th className="text-left py-3 font-medium">Sales</th>
                  <th className="text-right py-3 font-medium">Created at</th>
                  <th className="text-right py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading clients...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="border-b hover-elevate text-sm"
                      data-testid={`client-row-${index}`}
                    >
                      <td className="py-3 font-medium">{customer.name}</td>
                      <td className="py-3 text-muted-foreground">{customer.phone || '-'}</td>
                      <td className="py-3 text-muted-foreground">-</td>
                      <td className="py-3 text-muted-foreground">
                        AED {parseFloat(customer.totalSpent?.toString() || '0').toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`client-actions-${index}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClient(customer)} data-testid={`edit-client-${index}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClient(customer.id)} 
                              className="text-destructive"
                              data-testid={`delete-client-${index}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update client information' : 'Add a new client to your database'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input
                id="client-name"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                placeholder="Enter client name"
                data-testid="input-client-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="client@example.com"
                data-testid="input-client-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone Number</Label>
              <Input
                id="client-phone"
                type="tel"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                placeholder="+971 50 123 4567"
                data-testid="input-client-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddClientOpen(false);
                setEditingClient(null);
                setClientForm({ name: "", email: "", phone: "" });
              }}
              data-testid="button-cancel-client"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitClient}
              disabled={createClientMutation.isPending || updateClientMutation.isPending}
              data-testid="button-save-client"
            >
              {editingClient ? 'Update' : 'Add'} Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
