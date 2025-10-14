import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Check } from "lucide-react";

export default function AdminAddOns() {
  const addons = [
    {
      id: 1,
      name: "Premium Analytics",
      description: "Advanced reporting and business insights",
      price: "AED 299/month",
      features: ["Custom reports", "Data export", "Trend analysis"],
      active: true,
      icon: Crown,
    },
    {
      id: 2,
      name: "Priority Support",
      description: "24/7 dedicated support with faster response times",
      price: "AED 199/month",
      features: ["24/7 support", "Dedicated manager", "Priority tickets"],
      active: false,
      icon: Shield,
    },
    {
      id: 3,
      name: "Automation Suite",
      description: "Automated marketing and client communications",
      price: "AED 399/month",
      features: ["Auto campaigns", "Smart reminders", "AI insights"],
      active: true,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="addons-title">Add-ons</h1>
          <p className="text-muted-foreground">Enhance your spa management with premium features</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {addons.map((addon) => {
          const Icon = addon.icon;
          return (
            <Card key={addon.id} className={addon.active ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{addon.name}</CardTitle>
                      {addon.active && (
                        <Badge variant="default" className="mt-1">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{addon.description}</p>
                <p className="text-2xl font-bold">{addon.price}</p>
                <ul className="space-y-2">
                  {addon.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={addon.active ? "outline" : "default"}
                  className="w-full"
                  data-testid={`button-addon-${addon.id}`}
                >
                  {addon.active ? "Manage" : "Activate"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
