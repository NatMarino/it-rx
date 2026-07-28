# ITRX / IT Prescription — Marketing Site

Static landing page for IT Prescription (ITRX), implemented from the Figma design
[IT-RX](https://www.figma.com/design/B6hAjfu9F0JgTtjv4rFHdT/IT-RX?node-id=151-1366) (Frame 74 desktop, Frame 151 mobile).

## Stack

Plain HTML + CSS + vanilla JS. No build step.

- `index.html` — single page, all sections
- `css/style.css` — design tokens from the Figma file, desktop-first with a mobile breakpoint at 880px
- `js/main.js` — mobile nav, services carousel dots, mailto contact form
- `assets/` — logos/icons/waves exported from Figma (SVG), brand logos and photos (PNG/JPG/WebP)

Fonts: Racing Sans One, Silkscreen, IBM Plex Mono (Google Fonts).

## Run locally

Any static server, e.g.:

```sh
python3 -m http.server 8080
```

## Status / placeholders

- Contact form opens a `mailto:` draft (no backend yet)
- Login button is a placeholder
- Services carousel on mobile is CSS scroll-snap with dots
