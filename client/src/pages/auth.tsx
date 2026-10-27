import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff, Fingerprint, Shield, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { BiometricAuth } from "../lib/biometric";
import { ClientEncryption, LocalStorage } from "../lib/encryption";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { toast } = useToast();
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [localStorageOnly, setLocalStorageOnly] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});

  // React.useEffect(() => {
  //   BiometricAuth.isAvailable().then(setBiometricAvailable);
  // }, []);

  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    console.log("🔍 Password validation breakdown:", {
      password,
      length: password.length,
      hasLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    });
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  };

  const generateStrongPassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>';
    
    console.log("🔧 Character sets:", { uppercase, lowercase, numbers, specialChars });
    
    // Create an array to build the password
    const passwordChars = [];
    
    // Guarantee at least 3 of each required type (total 12 characters)
    for (let i = 0; i < 3; i++) {
      const upperChar = uppercase[Math.floor(Math.random() * uppercase.length)];
      const lowerChar = lowercase[Math.floor(Math.random() * lowercase.length)];
      const numberChar = numbers[Math.floor(Math.random() * numbers.length)];
      const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
      
      console.log(`🔧 Adding chars ${i + 1}:`, { upperChar, lowerChar, numberChar, specialChar });
      
      passwordChars.push(upperChar);
      passwordChars.push(lowerChar);
      passwordChars.push(numberChar);
      passwordChars.push(specialChar);
    }
    
    // Fill remaining 4 characters randomly from all character sets
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = 0; i < 4; i++) {
      const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
      console.log(`🔧 Adding random char ${i + 1}:`, randomChar);
      passwordChars.push(randomChar);
    }
    
    console.log("🔧 Before shuffle:", passwordChars);
    
    // Fisher-Yates shuffle for proper randomization
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }
    
    const finalPassword = passwordChars.join('');
    console.log("🔧 After shuffle:", finalPassword);
    
    // Double-check the password meets requirements before returning
    const verification = {
      hasUpper: /[A-Z]/.test(finalPassword),
      hasLower: /[a-z]/.test(finalPassword),
      hasNumber: /\d/.test(finalPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(finalPassword),
      length: finalPassword.length
    };
    console.log("🔧 Final verification:", verification);
    
    return finalPassword;
  };

  const handleGeneratePassword = () => {
    console.log("🔧 Starting password generation...");
    
    // Generate password until we get a valid one (safety measure)
    let newPassword = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      newPassword = generateStrongPassword();
      attempts++;
      console.log(`Password attempt ${attempts}:`, {
        password: newPassword,
        length: newPassword.length,
        hasUpperCase: /[A-Z]/.test(newPassword),
        hasLowerCase: /[a-z]/.test(newPassword),
        hasNumbers: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        isValid: validatePassword(newPassword)
      });
    } while (!validatePassword(newPassword) && attempts < maxAttempts);
    
    if (!validatePassword(newPassword)) {
      console.error("Failed to generate valid password after", maxAttempts, "attempts");
      toast({
        title: "Password Generation Error",
        description: "Unable to generate a valid password. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("✅ Successfully generated valid password:", newPassword);
    
    // Set the password values
    setRegisterPassword(newPassword);
    setConfirmPassword(newPassword);
    
    // Show success message
    toast({
      title: "Strong password generated",
      description: "Your secure password has been created and confirmed",
    });
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword
      });
      
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully"
      });
      
      // Redirect to home page
      setLocation("/");
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // Clear previous errors
    setFieldErrors({});
    
    // Check for missing required fields
    const errors: {[key: string]: boolean} = {};
    if (!firstName.trim()) errors.firstName = true;
    if (!lastName.trim()) errors.lastName = true;
    if (!registerEmail) errors.email = true;
    if (!registerPassword) errors.password = true;
    if (!confirmPassword) errors.confirmPassword = true;
    if (!registerPhone) errors.phone = true;
    
    // Validate email format
    if (registerEmail && !validateEmail(registerEmail)) {
      errors.email = true;
      setFieldErrors(errors);
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@example.com)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate phone number has at least 10 digits
    const phoneDigits = registerPhone.replace(/\D/g, '');
    if (registerPhone && phoneDigits.length < 10) {
      errors.phone = true;
      setFieldErrors(errors);
      toast({
        title: "Error",
        description: "Phone number must contain at least 10 digits",
        variant: "destructive"
      });
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // Debug: log the password being validated
    console.log("🔍 Registration validation check:", {
      password: registerPassword,
      length: registerPassword.length,
      hasUpperCase: /[A-Z]/.test(registerPassword),
      hasLowerCase: /[a-z]/.test(registerPassword),
      hasNumbers: /\d/.test(registerPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(registerPassword),
      isValid: validatePassword(registerPassword)
    });

    if (!validatePassword(registerPassword)) {
      console.log("❌ Password validation failed during registration");
      toast({
        title: "Weak Password",
        description: "Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters",
        variant: "destructive"
      });
      return;
    }

    if (!agreePrivacy) {
      toast({
        title: "Privacy Policy",
        description: "Please agree to the privacy policy to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
        phone: registerPhone,
        localStorageOnly
      });

      toast({
        title: "Welcome to VelvetLog!",
        description: "Your account has been created successfully"
      });
      
      // Redirect to onboarding flow
      setLocation("/onboarding/plan");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      toast({
        title: "Biometric Not Available",
        description: "Biometric authentication is not supported on this device",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const credential = await BiometricAuth.authenticate();
      
      const response = await fetch('/api/auth/biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: credential.id
        })
      });

      if (!response.ok) {
        throw new Error('Biometric authentication failed');
      }

      const { user, encryptionKey, token } = await response.json();

      // Store user session
      localStorage.setItem('velvetlog_token', token);
      localStorage.setItem('velvetlog_user', JSON.stringify(user));

      toast({
        title: "Welcome back!",
        description: "Biometric authentication successful"
      });

      // Redirect to main app
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Biometric Login Failed",
        description: "Please try again or use password login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              VelvetLog
            </h1>
          </div>
          <p className="text-gray-600">Secure & Private Relationship Management</p>
        </div>

        {/* Security Features */}
        <Card className="border-pink-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-600" />
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Zero knowledge
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Local-first storage
              </div>
              <div className="flex items-center gap-1">
                <Fingerprint className="w-3 h-3" />
                Biometric auth
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Tabs */}
        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to access your secure relationship manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-pink-200 focus:border-pink-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="border-pink-200 focus:border-pink-300 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {biometricAvailable && (
                  <Button 
                    onClick={handleBiometricLogin}
                    variant="outline" 
                    className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                    disabled={isLoading}
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Sign In with Biometric
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Set up your secure and private relationship manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className={fieldErrors.firstName ? "text-red-600" : ""}>
                      First Name <span className={fieldErrors.firstName ? "text-red-600" : ""}>*</span>
                    </Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (fieldErrors.firstName) setFieldErrors(prev => ({...prev, firstName: false}));
                      }}
                      placeholder="First name"
                      className={fieldErrors.firstName ? "border-red-500 focus:border-red-500" : "border-pink-200 focus:border-pink-300"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className={fieldErrors.lastName ? "text-red-600" : ""}>
                      Last Name <span className={fieldErrors.lastName ? "text-red-600" : ""}>*</span>
                    </Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (fieldErrors.lastName) setFieldErrors(prev => ({...prev, lastName: false}));
                      }}
                      placeholder="Last name"
                      className={fieldErrors.lastName ? "border-red-500 focus:border-red-500" : "border-pink-200 focus:border-pink-300"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className={fieldErrors.email ? "text-red-600" : ""}>
                    Email <span className={fieldErrors.email ? "text-red-600" : ""}>*</span>
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: false}));
                    }}
                    placeholder="your@email.com"
                    className={fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-pink-200 focus:border-pink-300"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone" className={fieldErrors.phone ? "text-red-600" : ""}>
                    Phone Number <span className={fieldErrors.phone ? "text-red-600" : ""}>*</span>
                  </Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => {
                      setRegisterPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: false}));
                    }}
                    placeholder="+1 (555) 123-4567"
                    className={fieldErrors.phone ? "border-red-500 focus:border-red-500" : "border-pink-200 focus:border-pink-300"}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="register-password" className={fieldErrors.password ? "text-red-600" : ""}>
                      Password <span className={fieldErrors.password ? "text-red-600" : ""}>*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🔘 Strong Password button clicked");
                        handleGeneratePassword();
                      }}
                      className="text-xs h-7 px-2 border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Strong Password
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({...prev, password: false}));
                      }}
                      placeholder="At least 12 characters"
                      className={fieldErrors.password ? "border-red-500 focus:border-red-500 pr-10" : "border-pink-200 focus:border-pink-300 pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Must include: uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className={fieldErrors.confirmPassword ? "text-red-600" : ""}>
                    Confirm Password <span className={fieldErrors.confirmPassword ? "text-red-600" : ""}>*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors(prev => ({...prev, confirmPassword: false}));
                      }}
                      placeholder="Confirm your password"
                      className={`pr-10 ${
                        fieldErrors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500' 
                          : confirmPassword && registerPassword !== confirmPassword 
                            ? 'border-red-300 focus:border-red-400' 
                            : 'border-pink-200 focus:border-pink-300'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {confirmPassword && registerPassword !== confirmPassword && (
                    <p className="text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="local-storage"
                      checked={localStorageOnly}
                      onCheckedChange={setLocalStorageOnly}
                    />
                    <Label htmlFor="local-storage" className="text-sm">
                      Store data locally only (recommended for maximum privacy)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="privacy-policy"
                      checked={agreePrivacy}
                      onCheckedChange={setAgreePrivacy}
                    />
                    <Label htmlFor="privacy-policy" className="text-sm">
                      I agree to the{" "}
                      <a href="/privacy" className="text-pink-600 hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and understand my data is encrypted end-to-end
                    </Label>
                  </div>
                </div>

                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🔘 Create Account button clicked");
                    handleRegister();
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Secure Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Your data is encrypted and private by design</p>
          <p>
            <a href="/privacy" className="text-pink-600 hover:underline">
              Learn about our privacy practices
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}