# STRAND — Phone-Only Build Guide

This is the first iteration of your research peptide e-commerce site. Everything is static HTML/CSS/JS — no build tools, no terminal commands, no Node.js. Every file can be uploaded and edited from your phone using the GitHub mobile app or github.com in mobile Safari/Chrome.

---

## What's in this folder

```
strand/
├── index.html              ← Homepage
├── peptide-pens.html       ← Category: Pens
├── peptide-vials.html      ← Category: Vials
├── tertiary.html           ← Category: Lab Supplies
├── product.html            ← Dynamic product detail page (reads ?id= from URL)
├── cart.html               ← Full-page cart view
├── checkout.html           ← Checkout form
├── success.html            ← Post-payment confirmation
├── cancel.html             ← Payment cancelled
├── about.html              ← Brand story
├── faq.html                ← Frequently asked questions
├── contact.html            ← Contact form
├── disclaimer.html         ← Research Use Disclaimer (LEGAL)
├── terms.html              ← Terms of Service (LEGAL)
├── privacy.html            ← Privacy Policy (LEGAL)
├── shipping.html           ← Shipping Policy (LEGAL)
│
├── css/styles.css          ← All site styling
├── data/products.json      ← YOUR PRODUCT CATALOG
├── js/main.js              ← Nav, theme, cart count
├── js/products.js          ← Catalog rendering
├── js/cart.js              ← Cart state + drawer
├── js/animations.js        ← Scroll reveal + parallax
├── js/product-detail.js    ← PDP rendering
├── js/cart-page.js         ← Full cart page logic
├── js/checkout.js          ← Checkout form + processor handoff
├── js/faq.js               ← FAQ accordion
│
├── images/                 ← (Empty — for your real product photos later)
├── generate.py             ← Page generator (you don't need this; just for me)
├── PROGRESS.md             ← My build log (you can ignore)
└── README.md               ← This file
```

---

## Step 1 — Get the files onto your phone

You should have downloaded `strand.zip` from this conversation. Unzip it on your phone (iOS Files app or Android's built-in extractor work). You'll get this `strand/` folder.

---

## Step 2 — Push to GitHub from your phone

### Option A — Via github.com on mobile (works on iOS and Android)

1. Open Safari/Chrome → go to **github.com** → sign in.
2. Tap the **`+`** icon top-right → **New repository**.
3. Repository name: **`yourusername.github.io`** (this is the magic name that gives you the free .github.io URL automatically).
4. Set it to **Public**. Skip the "Add a README" option.
5. Tap **Create repository**.
6. On the new repo's page, tap **uploading an existing file** (or **Add file → Upload files**).
7. Tap **choose your files**. Select all 30+ files from the unzipped `strand/` folder. You may need to do this in batches — start with the HTML files, then the `css/` folder, then `js/`, then `data/`.
8. **Important about folders:** GitHub mobile may not preserve folder structure on upload. If files end up in the root, you'll need to recreate the folders. Easiest fix: use the **Working Copy** app (iOS) or **Acode** (Android) — see Option B.
9. After uploading, scroll down and tap **Commit changes**.

### Option B — Via Working Copy (iOS, recommended) or Acode (Android)

This is the better workflow long-term because you can edit files in place and push to GitHub with one tap.

**iOS (Working Copy):**
1. Install **Working Copy** from the App Store (free for read-only; one-time purchase for push, about $20).
2. In Working Copy: tap **+** → **Clone repository** → enter your repo URL.
3. Use the iOS Files app to copy the entire unzipped `strand/` folder INTO the Working Copy repo folder.
4. Back in Working Copy: tap the repo → tap the **status** tab → review changes → tap **commit & push**.

**Android (Acode + Termux Git, or MGit):**
1. Install **MGit** from the Play Store (free).
2. Clone your repo via SSH or HTTPS.
3. Copy the `strand/` files into the cloned folder using your file manager.
4. In MGit: stage all → commit → push.

---

## Step 3 — Enable GitHub Pages

1. On github.com, open your repo.
2. Tap **Settings** (mobile: may be hidden under the **⋯** menu near the top).
3. Tap **Pages** in the left sidebar (mobile: scroll the sidebar).
4. Under **Source**, select **Deploy from a branch**.
5. Branch: **main** (or **master**, whichever you have). Folder: **/(root)**.
6. Tap **Save**.
7. Wait about 60 seconds. Refresh the Pages section — you should see "Your site is live at https://yourusername.github.io".

That URL is your live site.

---

## Step 4 — Test the live site

Open `https://yourusername.github.io` on your phone. You should see the STRAND homepage.

Things to test:
- Browse to each category page (Pens, Vials, Lab Supplies)
- Tap a product card → product detail page loads with gallery
- Tap "Add to bag" → toast appears, cart count updates
- Tap the bag icon → drawer opens with your item
- Tap "Checkout" → checkout form appears
- Fill it out and submit → demo redirects to success page
- Visit `/disclaimer.html`, `/terms.html`, etc. — all should render
- Toggle dark/light mode using the sun/moon icon

If something looks broken, check the browser console (in mobile Safari: enable Web Inspector in Settings, then connect to a Mac; in Chrome Android: use chrome://inspect from a desktop, or just test on desktop first).

---

## What to change before going live

There are five things that **must** be customized before you take a real order. Each is marked clearly in the code with a placeholder you can search for.

### 1. Add your real products to `data/products.json`

Currently there are 6 sample products. You'll want 10–30 total across pens, vials, and tertiary. Each entry needs:

```json
{
  "id": "unique-slug-no-spaces",
  "name": "Display name",
  "category": "pens" | "vials" | "tertiary",
  "price": 89,
  "images": [
    "https://your-image-url-1.jpg",
    "https://your-image-url-2.jpg",
    "https://your-image-url-3.jpg",
    "https://your-image-url-4.jpg"
  ],
  "shortDescription": "One sentence shown on cards and at top of PDP.",
  "longDescription": "Longer paragraph shown in the Description tab.",
  "specs": {
    "purity": "≥99.0%",
    "size": "10mg",
    "form": "Lyophilized powder",
    "molecular": "C..H..N..O..",
    "casNumber": "12345-67-8",
    "storage": "2–8°C"
  },
  "stockStatus": "in-stock" | "low" | "out",
  "featured": true,
  "researchOnly": true
}
```

Edit `data/products.json` directly in GitHub's web editor or via Working Copy.

### 2. Connect your high-risk merchant processor in `js/checkout.js`

Open `js/checkout.js` and find the comment block that says **"HANDOFF TO PAYMENT PROCESSOR"**. The demo currently redirects straight to `success.html` for testing.

When PaymentCloud / Easy Pay Direct / Soar Payments approves your account, they will give you a hosted-checkout endpoint URL and a list of required form fields. Replace the demo redirect block with a real POST to that endpoint — there's a worked example commented right above the demo code.

### 3. Hook up your contact form in `contact.html`

The form currently has `action="https://formspree.io/f/REPLACE_WITH_YOUR_FORMSPREE_ID"`.

1. Go to **formspree.io** → sign up (free tier is fine for low volume).
2. Create a new form → copy your form's URL endpoint.
3. Replace `REPLACE_WITH_YOUR_FORMSPREE_ID` in `contact.html` with your endpoint.

### 4. Have a lawyer review the legal pages

The four legal pages (`disclaimer.html`, `terms.html`, `privacy.html`, `shipping.html`) all have a yellow "Sample copy — pending attorney review" banner at the top. This is **not optional** for research peptides. Find an attorney with experience in research chemicals or supplements. Budget a few hundred dollars for the review.

After review, delete the `<div class="legal-banner">…</div>` block from each page.

### 5. Swap in real product photos

Currently every product uses `https://picsum.photos/seed/...` placeholder images. When you have real photos:

1. Resize/compress them with **squoosh.app** in your phone browser (recommended dimensions: 1200×1500 px, JPEG quality 80).
2. Upload them to GitHub: in your repo, go to the `images/` folder → **Add file → Upload files**.
3. In `data/products.json`, replace the picsum.photos URLs with `images/your-photo-name.jpg`.

---

## How to make edits from your phone going forward

### Quick edit via github.com:
1. Browse to the file on github.com.
2. Tap the **pencil icon** (top right of the file view).
3. Edit.
4. Scroll down → **Commit changes**.
5. Your site updates within 60 seconds.

### Better edit via Working Copy (iOS):
1. Open Working Copy → tap your repo.
2. Tap the file → tap the edit icon (pencil).
3. Edit with proper syntax highlighting.
4. Save → status tab → commit & push.

---

## Custom domain (when you're ready)

1. Buy a domain at **cloudflare.com/products/registrar** (cheapest, no upsells, ~$10/year).
2. In Cloudflare DNS, add a CNAME record: name `@`, target `yourusername.github.io`.
3. In your GitHub repo → Settings → Pages → Custom domain → enter your domain.
4. Wait for DNS to propagate (10 min to a few hours).
5. Check "Enforce HTTPS" once GitHub finishes the cert.

---

## Useful additions for later

These aren't built yet but you may want them once the basics are live:

- **Email forwarding** at `support@yourdomain.com` — use ImprovMX (free).
- **Order tracking integration** — most processors send tracking webhooks; you can build a simple order lookup page or rely on the processor's customer portal.
- **Analytics** — Plausible (paid, privacy-friendly) or Google Analytics (free). Add the snippet to the `<head>` of every page.
- **Cookie banner** — required in EU/UK. Easiest: Cookieyes free tier.
- **Customs paperwork generator** — for international, you'll want a small script to print a customs declaration. Can be added later.

---

## One last thing

Read the `BUILD_PLAN.md` document I gave you earlier — it has the merchant approval timeline, business entity requirements, and a long list of things to do in parallel with the build. Approval can take 1–3 weeks; start those applications now.

Good luck. Email me (well, a fresh Claude conversation) any time you hit something that doesn't make sense.
