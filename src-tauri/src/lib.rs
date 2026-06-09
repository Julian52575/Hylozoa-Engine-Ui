use std::fs;
use std::path::PathBuf;
use tauri::command;
use std::fs::File;
use std::io::Write;
use flate2::write::GzEncoder;
use flate2::Compression;

#[derive(Debug, serde::Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileEntry>>,
}

#[command]
fn read_dir_recursively(path: String) -> Result<FileEntry, String> {
    let path_buf: PathBuf = PathBuf::from(&path)
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize path '{}': {}", path, e))?;

    if !path_buf.is_dir() {
        return Err(format!("The path '{}' is not a valid directory.", path));
    }

    fn process_path(path: PathBuf) -> FileEntry {
        let name: String = path.file_name()
            .map(|n: &std::ffi::OsStr| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "".into());
            
        let is_dir: bool = path.is_dir();
        let mut children: Option<Vec<FileEntry>> = None;

        if is_dir {
            if let Ok(entries) = fs::read_dir(&path) {
                let mut child_vec: Vec<FileEntry> = Vec::new();
                for entry in entries.flatten() {
                    child_vec.push(process_path(entry.path()));
                }
                children = Some(child_vec);
            }
        }

        FileEntry {
            name,
            path: path.to_string_lossy().into_owned(),
            is_dir,
            children,
        }
    }

    Ok(process_path(path_buf))
}



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
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![save_compressed_project, read_dir_recursively])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
