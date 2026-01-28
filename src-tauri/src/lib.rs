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
    let path_buf: PathBuf = PathBuf::from(&path);
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err(format!("The path '{}' is not a valid directory.", path));
    }

    fn read_dir(path: &PathBuf) -> FileEntry {
        let mut children = Vec::new();
        if path.is_dir(){
            for entry in fs::read_dir(path).unwrap() {
                let entry = entry.unwrap();
                let entry_path = entry.path();
                let is_dir = entry_path.is_dir();
                let name = entry.file_name().into_string().unwrap_or_default();
                let child = if is_dir {
                    Some(read_dir(&entry_path))
                } else {
                    None
                };
                children.push(FileEntry {
                    name,
                    path: entry_path.to_string_lossy().to_string(),
                    is_dir,
                    children: child.map(|c| vec![c]).or(None),
                });
            }
        }
        FileEntry {
            name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            is_dir: true,
            children: Some(children),
        }
    }

    Ok(read_dir(&path_buf))
}


#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_dir_recursively])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
