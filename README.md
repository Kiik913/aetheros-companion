# 🌌 Aura Lab — Open Source Operating Systems & Creative Computing Ecosystem

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)
![Status](https://img.shields.io/badge/status-active%20development-orange.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)
![Architecture](https://img.shields.io/badge/arch-x86__64%20%7C%20ARM64%20%7C%20RISC--V-green.svg)

**A dual-project ecosystem: AuraOS (native) + AetherOS (web-based)**

[YouTube](https://www.youtube.com/@CareLabStudio) · [GitHub](https://github.com/Kiik913) · [Discord](https://discord.com/channels/1505857480503197696/1505857672597999736) · [Instagram](https://www.instagram.com/kavyanthub)

</div>

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b37b8dcc-6197-45bc-afec-9c6115e70dce" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2d814680-f1e0-4249-9bc1-80a866d534e6" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/13b8cf32-5536-44c4-9f69-c9d56154704c" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4d993844-d16b-433f-a7d5-0427c65ef147" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/db1c73af-917c-4e1c-912f-459a6ca9908e" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2ee5c60a-9cfd-4a7f-b523-1d89b86921c8" />


## 📋 Table of Contents

### Part I — Ecosystem Overview
1. [Vision & Mission](#vision--mission)
2. [The Aura Lab Ecosystem](#the-aura-lab-ecosystem)
3. [Project Comparison](#project-comparison)

### Part II — AuraOS (Native Operating System)
4. [AuraOS Introduction](#auraos-introduction)
5. [AuraOS Features](#auraos-features)
6. [Device Support Matrix](#device-support-matrix)
7. [AuraOS Architecture](#auraos-architecture)
8. [AuraOS Userland & Apps](#auraos-userland--apps)
9. [Building AuraOS](#building-auraos)
10. [Running AuraOS](#running-auraos)

### Part III — AetherOS (Web Desktop OS)
11. [AetherOS Introduction](#aetheros-introduction)
12. [AetherOS Features](#aetheros-features)
13. [Iframe Bypass Engine](#iframe-bypass-engine)
14. [Installing AetherOS](#installing-aetheros)
15. [AetherOS Tech Stack](#aetheros-tech-stack)

### Part IV — Shared Resources
16. [Official Links](#official-links)
17. [UN SDG Alignment](#un-sdg-alignment)
18. [Contributing](#contributing)
19. [Roadmap](#roadmap)
20. [License & Acknowledgments](#license--acknowledgments)

---

# Part I — Ecosystem Overview

## 🎯 Vision & Mission

**Aura Lab** is a community-driven open-source initiative that bridges two worlds:

| Track | Project | What It Is |
|-------|---------|------------|
| **Native** | **AuraOS** | A real, bootable Unix-like operating system written in C and Assembly |
| **Web** | **AetherOS** | A full desktop environment running inside Chrome as an extension |

Both projects share the same philosophy: **make computing accessible, educational, and fun** — whether you're learning OS internals on a Raspberry Pi or installing a virtual desktop in your browser.

### Core Principles

1. **Learn by building** — Every layer is documented and hackable
2. **Run on anything** — Low-spec PCs, old laptops, virtual machines, or your browser
3. **Creative + technical** — OS development meets UI experiments and web demos
4. **Local-first & private** — No mandatory cloud dependencies
5. **Community-owned** — MIT licensed, contribution-friendly, beginner-welcoming

---

## 🌐 The Aura Lab Ecosystem

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         AURA LAB ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐     │
│   │   AuraOS     │    │  AetherOS    │    │   Aura Lab       │     │
│   │  (Native)    │    │   (Web)      │    │   Creative       │     │
│   │              │    │              │    │   Demos          │     │
│   │  C + ASM     │    │  HTML/CSS/JS │    │   (CodePen)      │     │
│   │  x86_64      │    │  Chrome Ext  │    │                  │     │
│   └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘     │
│          │                   │                     │               │
│          └───────────────────┼─────────────────────┘               │
│                              │                                     │
│                    ┌─────────▼─────────┐                           │
│                    │   CareLabStudio   │                           │
│                    │  YouTube Channel  │                           │
│                    │  Tutorials/Demos  │                           │
│                    └─────────┬─────────┘                           │
│                              │                                     │
│                    ┌─────────▼─────────┐                           │
│                    │   Chaos Factory   │                           │
│                    │  Experimental     │                           │
│                    │  GitHub Sandbox   │                           │
│                    └───────────────────┘                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ Project Comparison

| Aspect | AuraOS (Native) | AetherOS (Web) |
|--------|-----------------|----------------|
| **Type** | Bootable operating system | Chrome extension desktop |
| **Language** | C, Assembly, (Rust planned) | HTML5, CSS3, Vanilla JS |
| **Target** | x86_64 PCs, VMs, SBCs | Any Chromium browser |
| **Kernel** | Monolithic | Browser sandbox |
| **File System** | RAM FS → FAT32/EXT2 | localStorage + chrome.storage |
| **App Model** | ELF binaries + libc | Web apps + iframes |
| **Boot Method** | GRUB/Multiboot2 | Extension popup |
| **Maturity** | Pre-alpha, early kernel | v7.1.0, feature-rich |
| **Best For** | Learning OS internals | Daily virtual workspace |

---

# Part II — AuraOS (Native Operating System)

## 🖥️ AuraOS Introduction

> **⚠️ Pre-release Notice:** AuraOS is a working name. This is an early-stage operating system for developers, students, hobbyists, and community testing. **Not ready for production or daily driving.**

**AuraOS** is a lightweight, Unix-like operating system designed for:

- 📚 **Learning** — OS development, drivers, memory management, syscalls
- 💻 **Low-resource computing** — Revive old hardware, reduce e-waste
- 🎨 **Creative experimentation** — Companion web demos and UI labs
- 🤝 **Community collaboration** — Open, modular, beginner-friendly codebase

Written primarily in **C** and **Assembly**, with userland utilities planned in **C** and **Rust**.

### What Makes AuraOS Different?

AuraOS is **not just a kernel** — it's an ecosystem:

| Layer | Description |
|-------|-------------|
| **Bootable OS** | Runs on x86_64 PCs and virtual machines |
| **Learning platform** | Readable code for OS internals, drivers, syscalls |
| **Creative lab** | Web demos, UI experiments, community projects |
| **Low-spec target** | Designed to extend hardware lifespan |

---

## ✨ AuraOS Features

### Kernel & Core

- ✅ **Monolithic kernel** — Preemptive multitasking, SMP support planned
- ✅ **Boot support** — BIOS and UEFI via GRUB/Multiboot2 on x86_64
- ✅ **Memory management** — Physical memory manager, paging, kernel heap
- 🛠 **Virtual memory** — Full paging and user/kernel separation (in progress)
- 🛠 **Scheduler** — Round-robin with priorities (planned)

### Drivers

| Driver | Status | Notes |
|--------|--------|-------|
| VGA text mode | ✅ | Early console output |
| Linear framebuffer | ✅ | Basic graphics |
| PS/2 keyboard | ✅ | Basic input |
| PS/2 mouse | ✅ | Basic pointer |
| Serial UART (16550) | ✅ | Debugging and headless testing |
| ATA PIO storage | ✅ | Basic disk read/write |
| USB HID | 🧪 | Experimental, stack incomplete |
| AHCI/SATA | 🧪 | Experimental |
| NVMe SSD | 🛠 | Planned |
| PC speaker | 🧪 | Beep only |
| Intel HDA audio | 🛠 | Planned |
| virtio-net | 🛠 | Planned |
| Intel e1000 | 🛠 | Planned |

### File System & Userland

- ✅ **Initial RAM filesystem** — In-memory file storage
- 🛠 **FAT32 / EXT2** — Planned
- ✅ **Custom shell (`osh`)** — In progress
- 🛠 **libc subset** — Core utilities planned
- 🛠 **Package manager** — Community packages planned

### Networking

- ✅ **Loopback** — Local networking only
- 🛠 **virtio-net** — Planned
- 🛠 **Intel e1000** — Planned
- ❌ **Wi-Fi** — Not yet supported

---

## 📱 Device Support Matrix

**Legend:** ✅ Supported · 🧪 Experimental · 🛠 Planned · ❌ Not supported

### Compute Platforms

| Device | Status | Notes |
|--------|--------|-------|
| x86_64 PC / laptop | ✅ | Primary target; BIOS + UEFI |
| QEMU x86_64 | ✅ | Recommended dev environment |
| VirtualBox / VMware | 🧪 | Basic boot; driver testing ongoing |
| Raspberry Pi 4 / 5 | 🛠 | ARM64 port planned |
| RISC-V QEMU virt | 🛠 | Planned |

### Input & Output

| Device | Status | Notes |
|--------|--------|-------|
| VGA text mode | ✅ | Early console |
| Linear framebuffer | ✅ | Basic graphics |
| UEFI GOP framebuffer | 🧪 | Firmware-dependent |
| PS/2 keyboard | ✅ | Basic input |
| PS/2 mouse | ✅ | Basic pointer |
| USB HID keyboard/mouse | 🧪 | USB stack incomplete |
| Serial console (16550) | ✅ | Debug + headless |
| Touchscreen | 🛠 | Planned |
| PC speaker | 🧪 | Beep only |
| Intel HDA audio | 🛠 | Planned |

### Storage

| Device | Status | Notes |
|--------|--------|-------|
| ATA PIO | ✅ | Basic read/write |
| AHCI / SATA | 🧪 | Experimental |
| NVMe SSD | 🛠 | Planned |
| USB mass storage | 🛠 | Planned |

### Networking

| Device | Status | Notes |
|--------|--------|-------|
| Loopback | ✅ | Local only |
| virtio-net | 🛠 | Planned |
| Intel e1000 | 🛠 | Planned |
| Wi-Fi | ❌ | Not supported |

> **⚠️ Hardware Warning:** Real-hardware testing is experimental. **Always back up your data** before booting AuraOS on physical hardware. Device support depends on build target and firmware.

---

## 🏗️ AuraOS Architecture

### Boot Flow

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         AURAOS BOOT FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   [1] Firmware (BIOS/UEFI)                                          │
│         │                                                           │
│         ▼                                                           │
│   [2] GRUB / Multiboot2 Bootloader                                  │
│         │                                                           │
│         ▼                                                           │
│   [3] Kernel Entry (Assembly)                                       │
│         │                                                           │
│         ▼                                                           │
│   [4] GDT, IDT, Paging, Kernel Heap                                 │
│         │                                                           │
│         ▼                                                           │
│   [5] Drivers: Display, Keyboard, Serial, Disk                      │
│         │                                                           │
│         ▼                                                           │
│   [6] Scheduler + System Call Interface                             │
│         │                                                           │
│         ▼                                                           │
│   [7] libc Subset                                                   │
│         │                                                           │
│         ▼                                                           │
│   [8] Userland: init → osh → apps                                   │
│         │                                                           │
│         ▼                                                           │
│   [9] Companion Aura Lab Web Demos (browser/runtime planned)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### System Call Interface

AuraOS provides a **POSIX-like syscall API** for:

| Category | Operations |
|----------|------------|
| **Process** | fork, exec, exit, wait |
| **Memory** | mmap, munmap, brk |
| **File I/O** | open, read, write, close, seek |
| **Directory** | opendir, readdir, mkdir, rmdir |
| **Device I/O** | ioctl, read, write |
| **IPC** | pipe, shared memory (planned) |
| **Time/Info** | gettimeofday, uname |

### Memory Layout

```text
┌─────────────────────────────────────────┐ 0xFFFFFFFF
│           Kernel Space                  │
│  (Higher-half, mapped in all processes) │
├─────────────────────────────────────────┤ 0x0000800000000000
│           User Space                    │
│  (Per-process address space)            │
├─────────────────────────────────────────┤ 0x0000000000400000
│           Reserved / Null Page          │
└─────────────────────────────────────────┘ 0x0000000000000000
```

---

## 📦 AuraOS Userland & Apps

### OS Userland Applications

| App | Status | Purpose |
|-----|--------|---------|
| `osh` shell | ✅ / in progress | Command-line shell |
| `init` | ✅ / in progress | First userland process |
| `ls`, `cat`, `echo`, `cp`, `mv`, `rm` | 🛠 | Core utilities |
| Text editor | 🛠 | Lightweight terminal editor |
| File manager | 🛠 | TUI file browser |
| Package manager | 🛠 | Community package installation |
| Settings / system info | 🛠 | Hardware and OS info |
| Terminal multiplexer | 🛠 | Multiple shell sessions |
| Web runtime / browser | 🛠 | Run companion web demos |

### Aura Lab Companion Apps (Web Demos)

| Demo | Link | Purpose |
|------|------|---------|
| Aura Lab: Cares & Laughs 1 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPGJPKj) | Creative web experience |
| Aura Lab: Cares & Laughs 2 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPOXwmY) | Creative web experience |
| Aura Lab: Cares & Laughs 3 | [CodePen Editor](https://codepen.io/editor/Kavyant-Kumar/pen/01a0756c-8113-764d-bfe9-462dbedbfe7c) | Creative web experience |
| Satisfying Cursor Effect | [CodePen](https://codepen.io/Kavyant-Kumar/pen/GgJMVJR) | UI/UX interaction demo |
| Chaos Factory | [GitHub](https://github.com/Kiik913/Welcome-to-Chaos-Factory) | Experimental sandbox |
| CareLabStudio videos | [YouTube](https://www.youtube.com/@CareLabStudio) | Tutorials and demos |

> **Note:** Companion demos currently run in a web browser. They are part of the Aura Lab ecosystem, not kernel modules. A future AuraOS browser could make them available inside the OS.

---

## 🔨 Building AuraOS

### Prerequisites

Use a **Linux or macOS host** (WSL2 supported on Windows).

| Tool | Purpose | Install (Ubuntu/Debian) |
|------|---------|-------------------------|
| `gcc` / `clang` | Compiler | `sudo apt install build-essential` |
| `nasm` | x86 assembler | `sudo apt install nasm` |
| `make` + `cmake` | Build system | Included in build-essential |
| `qemu-system-x86_64` | Emulator | `sudo apt install qemu-system-x86` |
| `xorriso` | ISO creation | `sudo apt install xorriso` |
| `mtools` | FAT tools | `sudo apt install mtools` |
| `grub-mkrescue` | Bootable ISO | `sudo apt install grub-pc-bin` |

### One-Line Setup (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install -y \
  build-essential nasm qemu-system-x86 \
  xorriso mtools grub-pc-bin
```

### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/Kiik913/OS_NAME.git
cd OS_NAME

# 2. Configure the build
make config

# 3. Compile kernel and userland
make all

# Output: build/AuraOS.iso
```

### Build Targets

| Target | Description |
|--------|-------------|
| `make config` | Configure build options |
| `make all` | Build kernel + userland + ISO |
| `make kernel` | Kernel only |
| `make userland` | Userland only |
| `make run` | Build and run in QEMU |
| `make test` | Run unit + integration tests |
| `make clean` | Clean build artifacts |

---

## 🚀 Running AuraOS

### QEMU (Recommended)

```bash
# Quick start
make run

# Manual with serial console
qemu-system-x86_64 -cdrom build/AuraOS.iso -m 512M -serial stdio

# With debugging
qemu-system-x86_64 -cdrom build/AuraOS.iso -m 512M \
  -serial stdio -s -S
```

### Real Hardware

> **⚠️ Data Loss Warning:** Running AuraOS on real hardware may cause data loss. **Back up your data first.**

1. Flash the ISO to a USB drive:
   ```bash
   # Linux/macOS
   sudo dd if=build/AuraOS.iso of=/dev/sdX bs=4M status=progress
   
   # Windows: Use Rufus (https://rufus.ie)
   ```
2. Boot from USB in BIOS/UEFI settings
3. Use serial console or VGA display for debugging

### VirtualBox / VMware

- Create a new VM (x86_64)
- Attach `build/AuraOS.iso` as CD/DVD
- Enable serial port for debugging (optional)
- **Status:** 🧪 Experimental — basic boot expected

---

## 🧪 Testing

```bash
# Run all tests
make test

# Unit tests only
make test-unit    # tests/unit

# Integration tests (QEMU)
make test-integration   # tests/integration
```

### Test Categories

| Type | Location | Description |
|------|----------|-------------|
| Unit | `tests/unit/` | Pure functions, data structures |
| Integration | `tests/integration/` | Boot tests, driver tests in QEMU |
| Hardware | `tests/hardware/` | Real-hardware smoke tests (manual) |

---

## 📁 AuraOS Project Structure

```text
/
├── boot/               # Bootloader config + early assembly
│   ├── multiboot2.asm
│   └── grub.cfg
├── kernel/             # Core kernel source
│   ├── arch/           # Architecture-specific (x86_64, ARM64, RISC-V)
│   │   └── x86_64/
│   │       ├── boot/
│   │       ├── gdt/
│   │       ├── idt/
│   │       └── paging/
│   ├── drivers/        # Device drivers
│   │   ├── disk/
│   │   ├── keyboard/
│   │   ├── display/
│   │   └── serial/
│   ├── fs/             # VFS + filesystem implementations
│   ├── mm/             # Memory management (paging, heap)
│   └── sys/            # System calls
├── libc/               # Standard C library subset
├── user/               # Userland programs + shell utilities
├── tools/              # Build scripts + image creation
├── docs/               # Documentation + design specs
└── tests/              # Unit + integration tests
```

---

# Part III — AetherOS (Web Desktop OS)

## 🌌 AetherOS Introduction

<div align="center">

![AetherOS Version](https://img.shields.io/badge/version-7.1.0-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)

</div>

**AetherOS** is a futuristic, fully-featured **desktop operating system** that runs entirely inside your **Chrome browser** as an extension. It combines:

- 🪟 Traditional OS features — window management, file system, app store
- 🌐 Web's limitless potential — embed any website as an app
- 🤖 AI integration — Aura AI assistant powered by Puter.js

**No servers. No downloads. Just open the extension and boot up your virtual workspace.**

### AetherOS vs. Traditional Web Apps

| Feature | Traditional Web App | AetherOS |
|---------|---------------------|----------|
| **Multi-window** | ❌ Single tab | ✅ Draggable, resizable windows |
| **File system** | ❌ No persistence | ✅ Virtual FS in localStorage |
| **App store** | ❌ N/A | ✅ Install built-in + custom apps |
| **Workspaces** | ❌ N/A | ✅ 4 virtual desktops |
| **AI assistant** | ❌ Separate service | ✅ Integrated Aura AI |
| **Website embedding** | ❌ Blocked by X-Frame-Options | ✅ Iframe bypass engine |

---

## ✨ AetherOS Features

### 🪟 Complete Window Manager

- Draggable, resizable windows
- macOS-style traffic lights (close, minimize, maximize)
- Window snapping (¼ screen, half screen)
- Minimize/maximize controls
- Z-index management and focus handling

### 📱 App Store & Custom Apps

| Built-in App | Description |
|--------------|-------------|
| Terminal | Command-line interface |
| Paint | Simple drawing tool |
| Kanban | Task board |
| Calculator | Standard calculator |
| Media Player | Audio/video playback |
| Notes | Text notes |
| File Manager | Browse VFS |
| Trash | Deleted files recovery |
| Storage Dashboard | localStorage usage |

**Custom Apps:** Add **any website** as a custom app. AetherOS embeds it in a window with iframe bypass.

### 🌐 Iframe Bypass Engine

Tired of `X-Frame-Options` blocking your web apps? AetherOS includes a **two-pronged bypass**:

1. **Network Level** (`rules.json`) — Chrome's `declarativeNetRequest` API strips `X-Frame-Options` and restrictive `CSP` headers
2. **Script Level** (`framebuster.js`) — Injects at `document_start` to neutralize `window.top`, `window.parent`, `window.frameElement`

**Result:** Embed sites that normally refuse to connect (like GitHub, YouTube, Reddit).

### 🤖 Aura AI Assistant

- Deeply integrated AI chatbot powered by **Puter.js**
- Right-click any text on any website to **"Ask Aura"**
- Built-in AI chat window
- AI history searchable via command palette

### 📂 Virtual File System (VFS)

- Create, edit, save text files, images, notes
- Stored in browser's `localStorage`
- Fully functional **Trash bin**
- **Storage dashboard** for usage tracking

### ⌨️ Command Palette & Quick Search

- Press `Ctrl+K` (or `Cmd+K`) to open
- Search apps, files, notes, AI history
- Type a web query to search the web

### 🖥️ Multiple Workspaces

- **4 virtual desktops**
- Separate gaming, work, dev apps
- Switch between workspaces

### 🎨 Deep Customization

| Setting | Options |
|---------|---------|
| Accent colors | Full color picker |
| Glass opacity | Slider |
| Live wallpapers | Multiple options |
| Icon glow | Toggle + intensity |
| Window control style | Windows vs. macOS |

---

## 🔓 Iframe Bypass Engine (Technical Details)

### The Problem

Embedding sites like GitHub, YouTube, Reddit is blocked by:

1. **Security headers:** `X-Frame-Options: DENY` / `SAMEORIGIN`
2. **CSP:** `Content-Security-Policy: frame-ancestors 'none'`
3. **JavaScript frame-busting:** Scripts detect `window.top !== window.self` and break out

### The Solution

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    IFRAME BYPASS ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   [Network Level]                                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  rules.json (declarativeNetRequest)                         │   │
│   │  ─ Intercept response headers                               │   │
│   │  ─ Remove X-Frame-Options                                   │   │
│   │  ─ Strip restrictive CSP frame-ancestors                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   [Script Level]                                                    │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  framebuster.js (injected at document_start)                │   │
│   │  ─ Neutralize window.top                                   │   │
│   │  ─ Neutralize window.parent                                │   │
│   │  ─ Neutralize window.frameElement                          │   │
│   │  ─ Prevent detection of iframe context                     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   [Result]                                                          │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Website embeds successfully in AetherOS window             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Known Limitations

| Limitation | Workaround |
|------------|------------|
| **Authentication (cookies)** | Cross-site cookies restricted — use **↗ New Tab** button to log in externally |
| **YouTube player** | Homepage loads, but videos may fail — use built-in **Aura YouTube** app |
| **Heavy security sites** | Banks and high-security portals still refuse — extension alerts after 8s to open in real tab |

---

## 🚀 Installing AetherOS

### Developer Mode (Unpacked Extension)

1. **Clone or download** this repository to your local machine
2. Open Google Chrome and go to `chrome://extensions/`
3. Turn on **Developer mode** (toggle in top right corner)
4. Click **Load unpacked** (top left)
5. Select the `AetherOS` folder (where `manifest.json` is located)
6. Click the **AetherOS icon** in your Chrome toolbar to boot up!

### Requirements

| Requirement | Details |
|-------------|---------|
| **Browser** | Chrome, Edge, Brave, or any Chromium-based browser |
| **Manifest** | V3 (required) |
| **Permissions** | `declarativeNetRequest`, `storage`, `activeTab` |

### First Boot

1. Click the AetherOS icon in your toolbar
2. The desktop loads with default wallpaper
3. Use **App Store** to install apps
4. Press `Ctrl+K` to open command palette
5. Right-click any text on any website to **"Ask Aura"**

---

## 🛠️ AetherOS Tech Stack

| Layer | Technology |
|-------|------------|
| **Core** | HTML5, Vanilla JavaScript (ES6+), CSS3 |
| **Theming** | CSS Variables (dynamic accent colors, glass opacity) |
| **Architecture** | Chrome Extension Manifest V3 |
| **Service Workers** | Background script for extension lifecycle |
| **Content Scripts** | `framebuster.js` for iframe bypass |
| **Network Rules** | `declarativeNetRequest` for header stripping |
| **AI Engine** | Puter.js (serverless AI integration) |
| **Storage** | `localStorage` (VFS, settings) + `chrome.storage.local` (extension state) |
| **Build** | No build step — pure vanilla JS |

### File Structure

```text
AetherOS/
├── manifest.json           # Extension manifest (V3)
├── background.js           # Service worker
├── rules.json              # declarativeNetRequest rules
├── content/
│   └── framebuster.js      # Iframe bypass script
├── desktop/
│   ├── index.html          # Desktop environment
│   ├── css/
│   │   ├── desktop.css
│   │   ├── windows.css
│   │   └── themes.css
│   └── js/
│       ├── desktop.js
│       ├── window-manager.js
│       ├── app-store.js
│       ├── vfs.js
│       ├── ai-assistant.js
│       └── command-palette.js
├── apps/
│   ├── terminal/
│   ├── paint/
│   ├── kanban/
│   ├── calculator/
│   ├── media-player/
│   └── notes/
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

# Part IV — Shared Resources

## 🔗 Official Links

### Community & Social

| Platform | Link |
|----------|------|
| **YouTube — CareLabStudio** | [https://www.youtube.com/@CareLabStudio](https://www.youtube.com/@CareLabStudio) |
| **Official GitHub** | [https://github.com/Kiik913](https://github.com/Kiik913) |
| **Chaos Factory GitHub** | [https://github.com/Kiik913/Welcome-to-Chaos-Factory](https://github.com/Kiik913/Welcome-to-Chaos-Factory) |
| **Official Instagram** | [https://www.instagram.com/kavyanthub](https://www.instagram.com/kavyanthub) |
| **Official Snapchat** | [https://www.snapchat.com/add/kavyanthub](https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN) |
| **Discord — Aura Lab Server** | [Join Server](https://discord.com/channels/1505857480503197696/1505857672597999736) |

### Creative Demos (CodePen)

| Demo | Link |
|------|------|
| Aura Lab: Cares & Laughs 1 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPGJPKj) |
| Aura Lab: Cares & Laughs 2 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPOXwmY) |
| Aura Lab: Cares & Laughs 3 | [CodePen Editor](https://codepen.io/editor/Kavyant-Kumar/pen/01a0756c-8113-764d-bfe9-462dbedbfe7c) |
| Satisfying Cursor Effect | [CodePen](https://codepen.io/Kavyant-Kumar/pen/GgJMVJR) |

---

## 🌍 UN SDG Alignment

Aura Lab maps its goals to the **17 United Nations Sustainable Development Goals**. This is an **aspirational alignment**, not an official UN program.

| SDG | Goal | How Aura Lab Relates |
|-----|------|----------------------|
| **SDG 1** | No Poverty | Free, open-source OS for low-cost devices |
| **SDG 2** | Zero Hunger | Indirect: low-resource education tools |
| **SDG 3** | Good Health & Well-being | Aura Lab "Cares & Laughs" creative breaks |
| **SDG 4** | Quality Education | OS tutorials, docs, hands-on learning |
| **SDG 5** | Gender Equality | Inclusive open community |
| **SDG 6** | Clean Water | Indirect: lower e-waste |
| **SDG 7** | Affordable Clean Energy | Lightweight OS reduces energy needs |
| **SDG 8** | Decent Work & Growth | Open-source skills, portfolio building |
| **SDG 9** | Industry & Innovation | OS research, driver development |
| **SDG 10** | Reduced Inequalities | Free computing education access |
| **SDG 11** | Sustainable Cities | Repairable computing, reduced e-waste |
| **SDG 12** | Responsible Consumption | Reviving old devices |
| **SDG 13** | Climate Action | Lower compute requirements |
| **SDG 14** | Life Below Water | Indirect: reduced e-waste pollution |
| **SDG 15** | Life on Land | Indirect: responsible electronics |
| **SDG 16** | Peace & Justice | Transparent governance, privacy tools |
| **SDG 17** | Partnerships | GitHub, Discord, YouTube, CodePen |

---

## 🤝 Contributing

We welcome contributions from the community! Please read `CONTRIBUTING.md` for full guidelines.

### Quick Start

```bash
# 1. Fork the repository
# 2. Create a branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'Add amazing feature'

# 4. Push the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

### Coding Standards

| Language | Standard |
|----------|----------|
| **C** | [Linux Kernel Coding Style](https://www.kernel.org/doc/html/latest/process/coding-style.html) |
| **Assembly** | NASM syntax, commented sections |
| **JavaScript** | ES6+, 2-space indent, semicolons |
| **HTML/CSS** | Semantic HTML, BEM-like CSS naming |
| **Markdown** | GitHub-flavored, tables for data |

### Contribution Areas

| Area | Skills Needed |
|------|---------------|
| **Kernel development** | C, Assembly, OS internals |
| **Driver development** | C, hardware datasheets |
| **Userland apps** | C, Rust, POSIX APIs |
| **AetherOS apps** | HTML, CSS, JavaScript |
| **Documentation** | Technical writing, Markdown |
| **Testing** | QEMU, unit testing, CI |
| **Design** | UI/UX, graphics, icons |
| **Community** | Discord moderation, tutorials |

### Pull Request Checklist

- [ ] Code follows project style
- [ ] Documentation updated (if applicable)
- [ ] Tests added (if applicable)
- [ ] All tests pass (`make test`)
- [ ] Commit messages are descriptive
- [ ] No merge conflicts

---

## 🗺️ Roadmap

### AuraOS (Native)

| Status | Milestone |
|--------|-----------|
| ✅ | Bootloader via GRUB/Multiboot2 |
| ✅ | Basic console output |
| ✅ | GDT and IDT setup |
| ✅ | Physical memory manager |
| ✅ | Serial debugging |
| ✅ | PS/2 keyboard input |
| 🔄 | Virtual memory manager and paging |
| ⏳ | User mode / Ring 3 |
| ⏳ | `osh` shell and core utilities |
| ⏳ | FAT32 and EXT2 filesystems |
| ⏳ | AHCI/SATA and NVMe storage |
| ⏳ | USB HID support |
| ⏳ | virtio-net and e1000 networking |
| ⏳ | Web runtime for Aura Lab demos |
| ⏳ | ARM64 Raspberry Pi 4/5 port |
| ⏳ | RISC-V QEMU port |
| ⏳ | Package manager |
| ⏳ | Graphical user interface |

### AetherOS (Web)

| Status | Milestone |
|--------|-----------|
| ✅ | Complete window manager |
| ✅ | App store + custom apps |
| ✅ | Iframe bypass engine |
| ✅ | Aura AI assistant |
| ✅ | Virtual file system |
| ✅ | Command palette |
| ✅ | Multiple workspaces |
| ✅ | Deep customization |
| ⏳ | **Web Clipper** — right-click images/links to save to desktop |
| ⏳ | **Aura Vision** — AI screen analysis (screenshot + ask Aura) |
| ⏳ | **Chrome Tab Integration** — manage real browser tabs from taskbar |
| ⏳ | **Global Clipboard** — sync copied text from any website |

---

## 📄 License

Both AuraOS and AetherOS are distributed under the **MIT License**.

```text
MIT License

Copyright (c) 2024 Aura Lab / CareLabStudio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See `LICENSE` for full text.

---

## 🙏 Acknowledgments

### Community & Partners

| Partner | Contribution |
|---------|--------------|
| **CareLabStudio** | YouTube tutorials, demos, community updates |
| **Aura Lab community** | Cares & Laughs demos, Discord support |
| **Chaos Factory** | Experimental community sandbox |
| **All contributors** | Code, docs, testing, bug reports |

### Technical Resources

| Resource | Use |
|----------|-----|
| **OSDev Wiki** | OS development reference |
| **The Linux Kernel** | Driver architecture, coding style inspiration |
| **Puter.js** | Serverless AI integration (AetherOS) |
| **Chrome Extension Docs** | Manifest V3, declarativeNetRequest |

### Individual Contributors

> **Want to be listed here?** Contribute code, docs, or testing — we'll add your name!

---

<div align="center">

## 🌟 Aura Lab: Cares & Laughs

**Building the future of accessible computing — one kernel panic at a time.**

[⬆ Back to Top](#-aura-lab--open-source-operating-systems--creative-computing-ecosystem)

---

**AuraOS** — *Learn the machine.*
**AetherOS** — *Own the browser.*

---

**Official GitHub:** [https://github.com/Kiik913](https://github.com/Kiik913)  
**Official Instagram:** [https://www.instagram.com/kavyanthub](https://www.instagram.com/kavyanthub)  
**Official Snapchat:** [https://www.snapchat.com/add/kavyanthub](https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN)

</div>
