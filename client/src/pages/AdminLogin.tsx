import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload, FileText, CheckCircle2 } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [spaName, setSpaName] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPassword 
        }),
      });

      if (response.ok) {
        toast({ title: "Login successful!" });
        setLocation("/admin");
      } else {
        const error = await response.json();
        toast({ 
          title: "Login failed", 
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== registerConfirmPassword) {
      toast({ 
        title: "Passwords don't match", 
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (!licenseFile) {
      toast({ 
        title: "License document required", 
        description: "Please upload a copy of your business license",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // First, upload the license document
      const formData = new FormData();
      formData.append("file", licenseFile);
      
      const uploadResponse = await fetch("/api/upload/license", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload license document");
      }

      const { fileUrl } = await uploadResponse.json();

      // Then, register with the license URL
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: registerName,
          email: registerEmail, 
          password: registerPassword,
          spaName,
          licenseUrl: fileUrl
        }),
      });

      if (response.ok) {
        setRegistrationSuccess(true);
      } else {
        const error = await response.json();
        toast({ 
          title: "Registration failed", 
          description: error.message || "Could not create account",
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
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-purple-200/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Link */}
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            ← Back to Home
          </Button>
        </Link>

        {/* Login/Register Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl" data-testid="text-title">
              Admin Portal
            </CardTitle>
            <CardDescription data-testid="text-subtitle">
              Manage your spa business
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      data-testid="input-login-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      data-testid="input-login-password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    data-testid="button-login-submit"
                  >
                    Sign In
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Password reset will be available after authentication system update
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                {registrationSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" data-testid="registration-success-message">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-green-700 dark:text-green-400">
                        Registration Complete!
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Your application has been submitted and is pending for review. 
                        You will be notified once your account is reviewed.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setRegisterName("");
                        setRegisterEmail("");
                        setRegisterPassword("");
                        setRegisterConfirmPassword("");
                        setSpaName("");
                        setLicenseFile(null);
                      }}
                      data-testid="button-register-another"
                    >
                      Register Another Account
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Your Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        data-testid="input-register-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spa-name">Spa/Business Name</Label>
                      <Input
                        id="spa-name"
                        type="text"
                        placeholder="Wellness Paradise"
                        value={spaName}
                        onChange={(e) => setSpaName(e.target.value)}
                        required
                        data-testid="input-spa-name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        data-testid="input-register-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-file">Business License Document *</Label>
                      <div className="relative">
                        <Input
                          id="license-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                          required
                          className="cursor-pointer"
                          data-testid="input-license-file"
                        />
                        {licenseFile && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span data-testid="text-selected-file">{licenseFile.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a copy of your business license (PDF, JPG, or PNG)
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isUploading}
                      data-testid="button-register-submit"
                    >
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By creating an account, you agree to our Terms of Service
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
