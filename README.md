# Hylozoa UI
Tauri-based desktop editor built with **React**, **TypeScript** and **Vite**.

This application is the **editor UI** for the Hylozoa game engine.  
The engine itself is a native binary and is **not part of this repository**.

---

## Tech Stack

- **Tauri** (Rust backend)
- **React**
- **TypeScript**
- **Vite**

---

## Prerequisites

### General
- **Node.js** ≥ 18
- **npm** ≥ 9
- **Rust** (stable)


### Tauri Requirements
- **Cargo** (comes with Rust)
- **Rust toolchain** with the following components:
  - `cargo`
  - `rustc`
  - `cargo-tauri`
  - `tauri-cli`
- **Platform-specific dependencies**: see the [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites) for details.


### How to start
1. Clone the repository:
   ```bash
   git clone
    ```
2. Navigate to the project directory:
   ```bash
   cd hylozoa-ui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run tauri dev
   ```