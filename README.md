# Xanarena: Exit Stage...House Left

Watch page for the Climate Pledge Arena spoof VHS film made for Rush. It's a static site with no build step.

## Viewing

The published site is only `index.html` (the watch page, concept 1D), `404.html` and `assets/`. Everything for review lives in `concepts/`, which never deploys: `concepts/index.html` is the "Staff picks" shelf that links to every concept, the printable flyers and the easter egg lab. Open pages through a local web server (for example `npx http-server`), since YouTube won't play embeds on pages opened as files.

| Folder (in `concepts/`) | Concept |
| --- | --- |
| `concept-1-be-kind-rewind/` | CRT TV and a working VCR deck (tracking, VHS FX, LCD counter), plus the core Rush eggs: YYZ power light, 21:12 counter, song-title on-screen text, CC button, secret codes (`yyz`, `2112`), backline credit |
| `concept-1b-viewer-beware/` | Same TV and VCR as concept 1, with a kids-horror TV intro as the pre-roll (`Viewer beware...`). Has the same core Rush eggs as concept 1 |
| `concept-1c-deep-cuts/` | Concept 1 with every player egg: the core eggs plus a "Distant early warning" card and "Rated R40" in the specs line |
| none (root `index.html` + `assets/`) | 1D, the live watch page. Concept 1 playing a YouTube-hosted tape (set in `index.html`, not `assets/config.js`): the pre-roll loops until Play or a click on the screen loads the player, the deck keys, counter, seek bar and OSD drive YouTube, and Eject or the end of the film returns to the pre-roll. Also has the laminate reviews from concept 3, tracking beside the counter, and a dryers-only backline credit |
| `concept-2-midnight-rental/` | The box as a page: horror-shelf front cover, then turn it over to watch |
| `concept-3-house-left/` | Arena show night: spotlights, LED wall player, lighters, ticket, setlist |

## Adding the video

Edit `assets/config.js` once and every concept picks it up (the live page overrides it with its YouTube embed in `index.html`):

```js
window.XANARENA_VIDEO = {
  src: 'media/xanarena.mp4',   // self-hosted file (MP4/WebM)
  embed: '',                   // or a YouTube/Vimeo embed URL instead of src
  poster: 'media/poster.jpg'   // optional still shown before play
};
```

While `src` and `embed` are both empty, each concept shows its placeholder. Concept 1's custom deck controls (seek, counter, tracking) only work with `src`. With an embed, the host's own player controls are used.

## Flyers

Six letter-size flyers live in `flyers/` (gallery at `flyers/index.html`), each with a QR code to the watch page. Flyers 1, 2 and 3 are portrait posters. Flyers 1B (the tape), 2B (the fence) and 3B (the ticket) are quieter landscape versions; they set landscape on their own when printed.

1. Set the real address in `flyers/flyer-config.js`. Every QR code and printed URL updates from it. While it still points at example.com, an orange draft note shows on screen (it never prints).
2. Open a flyer and print with paper size **Letter**, margins **None**. Background colors print automatically.
3. Scan a test print before running copies.

QR codes are drawn locally by `flyers/vendor/qrcode.js` (qrcode-generator by Kazuhiko Arase, MIT license).

## Easter eggs

`concepts/EASTER-EGGS.md` lists every Rush reference idea with the real story behind it. `concepts/easter-eggs/index.html` is a lab page with a working demo or mock of each one, tagged "Live in" (with the concepts that have it), "Mock" or "Needs sign-off". The root `404.html` is the live "Moving pictures" error page. It uses root-relative links (`/assets/...`, `/`) so it works at any missing URL, and the Linux startup command (`pm2 serve`) serves it automatically for anything not found.

## Deploying

The site runs on the Azure App Service `xanarena` (resource group `xanarena`). Basic auth, FTP and publish profiles stay off; both routes below sign in with Microsoft Entra ID.

**GitHub Actions** (`.github/workflows/deploy.yml`): publishing is a manual step. On GitHub, open **Actions > Deploy to Azure App Service > Run workflow**. It uploads only `index.html`, `404.html` and `assets/` from `main`. Pushing commits doesn't deploy anything. One-time setup:

1. Push this folder to a GitHub repo with a `main` branch.
2. Create a user-assigned managed identity, give it the **Website Contributor** role on the `xanarena` web app, and add a federated credential for the repo's `main` branch. GitHub now sends a subject with owner and repo IDs, so use the exact one from the first failed run's error (for this repo: `repo:davidconger@65508239/xanarena@1411203752:ref:refs/heads/main`).
3. Add three repo secrets from that identity: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`. All of this is already done for `davidconger/xanarena` (identity `xanarena-deploy`).

To deploy from this machine instead of the Actions tab: `gh workflow run deploy.yml -R davidconger/xanarena`.

**From this machine** with the Azure CLI, after `az login`, zip `index.html`, `404.html` and `assets/` and run:

```
az webapp deploy --resource-group xanarena --name xanarena --src-path site.zip --type zip
```

If the App Service runs on Linux, plain HTML needs a startup command to be served (for example `pm2 serve /home/site/wwwroot --no-daemon` on the Node stack). On Windows it works as-is.

## Before launch

- Anything touching Neil (the "Thanks, Professor" end card, Anika's "Die Schlagzeugerin" credit) needs a yes from the band's team first.

## Layout

```
index.html              watch page (concept 1D), published
404.html                "Moving pictures" error page, published
assets/                 published: styles.css, app.js, config.js (video settings), video.js (player mount), favicon.svg, feel-the-sound.svg
concepts/               review only, never deployed: index.html (picker), concept-*/, easter-eggs/ (lab), review-bar.js, EASTER-EGGS.md
flyers/                 printable flyers, flyer-config.js (URL), flyer.css, flyer.js, vendor/qrcode.js (not deployed)
.github/workflows/      deploy.yml (manual GitHub Actions deploy to Azure)
```

Fonts load from Google Fonts. Everything else is local.
