"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { ServerDashboard } from '@/components/server/dashboard';
import { RCONConsole } from '@/components/server/console';
import { ServerChat } from '@/components/server/chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Terminal, MessageSquare, Settings, Map as MapIcon, Trophy } from 'lucide-react';
import { MatchGenerator } from '@/components/server/match-generator';
import { GeneralSettings } from '@/components/settings/general-settings';
import { db_helper, ServerProfile } from '@/lib/db';
import { fetchServerInfo, ServerStatus, fetchServerPlayers, fetchRconPlayers } from '@/lib/a2s';
import { sendRconCommand } from '@/lib/rcon';
import { ServerModal } from '@/components/server/server-modal';
import { MapSelector } from '@/components/server/map-selector';
import { ServerSettings } from '@/components/server/server-settings';

const INITIAL_INFO = {
  name: "Loading...",
  map: "---",
  players: { online: 0, max: 0, bots: 0 },
  ping: 0,
  status: 'loading' as const,
};

export default function Home() {
  const [servers, setServers] = useState<ServerProfile[]>([]);
  const [activeServerId, setActiveServerId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [serverInfo, setServerInfo] = useState<any>(INITIAL_INFO);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerProfile | null>(null);

  const loadServers = async () => {
    try {
      const data = await db_helper.getServers();
      setServers(data);
      if (data.length > 0 && !activeServerId) {
        setActiveServerId(data[0].id || null);
      }
    } catch (error) {
      console.error("Failed to load servers:", error);
    }
  };

  // Poll server info
  React.useEffect(() => {
    if (!activeServerId) return;
    
    const server = servers.find(s => s.id === activeServerId);
    if (!server) return;

    const updateInfo = async () => {
      try {
        const info = await fetchServerInfo(server.host, server.port);
        setServerInfo({
          ...info,
          status: 'online'
        });
      } catch (error) {
        setServerInfo({
          ...INITIAL_INFO,
          name: server.name,
          status: 'offline'
        });
      }
    };

    updateInfo();
    const interval = setInterval(updateInfo, 5000);
    return () => clearInterval(interval);
  }, [activeServerId, servers]);


  const handleRconCommand = async (command: string) => {
    const server = servers.find(s => s.id === activeServerId);
    if (!server) throw new Error("No server selected");
    return await sendRconCommand(server.host, server.port, server.rcon_password, command);
  };

  // Fetch servers from DB on mount
  React.useEffect(() => {
    loadServers();
  }, []);

  const handleSaveServer = async (server: ServerProfile) => {
    try {
      if (server.id) {
        await db_helper.updateServer(server.id, server);
      } else {
        await db_helper.addServer(server);
      }
      await loadServers();
      setEditingServer(null);
    } catch (error) {
      console.error("Failed to save server:", error);
    }
  };

  const handleDeleteServer = async (id: number) => {
    if (confirm("Are you sure you want to delete this server?")) {
      try {
        await db_helper.deleteServer(id);
        await loadServers();
        if (activeServerId === id) {
          setActiveServerId(null);
        }
      } catch (error) {
        console.error("Failed to delete server:", error);
      }
    }
  };

  const selectedServer = servers.find(s => s.id === activeServerId);

  const handleStartMatch = async (config: string) => {
    if (!selectedServer) return;
    try {
      await sendRconCommand(
        selectedServer.host, 
        selectedServer.port, 
        selectedServer.rcon_password, 
        `matchzy_loadmatch_json ${config}`
      );
    } catch (error) {
      console.error('Failed to start match:', error);
      throw error;
    }
  };

  const handleStopMatch = async () => {
    if (!selectedServer) return;
    try {
      await sendRconCommand(
        selectedServer.host, 
        selectedServer.port, 
        selectedServer.rcon_password, 
        'get5_endmatch'
      );
    } catch (error) {
      console.error('Failed to stop match:', error);
      throw error;
    }
  };

  const handleLaunchMatch = async (config: string, url: string) => {
    if (!selectedServer) return;
    try {
      await sendRconCommand(
        selectedServer.host, 
        selectedServer.port, 
        selectedServer.rcon_password, 
        `matchzy_loadmatch_url "${url}"`
      );
    } catch (error) {
      console.error('Failed to launch match via URL:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-white">
      {/* Sidebar */}
      <Sidebar 
        servers={servers} 
        activeServerId={activeServerId} 
        onSelectServer={(id) => { setActiveServerId(id); setActiveTab('dashboard'); }}
        onAddServer={() => { setEditingServer(null); setIsModalOpen(true); }}
        onEditServer={(server) => { setEditingServer(server); setIsModalOpen(true); }}
        onDeleteServer={handleDeleteServer}
        onOpenGeneralSettings={() => { setActiveTab('general-settings'); }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'general-settings' ? (
          <GeneralSettings />
        ) : activeServerId ? (
          <>
            {/* Server Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#09090b]">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Selected: <span className="text-white">{selectedServer?.name}</span>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-white/5 border border-border">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <LayoutDashboard size={14} className="mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="console" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Terminal size={14} className="mr-2" />
                    Console
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <MessageSquare size={14} className="mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="maps" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <MapIcon size={14} className="mr-2" />
                    Maps
                  </TabsTrigger>
                  <TabsTrigger value="match" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Trophy size={14} className="mr-2" />
                    Match
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Settings size={14} className="mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === "dashboard" && (
                <ServerDashboard 
                  serverInfo={serverInfo} 
                  onSendCommand={handleRconCommand}
                />
              )}
              {activeTab === "console" && (
                <div className="h-full p-6">
                  <RCONConsole onSendCommand={handleRconCommand} />
                </div>
              )}
              {activeTab === "chat" && (
                <ServerChat onBroadcast={(msg) => handleRconCommand(`say ${msg}`)} />
              )}
              {activeTab === "maps" && (
                <MapSelector 
                  currentMap={serverInfo.map} 
                  onChangeMap={(map) => handleRconCommand(`map ${map}`)} 
                />
              )}
              {activeTab === "settings" && selectedServer && (
                <ServerSettings 
                  server={selectedServer} 
                  onUpdate={handleSaveServer} 
                />
              )}
              {activeTab === "match" && (
                <MatchGenerator 
                  onStartMatch={handleStartMatch} 
                  onLaunchMatch={handleLaunchMatch}
                  onStopMatch={handleStopMatch} 
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
            Select a server from the sidebar to start managing.
          </div>
        )}
      </main>

      <ServerModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSave={handleSaveServer}
        server={editingServer}
      />
    </div>
  );
}
