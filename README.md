# MarketMate

**Privacy-first marketplace listing generator using Chrome Built-in AI**

MarketMate is a Chrome Extension + Progressive Web App that transforms product photos and voice notes into polished marketplace listings (titles, descriptions, keywords, price suggestions), thumbnail captions, and video scripts — all generated client-side using Chrome Built-in AI models (Gemini Nano) with zero data leaving your device.

## 🌟 Features

- **Privacy-First**: All AI processing happens locally. Images, audio, and text never leave your device
- **Offline Capable**: Works completely offline using Chrome Built-in AI models
- **Multimodal AI**: Analyzes images and voice notes together to extract product details
- **Tone Variants**: Generate listings in 3 tones (Friendly, Premium, Bargain)
- **Multilingual**: Support for English and Urdu (with easy extensibility)
- **Video Scripts**: Auto-generate 15-30 second video scripts from voice notes
- **SEO Optimized**: Includes keyword suggestions and SEO-friendly titles
- **Price Suggestions**: Local price estimation based on category and condition
- **Export Options**: Copy to clipboard, export JSON, or open Facebook Marketplace

## 🛠️ Chrome Built-in AI APIs Used

This project uses the following Chrome Built-in AI APIs (via a shim layer until official APIs are available):

1. **Prompt API** (`chrome.ai.prompt`) - Multimodal analysis of images and audio
2. **Writer API** (`chrome.ai.writer`) - Content generation (titles, descriptions, video scripts)
3. **Rewriter API** (`chrome.ai.rewriter`) - Tone and style variants
4. **Proofreader API** (`chrome.ai.proofreader`) - Grammar and spelling correction
5. **Summarizer API** (`chrome.ai.summarizer`) - Voice note summarization
6. **Translator API** (`chrome.ai.translator`) - Multi-language support

### API Shim Implementation

The project includes a well-documented shim layer in `pwa/src/lib/chromeBuiltInAi.ts` that:

- Provides mock implementations for development
- Clearly marks where to swap in official Chrome Built-in AI calls
- Includes detailed comments on expected API signatures
- Allows the app to work immediately while waiting for official APIs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MarketMate App                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Chrome     │  │     PWA      │  │   Shared     │  │
│  │  Extension   │  │   (React)    │  │    Logic     │  │
│  │   (MV3)      │  │  (Vite + TS) │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                              │
│                   ┌────────▼────────┐                    │
│                   │  Chrome Built-in│                    │
│                   │   AI APIs       │                    │
│                   │  (Gemini Nano)  │                    │
│                   └────────┬────────┘                    │
│                            │                              │
│                     ┌───────▼────────┐                   │
│                     │   IndexedDB    │                   │
│                     │   (Local)      │                   │
│                     └────────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Core Components

- **Chrome Extension** (`/extension`): MV3 manifest, popup interface, background worker
- **PWA** (`/pwa`): React + TypeScript + Vite application with Tailwind CSS
- **AI Layer** (`pwa/src/lib/chromeBuiltInAi.ts`): Shim for Chrome Built-in AI APIs
- **Storage** (`pwa/src/lib/indexeddb.ts`): IndexedDB wrapper for local data persistence
- **Prompt Builders** (`pwa/src/utils/promptBuilders.ts`): Templates for AI prompts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Chrome/Edge browser
- For PWA: A local web server

### Installation

See [INSTALL.md](./INSTALL.md) for detailed installation instructions.

**Quick Setup:**

```bash
# Clone the repository
git clone <repository-url>
cd marketmate

# Install dependencies
cd pwa
npm install

# Start development server
npm run dev
```

### Loading Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` directory
5. The MarketMate icon should appear in your toolbar

## 📖 Usage

1. **Upload Images**: Drag and drop or select product images (up to 5)
2. **Add Voice Note** (Optional): Record a 10-20 second voice note describing your product
3. **Generate**: Click "Generate Listing" to create your listing
4. **Customize**: Switch between tone variants (Friendly, Premium, Bargain)
5. **Translate**: Toggle between English and Urdu
6. **Export**: Copy to clipboard, download JSON, or open Facebook Marketplace

## 🧪 Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions.

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📹 Demo Video

See [DEMO_SHOTLIST.md](./DEMO_SHOTLIST.md) for a detailed 3-minute demo script with exact timestamps.

## 🔒 Privacy & Security

- **Zero Data Transmission**: All processing happens client-side. No images, audio, or text is uploaded to servers
- **Local Storage**: All data is stored locally in IndexedDB
- **Offline First**: Works completely offline using Chrome's built-in AI models
- **Privacy Badge**: Visible UI indicator confirms local processing

## 🛣️ Roadmap & Future Enhancements

- [ ] Integration with official Chrome Built-in AI APIs when available
- [ ] Additional language support (Spanish, French, etc.)
- [ ] Opt-in cloud price comparison (with explicit user consent)
- [ ] Integration with more marketplaces (eBay, Mercari, etc.)
- [ ] Batch processing for multiple listings
- [ ] Custom prompt templates

## 🤝 Contributing

This is a hackathon project. Contributions and feedback are welcome!

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Chrome Built-in AI Hackathon
- Uses Chrome Built-in AI (Gemini Nano) for client-side processing
- UI built with React, TypeScript, Tailwind CSS, and Vite

## 📞 Support

For issues, questions, or feedback, please:

1. Check [TESTING.md](./TESTING.md) for known issues
2. Review [FEEDBACK.md](./FEEDBACK.md) for development notes
3. Open an issue in the repository

---

**Built with ❤️ for privacy-first marketplace sellers**
