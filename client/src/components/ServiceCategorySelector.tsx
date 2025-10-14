import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  discount?: number;
  package?: {
    description: string;
    originalPrice: number;
  };
}

interface ServiceCategorySelectorProps {
  selectedServiceIds: string[];
  onServiceToggle: (serviceId: string) => void;
  services: Service[];
  onContinue: () => void;
}

export default function ServiceCategorySelector({
  selectedServiceIds,
  onServiceToggle,
  services,
  onContinue,
}: ServiceCategorySelectorProps) {
  const categories = ["Featured", ...Array.from(new Set(services.map(s => s.category)))];
  const [activeCategory, setActiveCategory] = useState("Featured");

  const filteredServices = activeCategory === "Featured" 
    ? services.filter(s => s.discount || s.package)
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="shrink-0"
                data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Button variant="ghost" size="icon" className="shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <h3 className="text-xl font-semibold">{activeCategory}</h3>

      <div className="space-y-3">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id);

          return (
            <div key={service.id}>
              <Card
                className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onServiceToggle(service.id)}
                data-testid={`service-card-${service.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">{service.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{service.duration} min</span>
                      {service.discount && (
                        <Badge variant="secondary" className="text-xs text-green-600 dark:text-green-400">
                          Save up to {service.discount}%
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      {service.package ? (
                        <span className="text-sm">from AED {service.price}</span>
                      ) : (
                        <span className="font-medium">AED {service.price}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <div className="bg-primary rounded-full p-1.5">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="border-2 rounded-full p-1.5 w-7 h-7" />
                    )}
                  </div>
                </div>
              </Card>

              {service.package && (
                <Card className="mt-2 p-3 bg-primary/10 border-primary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="flex-1">{service.package.description}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {selectedServiceIds.length > 0 && (
        <Button
          onClick={onContinue}
          className="w-full"
          size="lg"
          data-testid="button-continue-to-professional"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
