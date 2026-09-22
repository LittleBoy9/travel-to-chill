# Travel to Chill — "Ascend to Chill" redesign (demo)

A redesign concept for [traveltochill.com](https://traveltochill.com), built as a static site (HTML + CSS + vanilla JS). It needs no build step.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo.
2. Go to **Settings → Pages → Deploy from a branch** and pick `main` / `root`.
3. The site goes live at `https://<user>.github.io/<repo>/`. All paths are relative, so it works from a sub-path.

## What's inside
| Section | Idea |
|---|---|
| Preloader | A plane flies in on a glowing trail and "writes" the logo as it passes. A sheen sweeps across the logo, the tagline rises in, and the screen splits open to the hero |
| Hero | Giant kinetic title sitting *behind* parallax mountain layers, a drifting mist canvas, mouse depth and a live IST clock |
| Altimeter | A fixed side gauge that climbs from 9 m (Kolkata) to 5,183 m (Gurudongmar) as you scroll |
| Story | The manifesto lights up word by word, with inline photo pills that grow in |
| The Route | A pinned horizontal journey. The drawn line is the real **elevation profile** from Kolkata → NJP → Darjeeling → Gangtok → North Sikkim → Dooars, with a live altitude HUD |
| Destinations | An expanding accordion of cards with ratings |
| Trip Studio | Tabs, package list, day-by-day itinerary, a group-size stepper and a **live price calculator**. "Book on WhatsApp" pre-fills the message |
| Services | Sticky stacking cards |
| Advantage | A bento grid: the "Chill slider" stress meter, auto-toggling custom options, a meals sun-arc, ₹0 hidden fees and a driving car |
| Film | A spinning text ring that opens their YouTube film in a modal |
| Quote | A conversational 5-step form that fills a **boarding pass** live, then sends to WhatsApp (or email) |
| Extras | Custom cursor, magnetic buttons, Lenis smooth scroll, film grain, and a WhatsApp/call dock |

Libraries (loaded from CDN): GSAP 3 + ScrollTrigger, Lenis. If any CDN script fails to load, the page still works without the animations. The site also respects `prefers-reduced-motion`.

## Content notes / to confirm with the client
- All copy, prices, ratings, contact details, images and the YouTube film come from the current site.
- The day-by-day plans for the **four Gangtok packages** were drafted for the demo; the current site lists only their names and prices. Please confirm these with the client.
- Darjeeling and Dooars use the "from ₹3,599 / person" price shown on the current homepage. The packages page reuses a placeholder Gangtok price in those sections.
