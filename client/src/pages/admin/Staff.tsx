import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Star, Calendar } from "lucide-react";

export default function AdminStaff() {
  const staff = [
    {
      id: 1,
      name: "Saqib",
      specialty: "Hairdresser/Massage Therapist",
      rating: 4.9,
      active: true,
      email: "saqib@spa.com",
      phone: "+971 50 123 4567",
      commission: 20,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      specialty: "Skincare Specialist",
      rating: 4.8,
      active: true,
      email: "sarah@spa.com",
      phone: "+971 50 234 5678",
      commission: 18,
    },
    {
      id: 3,
      name: "Michael Chen",
      specialty: "Massage Therapist",
      rating: 4.7,
      active: true,
      email: "michael@spa.com",
      phone: "+971 50 345 6789",
      commission: 22,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="staff-title">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members, schedules, and performance</p>
        </div>
        <Button data-testid="button-add-staff">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{member.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{member.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{member.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Commission</span>
                  <Badge variant="secondary">{member.commission}%</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-edit-staff-${member.id}`}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-schedule-staff-${member.id}`}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
