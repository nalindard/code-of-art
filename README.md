# 🎨 Code of Art - ASCII Wallpaper Generator

A fun project that transforms beautiful Bing wallpapers into stunning ASCII art! This automated system fetches daily wallpapers from Bing (via Japan region) and converts them into colorful ASCII representations in multiple formats.

## ✨ What it does

- 🌅 Fetches the latest Bing wallpaper daily
- 🎭 Converts images to ASCII art with color preservation
- 📁 Organizes output by date in `data/YYYY/MM/` structure
- 🌈 Generates multiple formats: HTML, plain text, and ANSI terminal
- 🤖 Runs automatically via GitHub Actions every day at midnight UTC

## 🖼️ Output Formats

Each wallpaper generates three files:

- **`.html`** - Colorful ASCII art viewable in web browsers
- **`.txt`** - Plain text ASCII art without colors
- **`.ansi`** - Terminal-friendly ASCII with ANSI color codes

## 🚀 How to View the Art

### Web Browser (HTML)
```bash
# Serve the HTML file locally
npx serve data/2025/09/
# Then open: http://localhost:3000/filename.html
```

### Terminal (ANSI colors)
```bash
# View colorful ASCII in terminal
cat data/2025/09/filename.ansi
```

### Plain Text
```bash
# View plain ASCII art
cat data/2025/09/filename.txt
```

## 🛠️ Local Development

### Prerequisites
- [Bun](https://bun.sh/) runtime
- Node.js (for serving HTML files)

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd code-of-art

# Install dependencies
bun install

# Run manually
bun start
```

## 📂 Project Structure

```
code-of-art/
├── data/                    # Generated ASCII art files
│   └── YYYY/MM/            # Organized by year/month
│       ├── *.html          # Web-viewable ASCII art
│       ├── *.txt           # Plain text ASCII
│       └── *.ansi          # Terminal ASCII with colors
├── .github/workflows/      # GitHub Actions automation
├── index.ts               # Main ASCII generation logic
└── package.json          # Project configuration
```

## 🔧 Technical Details

- **Runtime**: Bun for fast TypeScript execution
- **Image Processing**: HTML5 Canvas API for pixel manipulation
- **ASCII Mapping**: Luminance-based character mapping with color preservation
- **Automation**: GitHub Actions with daily cron schedule
- **Data Source**: Peapix API (Bing wallpaper proxy)

## 📋 DISCLAIMER

### Data Sources & Usage

This project is created purely for **educational purposes, curiosity, and admiration** of the beautiful Bing wallpapers. It's a fun experiment in ASCII art generation and automated content creation.

### Important Notes:

- **Bing Wallpapers**: All wallpaper images are sourced from Microsoft Bing's daily wallpaper collection via the Peapix API
- **Copyright**: All original images remain the property of their respective copyright holders as indicated in the metadata
- **Fair Use**: This project transforms images into ASCII art for educational and artistic purposes
- **No Commercial Use**: This is a non-commercial, open-source project created for learning and fun

### API Usage:

- **Peapix API**: Special thanks to [Peapix](https://peapix.com/) for providing a clean API to access Bing wallpapers
- **Rate Limiting**: This project fetches only one image per day to be respectful of API resources
- **Attribution**: All original copyright information is preserved in the generated files

### Content Removal:

If you are a copyright holder and would like any content removed from this repository, please contact me and I will promptly remove the requested content. This project is meant to celebrate and appreciate beautiful imagery, not to infringe on anyone's rights.

### Peapix API Usage

Based on Peapix's public API documentation, this usage appears to be within acceptable limits:
- ✅ Non-commercial use
- ✅ Educational/personal project
- ✅ Reasonable request frequency (1 request/day)
- ✅ Proper attribution maintained

However, if you're planning to use this code for commercial purposes or high-frequency requests, please review Peapix's terms of service and consider reaching out to them directly.

## 🤝 Contributing

Feel free to fork this project and experiment with:
- Different ASCII character sets
- Alternative image processing techniques
- New output formats
- Enhanced color mapping algorithms

## 📄 License

This project is open source. Please respect the original copyright of the wallpaper images and use responsibly.

---

*Made with ❤️ for the love of ASCII art and beautiful wallpapers*