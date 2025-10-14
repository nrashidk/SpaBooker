import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star } from "lucide-react";

export default function AdminServices() {
  const [services] = useState([
    {
      id: 1,
      name: "Express Haircut",
      category: "Hair Services",
      duration: 25,
      price: 50,
      featured: true,
      active: true,
    },
    {
      id: 2,
      name: "Beard Styling",
      category: "Shave Services",
      duration: 25,
      price: 50,
      featured: true,
      active: true,
    },
    {
      id: 3,
      name: "Executive Pedicure",
      category: "Nails",
      duration: 40,
      price: 80,
      discount: 33,
      featured: true,
      active: true,
    },
    {
      id: 4,
      name: "Little Master Haircut",
      category: "Hair Services",
      duration: 25,
      price: 40,
      featured: false,
      active: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="services-title">Services Management</h1>
          <p className="text-muted-foreground">Manage your spa services, pricing, and categories</p>
        </div>
        <Button data-testid="button-add-service">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            {service.featured && (
              <div className="absolute top-3 right-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-2">
                <span className="flex-1">{service.name}</span>
              </CardTitle>
              <Badge variant="secondary" className="w-fit">
                {service.category}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{service.duration} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <div className="flex items-center gap-2">
                  {service.discount && (
                    <span className="text-muted-foreground line-through">
                      AED {Math.round(service.price / (1 - service.discount / 100))}
                    </span>
                  )}
                  <span className="font-semibold">AED {service.price}</span>
                  {service.discount && (
                    <Badge variant="default" className="text-xs">
                      {service.discount}% off
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-edit-service-${service.id}`}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-delete-service-${service.id}`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
