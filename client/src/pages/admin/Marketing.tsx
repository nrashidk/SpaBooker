import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Users, Plus } from "lucide-react";

export default function AdminMarketing() {
  const campaigns = [
    {
      id: 1,
      name: "Weekend Special Promotion",
      type: "Email",
      status: "active",
      sent: 245,
      opened: 187,
      clicked: 89,
    },
    {
      id: 2,
      name: "Birthday Discount",
      type: "SMS",
      status: "scheduled",
      sent: 0,
      opened: 0,
      clicked: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="marketing-title">Marketing</h1>
          <p className="text-muted-foreground">Create campaigns and automate customer engagement</p>
        </div>
        <Button data-testid="button-new-campaign">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Active campaigns</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              SMS Blasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Messages sent this month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">892</p>
              <p className="text-sm text-muted-foreground">Subscribers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Campaigns</h2>
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{campaign.type}</Badge>
                    <Badge variant={campaign.status === "active" ? "default" : "outline"}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{campaign.sent}</p>
                    <p className="text-muted-foreground">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{campaign.opened}</p>
                    <p className="text-muted-foreground">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{campaign.clicked}</p>
                    <p className="text-muted-foreground">Clicked</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-campaign-${campaign.id}`}>
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
