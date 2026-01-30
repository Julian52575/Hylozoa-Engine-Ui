use std::fs::File;
use std::io::Write;
use flate2::write::GzEncoder;
use flate2::Compression;

#[tauri::command]
fn save_compressed_project(path: String, data: String) -> Result<(), String> {
    let file:File = File::create(path).map_err(|e| e.to_string())?;
    let mut encoder: GzEncoder<File> = GzEncoder::new(file, Compression::default());
    encoder.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    encoder.finish().map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_compressed_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
