
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function LegalGatePage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[80vh] py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
                    <CardDescription>
                        Please provide your email address to view our legal documents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action="/api/legal-access" method="POST" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="w-full"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Continue to Documents
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground text-center">
                        We collect your email for compliance and auditing purposes only.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
