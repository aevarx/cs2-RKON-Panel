import { invoke } from '@tauri-apps/api/core';

export interface ServerStatus {
  name: string;
  map: string;
  players: {
    online: number;
    max: number;
    bots: number;
  };
  ping: number;
  tags: string[];
}

export async function fetchServerInfo(host: string, port: number): Promise<ServerStatus> {
  try {
    const info: any = await invoke('a2s_query', { host, port });
    
    return {
      name: info.name,
      map: info.map,
      players: {
        online: info.players,
        max: info.max_players,
        bots: info.bots,
      },
      ping: info.ping,
      tags: [], // Tags not implemented in the basic Rust a2s query yet
    };
  } catch (error: any) {
    console.error('A2S_INFO Error:', error);
    throw error;
  }
}

export async function fetchServerPlayers(host: string, port: number): Promise<any[]> {
  // fetchServerPlayers can be handled via RCON for better accuracy in CS2
  // or we can implement a specific Rust command if needed.
  // For now, let's keep it minimal or use RCON if possible.
  return []; 
}

export async function fetchRconPlayers(host: string, port: number, rconPassword?: string): Promise<any[]> {
  if (!rconPassword) return [];
  try {
    const result: any = await invoke('rcon_command', { host, port, password: rconPassword, command: 'status' });
    if (!result.success) throw new Error(result.data);
    
    // Parse CS2 status output (simple version for now, or use the one from electron/main.js logic)
    const players: any[] = [];
    const lines = result.data.split('\n');
    const playerRegex = /#\s+\d+\s+\d+\s+"(.+)"\s+(\[U:\d+:\d+\])\s+[\d\.:]+\s+[\d:]+\s+(\d+)/;
    
    for (const line of lines) {
      const match = line.match(playerRegex);
      if (match) {
        players.push({
          name: match[1],
          steamId: match[2],
          ping: parseInt(match[3], 10)
        });
      }
    }
    return players;
  } catch (error) {
    console.error('RCON_PLAYERS Error:', error);
    return [];
  }
}
