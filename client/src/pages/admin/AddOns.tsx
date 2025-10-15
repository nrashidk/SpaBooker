import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Check, Star, Gift, Calendar, Share2, Target, BarChart3 } from "lucide-react";
import { SiGoogle, SiFacebook, SiInstagram, SiMeta } from "react-icons/si";

export default function AdminAddOns() {
  const addons = [
    {
      id: 1,
      name: "Premium Analytics",
      description: "Advanced reporting and business insights",
      price: "Free",
      features: ["Custom reports", "Data export", "Trend analysis"],
      active: true,
      icon: Crown,
      category: "premium",
    },
    {
      id: 2,
      name: "Priority Support",
      description: "24/7 dedicated support with faster response times",
      price: "Free",
      features: ["24/7 support", "Dedicated manager", "Priority tickets"],
      active: false,
      icon: Shield,
      category: "premium",
    },
    {
      id: 3,
      name: "Automation Suite",
      description: "Automated marketing and client communications",
      price: "Free",
      features: ["Auto campaigns", "Smart reminders", "AI insights"],
      active: true,
      icon: Zap,
      category: "premium",
    },
    {
      id: 4,
      name: "Google Rating Booster",
      description: "Automatically request reviews from satisfied clients",
      price: "Free",
      features: ["Auto review requests", "Rating analytics", "Response templates"],
      active: false,
      icon: Star,
      category: "connector",
    },
    {
      id: 5,
      name: "Client Loyalty Program",
      description: "Reward repeat customers with points and perks",
      price: "Free",
      features: ["Points system", "Tier rewards", "Referral bonuses"],
      active: false,
      icon: Gift,
      category: "connector",
    },
    {
      id: 6,
      name: "Google Reserve",
      description: "Accept bookings directly from Google Search & Maps",
      price: "Free",
      features: ["Google integration", "Real-time sync", "Mobile bookings"],
      active: false,
      icon: Calendar,
      category: "integration",
      customIcon: SiGoogle,
    },
    {
      id: 7,
      name: "Facebook & Instagram Bookings",
      description: "Enable bookings from your social media profiles",
      price: "Free",
      features: ["Social integration", "Auto-sync appointments", "Message bookings"],
      active: false,
      icon: Share2,
      category: "integration",
      customIcon: SiFacebook,
    },
    {
      id: 8,
      name: "Meta Pixel Ads",
      description: "Track conversions and optimize ad campaigns",
      price: "Free",
      features: ["Pixel tracking", "Ad optimization", "Conversion analytics"],
      active: false,
      icon: Target,
      category: "integration",
      customIcon: SiMeta,
    },
    {
      id: 9,
      name: "Google Analytics",
      description: "Comprehensive website and booking analytics",
      price: "Free",
      features: ["Traffic analytics", "User behavior", "Custom dashboards"],
      active: false,
      icon: BarChart3,
      category: "integration",
      customIcon: SiGoogle,
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

      {/* Category Sections */}
      <div className="space-y-8">
        {/* Premium Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Premium Features</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {addons.filter(addon => addon.category === "premium").map((addon) => {
              const Icon = addon.icon;
              return (
                <Card key={addon.id} className={addon.active ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{addon.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                    <p className="text-lg font-bold text-green-600">{addon.price}</p>
                    <Button
                      variant={addon.active ? "outline" : "default"}
                      className="w-full"
                      data-testid={`button-addon-${addon.id}`}
                    >
                      {addon.active ? "Disable" : "Enable"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Connectors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connectors</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {addons.filter(addon => addon.category === "connector").map((addon) => {
              const Icon = addon.icon;
              return (
                <Card key={addon.id} className={addon.active ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{addon.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                    <p className="text-lg font-bold text-green-600">{addon.price}</p>
                    <Button
                      variant={addon.active ? "outline" : "default"}
                      className="w-full"
                      data-testid={`button-addon-${addon.id}`}
                    >
                      {addon.active ? "Disable" : "Enable"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Integration APIs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Integration APIs</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {addons.filter(addon => addon.category === "integration").map((addon) => {
              const Icon = addon.customIcon || addon.icon;
              const isCustomIcon = !!addon.customIcon;
              return (
                <Card key={addon.id} className={addon.active ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className={`h-5 w-5 ${isCustomIcon ? 'text-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{addon.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                    <p className="text-lg font-bold text-green-600">{addon.price}</p>
                    <Button
                      variant={addon.active ? "outline" : "default"}
                      className="w-full"
                      data-testid={`button-addon-${addon.id}`}
                    >
                      {addon.active ? "Disable" : "Enable"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
