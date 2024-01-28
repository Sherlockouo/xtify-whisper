use crate::APP;
use dirs::config_dir;
use log::{info, warn};
use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::AppHandle;
use tauri::{Manager, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

pub struct StoreWrapper(pub Mutex<Store<Wry>>);

// 日志插件
use tauri_plugin_log::{
  fern::colors::{Color, ColoredLevelConfig},
  LogTarget,
};

pub fn init_config(app: &mut tauri::App) {
  let config_path = config_dir().unwrap();
  let config_path = config_path.join(app.config().tauri.bundle.identifier.clone());
  let config_path = config_path.join("config.json");
  info!("Load config from: {:?}", config_path);
  let mut store = StoreBuilder::new(app.handle(), config_path).build();

  match store.load() {
    Ok(_) => info!("Config loaded"),
    Err(e) => {
      warn!("Config load error: {:?}", e);
      info!("Config not found, creating new config");
    }
  }
  app.manage(StoreWrapper(Mutex::new(store)));
}

pub fn get(key: &str) -> Option<Value> {
  let state = APP.get().unwrap().state::<StoreWrapper>();
  let store = state.0.lock().unwrap();
  match store.get(key) {
    Some(value) => Some(value.clone()),
    None => None,
  }
}

pub fn set<T: serde::ser::Serialize>(key: &str, value: T) {
  let state = APP.get().unwrap().state::<StoreWrapper>();
  let mut store = state.0.lock().unwrap();
  store.insert(key.to_string(), json!(value)).unwrap();
  store.save().unwrap();
}

pub fn is_first_run() -> bool {
  let state = APP.get().unwrap().state::<StoreWrapper>();
  let store = state.0.lock().unwrap();
  store.is_empty()
}

pub fn get_app_data_dir_path(handle: AppHandle) -> PathBuf {
  return handle.path_resolver().app_data_dir().unwrap();
}

pub fn get_settings_filepath(handle: AppHandle) -> String {
  let app_data_dir = get_app_data_dir_path(handle);

  return format!("{}/settings.dat", app_data_dir.display());
}

pub fn get_library_dir_path(handle: AppHandle) -> String {
  let config_dir = get_app_data_dir_path(handle);

  return format!("{}/library", config_dir.display());
}

pub fn init(handle: AppHandle) {
  let library_dir_path = get_library_dir_path(handle);
  if !Path::new(&library_dir_path).exists() {
    fs::create_dir_all(library_dir_path).unwrap();
  }
}

pub fn app_root() -> PathBuf {
  tauri::api::path::home_dir().unwrap().join(".devlink")
}
