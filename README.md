![CipherBin Banner](https://i.postimg.cc/qM0DCL2G/image.png)

# What is CipherBin?

**CipherBin** is a next‑generation secure pastebin that stands out from traditional paste services like NoPaste or Topaz Paste by offering robust features such as private posts, time‑based expiration, and an offline‑enabled experience—all without a central database. With CipherBin, you create pastes online and then your data is cached locally in your browser for offline access. In short: you write it, you take it.

Visit our website at [cipher.ix.tc](https://cipher.ix.tc) to get started!

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Implementation](#architecture--implementation)
  - [Decentralized Storage with Gun.js](#decentralized-storage-with-gunjs)
  - [The Paste Class](#the-paste-class)
  - [Encryption & Integrity](#encryption--integrity)
- [Usage](#usage)
  - [Web Interface](#web-interface)
- [Installation](#installation)
- [Contributing](#contributing)
- [License & Attribution](#license--attribution)
- [Contact & Permissions](#contact--permissions)

## Overview

CipherBin is an open‑source pastebin service designed to give you full control over your data. While you must be online to create a new paste or initially load an existing paste, once loaded the data is cached locally—allowing you to access your paste offline in the future. Our system uses Gun.js to store and synchronize paste data in a decentralized manner. This means that no central server holds your data; what you write, you take.

## Key Features

- **Online Creation, Offline Access:**  
  You need an internet connection to create or load a paste. Once loaded, the paste is cached in your browser and remains accessible offline.

- **Decentralized Storage:**  
  Using Gun.js, pastes are stored in a decentralized, peer-to-peer manner. When you create a paste, it’s assigned a unique UUID, and your data is synchronized with the Gun network.

- **Short, Shareable URLs:**  
  Every paste is given a short URL (e.g., `https://cipher.ix.tc/<UUID>`) that points to the paste data stored in Gun.js. This keeps the URL concise while the full paste is stored separately.

- **Private & Public Posts:**  
  Choose to create public pastes (with simple Base64 encoding) or private pastes (with AES‑256‑CBC encryption and HMAC‑SHA256 integrity). Only you (and those with the password) can view private pastes.

- **Time‑Based Expiration:**  
  Optionally set an expiration date to automatically invalidate sensitive pastes after a certain time.

- **No Centralized Storage:**  
  CipherBin never stores your paste on a central server. Your data is stored and synchronized via Gun.js, ensuring true user control.

- **Modern, Secure UI:**  
  A minimalistic, offline‑enabled web interface built with Next.js offers a seamless experience for both creation and viewing of pastes.

> **Milestone**
> Store up to 19 million words at zero cost using state‑of‑the‑art cryptography and a fully decentralized database with permanent access. This is a huge milestone—remember, no one, not even the FBI, can see your pastes because we don’t rely on a central server!

## Architecture & Implementation

### Decentralized Storage with Gun.js

CipherBin leverages Gun.js for decentralized data synchronization. When you create a paste:
- A unique UUID is generated.
- The full paste data (content, metadata, signature, etc.) is stored in Gun.js under that UUID.
- Once you are online, Gun.js synchronizes the data with other peers (or relay servers), making it available globally.
- When a user visits a URL like `https://cipher.ix.tc/<UUID>`, the app retrieves the paste data from Gun.js. If it was previously loaded, it’s cached locally for offline access.

### The Paste Class

The `Paste` class encapsulates the logic for creating a paste:
- **Metadata Handling:** Automatically captures the creation date and allows for an expiration date.
- **Content Processing:**  
  - Public pastes: Content is Base64‑encoded.  
  - Private pastes: Content is encrypted with AES‑256‑CBC (using a password) and then Base64‑encoded.
- **Integrity:** An HMAC‑SHA256 signature is computed over the paste data (using `"public-secret"` for public pastes or a password-derived key for private pastes).
- **Final Encoding:** The complete paste object is then Base64‑encoded, and the unique UUID is used to store it in Gun.js.

### Encryption & Integrity

CipherBin employs industry‑standard cryptographic techniques:
- **AES‑256‑CBC** for reversible encryption (private pastes).
- **HMAC‑SHA256** to verify the integrity of the paste data.
- **Base64 Encoding** to produce URL‑friendly output.

## Usage

### Web Interface

Visit [cipher.ix.tc](https://cipher.ix.tc) to create and view pastes. The workflow is as follows:
- **Creating a Paste:**  
  - You must be online to create a paste.  
  - After creation, a unique short URL (e.g., `https://cipher.ix.tc/<UUID>`) is generated, and the paste is stored in Gun.js.
- **Viewing a Paste:**  
  - When you open a paste URL, your browser fetches the paste data from Gun.js.  
  - Once loaded, the paste is cached locally, allowing offline access later.

### Command-Line Interface

> **Note:**  
> We have dropped support for native CLI scripts (e.g., `paste.bat`, `paste.sh`) in favor of our Gun.js–based approach. All paste creation and retrieval now occur via the web interface with Gun.js synchronization. In the event that law enforcement takes action against the bin or the Gun instance (`https://relay-server-db7s.onrender.com/gun`), your long encoded string will still be stored in your browser's local storage, indexed by a unique short UUID. Keep that long encoded string if you want your paste to persist indefinitely—even if the bin is banned or seized. You can use the `Paste.js` script in the public directory to decode your paste from your terminal untill we are Back!

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Lettable/CipherBin.git
   ```
2. **Install Dependencies:**
   ```bash
   cd CipherBin
   npm install
   ```
3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
4. **Deploy:**  
   Follow the Next.js deployment guidelines for your hosting platform.

## Contributing

We welcome contributions to improve CipherBin! If you want to add features, fix bugs, or enhance the documentation:
1. Fork the repository.
2. Create a new branch for your changes (`git checkout -b feature/your-feature`).
3. Commit your changes with clear commit messages.
4. Open a pull request describing your modifications.

Please ensure your contributions adhere to our coding standards and that tests and documentation are updated accordingly.

## License & Attribution

This project is licensed under the MIT License.  
If you use any of this code in your own projects, please **ask for permission first** and provide appropriate credit. Attribution to the original authors (and to CipherBin and [cipher.ix.tc](https://cipher.ix.tc)) is required for any derivative works or redistributed versions of the code.

## Contact & Permissions

For questions, permission requests, or issue reports, please contact the project maintainers. We are committed to fostering a collaborative open‑source community—just remember to ask for permission and provide proper credits when using our work.

---

Let's build a world‑class pastebin that redefines secure, offline‑enabled sharing of code and text. With CipherBin, once you load a paste while online, it remains accessible offline forever, giving you true control over your data.

Happy pasting!
