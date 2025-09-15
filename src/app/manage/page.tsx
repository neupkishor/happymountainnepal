

import { Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarHeader, SidebarTrigger, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutGrid, Mail } from "lucide-react";
import InquiriesList from "./InquiriesList";
import { Button } from "@/components/ui/button";

export default function ManagePage() {

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                 <h2 className="text-xl font-bold !font-headline group-data-[collapsible=icon]:hidden">
                    Admin Panel
                </h2>
            </SidebarHeader>
            <SidebarContent>
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
        <SidebarInset>
            <div className="p-4 md:p-8">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold !font-headline">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome to the management panel.
                        </p>
                    </div>
                    <SidebarTrigger variant="ghost" size="icon" className="md:hidden" />
                </header>
                
                <InquiriesList />

            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
