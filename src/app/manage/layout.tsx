
'use client';

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutGrid, Mail, Users, Mountain, ArrowLeft, UsersRound, Package, Handshake, ShieldAlert, PictureInPicture, PenSquare, Star, UserCircle2, Landmark, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userName = "Admin";
  const userHandle = "happymountain";
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="max-w-screen-2xl mx-auto">
          <div className="flex">
              <Sidebar className="w-64 border-r hidden md:block">
                  <SidebarContent className="p-4 flex flex-col justify-between h-full">
                      <SidebarGroup>
                          <SidebarGroupLabel>Management</SidebarGroupLabel>
                          <SidebarMenu>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage" isActive={pathname === '/manage'} tooltip="Dashboard">
                                      <LayoutGrid />
                                      <span>Dashboard</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/profile" isActive={pathname.startsWith('/manage/profile')} tooltip="Profile">
                                      <UserCircle2 />
                                      <span>Profile</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/uploads" isActive={pathname.startsWith('/manage/uploads')} tooltip="Uploads">
                                      <PictureInPicture />
                                      <span>Uploads</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/inquiries" isActive={pathname === '/manage/inquiries'} tooltip="Inquiries">
                                      <Mail />
                                      <span>Inquiries</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/chatbot" isActive={pathname === '/manage/chatbot'} tooltip="Chatbot">
                                      <MessageSquare />
                                      <span>Chatbot</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/accounts" isActive={pathname.startsWith('/manage/accounts')} tooltip="Users">
                                      <Users />
                                      <span>Users</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                                <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/blog" isActive={pathname.startsWith('/manage/blog')} tooltip="Blog">
                                      <PenSquare />
                                      <span>Blog</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/team" isActive={pathname.startsWith('/manage/team')} tooltip="Team">
                                      <UsersRound />
                                      <span>Team</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/packages" isActive={pathname.startsWith('/manage/packages')} tooltip="Packages">
                                      <Package />
                                      <span>Packages</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/partners" isActive={pathname.startsWith('/manage/partners')} tooltip="Partners">
                                      <Handshake />
                                      <span>Partners</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton href="/manage/reviews" isActive={pathname.startsWith('/manage/reviews')} tooltip="Reviews">
                                      <Star />
                                      <span>Reviews</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                <SidebarMenuButton href="/manage/legal" isActive={pathname.startsWith('/manage/legal')} tooltip="Legal">
                                    <Landmark />
                                    <span>Legal</span>
                                </SidebarMenuButton>
                               </SidebarMenuItem>
                              <SidebarMenuItem>
                                <SidebarMenuButton href="/manage/site/errors" isActive={pathname.startsWith('/manage/site/errors')} tooltip="Site Errors">
                                    <ShieldAlert />
                                    <span>Site Errors</span>
                                </SidebarMenuButton>
                               </SidebarMenuItem>
                               <SidebarMenuItem>
                                  <SidebarMenuButton href="/" tooltip="Back to Site">
                                      <ArrowLeft />
                                      <span>Back to Site</span>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                          </SidebarMenu>
                      </SidebarGroup>
                  </SidebarContent>
              </Sidebar>
              <main className="flex-1 p-4 md:p-8 overflow-auto">
                  {children}
              </main>
          </div>
      </div>
    </SidebarProvider>
  );
}
