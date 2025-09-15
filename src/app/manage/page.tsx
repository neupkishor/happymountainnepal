

import { Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarHeader, SidebarTrigger, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutGrid, Mail, User, Bell, Search } from "lucide-react";
import InquiriesList from "./InquiriesList";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function ManagePage() {
  const userName = "Admin";
  const userHandle = "happymountain";

  return (
    <div className="max-w-screen-2xl mx-auto">
        <header className="flex items-center justify-between h-16 px-4 md:px-8 border-b">
            <div className="flex items-center gap-2">
                <Mountain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold !font-headline">Happy Mountain</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-semibold">{userName}</div>
                    <div className="text-sm text-muted-foreground">@{userHandle}</div>
                </div>
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <SidebarProvider>
            <div className="flex">
                <Sidebar className="w-64 border-r">
                    <SidebarContent className="p-4">
                        <SidebarGroup>
                            <SidebarGroupLabel>Management</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton href="#" isActive tooltip="Dashboard">
                                        <LayoutGrid />
                                        <span>Dashboard</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton href="#" tooltip="Inquiries">
                                        <Mail />
                                        <span>Inquiries</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                <main className="flex-1 p-4 md:p-8 overflow-auto">
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
                </main>
            </div>
        </SidebarProvider>
    </div>
  );
}
