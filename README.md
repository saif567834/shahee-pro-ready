# SHAHEE ORGANIC — full-stack website
React (Vite) + Framer Motion front end · Node/Express API · MongoDB · optional Razorpay · admin dashboard.

## Features
- Storefront: cinematic hero, brand story, ingredients (3D tilt), product shop (200 ml / 500 ml, quantity, cart saved in browser), brand film slot, Instagram gallery, contact form, FAQ.
- Checkout: customer name, phone, address, city, pincode; Cash on Delivery or Online payment (Razorpay UPI/card).
- Customers can track an order at /track with order number + mobile number.
- Admin at /admin (password): orders (update order and payment status, WhatsApp customer, CSV export), products (price, availability), gallery (upload/delete images), customer messages.
- Server recalculates prices from the database; rate limits; signed admin cookie; upload type/size checks.

## Quick start (site is already built)
    npm install
    cp .env.example .env     # set ADMIN_PASSWORD and SESSION_SECRET (+ MONGODB_URI for the real database)
    npm start                # site: http://localhost:3000   admin panel: http://localhost:3000/admin

## Run locally (rebuild after editing the client)
    npm install
    cp .env.example .env          # set ADMIN_PASSWORD and SESSION_SECRET
    npm run build                 # installs and builds the client
    npm start                     # http://localhost:3000   admin: /admin
With no MONGODB_URI the data goes to ./data/db.json (local testing only).
Live development: `npm run dev:server` and `npm run dev:client` in two terminals (client on :5173).

## MongoDB
1. Create a free MongoDB Atlas cluster, a database user, and allow your host's IP (or 0.0.0.0/0 for testing).
2. Put the connection string in MONGODB_URI. Collections products, orders, gallery, enquiries, counters are created and seeded on first start.

## Online payments (Razorpay)
Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Payments are verified server-side by signature. Without keys, "Online payment" orders are saved and you send a payment link on WhatsApp.

## Brand video
Put the file in client/public/video/brand.mp4 and set VITE_BRAND_VIDEO=/video/brand.mp4 in client/.env before `npm run build`.

## Deploy (Render / Railway / VPS)
Build command: `npm install && npm run build`   Start command: `npm start`
Set env vars from .env.example (NODE_ENV=production, MONGODB_URI, ADMIN_PASSWORD, SESSION_SECRET).
Gallery uploads are saved in ./uploads: attach a persistent disk there, or they disappear on redeploy.

## Not included
Real 3D (Three.js) bottle, GSAP scroll story, customer accounts, order emails/SMS, Razorpay webhooks. The bottle uses a 2.5D tilt of the real poster crop.
