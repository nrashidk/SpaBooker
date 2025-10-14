import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerDetailsFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
}

export default function CustomerDetailsForm({ onSubmit, isLoading = false }: CustomerDetailsFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Your Details</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    data-testid="input-customer-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    data-testid="input-customer-phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Email Address</FormLabel>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    data-testid="input-customer-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-submit-booking"
          >
            {isLoading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
