
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { useSidebar } from "@/hooks/useSidebar";
import { Toaster } from "../ui/toaster";
import { useState, useEffect } from "react";
import { ChatModal } from "../social/ChatModal";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

const AppLayout = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState({ id: "", name: "", avatar: "" });
  
  // Function to open chat from anywhere in the app
  const openChat = (userId: string, userName: string, userAvatar?: string) => {
    setChatRecipient({
      id: userId,
      name: userName,
      avatar: userAvatar || ""
    });
    setIsChatOpen(true);
  };

  // Listen for custom event to open chat
  useEffect(() => {
    const handleOpenChatEvent = (event: CustomEvent) => {
      const { userId, userName, userAvatar } = event.detail;
      openChat(userId, userName, userAvatar);
    };

    window.addEventListener("open-chat" as any, handleOpenChatEvent as EventListener);

    return () => {
      window.removeEventListener("open-chat" as any, handleOpenChatEvent as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden w-full">
      <div className="flex flex-1 overflow-hidden relative h-full w-full">
        <AppSidebar openChat={openChat} />
        
        <main className="flex-1 flex flex-col overflow-auto transition-all duration-300 w-full h-full">
          {/* Sidebar toggle button visible on all devices */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-5 left-8 z-40"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="p-4 md:p-6 flex-1 overflow-auto pt-14 md:pt-16 w-full h-full">
            <Outlet context={{ openChat }} />
          </div>
        </main>
      </div>
      
      <Toaster />
      
      <ChatModal
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        recipientId={chatRecipient.id}
        recipientName={chatRecipient.name}
        recipientAvatar={chatRecipient.avatar}
      />
    </div>
  );
};

export default AppLayout;
