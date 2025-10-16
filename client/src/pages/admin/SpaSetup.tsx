import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Building2, MapPin, Clock, Sparkles, Users, FileText, Package, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type SetupStep = {
  id: string;
  title: string;
  icon: any;
  description: string;
};

const steps: SetupStep[] = [
  { id: "basicInfo", title: "Basic Information", icon: Building2, description: "Spa name and contact details" },
  { id: "location", title: "Location", icon: MapPin, description: "Address and geographic details" },
  { id: "hours", title: "Business Hours", icon: Clock, description: "Operating hours and schedule" },
  { id: "services", title: "Services", icon: Sparkles, description: "Service offerings and pricing" },
  { id: "staff", title: "Staff", icon: Users, description: "Team members and schedules" },
  { id: "policies", title: "Policies", icon: FileText, description: "Cancellation and tax policies" },
  { id: "inventory", title: "Inventory", icon: Package, description: "Products and stock" },
  { id: "activation", title: "Activation", icon: CreditCard, description: "Payment and notifications" },
];

type SetupStatus = {
  spaId: number | null;
  setupComplete: boolean;
  steps: {
    basicInfo: boolean;
    location: boolean;
    hours: boolean;
    services: boolean;
    staff: boolean;
    policies: boolean;
    inventory: boolean;
    activation: boolean;
  };
  spa?: any;
};

export default function SpaSetup() {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const { data: setupStatus, isLoading } = useQuery<SetupStatus>({
    queryKey: ["/api/admin/setup/status"],
  });

  useEffect(() => {
    if (setupStatus?.spa) {
      setFormData(setupStatus.spa);
    }
  }, [setupStatus]);

  const saveStepMutation = useMutation({
    mutationFn: async ({ stepName, data }: { stepName: string; data: any }) => {
      return apiRequest("POST", `/api/admin/setup/step/${stepName}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/setup/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save progress",
        variant: "destructive",
      });
    },
  });

  const completeSetupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup/complete");
    },
    onSuccess: () => {
      toast({
        title: "Setup Complete!",
        description: "Your spa is now live and visible to customers.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/setup/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Completion Failed",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    const currentStep = steps[currentStepIndex];
    
    // Save current step data
    const stepData = getStepData(currentStep.id);
    if (Object.keys(stepData).length > 0) {
      await saveStepMutation.mutateAsync({ stepName: currentStep.id, data: stepData });
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    completeSetupMutation.mutate();
  };

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case "basicInfo":
        return {
          name: formData.name,
          description: formData.description,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          currency: formData.currency || "AED",
        };
      case "location":
        return {
          address: formData.address,
          city: formData.city,
          area: formData.area,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };
      case "hours":
        return {
          businessHours: formData.businessHours || {},
        };
      case "policies":
        return {
          cancellationPolicy: formData.cancellationPolicy || {},
          taxRate: formData.taxRate || "5.00",
        };
      default:
        return {};
    }
  };

  const isStepComplete = (stepId: string) => {
    return setupStatus?.steps?.[stepId as keyof typeof setupStatus.steps] === true;
  };

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading setup wizard...</p>
        </div>
      </div>
    );
  }

  if (setupStatus?.setupComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Setup Complete!</CardTitle>
                <CardDescription>Your spa is now live and accepting bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Congratulations! Your spa setup is complete and your business is now visible to customers.
            </p>
            <Button onClick={() => window.location.href = "/admin"} data-testid="button-go-to-dashboard">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-spa-setup">Spa Setup Wizard</h1>
        <p className="text-muted-foreground">Complete these steps to set up your spa</p>
        <div className="mt-4">
          <Progress value={progress} className="h-2" data-testid="progress-setup" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Steps Sidebar */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                index === currentStepIndex
                  ? "bg-primary/10 border-2 border-primary"
                  : isStepComplete(step.id)
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-card hover:bg-accent"
              }`}
              onClick={() => setCurrentStepIndex(index)}
              data-testid={`step-indicator-${step.id}`}
            >
              {isStepComplete(step.id) ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <Circle className={`h-5 w-5 flex-shrink-0 ${index === currentStepIndex ? "text-primary" : "text-muted-foreground"}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${index === currentStepIndex ? "text-primary" : ""}`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <currentStep.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{currentStep.title}</CardTitle>
                  <CardDescription>{currentStep.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Step */}
              {currentStep.id === "basicInfo" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Spa Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your spa name"
                      data-testid="input-spa-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of your spa"
                      rows={4}
                      data-testid="textarea-spa-description"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail || ""}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="contact@spa.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone || ""}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        data-testid="input-contact-phone"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Location Step */}
              {currentStep.id === "location" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                      data-testid="input-address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Dubai"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">Area/Neighborhood</Label>
                      <Input
                        id="area"
                        value={formData.area || ""}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="Downtown"
                        data-testid="input-area"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Other steps - placeholder for now */}
              {(currentStep.id === "hours" || currentStep.id === "services" || 
                currentStep.id === "staff" || currentStep.id === "policies" || 
                currentStep.id === "inventory" || currentStep.id === "activation") && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    This step will be implemented with detailed forms.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For now, you can mark this step as complete and continue.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStepIndex < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={saveStepMutation.isPending}
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={completeSetupMutation.isPending}
                    data-testid="button-complete-setup"
                  >
                    Complete Setup
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
