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
    const db = await getDb();
    return await db.execute(
      'INSERT INTO servers (name, host, port, rcon_password, country_code) VALUES ($1, $2, $3, $4, $5)',
      [server.name, server.host, server.port, server.rcon_password, server.country_code]
    );
  },

  updateServer: async (id: number, server: Partial<ServerProfile>) => {
    const db = await getDb();
    return await db.execute(
      'UPDATE servers SET name = $1, host = $2, port = $3, rcon_password = $4, country_code = $5 WHERE id = $6',
      [server.name, server.host, server.port, server.rcon_password, server.country_code, id]
    );
  },

  deleteServer: async (id: number) => {
    const db = await getDb();
    return await db.execute('DELETE FROM servers WHERE id = $1', [id]);
  },

  getCommands: async (): Promise<any[]> => {
    const db = await getDb();
    return await db.select<any[]>('SELECT * FROM custom_commands ORDER BY created_at DESC');
  },

  addCommand: async (label: string, command: string) => {
    const db = await getDb();
    return await db.execute('INSERT INTO custom_commands (label, command) VALUES ($1, $2)', [label, command]);
  },

  updateCommand: async (id: number, label: string, command: string) => {
    const db = await getDb();
    return await db.execute('UPDATE custom_commands SET label = $1, command = $2 WHERE id = $3', [label, command, id]);
  },

  deleteCommand: async (id: number) => {
    const db = await getDb();
    return await db.execute('DELETE FROM custom_commands WHERE id = $1', [id]);
  }
};
