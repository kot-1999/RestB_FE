# RestB Frontend

A simple website built with Pug templates that compiles to HTML.

## How It Works

- **Build**: Node.js converts Pug files to HTML
- **Run**: Browser shows the HTML files
- **Backend**: Separate - talks through APIs

## Files

```
RestB_FE/
├── src/
│   ├── views/           # Pug templates
│   │   ├── layouts/     # Base layouts
│   │   │   └── base.pug
│   │   ├── pages/       # Page templates
│   │   │   ├── index.pug
│   │   │   └── login.pug
│   │   └── partials/    # Reusable parts
│   │       ├── header.pug
│   │       └── footer.pug
│   └── assets/          # CSS and JavaScript
│       ├── css/
│       │   └── style.css
│       └── js/
│           ├── main.js
│           └── login.js
├── dist/                # Built website (deploy this)
│   ├── index.html       # Homepage
│   ├── pages/           # Built pages
│   │   ├── index.html
│   │   └── login.html
│   ├── css/             # Built styles
│   │   └── style.css
│   └── js/              # Built scripts
│       ├── main.js
│       └── login.js
├── package.json         # Project settings
├── package-lock.json    # Dependency lock
├── instructions.txt     # Setup guide
└── README.md           # This file
```

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Run Development Server
```bash
npm run devmon
```
This builds your site and starts it at `http://localhost:3000`

### 3. Make Changes
- Edit files in `src/`
- Changes auto-rebuild and refresh

## Commands

```bash
npm run build        # Build the website
npm run dev          # Build and serve
npm run devmon       # Build, serve, and watch changes
npm run clean        # Delete build folder
```

## How to Add a New Page

1. Copy `src/views/pages/index.pug` to `src/views/pages/yourpage.pug`
2. Edit the new file
3. Run `npm run build`
4. Visit `http://localhost:3000/pages/yourpage.html`

## Deploy

Upload the `dist/` folder to any web host.

That's it!
