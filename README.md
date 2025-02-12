![https://i.postimg.cc/qM0DCL2G/image.png](https://i.postimg.cc/qM0DCL2G/image.png)

# What is CipherBin?

**CipherBin** is a next‑generation secure pastebin that stands out from traditional paste services like NoPaste or Topaz Paste by offering robust features such as private posts, expiration dates, and a fully offline‑enabled experience—all without a central database. Whether you use the website at [cipher.ix.tc](https://cipher.ix.tc) or the command‑line interface (CLI), CipherBin gives you full control over your pastes with built‑in cryptographic integrity.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Implementation](#architecture--implementation)
  - [The Paste Class](#the-paste-class)
  - [Encryption & Integrity](#encryption--integrity)
- [Usage](#usage)
  - [Web Interface](#web-interface)
  - [Command‑Line Interface (CLI)](#command-line-interface-cli)
- [Installation](#installation)
- [Contributing](#contributing)
- [License & Attribution](#license--attribution)
- [Contact & Permissions](#contact--permissions)

## Overview

CipherBin is an open‑source project that allows you to share code and text securely. By embedding all data into the URL using reversible cryptographic operations, CipherBin eliminates the need for a centralized database—making your pastes entirely client‑side, offline‑accessible, and private if desired. The project includes:

- A modern, offline‑enabled website (available at [cipher.ix.tc](https://cipher.ix.tc))
- A powerful Paste class that handles encryption, signature generation, and data encoding
- A cross‑platform command‑line tool to quickly create paste URLs

## Key Features

- **Self‑Contained Pastes:**  
  Every paste is encoded into the URL itself (as a Base64‑encoded JSON blob) so that your data lives only in the link you share.

- **Private and Public Posts:**  
  Users can choose to create public pastes (which simply encode the content) or private pastes (which are encrypted using AES‑256‑CBC and authenticated with HMAC‑SHA256).

- **Expiration Support:**  
  Optionally, pastes can have an expiration date, ensuring that sensitive information does not persist indefinitely.

- **Offline-Enabled:**  
  With service worker support, CipherBin’s website works offline. All necessary assets and application logic are cached on the client, ensuring continuous access even without an Internet connection.

- **Command‑Line Interface:**  
  A native CLI is provided so that developers can generate paste URLs directly from the terminal. The CLI supports a variety of options (content, public/private flag, password, expiration date, host URL) for fast and flexible paste creation.

## Architecture & Implementation

### The Paste Class

At the heart of CipherBin is the `Paste` class (found in our source code). It encapsulates the logic for creating a paste by:

- **Recording Metadata:**  
  Automatically capturing the creation date and allowing an expiration date.

- **Content Handling:**  
  - **Public Pastes:** The content is Base64‑encoded.
  - **Private Pastes:** The content is encrypted with AES‑256‑CBC using a password and then Base64‑encoded.

- **Signature Generation:**  
  An HMAC‑SHA256 signature is computed over the JSON object (excluding the signature field) to guarantee data integrity. Public pastes use a fixed key ("public-secret"), while private pastes derive a key from the provided password.

- **Final Encoding:**  
  The paste object (with its signature appended) is then Base64‑encoded to produce a self‑contained string that is appended as a fragment (`/`) to the host URL.

### Encryption & Integrity

CipherBin leverages modern cryptographic techniques:
- **AES‑256‑CBC** for reversible encryption (for private pastes).
- **HMAC‑SHA256** to generate a signature that verifies the paste’s integrity.
- **Base64 Encoding** to produce URL‑friendly output.

These ensure that your pastes remain secure (when private), tamper‑evident, and fully self‑contained.

## Usage

### Web Interface

Visit [cipher.ix.tc](https://cipher.ix.tc) to use the web interface. The site offers:
- A minimalistic paste editor.
- Options to mark your paste as private and set an expiration.
- Offline access via service workers so you can even use CipherBin when your connection is down.

### Command‑Line Interface (CLI)

CipherBin also includes a command‑line tool to quickly create paste URLs. you can run:

#### Example (Windows):

```bat
paste.bat -c "Hello World" -p false -s "YourPassword" -h "https://cipher.ix.tc"
```

These commands will output a URL such as:

```
https://cipher.ix.tc/<EncodedMetaData>
```

The CLI accepts these options:
- `-c`: Content (required). If the content contains line breaks, use `\n` to indicate new lines.
- `-p`: Public flag (`true` or `false`). Default is `true`.  
  *Note:* If set to `false`, a password is required.
- `-s`: Password (required if `-p false` is used).
- `-e`: Expiration date (optional; defaults to `9999-12-31T23:59:59Z`).
- `-h`: Host URL (optional; defaults to `https://cipher.ix.tc/`).

> **Usage Example:**
>
> ```bash
> # Public paste:
> paste.bat -c "Hello World" -p true
>
> # Private paste:
> paste.bat -c "Hello World" -p false -s "YourPassword" -e "2025-02-12T11:22:33Z"
> ```

Clone the repository and follow the platform‑specific instructions below:

- **For Web Development:**  
  Set up the website using Next.js. Follow the documentation in the repository for installation and deployment instructions.

- **For CLI Usage:**  
  - **Windows:** Use the provided native script `paste.bat` to generate paste URLs.
  - **Linux/macOS:** Use the provided native script `paste.sh` (or, alternatively, run the CLI tool located at `/public/cipher.js` using Node.js).

> **Note:**  
> Node.js is required for both CLI versions. The project uses Node’s built‑in `crypto` module (which comes with Node.js, so no additional installation is needed).  
>  
> No external dependencies are required for the CLI scripts beyond standard Unix tools (on Linux/macOS) or PowerShell (on Windows).


## Contributing

We welcome contributions to improve CipherBin! If you want to add features, fix bugs, or enhance the documentation:
1. Fork the repository.
2. Create a new branch for your changes.
3. Submit a pull request with clear descriptions of your modifications.

Please ensure that your code adheres to our coding standards and that you update tests and documentation as necessary.

## License & Attribution

This project is licensed under the MIT License.  
If you use any of this code in your own projects, please **ask for permission first** and give appropriate credit. Attribution to the original authors (and to CipherBin and [cipher.ix.tc](https://cipher.ix.tc)) is required in any derivative works or redistributed versions of the code.

## Contact & Permissions

For questions, permission requests, or to report issues, please contact the project maintainers. We are committed to fostering a collaborative and open‑source community—just remember to ask for permission and provide proper credits when using our work.

---

Let’s build a world‑class pastebin that redefines secure, offline‑enabled sharing of code and text. Welcome to CipherBin—where your data lives solely in the link you share!

Happy pasting!
