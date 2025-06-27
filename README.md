# 3DeT Victory - Digital GM Screen

A comprehensive digital Game Master screen for the Brazilian RPG system "3DeT Victory". This is a Progressive Web App (PWA) that provides all the tools a GM needs to run their sessions.

## Features

- **Dice Roller** - Roll 1D, 2D, or 3D with visual feedback
- **Character Management** - View player characters, NPCs, and monsters
- **Rule Reference** - Quick access to skills, advantages, disadvantages, and techniques
- **Session Management** - Track encounters, objectives, and session data
- **Combat Tracker** - Visual HP/MP tracking for encounters
- **Campaign Tools** - Adventure modules and campaign management
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Offline Support** - Works without internet connection

## Quick Start

1. **Clone or download** this repository
2. **Navigate** to the project directory
3. **Start the server**:
   ```bash
   # Using Python (recommended)
   python3 -m http.server 8000
   
   # Or using npm
   npm run serve
   ```
4. **Open your browser** and go to `http://localhost:8000`

That's it! The application will load all data from local JSON files and work completely offline.

## Project Structure

```
3det/
├── data/                    # 📁 All game data (JSON files)
│   ├── personagens.json    # 👥 Player characters
│   ├── npcs.json          # 🎭 NPCs
│   ├── bestiario.json     # 🐉 Monsters
│   ├── pericias.json      # 📚 Skills
│   ├── vantagens.json     # ✅ Advantages
│   ├── desvantagens.json  # ❌ Disadvantages
│   ├── tecnicas.json      # ⚡ Techniques
│   └── sessao.json        # 📋 Session data
├── img/                    # 🖼️ Character images
├── icons/                  # 🎨 App icons
├── index.html             # 🏠 Main application
├── ipad.html              # 📱 Tablet interface
├── character_sheet.html   # 📄 Character sheet viewer
├── script.js              # ⚙️ Main application logic
├── style.css              # 🎨 Styling
├── sw.js                  # 🔄 Service worker (offline support)
└── manifest.json          # 📱 PWA manifest
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Font Awesome
- **Data**: Local JSON files
- **PWA**: Service Worker for offline functionality
- **Server**: Any static file server (Python, Node.js, etc.)

## Customization

### Adding New Characters
Edit `data/personagens.json` to add new player characters.

### Adding New NPCs
Edit `data/npcs.json` to add new NPCs.

### Adding New Monsters
Edit `data/bestiario.json` to add new monsters.

### Modifying Rules
Edit the respective JSON files in the `data/` folder:
- `pericias.json` - Skills
- `vantagens.json` - Advantages
- `desvantagens.json` - Disadvantages
- `tecnicas.json` - Techniques

### Session Data
Edit `data/sessao.json` to update current session information.

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source. See the LICENSE file for details.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application. 