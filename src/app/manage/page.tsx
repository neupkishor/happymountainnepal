
import { Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutGrid, Mail } from "lucide-react";
import InquiriesList from "./InquiriesList";
import { Button } from "@/components/ui/button";

export default function ManagePage() {

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold !font-headline group-data-[collapsible=icon]:hidden">
                        Admin Panel
                    </h2>
                    <SidebarTrigger variant="ghost" size="icon" />
                </div>
            </SidebarHeader>
            <SidebarContent>
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
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <div className="p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold !font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to the management panel. Here you can view recent inquiries.
                    </p>
                </header>
                
                <InquiriesList />

            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
