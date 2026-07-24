# My Forever Nails — myforevernails.com

The public website for **My Forever Nails**, an industry-only supplier of
restorative nail systems for the funeral profession.

Static site. No build step, no framework, no dependencies — the files in this
repository are exactly what the browser receives. Served by **GitHub Pages**
over HTTPS at <https://myforevernails.com>.

---

## Editing the site

Everything is plain HTML/CSS/JS. Edit a file, commit, push — the live site
updates in about a minute.

```
git add -A
git commit -m "Describe the change"
git push
```

### Where things live

| File | What it controls |
| --- | --- |
| `index.html` | The whole one-page site: copy, sections, the procurement form |
| `assets/css/styles.css` | All visual design. Colours live in `:root` at the very top |
| `assets/js/main.js` | Navigation, order builder, form submission. **Config is at the top** |
| `privacy.html` / `terms.html` | Legal pages |
| `404.html` | Shown for any unknown address |
| `CNAME` | **The custom domain. Do not delete this file** — see below |
| `sitemap.xml` | List of pages given to search engines |
| `assets/img/` | Favicons, app icons, and the social share image |
| `assets/img/products/` | Product photographs — see below |

### Common changes

**Change a price.** Prices appear in three places and must match:

1. `index.html` — the `<span class="product__price">` in the collection card
2. `index.html` — the `<p class="order-row__price">` in the procurement form
3. `assets/js/main.js` — the `SHADES` object (this drives the live subtotal)

Also update the `"price"` value in the structured-data block in `index.html`.

**Change the brand colours.** Edit the `:root` variables at the top of
`assets/css/styles.css`. `--gold`, `--gold-deep`, and `--gold-gradient` control
the metallic accents; `--paper`, `--cream`, and `--ink` control the base.

**Change the mission statement.** It is the `<blockquote class="mission__quote">`
in `index.html`.

**Replace a product photograph.** Each shade uses two files in
`assets/img/products/`:

| File | Used by | Size |
| --- | --- | --- |
| `grace-0N.jpg` | The collection card | 1100 × 300 |
| `grace-0N-thumb.jpg` | The order row in the procurement form | 320 × 320 |

Keep those exact dimensions. The card images are letterboxed onto a **white**
background so they sit invisibly on the white card — if a replacement has a
grey or coloured surround, a visible rectangle will appear behind it.

Remember to update the `alt` text in `index.html` if the shade changes.

---

## Turning on live form delivery

The procurement form works right now — but until you add a free access key it
falls back to opening a pre-filled email in the visitor's own mail app rather
than delivering silently to your inbox. Nothing is lost either way.

To enable direct delivery to **myforevernails@gmail.com**:

1. Go to <https://web3forms.com>
2. Enter `myforevernails@gmail.com` and press **Create Access Key**
3. Confirm the email they send you — they reply with a key (a UUID)
4. Open `assets/js/main.js` and paste it into the first line of the config block:

   ```js
   var WEB3FORMS_ACCESS_KEY = 'paste-your-key-here';
   ```

5. Commit and push.

The free tier covers 250 submissions per month. The key is **safe to commit** —
Web3Forms access keys are designed to be public and client-side; they only allow
sending mail to the address that owns the key.

Every submission arrives as an email containing the funeral home, director
details, license number, the itemised order, shipping address, and any notes.

---

## Hosting and the custom domain

- **Source:** the `main` branch, root folder.
- **Custom domain:** set by the `CNAME` file in this repository.
- **HTTPS:** GitHub issues and renews a free Let's Encrypt certificate.

> **Do not delete or rename `CNAME`.** It is what binds `myforevernails.com` to
> this repository. If it is removed, the site reverts to its
> `jordanmccann.github.io/MyForeverNails` address and the custom domain breaks.

### DNS records this site expects

At the domain registrar (GoDaddy), for `myforevernails.com`:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `jordanmccann.github.io` |

GitHub redirects `www.myforevernails.com` to the apex domain automatically.

---

## Local preview

No tooling required beyond Python:

```
cd site
python -m http.server 8080
```

Then open <http://localhost:8080>. Use a server rather than opening
`index.html` directly — the pages use absolute paths (`/assets/...`), which
only resolve correctly when served.

---

## Regenerating brand images

`assets/img/` holds the favicons, app icons, and the 1200×630 social share
image. They are generated from the brand droplet mark and the site's own
typefaces, and are committed to the repository — you do not need to rebuild
them unless the brand changes.

---

## Browser support

Modern evergreen browsers, plus graceful degradation:

- Without JavaScript, all content is visible and readable; only the order
  builder and the reveal animations are inactive.
- Without `backdrop-filter`, the header falls back to a solid bar.
- `prefers-reduced-motion` is respected throughout.
