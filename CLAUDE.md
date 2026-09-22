# CLAUDE.md

A redesign **demo** of [traveltochill.com](https://traveltochill.com), made to pitch to the client. Travel to Chill is a Kolkata-area travel agency that sells all-inclusive group tours to Darjeeling, Gangtok / Sikkim and the Dooars. The theme is "Ascend to Chill": the page reads as a climb from Kolkata into the hills.

It's a static site with no build step. It deploys to GitHub Pages as-is (`.nojekyll` is present, and every path is relative).

## Layout

```
index.html        single page, every section, in scroll order
css/style.css     all styles; design tokens live on :root
js/main.js        all behaviour; one IIFE split into "/* ---------- Section ---------- */" blocks
assets/img/       client photos (renamed and compressed) + logo.png (transparent)
```

The sections in `index.html` appear in the same order as their blocks in `main.js`:

loader → hero → story (manifesto + stats + motto) → route (horizontal pin) → marquee → destinations → packages ("Trip Studio") → services (stacking cards) → advantage (bento grid) → vista (parallax photo band) → FAQ → contact (quiz + boarding pass) → footer

## Run & check

```bash
python3 -m http.server 8765          # open http://localhost:8765
node -e "new Function(require('fs').readFileSync('js/main.js','utf8'))"   # quick JS syntax check
```

Browser testing: the chrome-devtools MCP profile is often locked by another session. The fallback is `puppeteer-core` installed in the session scratchpad, pointed at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

After any layout change, check these viewports:

| Width × height | Device |
|---|---|
| 320×568 | small phone |
| 375×667 | phone |
| 414×896 | large phone |
| 768×1024 | tablet, portrait |
| 1024×768 | tablet, landscape |
| 1280×720 | laptop |
| 1440×900 | desktop |
| 1920×1080 | large desktop |
| **844×390** | phone, landscape (the one that breaks most often) |

Also confirm there's no horizontal overflow: `document.documentElement.scrollWidth` must equal the viewport width.

## Libraries

Loaded from CDN at the bottom of `index.html`: GSAP 3.12.5 + ScrollTrigger (cdnjs) and Lenis 1.1.13 (jsdelivr). Fonts come from Google Fonts: Fraunces (display), Manrope (body), JetBrains Mono (labels).

## Rules that aren't obvious from the code

- **Degrade gracefully.** `animate = gsap && ScrollTrigger && !prefers-reduced-motion`. When it's false, `<html>` gets `.no-anim .no-pin`, the loader is removed, and all content must still be visible and usable. Don't add content that is hidden by default and only revealed by JS. `<noscript>` hides the loader and cursor.
- **Lenis drives scrolling.** It's wired to `ScrollTrigger.update` and `gsap.ticker`. Use `scrollToTarget()` for programmatic scrolling. Call `lenis.stop()` / `lenis.start()` around overlays (the menu). The menu has `data-lenis-prevent` so it can scroll on its own.
- **Mouse parallax and magnetic buttons use the CSS `translate` property**, not `transform`. That way they compose with GSAP transforms on the same element instead of fighting them. Keep it that way.
- **The Route section** is a pinned horizontal tween (`hTween`). Its elevation line is built in JS from each `.route__panel`'s `data-alt` / `data-name` and its `offsetLeft`, and rebuilt on ScrollTrigger refresh. The altitude readout reads the line's y position back into metres. To add or reorder stops, edit the panels in HTML; the line follows automatically. Parallax inside the route must use `containerAnimation: hTween`.
- **Service card stacking** (sticky cards + scale/dim) only runs at `(min-width: 900px) and (min-height: 700px)`. That condition is duplicated in CSS (`position: sticky`) and in JS (`gsap.matchMedia`), so keep both in sync. Below it the cards scroll normally, because a sticky card taller than the viewport gets covered before it can be read.
- **The floating dock** (WhatsApp + call) is hidden while the hero is in view (`.dock.is-hidden`, toggled in the scroll handler). On phones and short screens only the WhatsApp button shows. `.hero__bottom` and `.foot__bar` have right padding to stay clear of it.
- **The preloader** is a plane flying along `.loader__trail`. As it passes, it reveals the logo via `clip-path` over x = 132 to 468 (the logo's span in the 600-wide SVG viewBox). If you change `.loader__logo`'s `left` or `width`, update `LOGO_X0` / `LOGO_X1` too. The shine sweep masks with `../assets/img/logo.png` (relative to the CSS file).
- **Z-order:** the hero title sits between the back and mid mountain SVGs on purpose, so the peaks overlap the letters.
- **Contact details** appear in several places: HTML, the `WA` / `EMAIL` constants in JS, and the footer. Update them all together.

## Content & data

- **Packages** live in the `PACKS` object in `main.js`. Each entry has `kicker`, `title`, `rating`, `reviews`, `price`, `min` group size, `img`, a `days[]` list, `incl[]`, and optional `badge` / `note`. The "Book on WhatsApp" link and group total are generated from this data.
- **Where the content came from:** all copy, prices, ratings, contact info and images are from the client's live site.
- **Not confirmed yet:**
  - The four **Gangtok itineraries** were drafted for the demo; the live site only lists their names and prices. The client needs to confirm them.
  - Darjeeling and Dooars use the homepage's "from ₹3,599" price.
- **Contact:** phone and WhatsApp `+91 831 893 2610` (`918318932610`), email `official.traveltochill@gmail.com`. The address is Rani Plaza, Tetulia Road, Maslandapur, North 24 Parganas 743289.
- **Groups:** family and friends groups are 4+; corporate groups are 10+; Gangtok packages need a minimum of 5.
- **Images:** keep them under ~500 KB each. Compress with `sips -s formatOptions 60`, and **never use `-Z` to a size larger than the source** (it upscales). `north-sikkim-snow` was dropped because it shows a Chinese temple. `hero-valley-hiker.jpg` looks like Yosemite, so it's only used as a mood image (vista band, North Sikkim package), never to represent a real destination.

## Style

- Colours are tokens on `:root`: `--ink` (deep pine background), `--mist` (cream), `--saffron` and `--leaf` (the logo's orange and green).
- Headings use Fraunces, with the second phrase in `<em>`, which renders italic saffron.
- Small labels use the `.mono` class (uppercase, letter-spaced).
- Class names follow BEM-ish `block__el`. JS hooks are `js-*` classes; the custom cursor label is set with `data-cursor="Label"`.
- Match the existing CSS: one rule per line where short, and media queries next to the rules they modify.
