import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, MapPin, DollarSign, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SpaSettings } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Fetch existing settings
  const { data: settings, isLoading } = useQuery<SpaSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [financialSettings, setFinancialSettings] = useState({
    currency: "AED",
    taxRate: "5",
  });

  const [branding, setBranding] = useState({
    color: "#1a4d6d",
    logoUrl: "",
  });

  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string }>>({});

  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setBusinessInfo({
        name: settings.spaName || "",
        email: settings.contactEmail || "",
        phone: settings.contactPhone || "",
        address: settings.address || "",
      });
      setFinancialSettings({
        currency: settings.currency || "AED",
        taxRate: settings.taxRate || "5",
      });
      setBranding({
        color: settings.brandColor || "#1a4d6d",
        logoUrl: settings.logoUrl || "",
      });
      if (settings.businessHours) {
        setBusinessHours(settings.businessHours as Record<string, { open: string; close: string }>);
      }
    }
  }, [settings]);

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SpaSettings>) => {
      return await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });

  const handleSaveBusinessInfo = () => {
    updateSettingsMutation.mutate(
      {
        spaName: businessInfo.name,
        contactEmail: businessInfo.email,
        contactPhone: businessInfo.phone,
        address: businessInfo.address,
      },
      {
        onSuccess: () => {
          toast({
            title: "Business information saved",
            description: "Your business details have been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save business information.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSaveFinancialSettings = () => {
    updateSettingsMutation.mutate(
      {
        currency: financialSettings.currency,
        taxRate: financialSettings.taxRate,
      },
      {
        onSuccess: () => {
          toast({
            title: "Financial settings saved",
            description: "Your financial settings have been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save financial settings.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSaveBranding = () => {
    updateSettingsMutation.mutate(
      {
        brandColor: branding.color,
        logoUrl: branding.logoUrl,
      },
      {
        onSuccess: () => {
          toast({
            title: "Branding saved",
            description: "Your branding settings have been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save branding.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSaveBusinessHours = () => {
    updateSettingsMutation.mutate(
      {
        businessHours: businessHours,
      },
      {
        onSuccess: () => {
          toast({
            title: "Business hours saved",
            description: "Your business hours have been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save business hours.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleConfigureTwilio = () => {
    toast({
      title: "Coming soon",
      description: "Twilio configuration will be available in the notification settings panel.",
    });
  };

  const handleConfigureEmail = () => {
    toast({
      title: "Coming soon",
      description: "Email configuration will be available in the notification settings panel.",
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="settings-title">Settings</h1>
        <p className="text-muted-foreground">Manage spa settings, business details, and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Business Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="spa-name">Spa Name</Label>
              <Input
                id="spa-name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                data-testid="input-spa-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spa-email">Contact Email</Label>
              <Input
                id="spa-email"
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                data-testid="input-spa-email"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="spa-phone">Contact Phone</Label>
              <Input
                id="spa-phone"
                type="tel"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                data-testid="input-spa-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spa-address">Address</Label>
              <Input
                id="spa-address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                data-testid="input-spa-address"
              />
            </div>
          </div>
          <Button onClick={handleSaveBusinessInfo} data-testid="button-save-business-info">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Financial Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={financialSettings.currency}
                onChange={(e) => setFinancialSettings({ ...financialSettings, currency: e.target.value })}
                data-testid="input-currency"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={financialSettings.taxRate}
                onChange={(e) => setFinancialSettings({ ...financialSettings, taxRate: e.target.value })}
                step="0.01"
                data-testid="input-tax-rate"
              />
            </div>
          </div>
          <Button onClick={handleSaveFinancialSettings} data-testid="button-save-financial-settings">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Branding</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-color">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="brand-color"
                  type="color"
                  value={branding.color}
                  onChange={(e) => setBranding({ ...branding, color: e.target.value })}
                  className="w-20 h-10"
                  data-testid="input-brand-color"
                />
                <Input
                  value={branding.color}
                  onChange={(e) => setBranding({ ...branding, color: e.target.value })}
                  className="flex-1"
                  data-testid="input-brand-color-hex"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={branding.logoUrl}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                data-testid="input-logo-url"
              />
            </div>
          </div>
          <Button onClick={handleSaveBranding} data-testid="button-save-branding">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const dayKey = day.toLowerCase();
            const hours = businessHours[dayKey] || { open: "09:00", close: "20:00" };
            
            return (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <Label>{day}</Label>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => setBusinessHours({ ...businessHours, [dayKey]: { ...hours, open: e.target.value } })}
                    className="flex-1"
                    data-testid={`input-${dayKey}-open`}
                  />
                  <span className="flex items-center px-2">to</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setBusinessHours({ ...businessHours, [dayKey]: { ...hours, close: e.target.value } })}
                    className="flex-1"
                    data-testid={`input-${dayKey}-close`}
                  />
                </div>
              </div>
            );
          })}
          <Separator />
          <Button onClick={handleSaveBusinessHours} data-testid="button-save-business-hours">Save Business Hours</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WhatsApp/SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Send booking confirmations via WhatsApp/SMS</p>
              </div>
              <Button variant="outline" onClick={handleConfigureTwilio} data-testid="button-configure-twilio">
                Configure Twilio
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send booking confirmations via email</p>
              </div>
              <Button variant="outline" onClick={handleConfigureEmail} data-testid="button-configure-email">
                Configure Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
