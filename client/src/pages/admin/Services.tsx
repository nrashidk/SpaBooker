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
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, ServiceCategory } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ServicesSection = "service-menu" | "memberships";

export default function AdminServices() {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<ServicesSection>("service-menu");
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [showNewService, setShowNewService] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newServiceStep, setNewServiceStep] = useState("basic-details");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    categoryId: null as number | null,
    treatmentType: "",
    description: "",
    priceType: "fixed",
    price: "",
    duration: "60",
  });

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  const { data: serviceCategories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/admin/service-categories"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      setShowNewService(false);
      setServiceForm({
        name: "",
        categoryId: null,
        treatmentType: "",
        description: "",
        priceType: "fixed",
        price: "",
        duration: "60",
      });
      toast({
        title: "Service created",
        description: "The service has been added successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      const data = error?.data ?? error?.response?.data;
      
      if (status === 412 && data?.setupRequired) {
        toast({
          title: "Setup Required",
          description: "Please complete the setup wizard first.",
          variant: "destructive",
        });
        window.location.href = "/admin/setup";
        return;
      }
      
      if (status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      
      if (status === 403) {
        toast({
          title: "Forbidden",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/admin/services/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      setShowNewService(false);
      setEditingService(null);
      setServiceForm({
        name: "",
        categoryId: null,
        treatmentType: "",
        description: "",
        priceType: "fixed",
        price: "",
        duration: "60",
      });
      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      const data = error?.data ?? error?.response?.data;
      
      if (status === 412 && data?.setupRequired) {
        toast({
          title: "Setup Required",
          description: "Please complete the setup wizard first.",
          variant: "destructive",
        });
        window.location.href = "/admin/setup";
        return;
      }
      
      if (status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      
      if (status === 403) {
        toast({
          title: "Forbidden",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      const data = error?.data ?? error?.response?.data;
      
      if (status === 412 && data?.setupRequired) {
        toast({
          title: "Setup Required",
          description: "Please complete the setup wizard first.",
          variant: "destructive",
        });
        window.location.href = "/admin/setup";
        return;
      }
      
      if (status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      
      if (status === 403) {
        toast({
          title: "Forbidden",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return apiRequest('POST', '/api/admin/service-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-categories'] });
      setNewCategoryName("");
      setShowAddCategory(false);
      setEditingCategory(null);
      toast({
        title: "Category added",
        description: "The category has been added successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      const data = error?.data ?? error?.response?.data;
      
      if (status === 412 && data?.setupRequired) {
        toast({
          title: "Setup Required",
          description: "Please complete the setup wizard first.",
          variant: "destructive",
        });
        window.location.href = "/admin/setup";
        return;
      }
      
      if (status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      
      if (status === 403) {
        toast({
          title: "Forbidden",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to add category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string } }) => {
      return apiRequest('PUT', `/api/admin/service-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-categories'] });
      setNewCategoryName("");
      setShowAddCategory(false);
      setEditingCategory(null);
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/service-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.categoryId || !serviceForm.price) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields (name, category, price).",
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit = {
      name: serviceForm.name,
      categoryId: serviceForm.categoryId,
      description: serviceForm.description || null,
      price: Number(serviceForm.price),
      duration: parseInt(serviceForm.duration, 10),
    };

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        data: dataToSubmit,
      });
    } else {
      createServiceMutation.mutate(dataToSubmit);
    }
  };

  const handleEditService = (service: Service) => {
    setServiceForm({
      name: service.name,
      categoryId: service.categoryId,
      treatmentType: "",
      description: service.description || "",
      priceType: "fixed",
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setEditingService(service);
    setShowNewService(true);
  };

  const handleDeleteService = (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: { name: newCategoryName.trim() },
      });
    } else {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
      });
    }
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setNewCategoryName(category.name);
    setEditingCategory(category);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = (id: number) => {
    const categoryServices = services.filter(s => s.categoryId === id);
    if (categoryServices.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `This category has ${categoryServices.length} service(s). Please move or delete them first.`,
        variant: "destructive",
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const menuSections = [
    {
      title: "Services",
      items: [
        { id: "service-menu" as ServicesSection, label: "Services", icon: ListTree },
        { id: "memberships" as ServicesSection, label: "Memberships", icon: CreditCard },
      ]
    }
  ];

  // Build categories list from database - sorted alphabetically
  const getCategoryCount = (categoryId: number | string) => {
    if (categoryId === "all") return services.length;
    return services.filter(s => s.categoryId === categoryId).length;
  };

  const sortedServiceCategories = [...serviceCategories].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const categories = [
    { id: "all", label: "All categories", count: services.length },
    ...sortedServiceCategories.map(cat => ({
      id: cat.id,
      label: cat.name,
      count: getCategoryCount(cat.id),
    })),
  ];

  // Filter services based on selected category and search query
  const filteredServices = services
    .filter(s => selectedCategory === "all" || s.categoryId === selectedCategory)
    .filter(s => 
      searchQuery === "" || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Group services by category for display
  const groupedServices: { [key: string]: Service[] } = {};
  filteredServices.forEach(service => {
    const category = serviceCategories.find(cat => cat.id === service.categoryId);
    const categoryName = category?.name || 'Uncategorized';
    if (!groupedServices[categoryName]) {
      groupedServices[categoryName] = [];
    }
    groupedServices[categoryName].push(service);
  });

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
              <DropdownMenuItem 
                onClick={() => {
                  setShowAddCategory(true);
                  setShowOptionsMenu(false);
                }} 
                data-testid="option-category"
              >
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
            <Button variant="ghost" className="text-primary" data-testid="button-learn-more">
              Learn more →
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2">
          <h3 className="font-semibold mb-3">Categories</h3>
          {categories.map((category) => {
            const isRealCategory = category.id !== "all";
            const realCategory = isRealCategory ? sortedServiceCategories.find(c => c.id === category.id) : null;
            
            return (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                    selectedCategory === category.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  <span className="flex-1 text-left">{category.label}</span>
                  <span className="text-xs text-muted-foreground mr-2">{category.count}</span>
                  {isRealCategory && realCategory && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          data-testid={`button-category-menu-${category.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(realCategory);
                        }} data-testid={`button-edit-category-${category.id}`}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(realCategory.id);
                          }}
                          className="text-destructive"
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </button>
              </div>
            );
          })}
          <Button 
            variant="ghost" 
            className="text-primary w-full justify-start px-3" 
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName("");
              setShowAddCategory(true);
            }}
            data-testid="button-add-category"
          >
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-services"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toast({ title: "Coming soon", description: "Filters will be available soon." })}
              data-testid="button-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast({ title: "Coming soon", description: "Manage order will be available soon." })}
              data-testid="button-manage-order"
            >
              <ListTree className="h-4 w-4 mr-2" />
              Manage order
            </Button>
          </div>

          {filteredServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No services match your search" : "No services in this category"}
            </p>
          ) : selectedCategory === "all" ? (
            // Group by category when showing all services
            <div className="space-y-6">
              {Object.keys(groupedServices).sort().map((categoryName) => (
                <div key={categoryName}>
                  <h3 className="font-semibold mb-3">{categoryName}</h3>
                  <div className="space-y-2">
                    {groupedServices[categoryName].map((service) => (
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`button-service-menu-${service.id}`}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditService(service)} data-testid={`edit-service-${service.id}`}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteService(service.id)}
                                    className="text-destructive"
                                    data-testid={`delete-service-${service.id}`}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show flat list when a specific category is selected
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h3>
              <div className="space-y-2">
                {filteredServices.map((service) => (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-service-menu-${service.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditService(service)} data-testid={`edit-service-${service.id}`}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteService(service.id)}
                                className="text-destructive"
                                data-testid={`delete-service-${service.id}`}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNewService = () => (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingService ? 'Edit service' : 'New service'}</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewService(false);
                setEditingService(null);
                setServiceForm({
                  name: "",
                  categoryId: null,
                  treatmentType: "",
                  description: "",
                  priceType: "fixed",
                  price: "",
                  duration: "60",
                });
              }} 
              data-testid="button-close-service"
            >
              Close
            </Button>
            <Button 
              onClick={handleSaveService} 
              disabled={createServiceMutation.isPending || updateServiceMutation.isPending} 
              data-testid="button-save-service"
            >
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
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Add a treatment name, e.g. Men's Haircut"
                  data-testid="input-treatment-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-category">Menu category</Label>
                  <Select 
                    value={serviceForm.categoryId?.toString()} 
                    onValueChange={(value) => setServiceForm({ ...serviceForm, categoryId: parseInt(value) })}
                  >
                    <SelectTrigger id="menu-category" data-testid="select-menu-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedServiceCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
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
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
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
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      placeholder="0.00"
                      className="pl-12"
                      data-testid="input-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={serviceForm.duration} onValueChange={(value) => setServiceForm({ ...serviceForm, duration: value })}>
                    <SelectTrigger id="duration" data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast({ title: "Coming soon", description: "Extra time configuration will be available soon." })}
                  data-testid="button-add-extra-time"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Add extra time
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast({ title: "Coming soon", description: "Pricing options will be available soon." })}
                  data-testid="button-pricing-options"
                >
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

      {/* Add/Edit Category Dialog */}
      <Dialog 
        open={showAddCategory} 
        onOpenChange={(open) => {
          setShowAddCategory(open);
          if (!open) {
            setNewCategoryName("");
            setEditingCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category name' : 'Create a new service category to organize your services'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name (e.g., Massage, Nails)"
                data-testid="input-category-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName("");
                setEditingCategory(null);
              }}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
