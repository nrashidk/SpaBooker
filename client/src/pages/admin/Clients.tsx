import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import type { Customer } from "@shared/schema";

export default function AdminClients() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

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
          <Button data-testid="add-client">
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
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading clients...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
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
}
