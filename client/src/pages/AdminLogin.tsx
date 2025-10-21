import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload, FileText, CheckCircle2, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";

type AuthStatus = {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
};

type AdminApplication = {
  id: number;
  businessName: string;
  status: string;
  appliedAt: Date;
  licenseUrl: string | null;
};

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Application form
  const [spaName, setSpaName] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Check authentication status
  const { data: authStatus, isLoading: isCheckingAuth } = useQuery<AuthStatus>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) {
        return { isAuthenticated: false };
      }
      const user = await res.json();
      return { isAuthenticated: true, user };
    },
  });

  // Check if user has an existing application
  const { data: existingApplication, isLoading: isCheckingApplication } = useQuery<AdminApplication | null>({
    queryKey: ["/api/admin/my-application"],
    enabled: authStatus?.isAuthenticated === true,
    queryFn: async () => {
      const res = await fetch("/api/admin/my-application", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          return null; // No application yet
        }
        throw new Error("Failed to fetch application");
      }
      return res.json();
    },
  });

  // Redirect approved admins to admin panel
  useEffect(() => {
    if (authStatus?.user?.role === 'super_admin' || (authStatus?.user?.role === 'admin' && authStatus?.user?.status === 'approved')) {
      setLocation('/admin');
    }
  }, [authStatus, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseFile) {
      toast({ 
        title: "License document required", 
        description: "Please upload a copy of your business license",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload license document
      const formData = new FormData();
      formData.append("file", licenseFile);
      
      const uploadResponse = await fetch("/api/upload/license", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload license document");
      }

      const { fileUrl } = await uploadResponse.json();

      // Submit application
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          spaName,
          licenseUrl: fileUrl
        }),
      });

      if (response.ok) {
        setApplicationSubmitted(true);
        toast({ 
          title: "Application submitted!", 
          description: "Your application is pending review by a super admin.",
        });
      } else {
        const error = await response.json();
        toast({ 
          title: "Submission failed", 
          description: error.message || "Could not submit application",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - show login button
  if (!authStatus?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              ← Back to Home
            </Button>
          </Link>

          <Card data-testid="card-admin-login">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Admin Portal</CardTitle>
              <CardDescription>
                Apply for admin access or sign in to manage your spa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in with your Replit account to get started
                </p>
                <Button 
                  onClick={handleLogin}
                  className="w-full"
                  size="lg"
                  data-testid="button-login-replit"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.84 4.94v14.12L18.16 12zm12.32 0v7.06h3.53V4.94zM2.31 12v7.06h3.53V12zm0-7.06v3.53h3.53V4.94z"/>
                  </svg>
                  Sign in with Replit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated - check if user already has an application or is an admin
  if (isCheckingApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has a pending/rejected application - show status
  if (existingApplication) {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        title: 'Application Pending',
        description: 'Your admin application is under review by our team. We\'ll notify you once it\'s been reviewed.',
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        title: 'Application Approved!',
        description: 'Your application has been approved. You can now access the admin panel.',
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        title: 'Application Not Approved',
        description: 'Unfortunately, your application was not approved at this time.',
      },
    };

    const config = statusConfig[existingApplication.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              ← Back to Home
            </Button>
          </Link>

          <Card data-testid="card-application-status">
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
                <StatusIcon className={`w-8 h-8 ${config.color}`} />
              </div>
              <CardTitle className="text-2xl">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Business Name:</span>
                  <span className="text-sm">{existingApplication.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Applied:</span>
                  <span className="text-sm">{new Date(existingApplication.appliedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className={`text-sm font-medium capitalize ${config.color}`}>{existingApplication.status}</span>
                </div>
              </div>

              {existingApplication.status === 'approved' && (
                <Button onClick={() => setLocation('/admin')} className="w-full" size="lg">
                  Go to Admin Panel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No application yet - show application form
  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              ← Back to Home
            </Button>
          </Link>

          <Card data-testid="card-application-submitted">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-green-700 dark:text-green-400">
                  Application Submitted!
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Your application is pending for review. You'll receive an update once it's been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            ← Back to Home
          </Button>
        </Link>

        <Card data-testid="card-admin-application">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Apply for Admin Access</CardTitle>
            <CardDescription>
              Signed in as {authStatus.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spa-name">Business Name</Label>
                <Input
                  id="spa-name"
                  type="text"
                  placeholder="Your Spa Name"
                  value={spaName}
                  onChange={(e) => setSpaName(e.target.value)}
                  required
                  data-testid="input-spa-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license-upload">Business License (Required)</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center space-y-2 hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <Input
                      id="license-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                      required
                      data-testid="input-license-file"
                    />
                    <Label htmlFor="license-upload" className="cursor-pointer text-primary hover:underline">
                      {licenseFile ? licenseFile.name : "Click to upload"}
                    </Label>
                    {!licenseFile && (
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG (max 10MB)</p>
                    )}
                    {licenseFile && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{licenseFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-testid="button-submit-application"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
