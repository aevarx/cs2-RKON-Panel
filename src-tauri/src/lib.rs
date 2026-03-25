use rcon::Connection;
use std::sync::Mutex;
use tauri::{Manager, State};
use serde::{Serialize, Deserialize};
use std::thread;

struct AppState {
    match_config: Mutex<Option<String>>,
}

#[derive(Serialize, Deserialize)]
pub struct RconResponse {
    success: bool,
    data: String,
}

#[derive(Serialize, Deserialize)]
pub struct A2sResponse {
    name: String,
    map: String,
    players: u8,
    max_players: u8,
    bots: u8,
    ping: u64,
}

#[tauri::command]
async fn rcon_command(
    host: String,
    port: u16,
    password: String,
    command: String,
) -> Result<RconResponse, String> {
    let address = format!("{}:{}", host, port);
    let mut conn = Connection::connect(address, &password).await
        .map_err(|e| format!("{}", e))?;
    
    match conn.cmd(&command).await {
        Ok(response) => Ok(RconResponse {
            success: true,
            data: response,
        }),
        Err(e) => Ok(RconResponse {
            success: false,
            data: format!("{}", e),
        }),
    }
}

#[tauri::command]
async fn a2s_query(host: String, port: u16) -> Result<A2sResponse, String> {
    let address = format!("{}:{}", host, port);
    let client = a2s::A2SClient::new().map_err(|e| e.to_string())?;
    
    let start = std::time::Instant::now();
    let info = client.info(&address).map_err(|e| e.to_string())?;
    let ping = start.elapsed().as_millis() as u64;

    Ok(A2sResponse {
        name: info.name,
        map: info.map,
        players: info.players,
        max_players: info.max_players,
        bots: info.bots,
        ping,
    })
}

#[tauri::command]
fn set_match_config(config: String, state: State<AppState>) -> Result<(), String> {
    let mut match_config = state.match_config.lock().unwrap();
    *match_config = Some(config);
    Ok(())
}

#[tauri::command]
fn get_local_ip() -> String {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .manage(AppState {
            match_config: Mutex::new(None),
        })
        .setup(|app| {
            let handle = app.handle().clone();
            thread::spawn(move || {
                let server = tiny_http::Server::http("0.0.0.0:3031").unwrap();
                for request in server.incoming_requests() {
                    let state: State<AppState> = handle.state();
                    let response = if request.url().starts_with("/api/matches/config/") {
                        let config = state.match_config.lock().unwrap();
                        let body = config.as_deref().unwrap_or("{\"error\": \"No config loaded\"}");
                        tiny_http::Response::from_string(body)
                            .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap())
                            .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap())
                    } else {
                        tiny_http::Response::from_string("Not Found").with_status_code(404)
                    };
                    let _ = request.respond(response);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            rcon_command,
            a2s_query,
            set_match_config,
            get_local_ip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
