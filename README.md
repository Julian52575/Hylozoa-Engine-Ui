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
# Hylozoa Engine (UI)


-----
### Common submodule
The `common/` folder is a [github submodule](https://gist.github.com/gitaarik/8735255) to [this repo](https://github.com/Julian52575/Hylozoa-Engine-Common).  
Use `just update-common` to setup the submodule after clone the repo.  
It contains helpful scripts to both the [Engine](https://github.com/Julian52575/Hylozoa-Engine-Engine) and the UI.  

> [!TIP]
> Submodules acts like a cloned repository. You can `pull` `checkout` and `push` inside them!

> [!WARNING]
> Submodules needs to be pushed as well.  
> Be sure the submodule you are pushing is pointing to the correct tag.  
> Run `git status` to verify the state of the submodule.
-----
### Before pushing
Be careful of this before committing to this repository:

-----
#### Branches, [Issues](https://github.com/Julian52575/Hylozoa-Engine-Ui/issues) and [Pull Requests](https://github.com/Julian52575/Hylozoa-Engine-Ui/pulls)
- Make sure you are committing to a separate branch before merging.
  - Branches should follows this naming pattern: `{your name}-{issue-name}`
  - Note: An exception is made for `README.md` updates to `dev` and other **small hotfixes** that does not update the code base.
- Create a Pull Request after the first commit to allow comments
  - Note: Do not target `main` directly. We want to update `dev` until it is ready for a release to `main`.
- Resolve all the comments left of your Pull Request before merging.
- **Be sure the test workflows complete succesfully before merging.**
- You are free to keep the branch or delete it.

-----
#### Testing policy

The previously mentionned [common submodule](#Common-submodule) contain helper scripts to use [clang-tidy](https://clang.llvm.org/extra/clang-tidy/) and [clang-format](https://clang.llvm.org/docs/ClangFormat.html).  
These workflows are running on every push linked to a pull request.  

> [!TIP]
> These scripts can be called with `just tidy`, `just format` and `just format-check`.  
> Or `just cicd` to replicate the workflow tests.
