import Database from '@tauri-apps/plugin-sql';

export interface ServerProfile {
  id?: number;
  name: string;
  host: string;
  port: number;
  rcon_password: string;
  country_code?: string;
  created_at?: string;
}

let _db: Database | null = null;

async function getDb() {
  if (!_db) {
    _db = await Database.load('sqlite:servers.db');
    // Initialize schema
    await _db.execute(`
      CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        rcon_password TEXT NOT NULL,
        country_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await _db.execute(`
      CREATE TABLE IF NOT EXISTS custom_commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        command TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return _db;
}

export const db_helper = {
  getServers: async (): Promise<ServerProfile[]> => {
    const db = await getDb();
    return await db.select<ServerProfile[]>('SELECT * FROM servers ORDER BY created_at DESC');
  },

  addServer: async (server: ServerProfile) => {
    try {
      const db = await getDb();
      console.log("Adding server:", server);
      return await db.execute(
        'INSERT INTO servers (name, host, port, rcon_password, country_code) VALUES (?, ?, ?, ?, ?)',
        [server.name, server.host, server.port, server.rcon_password, server.country_code]
      );
    } catch (e) {
      console.error("Failed to add server:", e);
      throw e;
    }
  },

  updateServer: async (id: number, server: Partial<ServerProfile>) => {
    try {
      const db = await getDb();
      return await db.execute(
        'UPDATE servers SET name = ?, host = ?, port = ?, rcon_password = ?, country_code = ? WHERE id = ?',
        [server.name, server.host, server.port, server.rcon_password, server.country_code, id]
      );
    } catch (e) {
      console.error("Failed to update server:", e);
      throw e;
    }
  },

  deleteServer: async (id: number) => {
    try {
      const db = await getDb();
      return await db.execute('DELETE FROM servers WHERE id = ?', [id]);
    } catch (e) {
      console.error("Failed to delete server:", e);
      throw e;
    }
  },

  getCommands: async (): Promise<any[]> => {
    try {
      const db = await getDb();
      return await db.select<any[]>('SELECT * FROM custom_commands ORDER BY created_at DESC');
    } catch (e) {
      console.error("Failed to get commands:", e);
      return [];
    }
  },

  addCommand: async (label: string, command: string) => {
    try {
      const db = await getDb();
      return await db.execute('INSERT INTO custom_commands (label, command) VALUES (?, ?)', [label, command]);
    } catch (e) {
      console.error("Failed to add command:", e);
      throw e;
    }
  },

  updateCommand: async (id: number, label: string, command: string) => {
    try {
      const db = await getDb();
      return await db.execute('UPDATE custom_commands SET label = ?, command = ? WHERE id = ?', [label, command, id]);
    } catch (e) {
      console.error("Failed to update command:", e);
      throw e;
    }
  },

  deleteCommand: async (id: number) => {
    try {
      const db = await getDb();
      return await db.execute('DELETE FROM custom_commands WHERE id = ?', [id]);
    } catch (e) {
      console.error("Failed to delete command:", e);
      throw e;
    }
  }
};
