use std::fs;
use std::path::PathBuf;
use tauri::command;

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


#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, read_dir_recursively])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
