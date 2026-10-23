
---

# AuraOS

**Version:** 0.1.0-alpha  
**Status:** Active Development / Pre-release  
**License:** MIT  
**Architectures:** x86_64 first; ARM64 and RISC-V planned  
**Community:** Aura Lab / CareLabStudio

> **Note:** AuraOS is a working name. This is a pre-release operating system intended for developers, students, hobbyists, and community testing. It is not yet ready for production or daily driving.

## Table of Contents

1. [Introduction](#introduction)
2. [Official Links](#official-links)
3. [Features](#features)
4. [Device Support](#device-support)
5. [Apps Included and Planned](#apps-included-and-planned)
6. [How It Works](#how-it-works)
7. [What Problem It Solves](#what-problem-it-solves)
8. [UN SDG Alignment](#un-sdg-alignment)
9. [Project Structure](#project-structure)
10. [Prerequisites](#prerequisites)
11. [Building the OS](#building-the-os)
12. [Running the OS](#running-the-os)
13. [Testing](#testing)
14. [Contributing](#contributing)
15. [Roadmap](#roadmap)
16. [License](#license)
17. [Acknowledgments](#acknowledgments)

---

## Introduction

**AuraOS** is a lightweight, Unix-like operating system designed for learning, low-resource computing, creative experimentation, and community-driven open-source development. It is written primarily in **C** and **Assembly**, with userland utilities planned in **C** and **Rust**.

The project is connected to the **Aura Lab: Cares & Laughs** community, the **CareLabStudio** YouTube channel, and the **Chaos Factory** experimental GitHub project. AuraOS aims to be a practical OS development lab: small enough to understand, structured enough to extend, and open enough for beginners and experienced developers to collaborate.

AuraOS is not just a kernel. It is an ecosystem:

- A bootable OS for x86_64 PCs and virtual machines.
- A learning platform for OS development, drivers, memory management, and system calls.
- A companion creative lab for web demos, UI experiments, and community projects.
- A low-spec computing target that can help revive older hardware and reduce e-waste.

---

## Official Links

| Platform | Link |
|---|---|
| YouTube — CareLabStudio | [https://www.youtube.com/@CareLabStudio](https://www.youtube.com/@CareLabStudio) |
| Official GitHub | [https://github.com/Kiik913](https://github.com/Kiik913) |
| Chaos Factory GitHub | [https://github.com/Kiik913/Welcome-to-Chaos-Factory](https://github.com/Kiik913/Welcome-to-Chaos-Factory) |
| Official Instagram | [https://www.instagram.com/kavyanthub](https://www.instagram.com/kavyanthub) |
| Official Snapchat | [https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN](https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN) |
| Aura Lab Server — Discord | [https://discord.com/channels/1505857480503197696/1505857672597999736](https://discord.com/channels/1505857480503197696/1505857672597999736) |
| Aura Lab: Cares & Laughs 1 | [https://codepen.io/Kavyant-Kumar/pen/dPGJPKj](https://codepen.io/Kavyant-Kumar/pen/dPGJPKj) |
| Aura Lab: Cares & Laughs 2 | [https://codepen.io/Kavyant-Kumar/pen/dPOXwmY](https://codepen.io/Kavyant-Kumar/pen/dPOXwmY) |
| Aura Lab: Cares & Laughs 3 | [https://codepen.io/editor/Kavyant-Kumar/pen/01a0756c-8113-764d-bfe9-462dbedbfe7c](https://codepen.io/editor/Kavyant-Kumar/pen/01a0756c-8113-764d-bfe9-462dbedbfe7c) |
| Satisfying Cursor Effect | [https://codepen.io/Kavyant-Kumar/pen/GgJMVJR](https://codepen.io/Kavyant-Kumar/pen/GgJMVJR) |

> The CodePen demos are **companion web experiences**. They are part of the Aura Lab creative ecosystem. Running them inside AuraOS would require a browser or web runtime, which is planned but not currently included.

---

## Features

- **Monolithic kernel:** preemptive multitasking, virtual memory, and SMP support planned.
- **Boot support:** BIOS and UEFI via GRUB/Multiboot2 on x86_64.
- **Memory management:** physical memory manager, paging, kernel heap.
- **Drivers:** VGA text mode, framebuffer, PS/2 keyboard and mouse, serial UART, ATA PIO storage.
- **File system:** initial RAM filesystem; FAT32 and EXT2 planned.
- **Userland:** custom shell (`osh`), libc subset, core utilities planned.
- **Networking:** loopback first; virtio-net and e1000 planned.
- **Community ecosystem:** Aura Lab demos, Chaos Factory experiments, CareLabStudio videos, Discord support.

---

## Device Support

**Status key:** ✅ supported · 🧪 experimental · 🛠 planned · ❌ not yet supported

| Device / Class | Support Status | Notes |
|---|---|---|
| x86_64 PC / laptop | ✅ | Primary target; BIOS and UEFI boot |
| QEMU x86_64 | ✅ | Recommended development environment |
| VirtualBox / VMware | 🧪 | Basic boot expected; driver testing ongoing |
| Serial console (16550 UART) | ✅ | Useful for debugging and headless testing |
| VGA text mode | ✅ | Early console output |
| Linear framebuffer | ✅ | Basic graphics output |
| UEFI GOP framebuffer | 🧪 | Firmware-dependent |
| PS/2 keyboard | ✅ | Basic input |
| PS/2 mouse | ✅ | Basic pointer input |
| USB HID keyboard / mouse | 🧪 | Experimental; USB stack incomplete |
| ATA PIO storage | ✅ | Basic disk read/write |
| AHCI / SATA | 🧪 | Experimental |
| NVMe SSD | 🛠 | Planned |
| USB mass storage | 🛠 | Planned |
| PC speaker | 🧪 | Beep support only |
| Intel HDA audio | 🛠 | Planned |
| Loopback network | ✅ | Local networking only |
| virtio-net | 🛠 | Planned |
| Intel e1000 network | 🛠 | Planned |
| Wi-Fi | ❌ | Not yet supported |
| Raspberry Pi 4 / 5 | 🛠 | ARM64 port planned |
| RISC-V QEMU virt | 🛠 | Planned |
| Touchscreen | 🛠 | Planned |
| Printers / scanners | ❌ | Not yet supported |

> Device support depends on the build target and firmware. Real-hardware testing is experimental. Always back up your data before booting AuraOS on physical hardware.

---

## Apps Included and Planned

AuraOS has two app categories: **OS userland apps** and **Aura Lab companion apps/demos**.

### OS Userland Apps

| App | Status | Purpose |
|---|---|---|
| `osh` shell | ✅ / in progress | Command-line shell for AuraOS |
| `init` | ✅ / in progress | First userland process |
| Core utilities (`ls`, `cat`, `echo`, `cp`, `mv`, `rm`) | 🛠 | Basic file and system utilities |
| Text editor | 🛠 | Lightweight terminal editor |
| File manager | 🛠 | TUI file browser |
| Package manager | 🛠 | Community package installation |
| Settings / system info | 🛠 | Hardware and OS information |
| Terminal multiplexer | 🛠 | Multiple shell sessions |
| Web runtime / browser | 🛠 | Needed to run companion web demos inside AuraOS |

### Aura Lab Companion Apps and Demos

| App / Demo | Link | Purpose |
|---|---|---|
| Aura Lab: Cares & Laughs 1 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPGJPKj) | Creative web experience |
| Aura Lab: Cares & Laughs 2 | [CodePen](https://codepen.io/Kavyant-Kumar/pen/dPOXwmY) | Creative web experience |
| Aura Lab: Cares & Laughs 3 | [CodePen Editor](https://codepen.io/editor/Kavyant-Kumar/pen/01a0756c-8113-764d-bfe9-462dbedbfe7c) | Creative web experience |
| Satisfying Cursor Effect | [CodePen](https://codepen.io/Kavyant-Kumar/pen/GgJMVJR) | UI/UX interaction demo |
| Chaos Factory | [GitHub](https://github.com/Kiik913/Welcome-to-Chaos-Factory) | Experimental community sandbox |
| CareLabStudio videos | [YouTube](https://www.youtube.com/@CareLabStudio) | Tutorials, demos, and updates |

> These companion demos currently run in a web browser. They are part of the Aura Lab ecosystem, not kernel modules. A future AuraOS browser or web runtime could make them available inside the OS.

---

## How It Works

AuraOS follows a traditional monolithic kernel design with a clear boot-to-userland path.

```text
Firmware / BIOS / UEFI
        ↓
GRUB / Multiboot2 bootloader
        ↓
Kernel entry (Assembly)
        ↓
GDT, IDT, paging, kernel heap
        ↓
Drivers: display, keyboard, serial, disk
        ↓
Scheduler + system call interface
        ↓
libc subset
        ↓
Userland: init → osh → apps
        ↓
Companion Aura Lab web demos (browser/runtime planned)
```

### Boot Flow

1. **Firmware** initializes hardware and loads the bootloader.
2. **GRUB/Multiboot2** loads the AuraOS kernel.
3. **Kernel entry** sets up the stack, GDT, IDT, and paging.
4. **Memory management** initializes physical and virtual memory.
5. **Drivers** initialize display, input, serial, and storage.
6. **Scheduler** starts the first userland process.
7. **`init`** starts the shell and system services.
8. **Userland apps** run through system calls and libc.

### System Calls

AuraOS provides a POSIX-like system call interface for:

- Process creation and exit
- Memory allocation
- File and directory operations
- Device input/output
- Inter-process communication
- Time and system information

### Userland

The userland includes a small libc, the `osh` shell, and core utilities. The goal is to make AuraOS usable from a terminal first, then add graphical tools and a web runtime.

---

## What Problem It Solves

AuraOS is designed to solve several practical and educational problems:

1. **OS development is hard to learn.**  
   AuraOS provides a readable, modular codebase with documentation, build scripts, and community support.

2. **Old hardware becomes e-waste.**  
   A lightweight OS can extend the life of low-spec PCs and laptops by reducing memory, storage, and CPU requirements.

3. **Creative and technical learning are often separated.**  
   Aura Lab connects OS development with creative web demos, UI experiments, and community projects.

4. **Open-source communities need safe sandboxes.**  
   Chaos Factory provides an experimental space for ideas, prototypes, and community contributions.

5. **Privacy and local-first computing matter.**  
   AuraOS is designed to run locally, with no mandatory cloud dependency.

6. **Students need real systems experience.**  
   Building and running an OS teaches memory management, drivers, scheduling, file systems, and system calls in a hands-on way.

> AuraOS does not claim to solve every problem. The SDG mapping below is aspirational and indicates where the project can contribute, not an official UN endorsement.

---

## UN SDG Alignment

AuraOS maps its community, education, low-spec computing, and open-source goals to the **17 United Nations Sustainable Development Goals**. This is an aspirational alignment, not an official UN program.

| SDG | Goal | How AuraOS Relates |
|---|---|---|
| **SDG 1** | No Poverty | Free, open-source OS for low-cost devices and digital access |
| **SDG 2** | Zero Hunger | Indirect: low-resource tools for education and community projects |
| **SDG 3** | Good Health and Well-being | Aura Lab “Cares & Laughs” creative breaks and community support |
| **SDG 4** | Quality Education | OS development tutorials, documentation, and hands-on learning |
| **SDG 5** | Gender Equality | Inclusive open community and accessible learning resources |
| **SDG 6** | Clean Water and Sanitation | Indirect: lower e-waste and responsible computing |
| **SDG 7** | Affordable and Clean Energy | Lightweight OS reduces hardware and energy requirements |
| **SDG 8** | Decent Work and Economic Growth | Open-source skills, portfolio building, and entrepreneurship |
| **SDG 9** | Industry, Innovation and Infrastructure | OS research, driver development, and open tooling |
| **SDG 10** | Reduced Inequalities | Free access to computing education and low-spec hardware support |
| **SDG 11** | Sustainable Cities and Communities | Repairable computing and reduced e-waste |
| **SDG 12** | Responsible Consumption and Production | Reviving old devices with a lightweight OS |
| **SDG 13** | Climate Action | Lower compute requirements can reduce energy demand |
| **SDG 14** | Life Below Water | Indirect: reduced e-waste pollution |
| **SDG 15** | Life on Land | Indirect: reduced e-waste and responsible electronics use |
| **SDG 16** | Peace, Justice and Strong Institutions | Transparent open-source governance and privacy-respecting tools |
| **SDG 17** | Partnerships for the Goals | GitHub, Discord, YouTube, CodePen, and community collaboration |

---

## Project Structure

```text
/
├── boot/           # Bootloader configuration and early assembly code
├── kernel/         # Core kernel source code
│   ├── arch/       # Architecture-specific code (x86_64, ARM64, RISC-V)
│   ├── drivers/    # Device drivers (disk, keyboard, display, serial)
│   ├── fs/         # Virtual file system and filesystem implementations
│   ├── mm/         # Memory management (paging, heap)
│   └── sys/        # System calls
├── libc/           # Standard C library subset for userland
├── user/           # Userland programs and shell utilities
├── tools/          # Build scripts and image creation tools
├── docs/           # Documentation and design specifications
└── tests/          # Unit and integration tests
```

---

## Prerequisites

To build AuraOS, use a Linux or macOS host machine. WSL2 is supported on Windows.

Required tools:

- **Compiler:** `gcc` or `clang`
- **Assembler:** `nasm` for x86
- **Build system:** `make` and `cmake`
- **Emulator:** `qemu-system-x86_64`
- **Utilities:** `xorriso`, `mtools`, `grub-mkrescue`

### Installation on Ubuntu/Debian

```bash
sudo apt update
sudo apt install build-essential nasm qemu-system-x86 xorriso mtools grub-pc-bin
```

---

## Building the OS

1. Clone the repository:

```bash
git clone https://github.com/Kiik913/OS_NAME.git
cd OS_NAME
```

2. Configure the build:

```bash
make config
```

3. Compile the kernel and userland:

```bash
make all
```

The resulting image will be located at:

```text
build/AuraOS.iso
```

---

## Running the OS

Run in QEMU:

```bash
make run
```

Or manually:

```bash
qemu-system-x86_64 -cdrom build/AuraOS.iso -m 512M -serial stdio
```

### Running on Real Hardware

> **Warning:** Running on real hardware may cause data loss. Back up your data first.

1. Flash the ISO to a USB drive using `dd` or Rufus.
2. Boot from the USB drive in BIOS/UEFI settings.
3. Use a serial console or VGA display for debugging.

---

## Testing

```bash
make test
```

- **Unit tests:** `tests/unit`
- **Integration tests:** `tests/integration` — run in QEMU

---

## Contributing

We welcome contributions from the community. Please read `CONTRIBUTING.md` for code of conduct and pull request guidelines.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

**Community links:**

- Discord — Aura Lab Server: [https://discord.com/channels/1505857480503197696/1505857672597999736](https://discord.com/channels/1505857480503197696/1505857672597999736)
- GitHub: [https://github.com/Kiik913](https://github.com/Kiik913)
- Chaos Factory: [https://github.com/Kiik913/Welcome-to-Chaos-Factory](https://github.com/Kiik913/Welcome-to-Chaos-Factory)

**Coding standards:**

- Follow Linux Kernel Coding Style for C code.
- Document new drivers, system calls, and userland tools.
- Include tests for new functionality where possible.

---

## Roadmap

- [x] Bootloader via GRUB/Multiboot2
- [x] Basic console output
- [x] GDT and IDT setup
- [x] Physical memory manager
- [x] Serial debugging
- [x] PS/2 keyboard input
- [ ] Virtual memory manager and paging
- [ ] User mode / Ring 3
- [ ] `osh` shell and core utilities
- [ ] FAT32 and EXT2 file systems
- [ ] AHCI/SATA and NVMe storage
- [ ] USB HID support
- [ ] virtio-net and e1000 networking
- [ ] Web runtime for Aura Lab demos
- [ ] ARM64 Raspberry Pi 4/5 port
- [ ] RISC-V QEMU port
- [ ] Package manager
- [ ] Graphical user interface

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Acknowledgments

- **CareLabStudio** — YouTube tutorials, demos, and community updates: [https://www.youtube.com/@CareLabStudio](https://www.youtube.com/@CareLabStudio)
- **Aura Lab community** — Cares & Laughs demos and Discord support.
- **Chaos Factory** — experimental community sandbox: [https://github.com/Kiik913/Welcome-to-Chaos-Factory](https://github.com/Kiik913/Welcome-to-Chaos-Factory)
- **OSDev Wiki** — operating system development resources.
- **The Linux Kernel** — inspiration for driver architecture and coding style.
- **All contributors** — everyone who has contributed code, documentation, testing, or bug reports.

---

**Aura Lab: Cares & Laughs.**  
**Official GitHub:** [https://github.com/Kiik913](https://github.com/Kiik913)  
**Official Instagram:** [https://www.instagram.com/kavyanthub](https://www.instagram.com/kavyanthub)  
**Official Snapchat:** [https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN](https://www.snapchat.com/add/kavyanthub?share_id=Yl0iFizz9Vc&locale=en-IN)
