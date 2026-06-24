"use client"

import React, { useState } from "react"
import { Bell, MessageCircle, Package, ArrowLeft, ChevronRight, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface NotificationFlyboxProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data
const mockChats = [
  {
    id: "c1",
    name: "TechNova Solutions",
    avatar: "TN",
    lastMessage: "Are the dimensions correct?",
    unread: 2,
    threads: [
      { id: "t1", orderId: "ORD-9921", status: "processing", title: "CNC Milling Parts" }
    ]
  },
  {
    id: "c2",
    name: "Apex Manufacturing",
    avatar: "AM",
    lastMessage: "We have updated the shipping address.",
    unread: 0,
    threads: [
      { id: "t2", orderId: "ORD-8834", status: "shipped", title: "Aluminum Brackets" },
      { id: "t3", orderId: "ORD-8835", status: "processing", title: "Steel Enclosures" }
    ]
  },
  {
    id: "c3",
    name: "Global Components",
    avatar: "GC",
    lastMessage: "Thanks, looking forward to it.",
    unread: 0,
    threads: []
  }
]

const mockNotifications = [
  { id: "n1", title: "New Order Received", description: "You received a new order ORD-9921.", time: "10 min ago" },
  { id: "n2", title: "Payment Successful", description: "Payment for ORD-8834 has been cleared.", time: "2 hours ago" }
]

export default function NotificationFlybox({ isOpen, onClose }: NotificationFlyboxProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [activeThread, setActiveThread] = useState<string | null>(null)

  // Find the selected chat and thread for the active views
  const chatDetails = mockChats.find(c => c.id === activeChat)
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l">
        {/* If viewing a specific thread chat */}
        {activeThread ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => setActiveThread(null)} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-semibold text-sm">Order Thread {activeThread}</h3>
                <p className="text-xs text-muted-foreground">Chatting about order</p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="text-sm text-center text-muted-foreground my-4">Beginning of order chat</div>
              {/* Mock messages could go here */}
              <div className="flex items-end gap-2 mb-4">
                <Avatar className="h-8 w-8"><AvatarFallback>AM</AvatarFallback></Avatar>
                <div className="bg-muted p-2 rounded-lg text-sm max-w-[80%]">When can you ship this?</div>
              </div>
              <div className="flex items-end justify-end gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg text-sm max-w-[80%]">It will be shipped by tomorrow.</div>
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <input type="text" placeholder="Type a message..." className="w-full rounded-md border border-input px-3 py-2 text-sm" />
            </div>
          </div>
        ) : activeChat ? (
          /* Viewing a main chat with thread list */
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
              <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 mr-2"><AvatarFallback>{chatDetails?.avatar}</AvatarFallback></Avatar>
              <div>
                <h3 className="font-semibold text-sm">{chatDetails?.name}</h3>
                <p className="text-xs text-muted-foreground">Main Chat</p>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                {chatDetails?.threads.length ? (
                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Order Threads</h4>
                    {chatDetails.threads.map(thread => (
                      <div 
                        key={thread.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setActiveThread(thread.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{thread.orderId}</div>
                            <div className="text-xs text-muted-foreground">{thread.title} • {thread.status}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">General Chat</h4>
                  {/* Mock messages for general chat */}
                  <div className="flex items-end gap-2 mb-4">
                    <Avatar className="h-8 w-8"><AvatarFallback>{chatDetails?.avatar}</AvatarFallback></Avatar>
                    <div className="bg-muted p-2 rounded-lg text-sm max-w-[80%]">{chatDetails?.lastMessage}</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <input type="text" placeholder="Type a message..." className="w-full rounded-md border border-input px-3 py-2 text-sm" />
            </div>
          </div>
        ) : (
          /* Main Inbox/Notifications Switcher */
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 pb-0 text-left">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg">Activity</SheetTitle>
              </div>
            </SheetHeader>
            <Tabs defaultValue="inbox" className="flex-1 flex flex-col mt-4">
              <div className="px-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="inbox" className="flex-1 mt-4 data-[state=inactive]:hidden">
                <ScrollArea className="h-[calc(100vh-140px)]">
                  <div className="flex flex-col gap-1 px-2 pb-4">
                    {mockChats.map(chat => (
                      <button 
                        key={chat.id}
                        onClick={() => setActiveChat(chat.id)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors relative"
                      >
                        <Avatar>
                          <AvatarFallback>{chat.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm truncate">{chat.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">12:30 PM</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                          
                          {/* Thread preview chip */}
                          {chat.threads.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-medium">
                                <Package className="h-3 w-3" />
                                {chat.threads.length} active order{chat.threads.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        {chat.unread > 0 && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {chat.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="notifications" className="flex-1 mt-4 data-[state=inactive]:hidden">
                <ScrollArea className="h-[calc(100vh-140px)]">
                  <div className="flex flex-col gap-1 px-2 pb-4">
                    {mockNotifications.map(notification => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                          <span className="text-xs text-muted-foreground mt-1.5 block">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
