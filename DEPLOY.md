# Deploying Horizon Art Gallery

This guide puts the site live using:

| Part | Host | Address you'll get |
|---|---|---|
| React website (`client/artwork-app`) | **Vercel** *or* **Netlify** | `https://<your-project>.vercel.app` or `https://<your-site>.netlify.app` |
| Flask API (`server`) | **Render** (Frankfurt region) | `https://horizon-api.onrender.com` |
| Database | **Render Postgres** | Linked to the API automatically |

Total time is about 20–30 minutes. You need a GitHub account with this repo pushed to it, plus free accounts on [render.com](https://render.com) and [vercel.com](https://vercel.com). Sign up to both with GitHub, which makes connecting the repo one click.

> **Order matters.** Deploy the API first, because the website needs its address. Then deploy the website, then go back and tell the API the website's address.

---

## Step 0: Push the latest code to GitHub

Both hosts deploy straight from GitHub, so commit and push everything first:

```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

**Check:** on GitHub you should see `render.yaml` in the repo root and `client/artwork-app/vercel.json`.

---

## Step 1: Deploy the API and database on Render

The repo includes a **Blueprint** file, [`render.yaml`](render.yaml), that sets up the API and database together.

1. In the Render dashboard, click **New → Blueprint**.
2. Connect GitHub if asked, then pick the **Wambui-s-ArtGallery** repo.
3. Render reads `render.yaml` and lists two resources: **horizon-api** (web service) and **horizon-db** (Postgres).
4. It asks for a value for **`FRONTEND_URL`**. You don't have the website address yet, so enter `https://example.com` for now. You'll fix it in Step 3.
5. Click **Apply** and wait for the first deploy. It takes a few minutes; you can follow along under **horizon-api → Logs**.
6. When the status shows **Live**, copy the service address from the top of the page, e.g. `https://horizon-api.onrender.com`. If that name was taken, Render adds a few extra characters.

**Check:** open that address in your browser. You should see **"Welcome to the Artwork Page"**. Then add `/artworks` to the end; you should see `[]` (an empty list).

You don't set `DATABASE_URL` or `SECRET_KEY` yourself. The Blueprint links the database and generates a strong secret key for you.

---

## Step 2: Deploy the website on Vercel

1. In Vercel, click **Add New → Project** and import the **Wambui-s-ArtGallery** repo.
2. Under **Root Directory**, click **Edit** and choose **`client/artwork-app`**. This is the important setting.
3. **Framework Preset** should detect **Vite** automatically. Leave the build settings as they are.
4. Open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | Your Render address from Step 1, e.g. `https://horizon-api.onrender.com` (no slash at the end) |

5. Click **Deploy**. When it finishes, copy your site address, e.g. `https://wambuis-art-gallery.vercel.app`.

**Check:** the homepage loads, and refreshing on a page like `/shop` doesn't give a 404. `vercel.json` handles that.

### Step 2, alternative: Netlify instead of Vercel

Do this **instead of** the Vercel steps above. You only need one of the two. The repo includes [`netlify.toml`](netlify.toml), which already sets the folder, build command, output folder and page routes.

1. In Netlify, click **Add new site → Import an existing project → GitHub** and pick the **Wambui-s-ArtGallery** repo.
2. Netlify reads `netlify.toml` and fills in the build settings. You should see base directory `client/artwork-app`, build command `npm run build` and publish directory `client/artwork-app/dist`. Leave them as they are.
3. Under **Environment variables** (or later in **Site configuration → Environment variables**), add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render address from Step 1, e.g. `https://horizon-api.onrender.com` (no slash at the end) |

4. Click **Deploy**. When it's done, copy your site address, e.g. `https://wambuis-art-gallery.netlify.app`. You can rename the site under **Site configuration → Change site name**.

If you add or change `VITE_API_URL` after the first deploy, go to **Deploys → Trigger deploy → Deploy site** so the new value gets built in.

---

## Step 3: Tell the API your website's address

Right now the API only accepts requests from `https://example.com`, so the website can't load data yet. Fix that:

1. In Render, open **horizon-api → Environment**.
2. Edit **`FRONTEND_URL`** and paste your website address from Step 2 (Vercel or Netlify), e.g. `https://wambuis-art-gallery.netlify.app`, with no slash at the end.
3. Click **Save Changes**. Render redeploys automatically, which takes about a minute.

**Check:** reload the Shop page on your live site. The "Couldn't load artworks" error should be gone.

You can allow more than one address by separating them with commas, e.g. `https://horizon.co.ke,https://wambuis-art-gallery.vercel.app`.

---

## Step 4 (optional): Add the demo accounts

The new database is empty. To fill it with the demo artists, company, collector, artworks and events, run the seed script **from your own computer** against the Render database. Render's free plan has no command-line access to the server, so this is the way to do it.

1. In Render, open **horizon-db → Info** (or **Connect**) and copy the **External Database URL**.
2. From the repo root, run the following, keeping the quotes around the URL:

   ```bash
   docker build -t horizon-api ./server
   docker run --rm -e DATABASE_URL="PASTE_EXTERNAL_DATABASE_URL_HERE" horizon-api python seed.py
   ```

3. You should see `Added artist: artist@horizon.test` and similar lines. It's safe to run again, because it skips anything that already exists.

Demo logins (password `password123` for all):

| Email | Account type |
|---|---|
| `artist@horizon.test` | Artist |
| `artist2@horizon.test` | Artist |
| `company@horizon.test` | Company |
| `customer@horizon.test` | Collector |

> **Before you launch for real,** delete the demo accounts or change their passwords. Anyone who reads this repo knows `password123`.

---

## Step 5: Test it end to end

Go through this on the live site:

- [ ] Homepage loads with the pinned gallery and artist list
- [ ] Sign up as a **new artist**, upload an artwork and post an event
- [ ] Log out, sign up as a **collector**, add the artwork to your cart and place an order
- [ ] As the artist, the order appears under **Dashboard → Sales**
- [ ] Sign up as a **company** and send a connection request to the artist
- [ ] As the artist, accept it. Both sides should now see each other's email
- [ ] Refresh on a deep link like `/artists/1`; it still loads

---

## Updating the site later

Just push to `main`:

```bash
git push origin main
```

Vercel and Render both rebuild automatically. If you **change `VITE_API_URL`** on Vercel, trigger a new deploy (**Deployments → ⋯ → Redeploy**). The value is baked in at build time, so changing it alone does nothing.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Site loads but no artworks or "Failed to fetch" | `FRONTEND_URL` on Render doesn't exactly match your site address | Copy the address from the browser bar, with no slash at the end, and save |
| Works on the main address, fails on a **preview** link (Vercel preview or Netlify deploy preview) | Preview deployments get their own addresses | Add the preview address to `FRONTEND_URL` (comma-separated), or test on the main address |
| Site calls `127.0.0.1:5000` | `VITE_API_URL` wasn't set when the site was built | Set it on Vercel or Netlify, then redeploy |
| Netlify shows "Page not found" on `/shop` after a refresh | `netlify.toml` wasn't picked up | Make sure `netlify.toml` is in the **repo root** and pushed to GitHub |
| First load takes 30–60 seconds | Free Render services sleep after a while without visitors | Normal on the free plan; upgrade to **Starter** to keep it awake |
| Render deploy fails | Check **horizon-api → Logs** | The error is usually near the bottom |
| Everyone was logged out after a deploy | `SECRET_KEY` changed | Leave the generated key alone once you're live |

---

## Before taking real money

The free plans are fine for showing the site off, but not for a shop:

- **Upgrade the API to Starter.** Free services sleep, so a customer's first click is slow and payment confirmations from M-Pesa could arrive while it's asleep.
- **Upgrade the database to a paid plan.** Free Render databases expire after a limited time. Check the current limits on Render's pricing page. Paid plans also include backups.
- **Add your own domain** (e.g. `horizon.co.ke`): add it on Vercel under **Settings → Domains**, then add it to `FRONTEND_URL` on Render.

### M-Pesa (when you're ready)

Safaricom's Daraja API needs a public HTTPS **callback URL** to send payment confirmations to. Your Render address already works for that, e.g. `https://horizon-api.onrender.com/mpesa/callback`. Store the Daraja keys (consumer key, consumer secret, passkey, shortcode) as **environment variables on Render**, never in the code. The place to start the payment request is marked with a `TODO (M-Pesa)` comment in [`server/resources/orders.py`](server/resources/orders.py).

---

## Alternative: one server with Docker Compose

If you'd rather run everything on one rented server (DigitalOcean, Hetzner and so on), the repo already has a working `docker-compose.yml`:

```bash
# on the server
git clone https://github.com/Wambuiracheal/Wambui-s-ArtGallery.git && cd Wambui-s-ArtGallery
docker compose build --build-arg VITE_API_URL=https://api.your-domain.com
SECRET_KEY=$(openssl rand -hex 32) docker compose up -d
```

To go this way you also need to:
- point a domain at the server and put HTTPS in front of it (Caddy is the easiest);
- pass `SECRET_KEY` and `FRONTEND_URL` to the server container in `docker-compose.yml`;
- back up the `db-data` volume, which holds the SQLite database, yourself.

It's cheaper at scale, but you're responsible for security updates, HTTPS and backups, which Render and Vercel handle for you.
