import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, MapPin, DollarSign, Palette } from "lucide-react";

export default function AdminSettings() {
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
                defaultValue="Serene Spa"
                data-testid="input-spa-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spa-email">Contact Email</Label>
              <Input
                id="spa-email"
                type="email"
                defaultValue="info@serenespa.com"
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
                defaultValue="+971 4 123 4567"
                data-testid="input-spa-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spa-address">Address</Label>
              <Input
                id="spa-address"
                defaultValue="Dubai Marina, Dubai, UAE"
                data-testid="input-spa-address"
              />
            </div>
          </div>
          <Button data-testid="button-save-business-info">Save Changes</Button>
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
                defaultValue="AED"
                data-testid="input-currency"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                defaultValue="5"
                step="0.01"
                data-testid="input-tax-rate"
              />
            </div>
          </div>
          <Button data-testid="button-save-financial-settings">Save Changes</Button>
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
                  defaultValue="#1a4d6d"
                  className="w-20 h-10"
                  data-testid="input-brand-color"
                />
                <Input
                  defaultValue="#1a4d6d"
                  className="flex-1"
                  data-testid="input-brand-color-hex"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                placeholder="https://example.com/logo.png"
                data-testid="input-logo-url"
              />
            </div>
          </div>
          <Button data-testid="button-save-branding">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24">
                <Label>{day}</Label>
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  type="time"
                  defaultValue="09:00"
                  className="flex-1"
                  data-testid={`input-${day.toLowerCase()}-open`}
                />
                <span className="flex items-center px-2">to</span>
                <Input
                  type="time"
                  defaultValue="20:00"
                  className="flex-1"
                  data-testid={`input-${day.toLowerCase()}-close`}
                />
              </div>
            </div>
          ))}
          <Separator />
          <Button data-testid="button-save-business-hours">Save Business Hours</Button>
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
              <Button variant="outline" data-testid="button-configure-twilio">
                Configure Twilio
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send booking confirmations via email</p>
              </div>
              <Button variant="outline" data-testid="button-configure-email">
                Configure Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
