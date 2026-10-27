# velvetlog.com — static site

Plain HTML and CSS. No build step, no server, no dependencies.

```
index.html          Home page (features, how it works, pricing, FAQ)
about/index.html    About
contact/index.html  Contact form (sent by Web3Forms)
privacy/index.html  Privacy Policy
404.html            Not-found page
styles.css          All styling
img/                Screenshots (WebP), icon, icons.svg sprite
_redirects          Old URLs → new URLs (Netlify / Cloudflare Pages)
_headers            Caching and security headers (Netlify / Cloudflare Pages)
```

## Hosting

Point Netlify or Cloudflare Pages at this repo with:

- Build command: *(none)*
- Publish / output directory: `site`

## Common edits

- **App Store link:** in `index.html`, replace the two `<span class="btn ... store is-soon">` App Store badges with
  `<a class="btn btn-lg btn-white store" href="YOUR_APP_STORE_LINK" target="_blank" rel="noopener">…</a>`, and update the hero badge and FAQ text.
- **Header/footer:** they are copied into each page; change all five HTML files.
- **Contact form:** messages go to the inbox registered for the Web3Forms access key in `contact/index.html`.

## Preview locally

```
cd site && python3 -m http.server 8000
```
then open http://localhost:8000.
