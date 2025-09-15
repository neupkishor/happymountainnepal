

import InquiriesList from "./InquiriesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ManageDashboardPage() {
  const userName = "Admin";
  
  return (
    <>
      <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <h2 className="text-2xl font-bold !font-headline">Good morning, {userName}!</h2>
                  <p className="text-muted-foreground">Here's what's happening today.</p>
              </div>
          </div>
          <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search settings, people, apps, invoices..." className="pl-10"/>
          </div>
      </div>
      
      <InquiriesList />
    </>
  );
}
