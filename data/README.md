# Data Files

This folder contains all the static JSON data files for the 3DeT Victory Digital GM Screen.

## File Descriptions

- **personagens.json** - Player character data including stats, abilities, and equipment
- **sessao.json** - Current session data including encounters, objectives, and locations
- **tecnicas.json** - Techniques and special abilities available in the game
- **vantagens.json** - Character advantages and positive traits
- **npcs.json** - Non-player character data
- **pericias.json** - Skills and proficiencies
- **desvantagens.json** - Character disadvantages and negative traits
- **bestiario.json** - Monster and enemy data for encounters

## Usage

These files are used by:
- `script.js` - Main application logic
- `ipad.html` - Tablet-optimized interface
- `character-sheet.js` - Character sheet viewer
- Service Worker - For offline caching

## Data Structure

All files follow a consistent JSON structure designed for the 3DeT Victory RPG system. The application now runs entirely locally without any external dependencies.

## Local Development

To run the application locally:
1. Navigate to the project root
2. Run `python3 -m http.server 8000` or `npm run serve`
3. Open `http://localhost:8000` in your browser

The application will load all data from these JSON files and work completely offline. 