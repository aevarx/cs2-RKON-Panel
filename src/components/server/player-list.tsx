"use client";

import React from 'react';
import { User, Shield, Ban, UserMinus, Signal, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  steamId: string;
  ping: number;
  score: number;
  deaths: number;
  team: 'CT' | 'T' | 'SPEC';
}

interface PlayerListProps {
  players: Player[];
  onKick: (id: string) => void;
  onBan: (id: string) => void;
}

export function PlayerList({ players, onKick, onBan }: PlayerListProps) {
  return (
    <div className="bg-[#09090b] border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold">Player</th>
              <th className="px-6 py-4 font-semibold text-center">Team</th>
              <th className="px-6 py-4 font-semibold text-center">Ping</th>
              <th className="px-6 py-4 font-semibold text-center">Score</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                  No players currently online.
                </td>
              </tr>
            )}
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3 border border-border",
                      player.team === 'CT' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                      player.team === 'T' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                      "bg-white/5 text-muted-foreground"
                    )}>
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white truncate max-w-[150px]">{player.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{player.steamId || 'No SteamID'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                    player.team === 'CT' ? "bg-blue-500/10 text-blue-500" : 
                    player.team === 'T' ? "bg-orange-500/10 text-orange-500" : 
                    "bg-white/10 text-muted-foreground"
                  )}>
                    {player.team || 'SPEC'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center text-xs space-x-1.5">
                    <Signal size={12} className={cn(
                      player.ping < 50 ? "text-emerald-500" : player.ping < 100 ? "text-yellow-500" : "text-red-500"
                    )} />
                    <span className="text-muted-foreground font-mono">{player.ping === -1 ? '?' : player.ping}ms</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono text-muted-foreground">
                  {player.score || 0} / {player.deaths || 0}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-[10px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => onKick(player.id)}
                    >
                      KICK
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-[10px] text-muted-foreground hover:text-red-600 hover:bg-red-600/10"
                      onClick={() => onBan(player.id)}
                    >
                      BAN
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
