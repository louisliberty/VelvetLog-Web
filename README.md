# velvetlog.com

The VelvetLog marketing website. Plain HTML and CSS, hosted on GitHub Pages. No build step, no server, no dependencies.

```
index.html           Home: features, how it works, pricing, FAQ
about/index.html     About
contact/index.html   Contact form (delivered by Web3Forms)
privacy/index.html   Privacy Policy
404.html             Not-found page (GitHub Pages serves it automatically)
styles.css           All styling
img/                 App screenshots (WebP), app icon, icons.svg sprite
favicon.png, apple-touch-icon.png
robots.txt, sitemap.xml   For search engines
CNAME                Custom domain for GitHub Pages (velvetlog.com)
.nojekyll            Tells GitHub Pages to serve files as-is
```

## Publishing

GitHub repo **Settings → Pages**: Source *Deploy from a branch*, branch `main`, folder `/ (root)`.
Every push to `main` goes live within a minute or two.

## Common edits

- **App Store link:** in `index.html`, replace the two App Store `<span class="btn ... store is-soon">` badges with
  `<a class="btn btn-lg btn-white store" href="YOUR_APP_STORE_LINK" target="_blank" rel="noopener">…</a>`,
  and update the hero badge, FAQ answer and the FAQ text in the JSON-LD block at the top of the page.
- **Header/footer:** copied into each page; change all five HTML files.
- **New page:** create `newpage/index.html` (copy an existing page) and add its URL to `sitemap.xml`.
- **Contact form:** messages go to the inbox registered for the Web3Forms access key in `contact/index.html`.

## Preview locally

```
python3 -m http.server 8000
```
then open http://localhost:8000.
