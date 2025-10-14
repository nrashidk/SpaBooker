import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, Search, Filter, MoreVertical, Layers, ListTree, 
  CreditCard, Package, Warehouse, ChevronDown, X, Users,
  FolderOpen, Settings as SettingsIcon, DollarSign, FileText,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";

type ServicesSection = "catalog" | "service-menu" | "memberships" | "products" | "stock-takes" | "stock-orders" | "suppliers";
type ServiceCategory = "all" | "hair" | "coloring" | "shave-beard" | "facial" | "hand-foot-care";

export default function AdminServices() {
  const [selectedSection, setSelectedSection] = useState<ServicesSection>("service-menu");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [showNewService, setShowNewService] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [newServiceStep, setNewServiceStep] = useState("basic-details");

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  const menuSections = [
    {
      title: "Catalog",
      items: [
        { id: "catalog" as ServicesSection, label: "Catalog", icon: Layers },
        { id: "service-menu" as ServicesSection, label: "Service menu", icon: ListTree },
        { id: "memberships" as ServicesSection, label: "Memberships", icon: CreditCard },
        { id: "products" as ServicesSection, label: "Products", icon: Package },
      ]
    },
    {
      title: "Inventory",
      items: [
        { id: "stock-takes" as ServicesSection, label: "Stock takes", icon: Warehouse },
        { id: "stock-orders" as ServicesSection, label: "Stock orders", icon: FileText },
        { id: "suppliers" as ServicesSection, label: "Suppliers", icon: Users },
      ]
    }
  ];

  const categories = [
    { id: "all" as ServiceCategory, label: "All categories", count: services.length },
    { id: "hair" as ServiceCategory, label: "Hair", count: 14 },
    { id: "coloring" as ServiceCategory, label: "Coloring", count: 9 },
    { id: "shave-beard" as ServiceCategory, label: "Shave & Beard", count: 6 },
    { id: "facial" as ServiceCategory, label: "Facial", count: 4 },
    { id: "hand-foot-care" as ServiceCategory, label: "Hand & Foot Care", count: 5 },
  ];

  const serviceSteps = [
    { id: "basic-details", label: "Basic details" },
    { id: "team-members", label: "Team members", count: 7 },
    { id: "resources", label: "Resources" },
    { id: "service-add-ons", label: "Service add-ons" },
    { id: "settings", label: "Settings", subItems: [
      { id: "online-booking", label: "Online booking" },
      { id: "forms", label: "Forms", count: 1 },
      { id: "commissions", label: "Commissions" },
      { id: "settings", label: "Settings" },
    ]},
  ];

  const renderServiceMenu = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service menu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage the services offered by your business. <a href="#" className="text-primary">Learn more</a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu open={showOptionsMenu} onOpenChange={setShowOptionsMenu}>
            <DropdownMenuTrigger asChild>
              <Button data-testid="button-add-service-options">
                <Plus className="h-4 w-4 mr-2" />
                Add
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowNewService(true)} data-testid="option-single-service">
                Single service
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="option-bundle">
                Bundle
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="option-category">
                Category
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="option-service">
                +Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" data-testid="button-options">
            Options
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">New</Badge>
              <p className="font-medium">Simplify your service menu, perfect for extras, products or refreshments</p>
            </div>
            <Button variant="link" className="text-primary" data-testid="button-learn-more">
              Learn more →
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2">
          <h3 className="font-semibold mb-3">Categories</h3>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                selectedCategory === category.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
              }`}
              data-testid={`category-${category.id}`}
            >
              <span>{category.label}</span>
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </button>
          ))}
          <Button variant="link" className="text-primary w-full justify-start px-3" data-testid="button-add-category">
            <Plus className="h-4 w-4 mr-2" />
            Add category
          </Button>
        </div>

        {/* Services List */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search service name"
                className="pl-10"
                data-testid="input-search-services"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filters">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" data-testid="button-manage-order">
              <ListTree className="h-4 w-4 mr-2" />
              Manage order
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {selectedCategory === "all" ? "All services" : categories.find(c => c.id === selectedCategory)?.label}
              <Button variant="ghost" size="sm" data-testid="button-actions">
                Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </h3>

            <div className="space-y-2">
              {services.map((service) => (
                <Card key={service.id} className="hover-elevate" data-testid={`service-card-${service.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.duration}min</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">AED {service.price}</p>
                        </div>
                        <Button variant="ghost" size="icon" data-testid={`button-service-menu-${service.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewService = () => (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">New service</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowNewService(false)} data-testid="button-close-service">
              Close
            </Button>
            <Button data-testid="button-save-service">
              Save
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-6 p-6">
          {/* Left Navigation */}
          <div className="w-56 flex-shrink-0 space-y-1">
            {serviceSteps.map((step) => (
              <div key={step.id}>
                <button
                  onClick={() => setNewServiceStep(step.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                    newServiceStep === step.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                  }`}
                  data-testid={`service-step-${step.id}`}
                >
                  <span>{step.label}</span>
                  {step.count && <span className="text-xs text-muted-foreground">{step.count}</span>}
                </button>
                {step.subItems && newServiceStep === step.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {step.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover-elevate"
                        data-testid={`service-substep-${subItem.id}`}
                      >
                        <span>{subItem.label}</span>
                        {subItem.count && <span className="text-xs">{subItem.count}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Form */}
          <div className="flex-1 space-y-8 max-w-3xl">
            {/* Basic Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Basic details</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="treatment-name">Treatment name</Label>
                  <span className="text-xs text-muted-foreground">0/255</span>
                </div>
                <Input
                  id="treatment-name"
                  placeholder="Add a treatment name, e.g. Men's Haircut"
                  data-testid="input-treatment-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-category">Menu category</Label>
                  <Select>
                    <SelectTrigger id="menu-category" data-testid="select-menu-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hair">Hair</SelectItem>
                      <SelectItem value="coloring">Coloring</SelectItem>
                      <SelectItem value="facial">Facial</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The category displayed to you, and to clients online
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment-type">Treatment type</Label>
                  <Select>
                    <SelectTrigger id="treatment-type" data-testid="select-treatment-type">
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hair">Hair</SelectItem>
                      <SelectItem value="facial">Facial</SelectItem>
                      <SelectItem value="massage">Massage</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Used to help clients find your service on the Fresha marketplace
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <span className="text-xs text-muted-foreground">0/1000</span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Add a short description"
                  rows={4}
                  data-testid="input-description"
                />
              </div>
            </div>

            {/* Pricing and Duration */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Pricing and duration</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price-type">Price type</Label>
                  <Select defaultValue="fixed">
                    <SelectTrigger id="price-type" data-testid="select-price-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      AED
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-12"
                      data-testid="input-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select defaultValue="1h">
                    <SelectTrigger id="duration" data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">15 min</SelectItem>
                      <SelectItem value="30m">30 min</SelectItem>
                      <SelectItem value="45m">45 min</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="1h30m">1.5 hours</SelectItem>
                      <SelectItem value="2h">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" data-testid="button-add-extra-time">
                  <Clock className="h-4 w-4 mr-2" />
                  Add extra time
                </Button>
                <Button variant="outline" size="sm" data-testid="button-pricing-options">
                  Options
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (showNewService) {
      return renderNewService();
    }

    if (selectedSection === "service-menu") {
      return renderServiceMenu();
    }

    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{selectedSection.replace("-", " ")} coming soon</p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8">Loading services...</div>;
  }

  return (
    <div className="flex h-full gap-6">
      {!showNewService && (
        <>
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 space-y-6">
            <h1 className="text-xl font-bold">Services</h1>
            
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {section.title}
                </h3>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSection(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                        selectedSection === item.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </>
      )}
      {showNewService && renderContent()}
    </div>
  );
}
