# ESTATEZW — Premium Real Estate Template

A single-file static website for an imaginary Zimbabwean luxury real-estate
brand. No build step, no framework — open `index.html` and you're running.

## What's inside

```
estatezw/
├── index.html              # markup + section structure
├── assets/
│   ├── css/styles.css      # design tokens, components, animations
│   ├── js/
│   │   ├── main.js         # nav, parallax, filter, ROI calc, gallery, form, PWA
│   │   └── data.js         # listings, testimonials, case studies (edit me!)
│   └── icons/              # favicon + PWA icons
├── manifest.webmanifest    # PWA manifest
├── service-worker.js       # offline caching
└── README.md
```

## Run it

**Quickest** — double-click `index.html`. (Service worker / PWA install
won't activate from `file://`, but the site works.)

**With a local server** (recommended for full PWA + caching):

```bash
# any one of these:
npx serve .
python3 -m http.server 8080
php -S localhost:8080
```

Then visit `http://localhost:8080`.

## Deploy

Drag the `estatezw/` folder into:

- **Netlify** — drop on https://app.netlify.com/drop
- **Vercel** — `vercel deploy` from inside the folder
- **Cloudflare Pages** — connect a repo containing this folder
- **GitHub Pages** — push to a repo, enable Pages on `main`

No build configuration required.

## Reuse this template for clients

Everything client-specific lives in two places.

### 1. Edit `assets/js/data.js`

Swap the listings, gallery images, case studies, and testimonials. Keep
the same shape; the page rebuilds automatically.

### 2. Edit `index.html`

- Brand name in the `<header class="nav">` block
- Hero copy, eyebrow, lede
- Section copy in `.brand-strip`, `.sec-head` blocks
- Map iframe `src` → search Google Maps for the client's address, click
  *Share → Embed a map*, copy the `src` URL
- Footer address & contact details

### 3. Tune the look in `assets/css/styles.css`

The top of the file is a `:root` token block:

```css
:root{
  --paper:#f7f5f1;     /* page background */
  --ink:#0e0e0e;       /* primary text & dark sections */
  --bronze:#9a6b3f;    /* accent — change for instant rebrand */
  --serif: "Fraunces", ...;
  --sans:  "Inter", ...;
}
```

Change `--bronze` and the entire site re-themes.

### 4. Update PWA identity

Edit `manifest.webmanifest` (`name`, `theme_color`, `background_color`)
and replace the icons in `assets/icons/` (192px and 512px PNGs).

### 5. Re-zip

```bash
zip -r my-client-site.zip estatezw/
```

## Wiring the booking form to a real inbox

The form currently logs submissions to the browser console and shows a
success state. To receive emails without a backend:

1. Sign up at https://formspree.io (free tier) and create a form.
2. Copy the form endpoint URL.
3. In `index.html`, change `<form id="booking" ...>` to:
   `<form id="booking" action="https://formspree.io/f/YOUR_ID" method="POST" novalidate>`
4. In `assets/js/main.js`, replace the `form.addEventListener("submit", …)`
   block with a `fetch(form.action, { method:"POST", body:new FormData(form), headers:{Accept:"application/json"} })`
   call, then show the success state on `.ok`.

EmailJS, Getform, and Basin work the same way.

## Features included

- Sticky glass navbar with scroll frost
- Hero with parallax and count-up stats
- 3D-tilt featured listings grid
- Live filter & discovery (city, type, beds, price)
- Three-tier service comparison
- Video tour + interactive floor-plan hotspots
- Animated masonry gallery with lightbox
- Case studies + interactive ROI calculator with SVG chart
- Auto-sliding, swipeable testimonials
- Google Maps embed with glass info card
- Three-step booking form with inline validation & success animation
- PWA: manifest, service worker, install banner, offline cache
- Respects `prefers-reduced-motion`
- Mobile-first with real touch interactions

## Licence

Template is yours to use and modify. Stock photography is sourced from
Unsplash under the Unsplash licence — free for commercial use, no
attribution required, but linking back is appreciated.
