**Contents**[1. Scope and product summary](#s1)[2. System architecture](#s2)[3. App shell and tabs](#s3)[4. Domain model](#s4)[5. State machines](#s5)[6. The multi-vendor basket](#s6)[7. Checkout and payment](#s7)[8. Delivery and dispatch](#s8)[9. Wallet and withdrawals](#s9)[10. Authentication and authorization](#s10)[11. Voice pipeline](#s11)[12. Notifications](#s12)[13. API catalogue](#s13)[14. Admin console](#s14)[15. Infrastructure and deployment](#s15)[16. Observability and operations](#s16)[17. Security and privacy](#s17)[18. Testing strategy](#s18)[19. Roadmap](#s19)[20. Open decisions and risks](#s20)[21. Glossary](#s21)

Beez | Production architecture | Version 1.0

# Beez Production Architecture

The complete design for the Beez app for customers, merchants, riders and admins: tabs and screens, multi-shop baskets, M-Pesa checkout, delivery, wallet and withdrawals, authentication, voice, infrastructure and operations. It merges and replaces the earlier MVP architecture, the authentication specification, and the account and dashboard flow document.

**Four launch tabs**Discover, Track, Sell, Ride, plus a separate admin console

**One basket, many shops**One payment, one rider, one delivery code

**Ledger-based money**Balances are sums of entries. Withdrawals are held, paid, or released

**Phone-code sign-in**No passwords for merchants and riders. Guests need no account

**Voice first**Products and onboarding by speaking, with typing always available

**Modular monolith**One Spring Boot app, PostgreSQL, Redis, object storage

**How to read this.** Sections 1 to 3 explain the product and how the tabs work together. Sections 4 to 9 define the data and the money flows. Section 10 is the full authentication design. Sections 11 to 14 cover voice, alerts, the API and the admin console. Sections 15 to 21 cover deployment, operations, security, testing, the roadmap and open decisions. Every diagram is drawn in the page and adapts to light and dark mode.

## 1. Scope and product summary

Beez is voice-first commerce infrastructure for street vendors and small shops. Customers shop from **several vendors in one basket**, pay once with M-Pesa, and one rider collects everything and delivers it. Merchants and riders earn money inside Beez and **withdraw** it to M-Pesa. Every sale, payment and delivery is recorded, which builds the verified history that later supports financial services.

This document is the single production architecture. It merges and replaces the earlier MVP architecture, the authentication specification, and the account and dashboard flow document, and adds the multi-vendor basket and the wallet and withdrawal system.

| Area | What the product does | Section |
| --- | --- | --- |
| App shell | Launch page with four tabs: Discover, Track, Sell, Ride. Separate admin console | 3 |
| Catalogue and voice | Shop pages, products added by voice or by hand, intro video | 11 |
| Multi-vendor basket | One basket, many shops, one payment, one rider with several stops | 5, 6, 7 |
| Payments | M-Pesa STK Push, callbacks, reconciliation, refunds | 7 |
| Delivery | Dispatch, multi-stop jobs, delivery code, live tracking | 8 |
| Wallet and withdrawals | Double-entry ledger, balances, withdrawal requests, admin payout, later automatic payout | 9 |
| Authentication | Phone and SMS code for merchants and riders, capability links for guests, password and authenticator for admins | 10 |
| Operations | Admin console, notifications, monitoring, deployment, security, testing | 12 to 18 |

### 1.1 Roles

| Role | Account | Enters through | Main goal |
| --- | --- | --- | --- |
| Customer | None (guest) | Discover and Track tabs, shop links | Buy from several shops and get one delivery |
| Merchant | Phone and SMS code | Sell tab | Take orders, prepare goods, get paid |
| Rider | Phone and SMS code, approved by admin | Ride tab | Collect and deliver, get paid |
| Admin | Email, password, authenticator | /admin | Approve, monitor, settle, refund |

### 1.2 Not in scope yet

Credit scoring, loans, merchant financing, inventory forecasting and AI business advice. The data model keeps the records those features need, so they can be added without redesign.

## 2. System architecture

Beez is a **modular monolith**: one deployable Java application with clearly separated modules, one PostgreSQL database, and a small set of managed services around it. For a team of one to five engineers this gives the speed of a single codebase with clean seams, so a module can be extracted into its own service later if one ever needs to scale alone.

CLIENTS: one installable web app (PWA) plus admin consoleCustomerDiscover and Track tabsMerchantSell tabRiderRide tabAdmin console/adminEdge: CDN, TLS, WAF, rate limiting (Cloudflare or Caddy)BEEZ API: modular monolith, stateless, 2 or more instancesAuthOTP, tokens, rolesCatalogueShops, productsVoiceSpeech to productsBasket and ordersBaskets, sub-ordersPaymentsM-Pesa, refundsDispatchJobs, stops, trackingWalletLedger, withdrawalsNotificationsPush, SMS, voiceAdminApprovals, opsJobsSchedulers, outboxModules call each other through service interfaces, never through each other's tablesPostgreSQLPrimary and replicaRedisLimits, cache, locksObject storageVideo, audio, imagesBackupsEncrypted, off siteEXTERNAL SERVICES (each behind an interface)M-PesaDaraja APISMS and voiceAfrica's TalkingWeb PushVAPIDSpeech to textSwahili, EnglishLLMExtractionMapsOpenStreetMap

Figure 1. Production system architecture: clients, edge, API modules, data stores and external services

### 2.1 Design principles

1. **Money is a ledger.** Balances are never stored as a single editable number. They are computed from immutable ledger entries.
2. **One payment, many parts.** A basket is paid once and split into per-shop and per-rider amounts by the ledger.
3. **Server owns the truth.** Prices, totals, fees, roles and statuses are decided on the server for every request.
4. **Idempotent everything.** Payment callbacks, withdrawals and status changes can be repeated safely.
5. **Voice first, text always available.** Every screen works for people who struggle with reading, and every voice step has a typing fallback.
6. **Replaceable providers.** Payments, SMS, speech, language model, maps and storage sit behind interfaces.
7. **Observable by default.** Every order, payment and withdrawal can be traced end to end by an ID.
8. **Boring technology.** Proven tools that one developer can run at 2 a.m.

### 2.2 Technology stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language and framework | Java 21, Spring Boot 3 (Web, Security, Validation, Data JPA, Actuator) | Mature, strong typing, fits the team |
| Database | PostgreSQL 16, Flyway migrations | Transactions and constraints protect money data |
| Cache and limits | Redis | Rate limits, short-lived locks, shared cache across instances |
| Object storage | S3-compatible (Cloudflare R2, Backblaze B2, or AWS S3) | Video, audio and images via signed URLs |
| Client | React, TypeScript, Vite, Workbox service worker | One PWA codebase for customer, merchant and rider |
| Admin console | Same codebase, separate route group and bundle | Shared components, separate access |
| Payments | Safaricom Daraja (STK Push, callbacks, status query, later B2C), behind `PaymentProvider` | The rail users already use |
| Messaging | Africa's Talking (SMS and voice), Web Push, behind `NotificationChannel` | Reliable in Kenya |
| Speech and language | Hosted speech-to-text and an LLM with JSON output, behind interfaces | Swappable as quality improves |
| Maps | Leaflet and OpenStreetMap, browser geolocation, map links | Free, light on data |
| Hosting | Containers on a managed platform or VPS, GitHub Actions CI/CD | See Section 15 |
| Observability | Structured JSON logs, Prometheus metrics, Grafana, Sentry, uptime checks | See Section 16 |

### 2.3 Module responsibilities

| Module | Owns | Talks to |
| --- | --- | --- |
| Auth | Users, OTP, tokens, sessions, roles, admin MFA | Notifications (SMS), Redis (limits) |
| Catalogue | Merchants, shop pages, products, media, market zones | Voice, Object storage |
| Voice | Voice uploads, transcripts, extracted drafts | Speech to text, LLM, Catalogue |
| Basket and orders | Baskets, vendor orders, items, pricing, delivery fee, order state | Catalogue, Payments, Dispatch, Wallet |
| Payments | Payment attempts, callbacks, reconciliation, refunds | M-Pesa, Basket and orders, Wallet |
| Dispatch | Riders, availability, deliveries, stops, offers, codes, tracking | Basket and orders, Notifications |
| Wallet | Ledger, balances, withdrawals, settlements | Payments, Admin, M-Pesa (later) |
| Notifications | Alerts, templates, delivery tracking, fallbacks | Web Push, SMS provider |
| Admin | Approvals, monitoring, manual actions, audit log, metrics | All modules through service interfaces |

## 3. App shell and how the tabs interact

The app opens on the launch page with four tabs. Each tab serves one kind of person. Two are open to guests, two need an account.

LAUNCH PAGE: four tabs at the bottom of the screenDiscoverCustomer, guestShops and searchBasket, many shopsCheckout, M-PesaTrackCustomer, guestOrder timelineDelivery codeRecent ordersSellMerchant, accountHomeOrdersProductsShopEarnings, WithdrawRideRider, accountJobsActive deliveryEarnings, WithdrawProfileAdmin console (/admin), a separate sign-inOverview · Approvals · Orders · Payments · Withdrawals · Ledger · Refunds · Users · Metrics · Audit logAdmin is a separate sign-in, not a tab. Sell and Ride show their dashboard when signed in, and a sign-in page when not.

Figure 2. The four launch tabs and the screens inside each role

### 3.1 How the tabs work together

A single purchase touches every role. The tabs do not call each other directly. They react to events from the server, so each person always sees the current state.

Add itemsCustomer, DiscoverPay onceCustomer, CheckoutShops alertedSell, Orders tabParts readySell, mark readyJob offeredRide, Jobs tabCollect stopsRide, Active tabLive progressCustomer, TrackDeliveredRide, enter codeMoney creditedSell and Ride tabsWithdraw, paidAdmin, WithdrawalsYellow fill: customer. Plain: merchants and rider. Thick outline: admin. The curved line shows the flow continuing on the second row.

Figure 3. One purchase across the tabs, from basket to withdrawal

| Event on the server | Customer tabs | Merchant (Sell) | Rider (Ride) | Admin |
| --- | --- | --- | --- | --- |
| Basket paid | Track shows "Paid" and the delivery code | Orders: new order for each shop, push and SMS alert | Nothing yet | Payments list updates |
| Shop marks its part ready | Track: that shop shows "Ready" | Order moves to Ready | When all shops are ready, a job appears in Jobs | Orders timeline |
| Rider accepts | Track: rider first name and vehicle | Order shows the rider | Active tab opens with the stops | Orders timeline |
| Rider picks up at a shop | Track: shop shows "Picked up" | Order moves to Picked up | Next stop highlighted | Orders timeline |
| Rider enters correct code | Track: Delivered | Earnings credited | Earnings credited | Ledger entries created |
| Withdrawal requested | None | Earnings: Processing | Earnings: Processing | Withdrawals queue |
| Admin marks paid | None | SMS and Paid status | SMS and Paid status | Audit log row |

### 3.2 Navigation rules

* The last tab used is remembered on the device. First-time visitors land on Discover.
* A shop link (`/m/{slug}`) opens that shop directly. A tracking link (`/track/{token}`) opens that order directly. Both work without the tab bar.
* Sell and Ride show a short explanation and "Create account or sign in" when signed out.
* One phone number has one role. A signed-in merchant who opens Ride is told to use a different number.
* Tab badges show what needs attention: new orders on Sell, available jobs on Ride, an active order on Track.
* Each tab loads its own code on demand. Discover and Track are the lightest, since most customers only use them.

### 3.3 Role and tab access

| Tab or area | Guest | Merchant | Rider | Admin |
| --- | --- | --- | --- | --- |
| Discover, shop pages, basket, checkout | Yes | Yes (cannot buy from own shop) | Yes | Yes |
| Track | Own orders by link or device list | Yes | Yes | Yes |
| Sell dashboard | No | Own shop only | No | View through admin console |
| Ride dashboard | No | No | Approved riders only | View through admin console |
| Withdraw | No | Own balance | Own balance | Process requests |
| Admin console | No | No | No | Yes, with authenticator |

## 4. Domain model

The big change from the MVP is the **basket**. A customer pays for a basket. A basket contains one **vendor order** per shop. One **delivery** serves the whole basket, with one **stop** per vendor order. Money moves through a double-entry **ledger**, and **withdrawals** debit it.

usersidrolephonestatustoken\_versionmerchantsiduser\_idslugnamezone\_idstatusproductsidmerchant\_idnameprice\_kesin\_stockzonesidnamecentre\_latcentre\_lngradius\_mbasketsidtracking\_hashcustomer\_phonetotal\_kesstatuszone\_idvendor\_ordersidbasket\_idmerchant\_idsubtotal\_kesstatusready\_atorder\_itemsidvendor\_order\_idproduct\_idqtyunit\_price\_kespaymentsidbasket\_idamount\_kesstatusmpesa\_receiptdeliveriesidbasket\_idrider\_idfee\_kesstatuscode\_hmacdelivery\_stopsiddelivery\_idvendor\_order\_idseqstatusridersuser\_idvehiclestatusavailablelast\_seen\_atnotificationsiduser\_idchanneltypestatusledger\_accountsidowner\_typeowner\_idkindledger\_entriesidtxn\_idaccount\_idamount\_kesrefwithdrawalsidaccount\_idamount\_kesstatusmpesa\_refaudit\_logidadmin\_idactiontargetcreated\_atArrows show the main foreign-key links. payments, notifications and audit\_log also reference baskets, users and admins by ID.

Figure 4. Core entities and their links

### 4.1 Production schema (core tables)

Authentication tables (users, otp\_challenges, refresh\_tokens, auth\_events, admin\_backup\_codes, push\_subscriptions) are defined in Section 10. All IDs are UUIDs and all times are UTC. Money is stored as whole Kenyan shillings in integer columns.

```
CREATE TABLE zones (                       -- a market or neighbourhood where baskets are allowed
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL, centre_lat NUMERIC(9,6) NOT NULL, centre_lng NUMERIC(9,6) NOT NULL,
  radius_m INTEGER NOT NULL, active BOOLEAN NOT NULL DEFAULT true);

CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  slug VARCHAR(60) NOT NULL UNIQUE, business_name VARCHAR(120) NOT NULL,
  category VARCHAR(24) NOT NULL, zone_id UUID REFERENCES zones(id),
  location_text VARCHAR(200), lat NUMERIC(9,6), lng NUMERIC(9,6),
  intro_video_key TEXT, payout_phone VARCHAR(16) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ONBOARDING'
    CHECK (status IN ('ONBOARDING','PENDING_REVIEW','ACTIVE','SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  name VARCHAR(120) NOT NULL, unit VARCHAR(20), price_kes INTEGER NOT NULL CHECK (price_kes >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true, photo_key TEXT,
  source VARCHAR(8) NOT NULL DEFAULT 'VOICE', deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX ix_products_merchant ON products (merchant_id) WHERE deleted_at IS NULL;

CREATE TABLE riders (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  vehicle VARCHAR(16) NOT NULL, plate VARCHAR(16), selfie_key TEXT, id_photo_key TEXT,
  referee_name VARCHAR(80), referee_phone VARCHAR(16), area VARCHAR(80), payout_phone VARCHAR(16) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ONBOARDING'
    CHECK (status IN ('ONBOARDING','PENDING_APPROVAL','ACTIVE','SUSPENDED')),
  available BOOLEAN NOT NULL DEFAULT false, last_lat NUMERIC(9,6), last_lng NUMERIC(9,6), last_seen_at TIMESTAMPTZ);

CREATE TABLE baskets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_no VARCHAR(12) NOT NULL UNIQUE,           -- e.g. BZ-1042
  tracking_hash BYTEA NOT NULL UNIQUE,
  zone_id UUID NOT NULL REFERENCES zones(id),
  customer_name VARCHAR(80) NOT NULL, customer_phone VARCHAR(16) NOT NULL,
  dest_lat NUMERIC(9,6), dest_lng NUMERIC(9,6), landmark VARCHAR(200) NOT NULL,
  items_total_kes INTEGER NOT NULL, delivery_fee_kes INTEGER NOT NULL, total_kes INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN ('PENDING_PAYMENT','PAID','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), paid_at TIMESTAMPTZ, completed_at TIMESTAMPTZ);

CREATE TABLE vendor_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basket_id UUID NOT NULL REFERENCES baskets(id), merchant_id UUID NOT NULL REFERENCES merchants(id),
  subtotal_kes INTEGER NOT NULL, commission_kes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'AWAITING_PAYMENT'
    CHECK (status IN ('AWAITING_PAYMENT','PAID','READY','PICKED_UP','DELIVERED','REJECTED','CANCELLED')),
  ready_by TIMESTAMPTZ, ready_at TIMESTAMPTZ, picked_up_at TIMESTAMPTZ, reject_reason VARCHAR(120),
  UNIQUE (basket_id, merchant_id));

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id UUID NOT NULL REFERENCES vendor_orders(id), product_id UUID NOT NULL REFERENCES products(id),
  name_snapshot VARCHAR(120) NOT NULL, unit_price_kes INTEGER NOT NULL, qty INTEGER NOT NULL CHECK (qty > 0),
  line_total_kes INTEGER NOT NULL, status VARCHAR(12) NOT NULL DEFAULT 'OK' CHECK (status IN ('OK','UNAVAILABLE')));

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basket_id UUID NOT NULL REFERENCES baskets(id), provider VARCHAR(12) NOT NULL DEFAULT 'MPESA',
  amount_kes INTEGER NOT NULL, phone VARCHAR(16) NOT NULL,
  merchant_request_id VARCHAR(64), checkout_request_id VARCHAR(64) UNIQUE, mpesa_receipt VARCHAR(20) UNIQUE,
  status VARCHAR(12) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED','PENDING','SUCCEEDED','FAILED','TIMEOUT')),
  result_code INTEGER, result_desc VARCHAR(200), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ);

CREATE TABLE payment_callbacks (
  id BIGSERIAL PRIMARY KEY, checkout_request_id VARCHAR(64), raw_body JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(), processed_at TIMESTAMPTZ);

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basket_id UUID NOT NULL UNIQUE REFERENCES baskets(id), rider_id UUID REFERENCES riders(user_id),
  fee_kes INTEGER NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'UNASSIGNED'
    CHECK (status IN ('UNASSIGNED','ASSIGNED','COLLECTING','ON_THE_WAY','DELIVERED','FAILED')),
  code_hmac BYTEA NOT NULL, code_attempts SMALLINT NOT NULL DEFAULT 0,
  offered_at TIMESTAMPTZ, assigned_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ);

CREATE TABLE delivery_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id), vendor_order_id UUID NOT NULL REFERENCES vendor_orders(id),
  seq SMALLINT NOT NULL, status VARCHAR(12) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PICKED_UP','SKIPPED')),
  picked_up_at TIMESTAMPTZ, UNIQUE (delivery_id, seq));

-- Double-entry ledger
CREATE TABLE ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type VARCHAR(12) NOT NULL CHECK (owner_type IN ('MERCHANT','RIDER','BEEZ','CUSTOMER_FUNDS','PAYOUT_CLEARING')),
  owner_id UUID, kind VARCHAR(16) NOT NULL CHECK (kind IN ('AVAILABLE','HELD','PAYABLE','REVENUE','CASH')),
  UNIQUE (owner_type, owner_id, kind));
CREATE TABLE ledger_txns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), type VARCHAR(24) NOT NULL,
  ref_type VARCHAR(16), ref_id UUID, memo VARCHAR(200), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE ledger_entries (
  id BIGSERIAL PRIMARY KEY, txn_id UUID NOT NULL REFERENCES ledger_txns(id),
  account_id UUID NOT NULL REFERENCES ledger_accounts(id), amount_kes INTEGER NOT NULL,  -- credit +, debit -
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
-- Rule enforced in code and by a deferred constraint trigger: SUM(amount_kes) per txn = 0.

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), public_no VARCHAR(12) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id), account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  amount_kes INTEGER NOT NULL CHECK (amount_kes >= 100), payout_phone VARCHAR(16) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'REQUESTED'
    CHECK (status IN ('REQUESTED','PROCESSING','PAID','REJECTED','FAILED')),
  hold_txn_id UUID REFERENCES ledger_txns(id), paid_txn_id UUID REFERENCES ledger_txns(id),
  mpesa_ref VARCHAR(20), reason VARCHAR(200), processed_by UUID REFERENCES users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(), processed_at TIMESTAMPTZ);
-- Only one open request per user:
CREATE UNIQUE INDEX ux_withdrawal_open ON withdrawals (user_id) WHERE status IN ('REQUESTED','PROCESSING');

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), basket_id UUID NOT NULL REFERENCES baskets(id),
  vendor_order_id UUID REFERENCES vendor_orders(id), amount_kes INTEGER NOT NULL,
  reason VARCHAR(120) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','DONE')),
  mpesa_ref VARCHAR(20), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), done_at TIMESTAMPTZ);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, phone VARCHAR(16),
  channel VARCHAR(10) NOT NULL, type VARCHAR(32) NOT NULL, payload JSONB NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'PENDING', attempts SMALLINT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ, acked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY, admin_id UUID NOT NULL REFERENCES users(id), action VARCHAR(40) NOT NULL,
  target_type VARCHAR(20), target_id UUID, before JSONB, after JSONB, ip INET, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
```

### 4.2 Why a double-entry ledger?

Every movement of money is written as a set of entries that add up to zero. A customer payment moves money from "customer funds" to each shop, the rider and Beez. A withdrawal moves money from a user's available account to a hold and then to payout clearing. Because entries are never edited, the system can always answer "where did this shilling go?", and a user's balance is simply the sum of their account.

## 5. State machines

Four things move through states. The server enforces every transition, so a client can never skip a step.

BasketPENDING\_PAYMENTPAIDIN\_PROGRESSCOMPLETEDVendor orderAWAITING\_PAYMENTPAIDREADYPICKED\_UPDELIVEREDDeliveryUNASSIGNEDASSIGNEDCOLLECTINGON\_THE\_WAYDELIVEREDWithdrawalREQUESTEDPROCESSINGPAIDExits: CANCELLED or EXPIRED before payment, CANCELLED after a full refundExits: REJECTED or CANCELLED (shop cannot fill it), triggers a partial refundExit: FAILED (customer not found), handled by an adminExits: REJECTED or FAILED, the held amount returns to the balance

Figure 5. The four state machines, with their exit states

| Entity | From | To | Triggered by | Guard |
| --- | --- | --- | --- | --- |
| Basket | PENDING\_PAYMENT | PAID | Verified M-Pesa success | Amount matches basket total |
| Basket | PAID | IN\_PROGRESS | First stop picked up | Delivery assigned |
| Basket | IN\_PROGRESS | COMPLETED | Correct delivery code | All non-cancelled vendor orders picked up |
| Vendor order | PAID | READY | Merchant taps Ready | Caller owns the vendor order |
| Vendor order | PAID | REJECTED | Merchant taps Cannot fill | Within the ready window |
| Vendor order | READY | PICKED\_UP | Rider confirms pickup | Rider assigned to this delivery |
| Delivery | UNASSIGNED | ASSIGNED | Rider accepts | Atomic update, first rider wins |
| Delivery | COLLECTING | ON\_THE\_WAY | Last stop confirmed | Every active stop picked up or skipped |
| Delivery | ON\_THE\_WAY | DELIVERED | Correct 4-digit code | Fewer than 5 wrong tries |
| Withdrawal | REQUESTED | PROCESSING | Admin opens it, or automatic payout starts | Hold exists in the ledger |
| Withdrawal | PROCESSING | PAID | Admin enters M-Pesa reference | Recent authenticator check |

**Invariant.** The basket total always equals the sum of its vendor-order subtotals plus the delivery fee. Any change (a rejected shop, a removed item) writes a refund and a ledger reversal in the same database transaction as the status change.

## 6. The multi-vendor basket

Edma's example: someone does the week's grocery shopping from rice, vegetables, meat and fruit sellers, manages it all from the phone, and one delivery person brings it home. This section defines how that works.

### 6.1 Rules

| Topic | Rule |
| --- | --- |
| Where baskets are allowed | Only across shops in the same **zone** (a market or neighbourhood). Shops across town are separate baskets. This keeps one rider's route short and delivery times sensible |
| Pricing | The server prices every line from the database at checkout. Item totals, per-shop subtotals, delivery fee and basket total are computed once and stored |
| Delivery fee | `fee = base + per_extra_stop x (stops - 1) + per_km x ceil(max(0, km - free_km))`. Placeholder values: base KES 100, extra stop KES 40, free distance 3 km, KES 20 per km beyond. Stored in configuration and shown to the customer before payment |
| One payment | One STK Push for the basket total. The ledger splits it afterwards |
| One rider, one code | One delivery with one stop per shop and one 4-digit delivery code for the customer |
| Offering the job | The job is offered to riders once every active vendor order is READY. If a shop is late (past its ready window), the customer and admin are alerted |
| Stop order | The server proposes the shortest route (nearest shop first, then the customer). The rider can follow it or change it. The customer is always last |
| Ready window | Each shop has a deadline (for example 15 minutes) after payment, stored as `ready_by` |
| Basket limits | For example at most 6 shops and 40 items, and a weight guide by vehicle (a bicycle gets a smaller limit than a boda). Configurable |
| Own shop | A merchant cannot order from their own shop |

### 6.2 When something goes wrong

| Situation | What happens |
| --- | --- |
| A shop cannot fill its part | That vendor order becomes REJECTED. The customer is told and chooses within 5 minutes: wait for a replacement they pick, or take a partial refund. No choice means refund. The other shops continue |
| One item is out of stock | The item is marked UNAVAILABLE, the subtotal is reduced, and the difference is refunded |
| A shop is very late | After the ready window plus a grace period, the customer can drop that part with a refund, and the rider is released to continue |
| Rider cannot find the customer | The rider taps Customer not found. The delivery becomes FAILED and an admin decides: retry, return, or refund |
| Payment fails or times out | The basket stays PENDING\_PAYMENT, then becomes EXPIRED after 15 minutes. No shop is ever alerted |
| Basket cancelled before pickup | Full refund, ledger reversed, shops told |

### 6.3 Worked example

A customer buys from four shops. With a 5% commission (placeholder) and the placeholder delivery fee:

| Part | Goods | Commission | Shop receives |
| --- | --- | --- | --- |
| Mama Neema (rice, oil) | KES 650 | 33 | KES 617 |
| Mwanaisha Greens (tomatoes) | KES 200 | 10 | KES 190 |
| Baraka Butchery (beef) | KES 700 | 35 | KES 665 |
| Fatuma Fruits (oranges) | KES 150 | 8 | KES 142 |
| **Goods total** | **KES 1,700** | **86** | **KES 1,614** |
| Delivery, 4 stops: 100 + 3 x 40 | KES 220 to the rider | | |
| **Customer pays** | **KES 1,920** = 1,614 to shops + 220 to rider + 86 to Beez | | |

The ledger records this as one transaction when the basket is delivered. Until then, the money sits in "customer funds" and nobody can withdraw it.

### 6.4 What the basket changes in each tab

| Tab | Change from a single-shop order |
| --- | --- |
| Discover | Items from several shops can be added. A floating bar shows shops, items and total. Shops outside the zone are greyed out with an explanation |
| Track | Timeline shows each shop (Preparing, Ready, Picked up), then the rider's progress |
| Sell | The merchant sees only their own part, with the rider's name when assigned. Their earnings are credited only when the basket is delivered |
| Ride | The job card shows N pickups and the drop-off. The Active tab lists stops in order, each with a confirm button |
| Admin | Order detail shows every vendor order and stop. Manual actions work per part |

## 7. Checkout and payment

The customer builds a basket across shops, then pays once. Nothing reaches a shop or a rider until M-Pesa confirms the money.

CustomerBeez APIM-PesaShopsRider1 POST /public/basketsServer prices items, fee, total2 POST /baskets/{token}/pay3 STK Push (basket total)4 PIN prompt on phone5 callback: successVerify, mark PAID, create delivery, ledger6 push + SMS to each shop7 mark part READY8 job offer, N stops9 accept (first wins)10 collect at each shop11 confirm each pickup12 arrives, asks for code13 enter 4-digit code14 delivered, receiptLedger credits shops, rider and Beez

Figure 6. One multi-shop purchase from checkout to delivery

### 7.1 API contract

```
POST /api/v1/public/baskets                       (guest, rate limited)
{ "zoneId": "...", "lines": [ { "productId": "...", "qty": 2 }, { "productId": "...", "qty": 1 } ],
  "customer": { "name": "Amina", "phone": "0712345678" },
  "delivery": { "lat": -4.04, "lng": 39.66, "landmark": "Opposite the petrol station, Nyali" } }

201 Created
{ "basketNo": "BZ-1042", "trackingToken": "k3J...", "itemsTotalKes": 1700, "deliveryFeeKes": 220, "totalKes": 1920,
  "vendors": [ { "merchantId": "...", "name": "Mama Neema", "subtotalKes": 650 }, ... ] }

POST /api/v1/public/baskets/{trackingToken}/pay   -> 202 { "paymentId": "...", "status": "PENDING" }
GET  /api/v1/public/baskets/{trackingToken}       -> status, vendors[], delivery{rider, stops[]}, code (only after paid)
```

Errors: `zone_mismatch` (a shop is outside the zone), `out_of_stock`, `shop_closed`, `limit_exceeded`, `rate_limited`, `invalid_phone`. Prices sent by the client are ignored.

### 7.2 M-Pesa STK Push

1. Create the payment row with status INITIATED. Get an OAuth token from Daraja (cached until it expires).
2. Send the STK Push request with the shortcode, a timestamp-based password, the amount (whole shillings), the customer phone in international format, the callback URL (with a secret path segment), and the basket number as the reference. Save `MerchantRequestID` and `CheckoutRequestID`, then set PENDING.
3. The customer approves on their phone. M-Pesa posts the result to the callback.
4. The callback handler stores the raw body, returns 200 at once, and processes it once (Section 7.3).
5. A background job queries any payment still PENDING after 2 minutes and settles it as SUCCEEDED, FAILED or TIMEOUT.

Confirm the exact request fields, callback format, callback source addresses and any new Safaricom requirements in the current Daraja documentation before building. They change over time.

### 7.3 Processing a success callback (one database transaction)

```
1. Find payment by CheckoutRequestID. If SUCCEEDED already: return (idempotent).
2. Verify with the transaction status query (do not trust the callback body alone).
3. Check amount == basket.total_kes and phone matches. If not: flag for admin, do not mark paid.
4. payment: SUCCEEDED, store mpesa_receipt.
5. basket: PAID. vendor_orders: PAID, set ready_by = now + ready window.
6. delivery: create UNASSIGNED with fee and HMAC of the generated 4-digit code.
7. ledger txn CUSTOMER_PAYMENT: CASH -total, CUSTOMER_FUNDS +total.
8. outbox: notifications for each shop, SMS receipt to customer.
Commit. Notifications are sent after commit by the outbox worker.
```

### 7.4 Safeguards

* **Idempotency.** A unique constraint on `checkout_request_id` and `mpesa_receipt`. A client-supplied `Idempotency-Key` header prevents double baskets on a retry.
* **Spam control.** Maximum 3 unpaid baskets per phone per hour, one STK Push per basket per 60 seconds, per-IP limits.
* **Reconciliation.** A daily job compares Beez payments with the M-Pesa statement. Differences go to the admin Payments tab.
* **Orphan payments.** Money received with no matching basket is flagged for manual handling and refund.
* **Refunds.** Each refund is a row and a ledger reversal. In the first phase an admin sends the money back by hand and records the reference. Later this can use the M-Pesa reversal or payout APIs, subject to Safaricom approval.

### 7.5 Customer without an account

The tracking token (128 bits or more, stored hashed) is the customer's key to this basket. The device also remembers recent tokens so the Track tab lists recent orders. See Section 10.4.

## 8. Delivery and dispatch

### 8.1 Rider availability and location

* A rider switches AVAILABLE or OFFLINE in the Jobs tab. When available, the app sends the rider's location about every 15 seconds while it is open (`POST /riders/me/location`).
* A rider counts as near only if their last location is under 2 minutes old.

### 8.2 Offering a job

1. When every active vendor order of a basket is READY, the delivery becomes offerable.
2. The server selects approved, available riders within a radius of the zone centre (start at 3 km, widen to 6 km after 2 minutes) ordered by distance.
3. They receive a push alert and the job appears in Jobs with number of stops, distance and fee.
4. The first accept wins, using one atomic update:

```
UPDATE deliveries SET rider_id = :rider, status = 'ASSIGNED', assigned_at = now()
 WHERE id = :id AND rider_id IS NULL AND status = 'UNASSIGNED';   -- 0 rows updated = "job was taken"
```

5. If no rider accepts within 5 minutes, widen the radius, re-alert, and notify the admin after 10 minutes.

### 8.3 The stops

* The Active tab lists one stop per shop, then the customer. Each stop shows shop name, landmark, map link and call button.
* At a shop, the rider checks the goods and taps Picked up. That stop becomes PICKED\_UP and the shop is told.
* When the last stop is picked up, the delivery becomes ON\_THE\_WAY and the customer sees it.
* If a shop is not ready or has refused, the rider taps Skip stop, which the server accepts only for REJECTED or cancelled parts.

### 8.4 Delivery code

* A 4-digit code is generated at payment time, stored only as an HMAC, and shown to the customer.
* The rider enters it at drop-off. At most 5 wrong attempts, then the delivery locks and an admin is alerted. Success records the rider, time and position.
* The merchant never sees the code.

### 8.5 Tracking

The customer page polls every 10 seconds for status and, once ON\_THE\_WAY, the rider's last known location (rounded). If load grows, replace polling with Server-Sent Events without changing the data model.

### 8.6 Service targets

| Measure | Target in the pilot |
| --- | --- |
| Shop marks part ready | Within 15 minutes of payment |
| Rider accepts a job | Within 5 minutes of the offer |
| Delivery after last pickup | Within 30 minutes |
| Failed deliveries | Under 3% |

## 9. Wallet, ledger and withdrawals

Merchants and riders earn inside Beez and move the money to M-Pesa with a **Withdraw** button on their Earnings tab. Admins process requests.

Merchant or riderBeez APISMSAdminM-Pesa1 request withdrawal code2 send 6-digit code3 code arrives4 POST /withdrawals {amount, code}Check balance, rules, limits. Ledger: AVAILABLE to HELD5 appears in Withdrawals queue6 send money (manual, phase 1)7 mark paid + M-Pesa referenceLedger: HELD out, CASH out. Audit row8 SMS: paid, with referenceAlt: reject with reasonLedger: HELD back to AVAILABLE

Figure 7. A withdrawal, from request to payout (phase 1, manual payout)

### 9.1 Accounts

| Account | Owner | Meaning |
| --- | --- | --- |
| AVAILABLE | Each merchant and rider | Money the person can withdraw |
| HELD | Each merchant and rider | Money in a pending withdrawal |
| CUSTOMER\_FUNDS | Beez | Customer money received but not yet earned by anyone (before delivery) |
| REVENUE | Beez | Commissions kept by Beez |
| CASH | Beez | The Beez M-Pesa account, mirrored in the books |
| PAYOUT\_CLEARING | Beez | Used when automatic payouts are in flight (phase 2) |

Convention: credits are positive and debits negative, and every transaction sums to zero. The balance of a liability account is the sum of its entries.

| Event | Entries |
| --- | --- |
| Customer pays KES 1,920 | CASH -1920, CUSTOMER\_FUNDS +1920 |
| Basket delivered (example in Section 6.3) | CUSTOMER\_FUNDS -1920, merchants AVAILABLE +617, +190, +665, +142, rider AVAILABLE +220, REVENUE +86 |
| Merchant requests KES 3,850 | merchant AVAILABLE -3850, merchant HELD +3850 |
| Admin pays it | merchant HELD -3850, CASH +3850 (cash leaves) |
| Admin rejects it | merchant HELD -3850, merchant AVAILABLE +3850 |
| Customer refund (partial, KES 150) | If before delivery: CUSTOMER\_FUNDS -150, CASH +150. If after delivery: reverse the shop credit and Beez fee |

### 9.2 When earnings become available

Earnings are credited when the basket is DELIVERED. Optionally, they become withdrawable after a short hold (for example 24 hours) to cover disputes. The hold is a configuration value, and the ledger simply credits to AVAILABLE after that time.

### 9.3 Withdrawal rules (starting values)

| Rule | Value |
| --- | --- |
| Minimum | KES 100 |
| Maximum per request | Available balance, with a daily cap per user (for example KES 20,000) |
| Open requests | One per user at a time (enforced by a unique index) |
| Destination | The user's registered payout number |
| Confirmation | 6-digit SMS code at request time |
| Payout number changes | Take effect after 24 hours, with an SMS to the old and new numbers |
| Payout time | Within one business day in the pilot |
| Transfer charge | Absorbed by Beez in the pilot (decision to confirm) |

### 9.4 API

```
POST /api/v1/withdrawals/code            (auth) sends the confirmation SMS
POST /api/v1/withdrawals                 (auth) { "amountKes": 3850, "code": "482913" }  -> 201 { "no": "W-101", "status": "REQUESTED" }
GET  /api/v1/withdrawals/me              (auth) list with statuses
GET  /api/v1/earnings/me                 (auth) available, held, delivered this week, history

GET  /api/v1/admin/withdrawals?status=REQUESTED
POST /api/v1/admin/withdrawals/{id}/pay      { "mpesaRef": "SJK70X1B5" }     (recent authenticator code required)
POST /api/v1/admin/withdrawals/{id}/reject   { "reason": "Number mismatch" } (recent authenticator code required)
```

### 9.5 Request handling (one transaction)

```
1. Verify the SMS code (single use, 5 tries).
2. Lock the user's AVAILABLE account row. balance = SUM(entries). Reject if amount > balance.
3. Check minimum, daily cap, and that no open withdrawal exists.
4. Insert ledger txn WITHDRAWAL_HOLD: AVAILABLE -amount, HELD +amount.
5. Insert withdrawal (REQUESTED) referencing the hold txn. Commit.
6. Outbox: admin alert, user confirmation.
```

### 9.6 Paying a withdrawal

**Phase 1 (manual).** The admin sends the money from the Beez M-Pesa account to the user's number, then marks the request paid with the reference. The system writes the ledger entries, stores who did it, writes an audit row, and sends an SMS. Rejection returns the held amount and records a reason.

**Phase 2 (automatic).** After Safaricom approves business-to-customer payouts for the account, the system calls the payout API, moves the request to PROCESSING, and waits for the result callback. On success it marks PAID. On failure it retries safely once, then returns the hold and alerts an admin. Large amounts can require admin approval before the call. M-Pesa returns the receiver's registered name, which can be compared with the Beez name as a fraud check.

### 9.7 Controls

* Every payout action needs a recent authenticator code and writes an audit row.
* Two-person approval for amounts above a threshold (for example KES 20,000).
* Daily reconciliation: total of PAID withdrawals equals cash out in the M-Pesa statement. Any difference raises an alert.
* Velocity checks: alert on many withdrawals soon after a payout number change, or many accounts paid to one number.
* Balances come only from the ledger. There is no editable balance column.

### 9.8 Customer-facing and user-facing messages

| Event | Message |
| --- | --- |
| Request accepted | "We got your withdrawal of KES 3,850. We will pay you on M-Pesa, usually within a day." |
| Paid | "Paid KES 3,850 to your M-Pesa. Reference SJK70X1B5." |
| Rejected | "We could not pay your withdrawal: [reason]. The money is back in your balance." |

## 10. Authentication and authorization

*Authentication* answers "who are you?" and *authorization* answers "what may you do?". Both are enforced on the server. This section is the full authentication design, merged into the architecture.

### 10.1 One method per kind of risk

| Actor | Method | Session | Why |
| --- | --- | --- | --- |
| Merchant, rider | Phone number + 6-digit SMS code (voice call fallback) | Access token 15 min + rotating refresh cookie about 60 days | No password to forget, phone already tied to M-Pesa |
| Customer | None. M-Pesa payment proves the phone. A random link grants access to one basket | Capability token per basket | Zero friction at checkout |
| Admin | Email + password + authenticator code | About 8 hours, no long refresh | Highest privilege, strongest method |
| M-Pesa and SMS callbacks | Secret path, HTTPS, status verification | None | Machine to machine |

Phone (PWA)Beez APISMS providerDatabase1 POST /auth/otp/requestNormalise, rate limit, make code2 store HMAC of code, expiry3 send SMS4 code arrives5 POST /auth/otp/verifyAttempts + 1, constant-time compare6 find or create user, store refresh hash7 access token + refresh cookie8 later: POST /auth/refresh9 rotated: new tokens10 old token replayed11 401, whole family revoked

Figure 8. Sign-in with a phone code, silent refresh, and replay detection

### 10.2 Authentication tables

```
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(16) NOT NULL CHECK (role IN ('MERCHANT','RIDER','ADMIN')),
  phone VARCHAR(16) UNIQUE, email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), totp_secret_enc BYTEA,
  display_name VARCHAR(120), language VARCHAR(5) NOT NULL DEFAULT 'sw',
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING','ACTIVE','SUSPENDED','DELETED')),
  token_version INTEGER NOT NULL DEFAULT 0, failed_logins INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_login_at TIMESTAMPTZ,
  CHECK ((role='ADMIN' AND email IS NOT NULL AND password_hash IS NOT NULL) OR (role<>'ADMIN' AND phone IS NOT NULL)));

CREATE TABLE otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), phone VARCHAR(16) NOT NULL,
  purpose VARCHAR(16) NOT NULL DEFAULT 'LOGIN',          -- LOGIN or WITHDRAWAL
  code_hmac BYTEA NOT NULL, channel VARCHAR(8) NOT NULL DEFAULT 'SMS',
  attempts SMALLINT NOT NULL DEFAULT 0, max_attempts SMALLINT NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ, requested_ip INET, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL, token_hash BYTEA NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
  rotated_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ, created_ip INET, user_agent VARCHAR(255), created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE auth_events (
  id BIGSERIAL PRIMARY KEY, user_id UUID, phone_mask VARCHAR(20), event_type VARCHAR(32) NOT NULL,
  ip INET, user_agent VARCHAR(255), meta JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE admin_backup_codes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), code_hash BYTEA NOT NULL, used_at TIMESTAMPTZ);
CREATE TABLE push_subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
```

### 10.3 Merchant and rider sign-in

1. **Request.** The phone is normalised to +254 form and checked against the rate limits. The server stores an HMAC of a random 6-digit code and sends it by SMS. The reply is identical whether or not the number has an account.
2. **Verify.** The attempt counter goes up first, then the code is compared in constant time. A correct code is consumed. The user is found or created. Riders start PENDING\_APPROVAL, merchants start ONBOARDING.
3. **Tokens.** A 15-minute access token (JSON body) and a rotating refresh token (HttpOnly cookie).
4. **Refresh.** Each use rotates the token. If an old token appears again, the whole family is revoked and an alert is raised.

| OTP setting | Value |
| --- | --- |
| Code | 6 digits from `SecureRandom`, valid 5 minutes, single use, 5 attempts |
| Stored as | HMAC-SHA256(secret key, challengeId + ":" + code). Never plain or plain-hashed |
| Resend | After 60 seconds. A new code invalidates earlier ones |
| Voice fallback | "Call me with my code": an automated call reads the digits twice, slowly |
| Allowed numbers | Kenyan mobile numbers (+254) while Kenya is the only market |

### 10.4 Customers without accounts

* The tracking token is at least 128 random bits, shown once and sent by SMS, and stored only as a SHA-256 hash.
* It opens one basket. Phone numbers of other people are masked. Responses are not cached and do not send a referrer.
* It stays valid for 7 days after delivery. The device keeps recent tokens so the Track tab can list recent orders.
* **Spam controls:** at most 3 unpaid baskets per phone per hour, one STK Push per basket per 60 seconds, per-IP limits, and an invisible challenge that is switched on only if abuse appears.
* **Delivery code:** four digits, HMAC-stored, 5 attempts, then lock and alert.

### 10.5 Tokens and sessions

|  | Access token | Refresh token |
| --- | --- | --- |
| Format | Signed JWT (claims: sub, role, mid or rid, ver, jti, iss, aud, iat, exp) | Opaque 256-bit random value |
| Lifetime | 15 minutes | 60 days sliding, 180 days hard cap |
| Stored in the browser | Memory only | HttpOnly, Secure, SameSite=Lax cookie, path /api/v1/auth |
| Stored on the server | No, but `ver` is checked against the user's token\_version | SHA-256 hash, family ID, rotation timestamps |
| Revoking | Bump token\_version (suspension, logout everywhere) | Revoke the family |

* Signing: HS256 with a 256-bit secret and a `kid` header for rotation, or EdDSA if more services appear. Reject `alg: none`.
* The cookie endpoints require a custom header (`X-Beez-Client: pwa`), an Origin check and no-store caching, which protects them from cross-site requests.
* The PWA refreshes once with a single-flight lock, so several tabs do not trigger reuse detection.

### 10.6 Admin authentication

* No public sign-up. The first admin is created by a seed command.
* Argon2id (or BCrypt cost 12+) passwords, at least 12 characters, checked against common-password lists.
* TOTP authenticator with encrypted secrets and 8 single-use backup codes.
* Lock for 15 minutes after 5 wrong passwords, doubling on repeats. One generic error for wrong email or password.
* Sensitive actions (approve, suspend, mark paid, refund) need a fresh authenticator code within 10 minutes and write an audit row.

### 10.7 Authorization

| Control | How it is enforced |
| --- | --- |
| Role gates | Route rules and `@PreAuthorize` by role |
| Ownership | Queries are scoped by the caller: `findByIdAndMerchantId(id, principal.merchantId())`. Another person's record returns 404, never 403 |
| Status gates | Merchants must be ACTIVE and approved to be public. Riders must be ACTIVE, available and recently located to see jobs |
| State machine | Only valid transitions (Section 5), checked in the service |
| Atomic claims | Job acceptance and withdrawals use single conditional updates or locked rows |
| Admin power | Separate route group, authenticator freshness, audit log |

```
http.csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
  .authorizeHttpRequests(a -> a
     .requestMatchers("/api/v1/auth/otp/**","/api/v1/auth/refresh","/api/v1/auth/admin/login","/api/v1/auth/admin/mfa").permitAll()
     .requestMatchers("/api/v1/public/**","/webhooks/mpesa/**").permitAll()
     .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
     .requestMatchers("/api/v1/riders/**").hasAnyRole("RIDER","ADMIN")
     .requestMatchers("/api/v1/merchants/**").hasAnyRole("MERCHANT","ADMIN")
     .anyRequest().authenticated())
  .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
```

### 10.8 Rate limits

| Target | Limit |
| --- | --- |
| Login codes per phone | 5 per hour, 10 per day, 1 per 60 seconds |
| Login codes per IP | 20 per hour |
| Code guesses | 5 per code, 15 per phone per hour |
| Withdrawal codes | 3 per hour per user |
| Admin passwords | 5 then a 15-minute lock |
| Baskets per phone, unpaid | 3 per hour |
| Tracking lookups | 60 per minute per IP |
| Delivery code attempts | 5 per delivery |
| Daily SMS spend | A hard cap with alerts |

### 10.9 Machine-to-machine callbacks

The M-Pesa callback is protected by a secret path segment, HTTPS, an optional source address allow-list from Safaricom's current documentation, and above all by verification: after a success callback the server queries the transaction status and checks amount and reference before marking anything paid. Callbacks are stored raw and processed once.

### 10.10 Low-literacy sign-in

* Big two-button language choice with a speaker icon, remembered on the device.
* Phone entry with a large numeric keypad and automatic formatting. Code entry in six big boxes with autofill (`autocomplete="one-time-code"` and WebOTP).
* "Listen" buttons, the voice-call code, short messages with icons, no text puzzles.
* Long sessions, so most users rarely see the code screen again.

### 10.11 Authentication error codes

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | invalid\_phone, invalid\_code, code\_expired | Bad number, wrong code (with attempts left), expired code |
| 401 | unauthenticated, refresh\_invalid, refresh\_reused | No valid token, bad refresh, reuse detected and family revoked |
| 403 | forbidden, account\_pending | Role not allowed, rider not yet approved |
| 404 | not\_found | Missing or not yours |
| 409 | role\_conflict | Phone already registered under another role |
| 423 | delivery\_locked | Too many wrong delivery codes |
| 429 | rate\_limited, too\_many\_attempts | Limits hit, with retry time |
| 503 | sms\_unavailable | Provider failure or daily cap |

## 11. Voice pipeline

Voice is the heart of Beez: merchants say what they sell, and the system turns it into a product list. The same pipeline serves onboarding and the Products tab.

Record audioUpload (signed URL)Speech to textLLM extractionValidateRead back aloudMerchant confirmsPublish productsNothing goes live until the merchant confirms. Audio and text are kept (with consent) to improve accuracy.

Figure 9. From spoken words to a published product list

| Step | Detail |
| --- | --- |
| Record | Browser `MediaRecorder` (Opus), up to 60 seconds, language hint from the user's setting. Shows a level meter |
| Upload | Direct to object storage with a signed URL. The API creates a `voice_upload` row (UPLOADED) |
| Speech to text | Provider interface `SpeechToText.transcribe(audio, languageHint)`. Swahili and English first. Provider chosen by testing on real recordings |
| Extraction | LLM called with a strict JSON schema: product name, optional unit, price in KES, confidence. Handles code-switching, number words and Sheng |
| Validation | Reject negative or absurd prices, merge duplicates, flag low confidence rows, normalise units |
| Read back | The list is shown as text and read aloud so people who cannot read well can still check it |
| Confirm | Merchant edits or deletes rows and taps Publish. Only then do products go live |
| Fallback | If recognition fails twice, offer typing or a helper. Never block a merchant |

```
{ "products": [ { "name": "Sugar", "unit": "kg", "priceKes": 180, "confidence": 0.93 },
                { "name": "Flour", "unit": "kg", "priceKes": 140, "confidence": 0.91 } ],
  "unparsed": [] }
```

### 11.1 Quality and cost control

* Measure per recording: edits made by the merchant, rows deleted, time to confirm. These are the accuracy numbers that matter.
* Keep a test set of at least 50 real merchant recordings in Swahili, English and mixed speech, and rerun it for every provider or model change.
* Limit uploads per merchant per day and cap audio length to control cost.
* Store audio and transcripts only with consent shown at the first voice step, and delete on request.
* Language support grows one language at a time behind the same interface.

## 12. Notifications

All alerts go through one outbox: a notification row is written in the same transaction as the event, and a worker sends it after commit. This means no alert is lost and none is sent for a rolled-back change.

| Event | To | Channels | Fallback |
| --- | --- | --- | --- |
| Basket paid | Each shop | Web Push | SMS if not acknowledged within 60 seconds |
| Basket paid | Customer | SMS receipt with tracking link and delivery code | None |
| Delivery offerable | Nearby riders | Web Push and Jobs list | Wider radius after 2 minutes |
| Rider assigned, each pickup, on the way | Customer | Track page, SMS for key steps | None |
| Shop late or rejected | Customer | Track page and SMS | None |
| Delivered | Customer, shops, rider | Track page, dashboards | None |
| Shop or rider approved or rejected | The person | SMS and push | None |
| Withdrawal requested, paid, rejected | The person (and admin for new requests) | SMS and dashboard | None |
| Security: new device, number change, refresh reuse | The person and admin | SMS | None |

* Each notification stores status, attempts, sent and acknowledged times. Retries use backoff, up to 3 times.
* Push subscriptions belong to the signed-in user, and are removed on logout or when another user signs in on the same browser.
* SMS templates are short, in the user's language, and never contain full phone numbers or secrets, except the one-time codes themselves.
* Quiet hours apply to non-urgent messages. Order alerts are always sent.

## 13. API catalogue

REST with JSON, versioned under `/api/v1`. Errors use one shape: `{ "error": "code", "message": "...", "details": {}, "requestId": "..." }`. Lists are paginated with a cursor. Money is always whole KES in `*Kes` fields. State-changing calls accept an `Idempotency-Key` header.

### 13.1 Public (guest)

| Method and path | Who | Purpose |
| --- | --- | --- |
| `GET /public/zones` | Guest | Markets and neighbourhoods served |
| `GET /public/shops?zone=&category=&q=` | Guest | Browse and search shops |
| `GET /public/m/{slug}` | Guest | Shop page: details, video, products |
| `POST /public/baskets` | Guest | Create a basket across shops, get totals |
| `POST /public/baskets/{token}/pay` | Guest | Start M-Pesa payment |
| `GET /public/baskets/{token}` | Token | Status, vendors, rider, stops, code |
| `POST /public/baskets/{token}/items/{id}/decision` | Token | Choose replacement or refund for a missing item |

### 13.2 Authentication

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /auth/otp/request`, `/auth/otp/verify` | Public | Phone code sign-in |
| `POST /auth/refresh`, `/auth/logout`, `/auth/logout-all` | Cookie or user | Session control |
| `GET /auth/me` | User | Current user, role, status |
| `POST /auth/admin/login`, `/auth/admin/mfa` | Public | Admin sign-in with authenticator |
| `POST /push/subscribe`, `DELETE /push/subscribe` | User | Web Push subscription |

### 13.3 Merchant

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /merchants`, `PATCH /merchants/me` | Merchant | Create and edit the shop |
| `POST /merchants/me/video/upload-url`, `/video/confirm` | Merchant | Intro video upload |
| `POST /voice-products`, `POST /voice-products/{id}/confirm` | Merchant | Voice to product list, then confirm |
| `GET/POST /merchants/me/products`, `PATCH/DELETE /products/{id}` | Merchant | Manage products, stock switch |
| `GET /merchants/me/orders?status=` | Merchant | Own vendor orders |
| `POST /vendor-orders/{id}/ready`, `/reject` | Merchant | Ready for pickup, or cannot fill |
| `POST /notifications/{id}/ack` | Merchant | Acknowledge an alert |
| `GET /earnings/me` | Merchant, rider | Balances and history |

### 13.4 Rider

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /riders`, `PATCH /riders/me` | Rider | Register and edit |
| `POST /riders/me/availability`, `/location` | Rider | Online or offline, position |
| `GET /riders/me/jobs` | Rider (approved) | Open offers |
| `POST /deliveries/{id}/accept` | Rider | Take a job (first wins) |
| `POST /deliveries/{id}/stops/{stopId}/pickup`, `/skip` | Rider | Confirm or skip a shop stop |
| `POST /deliveries/{id}/deliver` | Rider | Enter the 4-digit code |
| `POST /deliveries/{id}/not-found` | Rider | Customer cannot be found |

### 13.5 Wallet

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /withdrawals/code`, `POST /withdrawals` | Merchant, rider | Confirmation code, then request |
| `GET /withdrawals/me` | Merchant, rider | Own requests |

### 13.6 Admin

| Method and path | Who | Purpose |
| --- | --- | --- |
| `GET /admin/overview`, `/admin/metrics` | Admin | Health and charts |
| `GET /admin/approvals`, `POST /admin/merchants/{id}/approve|reject`, `/admin/riders/{id}/approve|reject` | Admin | Approvals |
| `GET /admin/baskets`, `POST /admin/deliveries/{id}/confirm` | Admin | Monitor and manual actions |
| `GET /admin/payments`, `GET /admin/ledger/unsettled` | Admin | Money in and balances |
| `GET /admin/withdrawals`, `POST /admin/withdrawals/{id}/pay|reject` | Admin | Withdrawal queue |
| `GET /admin/refunds`, `POST /admin/refunds/{id}/done` | Admin | Refunds |
| `POST /admin/users/{id}/suspend|restore|logout-all` | Admin | Account control |
| `GET /admin/audit` | Admin | Audit log |

### 13.7 Webhooks

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /webhooks/mpesa/{secret}/stk` | Safaricom | STK Push result |
| `POST /webhooks/mpesa/{secret}/payout` | Safaricom | Payout result (phase 2) |
| `POST /webhooks/sms/{secret}` | SMS provider | Delivery reports |

## 14. Admin console architecture

The admin console is a separate route group and bundle in the same codebase, served under `/admin` and protected by email, password and an authenticator code. It reads through the same services as the apps and never touches tables directly.

| Tab | Reads | Actions (all audited) |
| --- | --- | --- |
| Overview | Orders today, paid value, active shops and riders, delivery time, failures, items needing attention | Jump to work queues |
| Approvals | Merchants and riders waiting, photos, referee details | Approve, reject with reason |
| Orders | Baskets with vendor orders, stops, timeline | Confirm delivery, cancel, reassign rider, handle failed delivery |
| Payments | Payment attempts, receipts, stuck and orphan payments | Re-check status, link to basket |
| Withdrawals | Queue by status | Mark paid with reference, reject with reason |
| Ledger | Balances per merchant, rider and Beez, transactions | View only (corrections are new reversing entries) |
| Refunds | Pending and done refunds | Mark refunded with reference |
| Users | Merchants and riders, status, last seen | Suspend, restore, sign out everywhere |
| Metrics | Onboarding funnel, orders, repeat customers, delivery times | None |
| Audit log | Every admin action with before and after | None (append only) |

* Sensitive actions require a fresh authenticator code. High-value payouts need a second admin.
* Admin roles can be split later (support, finance, super admin) using the same role mechanism.
* Exports (CSV) are allowed only to finance admins and are logged.

## 15. Infrastructure and deployment

UsersPhones, laptopsCloudflareDNS, CDN, WAF, TLSLoad balancerHealth checksAPPLICATION TIER (containers, 2 or more instances)Beez APISpring Boot, statelessBeez APISecond instanceWorkerJobs, outbox, schedulersStatic PWA filesServed from CDN cacheZero-downtime deploys: start new instances, wait for health, then drain the old onesSecrets from a secrets manager or environment, never in the imageRate limits and short locks live in Redis so all instances agreeDATA TIERPostgreSQL primaryManaged, daily snapshotsRead replicaReports, admin queriesRedisLimits, cache, locksObject storageVideo, audio, imagesPoint-in-time recovery for PostgreSQL. Backups encrypted and copied to a second provider.DELIVERY AND OPERATIONSGitHub ActionsBuild, test, scanContainer registryVersioned imagesGrafana + PrometheusMetrics and alertsSentry + log storeErrors and logs

Figure 10. Production deployment layout

### 15.1 Environments

| Environment | Purpose | Data | Providers |
| --- | --- | --- | --- |
| Local | Development with Docker Compose | Fake data | Fake SMS, mocked M-Pesa |
| Staging | Full rehearsal, every merge | Test data | M-Pesa sandbox, SMS sandbox |
| Production | Real users | Real data | Live providers |

### 15.2 Pipeline

1. Pull request: build, unit and integration tests (Testcontainers with PostgreSQL), dependency and secret scans, lint.
2. Merge to main: build the image, push to the registry, deploy to staging, run smoke tests.
3. Tagged release: manual approval, deploy to production with rolling update, run smoke tests, automatic rollback on failed health checks.
4. Database changes: Flyway migrations written to be backward compatible (add, then migrate, then remove), so old and new instances can run together.

### 15.3 Scaling path

| Stage | Scale | Setup | Rough monthly cost (to verify) |
| --- | --- | --- | --- |
| Pilot | Under 50 merchants, 100 orders a day | One small VPS with Docker Compose, managed or single PostgreSQL with nightly backups, object storage | About USD 20 to 40, plus usage-based speech, LLM and SMS |
| Early growth | Hundreds of merchants, thousands of orders a day | Two app instances, managed PostgreSQL, Redis, CDN, monitoring | A few hundred USD |
| Scale | Multiple cities or countries | Autoscaled containers, read replicas, partitioned ledger and events tables, extract the heaviest module if needed | Grows with volume and compliance needs |

The architecture does not change between stages. Only the number of instances and the managed services around it do. Prices change often, so confirm current provider pricing before budgeting.

### 15.4 Resilience

* Health endpoints for liveness and readiness. The load balancer removes unhealthy instances.
* Outbox and retries mean provider outages delay alerts but do not lose them.
* If SMS is down, users with a session keep working and new sign-ins use the voice-call fallback. If M-Pesa is down, checkout shows a clear message and no basket is created.
* Backups are restored and tested every quarter. Target recovery point under 15 minutes and recovery time under 2 hours for the pilot.

## 16. Observability and operations

| Area | What to collect | Alert when |
| --- | --- | --- |
| Availability | Uptime checks on the app and API, response times, error rate | Down for 2 minutes, error rate above 2% |
| Payments | STK Push sent, succeeded, failed, pending age, callback lag, orphan payments | Success rate drops sharply, a payment is pending over 10 minutes, any orphan payment |
| Orders and delivery | Time to ready, to accept, to deliver, failed deliveries, jobs with no rider | A job unaccepted for 10 minutes, a shop past its ready window |
| Wallet | Requests, time to pay, ledger imbalance checks, daily reconciliation result | Any ledger transaction that does not sum to zero, a request unpaid over 24 hours, reconciliation mismatch |
| Auth | OTP requests and failures, refresh reuse, admin logins | OTP spike, any refresh reuse, admin login from a new location, SMS spend near the cap |
| Voice | Latency, failures, edits per recording | Failure rate above 10%, edits per recording rising |
| Infrastructure | CPU, memory, database connections, disk, queue depth | Resource pressure, replica lag |

* **Logs:** structured JSON with a request ID and the basket, payment or withdrawal ID. Phones are masked and secrets are redacted.
* **Tracing:** a basket ID follows one purchase through all modules, so support can see the whole story in one search.
* **Runbooks:** short pages for the common problems: payment stuck, rider not accepting, SMS provider down, ledger mismatch, withdrawal disputed, account takeover report.
* **On call:** in the pilot, one named person with alerts to their phone and a backup contact.

## 17. Security and privacy

| Threat | Main defences |
| --- | --- |
| Account takeover | OTP limits, HMAC-stored codes, rotating refresh tokens with reuse detection, payout number change delay |
| SMS cost abuse | Country allow-list, per-phone and per-IP limits, daily cap, alerts |
| Forged payments | Secret callback path, status query before marking paid, amount and reference checks, idempotency |
| Cross-account access | Ownership-scoped queries returning 404, role gates, tests for every endpoint |
| Theft through withdrawals | SMS confirmation, one open request, daily caps, admin authenticator, two-person approval above a threshold, reconciliation |
| Delivery fraud | Delivery code with attempt limit, GPS and event records, rider vetting with ID and referee |
| Data leak | Hashes for codes and tokens, encrypted TOTP secrets, masked logs, encrypted backups, least-privilege database users |
| Web attacks | CSP, HSTS, no tokens in storage, CSRF controls on cookie endpoints, input validation, dependency scanning |
| Insider misuse | Audit log, separation of duties, fresh authenticator for sensitive actions |

### 17.1 Privacy and data protection

* Collect only what is needed: phone numbers, delivery location, voice and video the merchant chooses to provide, rider ID photos.
* Show a plain notice in Swahili and English, with audio, at first sign-in and at checkout.
* Retention: OTP and refresh records 7 days after expiry, auth events 12 months, order and ledger records as long as accounting and disputes require, then anonymise personal fields.
* Rider ID photos are stored privately, visible only to admins who approve riders, and deleted after a defined period once approved.
* Provide a way to request a copy or deletion of personal data. Deletion anonymises identity while keeping required financial records.
* The Kenya Data Protection Act applies. Check current registration and notification duties with the data protection authority, and have a lawyer review the privacy notice and the terms. This document is technical guidance, not legal advice.
* Money and licensing: holding customer funds and paying out may carry licensing or regulatory duties. Take advice from a financial-services lawyer before launching wallet features at scale.

## 18. Testing strategy

| Level | What is tested |
| --- | --- |
| Unit | Pricing and fees, ledger entries sum to zero, state transitions, OTP and token logic, phone normalisation, voice-extraction validation |
| Integration (Testcontainers) | Full flows against PostgreSQL: sign-in and refresh, basket to paid to delivered, partial refunds, withdrawals request, pay and reject, concurrency (two riders accepting, two parallel withdrawals) |
| Contract | Daraja, SMS and speech provider calls against recorded responses and sandboxes |
| Security | Role matrix for every endpoint, cross-account access attempts, replayed refresh tokens, forged callbacks, rate limit tests, delivery-code brute force |
| Money invariants | Nightly job: every transaction sums to zero, balances equal the sum of entries, basket total equals parts plus fee, no negative AVAILABLE balance |
| End to end | Playwright flows on a phone viewport: onboard a merchant by voice, build a multi-shop basket, pay in the sandbox, accept and deliver as a rider, withdraw and pay as an admin |
| Load | A realistic rush: many baskets at once, many riders polling, callbacks arriving together |
| Field | Watch real merchants, riders and customers use it. Track onboarding drop-off, voice edits, order success, delivery time |

## 19. Roadmap

| Phase | Scope | Done when |
| --- | --- | --- |
| 1. Foundation | Auth, merchants, voice products, shop pages, single-shop baskets, M-Pesa checkout, notifications, rider flow, delivery code, admin approvals, ledger and manual withdrawals | Five merchants take real orders and get paid through a withdrawal |
| 2. Baskets | Multi-shop baskets within a zone, multi-stop deliveries, partial refunds, route proposal, Track timeline per shop | A customer completes a four-shop basket delivered by one rider |
| 3. Automation | Automatic payouts, automatic refunds, reconciliation dashboards, two-person approvals, read replica for reports | Most withdrawals are paid without manual work |
| 4. Growth | More zones, more languages, merchant promotions, repeat-customer features, WhatsApp as an extra channel | Merchant retention and repeat orders meet targets |
| 5. Financial layer | Verified transaction history, merchant trust scores, savings, and lending with a regulated partner | Regulatory path confirmed and first financing pilot |

Because the ledger, baskets and audit trail are in place from phase 1, later phases add features without redesigning the foundations.

## 20. Open decisions and risks

| Decision | Options | Suggested default |
| --- | --- | --- |
| Kenyan legal entity and M-Pesa till or paybill | Who owns it and how revenue flows to the main company | Settle in the founders' agreement before any live money moves |
| Commission and delivery fee | Percentage, flat fee, or both | Start with placeholders (5% and KES 100 plus 40 per extra stop), tune from the pilot |
| Hold period before earnings are withdrawable | None, 24 hours, longer | 24 hours |
| Withdrawal transfer charge | Beez or user pays | Beez absorbs in the pilot |
| Zones | How large, who defines them | One market per zone at first, defined by admin |
| Job offered at all ready or earlier | All shops ready, or rolling dispatch | All ready first, rolling dispatch later |
| Link format for tracking | `/track/{token}` or `/t/{token}` | `/track/{token}` |
| Discover marketplace in the pilot | Browse shops or links only | Browse within one zone, with links as the main way in |

### Known risks

* **Operational complexity of baskets:** slow shops delay everyone. Mitigate with ready windows, alerts and the drop-a-part option.
* **Money handling:** errors lose real money. Mitigate with the ledger, invariants, reconciliation, and manual approval at first.
* **Regulation:** holding customer funds and paying out may need licences. Get advice early.
* **Voice accuracy in local languages:** measure on real recordings before promising languages.
* **Solo-developer capacity:** keep scope in phases and automate tests and deploys.
* **Provider dependence:** keep interfaces so M-Pesa, SMS, speech and LLM providers can be replaced.

## 21. Glossary

| Term | Meaning |
| --- | --- |
| Basket | One customer purchase across one or more shops, paid once |
| Vendor order | The part of a basket that belongs to one shop |
| Stop | One pickup (a shop) or the drop-off in a delivery |
| Zone | A market or neighbourhood where shops can be combined in one basket |
| Ledger | The append-only record of every money movement, balanced to zero |
| Withdrawal | A request by a merchant or rider to move earnings to M-Pesa |
| STK Push | The M-Pesa prompt that asks a customer to approve a payment on their phone |
| OTP | One-time code sent by SMS or voice call |
| Capability link | A link with an unguessable token that grants access to one resource |
| Idempotent | Safe to repeat: doing it twice has the same effect as once |
| Outbox | A table of messages written with the event, sent after the transaction commits |
| PWA | Progressive web app: a website that installs and works like an app |

Verify third-party details (Safaricom Daraja, Africa's Talking, speech and LLM providers, browser features) against current official documentation before implementing. Prices, fees and legal points are indicative and must be confirmed.
