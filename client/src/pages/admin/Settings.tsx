import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Building2, Mail, Phone, MapPin, DollarSign, Palette, Calendar, Link as LinkIcon, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SpaSettings, SpaIntegration } from "@shared/schema";
import NotificationProviderConfig from "@/components/NotificationProviderConfig";
import NotificationSettings from "@/components/NotificationSettings";
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Fetch existing settings
  const { data: settings, isLoading } = useQuery<SpaSettings>({
    queryKey: ["/api/admin/settings"],
  });

  // Fetch integrations for current spa
  const { data: integrations = [] } = useQuery<SpaIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  // Check for OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');

    if (oauthSuccess) {
      toast({
        title: "Integration connected",
        description: `${oauthSuccess} has been successfully connected.`,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/admin/settings');
    } else if (oauthError) {
      toast({
        title: "Connection failed",
        description: `Failed to connect: ${oauthError}`,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/admin/settings');
    }
  }, [toast]);

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

  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; isOpen?: boolean }>>({});

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
      return await apiRequest("PUT", "/api/admin/settings", data);
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

  // Connect to integration
  const handleConnectIntegration = async (provider: string, integrationType: string) => {
    try {
      const response = await fetch(
        `/api/oauth/${provider}/connect?integrationType=${integrationType}`
      );
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to initiate OAuth connection.",
        variant: "destructive",
      });
    }
  };

  // Disconnect integration
  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      return await apiRequest("POST", `/api/integrations/${integrationId}/disconnect`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration disconnected",
        description: "The integration has been disconnected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect integration.",
        variant: "destructive",
      });
    },
  });

  // Helper to find if integration is connected
  const getIntegrationStatus = (integrationType: string) => {
    return integrations.find(i => i.integrationType === integrationType && i.status === 'active');
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
            const hours = businessHours[dayKey] || { open: "09:00", close: "20:00", isOpen: true };
            const isOpen = hours.isOpen !== false; // Default to open if not specified
            
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
                    disabled={!isOpen}
                    data-testid={`input-${dayKey}-open`}
                  />
                  <span className="flex items-center px-2">to</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setBusinessHours({ ...businessHours, [dayKey]: { ...hours, close: e.target.value } })}
                    className="flex-1"
                    disabled={!isOpen}
                    data-testid={`input-${dayKey}-close`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={(checked) => setBusinessHours({ ...businessHours, [dayKey]: { ...hours, isOpen: checked } })}
                    data-testid={`switch-${dayKey}-open`}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {isOpen ? 'Open' : 'Closed'}
                  </Label>
                </div>
              </div>
            );
          })}
          <Separator />
          <Button onClick={handleSaveBusinessHours} data-testid="button-save-business-hours">Save Business Hours</Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Notification Providers</h2>
        <NotificationProviderConfig />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
        <NotificationSettings />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Third-Party Integrations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your spa with free third-party services to enhance functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Calendar Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  2-way sync for appointments (1M requests/day - FREE)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getIntegrationStatus('google_calendar') ? (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const integration = getIntegrationStatus('google_calendar');
                      if (integration) disconnectMutation.mutate(integration.id);
                    }}
                    data-testid="button-disconnect-google-calendar"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleConnectIntegration('google', 'google_calendar')}
                  data-testid="button-connect-google-calendar"
                >
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Coming Soon - Other Integrations */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Coming Soon</h3>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Google My Business - Review collection & SEO</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Google Analytics - Conversion tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Google Meet - Video consultations</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>HubSpot CRM - Contact management (free tier)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Mailchimp - Email campaigns (500 contacts)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Wave Accounting - Bookkeeping</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">FREE</Badge>
                <span>Buffer Social - Social media (3 accounts)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
