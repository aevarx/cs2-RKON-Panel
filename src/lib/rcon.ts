import { invoke } from '@tauri-apps/api/core';

export async function sendRconCommand(host: string, port: number, password: string, command: string): Promise<string> {
  try {
    const result: { success: boolean, data: string } = await invoke('rcon_command', { host, port, password, command });
    
    if (!result.success) {
      throw new Error(result.data);
    }
    
    return result.data;
  } catch (error: any) {
    console.error('RCON_COMMAND Error:', error);
    throw error;
  }
}
