// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


fn main() {
    tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
