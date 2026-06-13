# StayGuide — Deploy Guide

How to publish a new property guide in under 10 minutes.

---

## Prerequisites

- A free [Netlify](https://netlify.com) account
- Access to the StayGuide GitHub repository (private, owned by Wise in Blue)
- The property's details (name, address, contacts, Wi-Fi, etc.)

---

## Step 1 — Prepare the config

1. Copy `config-template.json` and rename it `config.json`
2. Fill in all fields (see table below)
3. Keep `admin_pin` secret — share it only with the property owner

### Required fields

| Field | Example |
|-------|---------|
| `property.name` | `"Villa Rosa"` |
| `property.city` | `"Florence"` |
| `wifi.network` | `"VillaRosa_WiFi"` |
| `wifi.password` | `"villa2024!"` |
| `checkin.time` | `"15:00"` |
| `checkout.time` | `"11:00"` |
| `contacts` | at least one contact with `name` and `phone` |

### Optional — but recommended

| Field | Notes |
|-------|-------|
| `property.accent_color` | Hex color, e.g. `"#2A9D8F"`. Defaults to teal. |
| `property.greeting` | Welcome message shown on the home screen |
| `property.language` | `"en"` or `"it"` (default: `"en"`) |
| `map.google_maps_url` | Google Maps link to the property address |
| `property.photos` | Array of base64 data URIs or image URLs for the gallery |

---

## Step 2 — Add the property photo

Replace `assets/property-photo.jpg` with the property's photo.
- Recommended size: 1200×800px, JPEG, under 300 KB
- If no photo is available, the hero shows a gradient with the accent color

Alternatively, use the admin panel (see Step 4) to upload photos directly — they are saved as base64 in `config.json`, so no separate image file is needed.

---

## Step 3 — Deploy on Netlify

### Option A — New site (first deployment for this property)

1. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Deploy manually**
2. Drag the entire `stayguide/` folder into the drop zone
3. Wait ~30 seconds for the deploy
4. Copy the generated URL (e.g. `amazing-fermat-123.netlify.app`)
5. Rename the site: **Site settings → Site name** → e.g. `villa-rosa`
   - Final URL: `villa-rosa.netlify.app`

### Option B — Custom subdomain on wiseinblue.com

1. Deploy as above to get the Netlify URL
2. In Netlify: **Domain settings → Add custom domain** → enter `villa-rosa.wiseinblue.com`
3. In Serverplan (DNS for wiseinblue.com): add a CNAME record:
   - Name: `villa-rosa`
   - Value: `villa-rosa.netlify.app`
4. Wait up to 10 minutes for DNS propagation
5. Netlify will auto-provision an SSL certificate

---

## Step 4 — Test the guide

1. Open the URL in a mobile browser
2. Navigate through all tabs: Home, House Info, Contacts, Nearby, FAQ
3. Open `[url]/admin.html` and enter the PIN to verify admin access

---

## Step 5 — Share with the property owner

Send the property owner:
- The guide URL (e.g. `https://villa-rosa.wiseinblue.com`)
- The admin URL: `[guide-url]/admin.html`
- Their admin PIN

---

## Updating the config after deployment

### If Wise in Blue manages updates:
1. Open `[url]/admin.html`, enter PIN
2. Make changes in the admin panel
3. Click **Download config.json**
4. In Netlify: **Deploys → Drag & drop** the updated folder (or just the `config.json` file via the Netlify UI)

### If the property owner manages updates:
- They access `/admin.html`, edit content, download the new `config.json`
- They send it to Wise in Blue or upload it via Netlify drag-and-drop

---

## Notes

- The guide works offline after the first load (PWA with service worker)
- config.json is cached in the browser — guests still see content even without internet
- The admin panel is not linked from the app — it's only accessible via direct URL
- Photos uploaded via the admin panel are stored as base64 inside config.json (no separate server needed)
