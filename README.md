# Khet2Kart: Direct Farm Connect

# Lovable App Generation Prompt: Khet2Kart (Direct Farmer-to-Consumer Platform)

Please copy the entire prompt below and paste it into Lovable to generate the complete frontend of the Khet2Kart platform.

---

**App Name:** Khet2Kart 🌱

**Description:** A comprehensive, full-stack digital agricultural supply chain platform connecting farmers directly with institutional buyers, local hubs, transporters, and retail consumers, eliminating middlemen. (SIH 2026 Agritech Solution).

**Tech Stack & Libraries to Use:**

- React (Vite or Next.js App Router)

- TypeScript

- Tailwind CSS (for all styling, layout, and responsive design)

- Lucide React (for all iconography)

- React Leaflet / Leaflet (for mapping and geolocation features)

- Context API (for global state management and role switching)

**Theme & UI/UX Guidelines (Crucial for Aesthetics):**

- **Color Palette:** Deep agritech greens (Emerald-500 to Emerald-900), contrasting with crisp whites, slate grays (Slate-50 to Slate-900), and vibrant accents for call-to-actions (e.g., `#10b981`).

- **Design Style:** Modern, premium, glassmorphism elements, subtle gradients. Use `backdrop-filter: blur()` for floating cards and headers.

- **Animations:** Include micro-animations for interactions (hover states, shimmer effects on buttons, pulsing dots for "live" indicators, smooth tab transitions).

- **Typography:** Clean, sans-serif font (Inter or Roboto).

- **Layout:** The app should feel like a Single Page Application (SPA). Use a sticky top navigation header that allows switching between different user "Roles" or "Views" (Home, Customer, Farmer, Transporter, Hub, Admin).

---

### Core Data Models (Mock these in Context or as Types)

1. **Farmer:** `id`, `farmerId`, `name`, `mobile`, `location` (state, district, village), `farmArea`, `mainCrop`, `lat`, `lng`.

2. **CropListing:** `id`, `listingId`, `farmerId`, `cropName`, `variety`, `grade` (Grade A, Organic, etc.), `availableQuantity`, `pricePerKg`, `harvestDate`, `imageUrl`.

3. **Order:** `id`, `orderId`, `customerId`, `farmerId`, `cropName`, `quantity`, `totalAmount`, `status` (PENDING, FARMER_ACCEPTED, IN_TRANSIT, DELIVERED), `paymentMethod`.

4. **Platform Stats (Global):** `totalHarvestSaved`, `extraFarmerIncome`, `activeFarmers`, `avgTurnaroundTime`.

---

### Global State Management (`FarmConnectContext`)

Create a global context provider that holds:

1. `activeRole`: Currently selected view (`'home' | 'customer' | 'farmer' | 'transporter' | 'hub' | 'admin'`).

2. `mockListings`: Array of available crops.

3. `mockOrders`: Array of orders across the platform.

4. `platformStats`: Real-time style statistics.

Provide a function `setActiveRole` to switch views.

---

### Main Layout & Navigation

- **Header:** Sticky header with logo "Khet2Kart 🌱". Include navigation links that change the `activeRole` state. Add a "Register as Farmer" button and a Cart icon (visible for customers).

- **Mandi Ticker Bar:** A continuous scrolling or sticky top bar above the header showing live crop prices (e.g., "Tomato: ₹25/kg (APMC) vs ₹32/kg (Khet2Kart)").

- **Footer:** Rich ecosystem footer with links, copyright, and operational portal links (Admin, Transporter, Hub).

---

### 1. Home / Landing View (`activeRole === 'home'`)

Build a stunning landing page composed of the following sections:

- **Cinematic Hero Section:** Deep green gradient background. "Connecting Farmers Directly to Buyers, Eliminating Middlemen". Include two CTAs: "Buy Directly from Farmers" and "Register as a Verified Farmer".

- **Glassmorphic Metrics:** A 4-column grid overlapping the hero section showing platform stats (Extra Earnings, Harvest Saved, Active Farmers, Turnaround Time).

- **Supply Chain Simulator:** An interactive visual component showing 4 stages: Farmer -> Hub -> Transporter -> Consumer. Clicking a stage highlights it and shows what happens there.

- **Traditional vs Khet2Kart Flow:** A visual flowchart comparing the traditional 6-step supply chain (with high commissions) to the direct Khet2Kart 3-step flow.

- **Live Harvest Preview:** A horizontal scrolling carousel of freshly listed crops with "Add to Cart" buttons.

- **Bento-Grid Features:** A modern bento-box style grid highlighting features like "Instant UPI Payments", "QR Traceability", and "AI Price Engine".

- **Closing CTA Section:** A large card with a dark gradient encouraging users to join.

---

### 2. Customer Portal (`activeRole === 'customer'`)

- **Marketplace Grid:** A grid of crop cards. Each card shows the crop image, farmer name, location, grade, available quantity, and price.

- **Filters/Search:** Sidebar or top bar to filter by crop type (Vegetables, Fruits, Grains) and grade (Organic, Standard).

- **Shopping Cart Modal/Slide-over:** Shows added items, subtotal, delivery fee calculation, and a "Checkout" button.

- **Checkout Flow:** Mock a simple checkout with delivery address and payment method (UPI / COD) selection.

---

### 3. Farmer Portal (`activeRole === 'farmer'`)

A dashboard layout with a sidebar (Dashboard, My Crops, Orders, Earnings) and main content area.

- **Welcome Banner:** Greeting the farmer, showing their Farmer ID.

- **Earnings Overview:** Cards showing "Total Earnings", "Pending Settlement", "Active Listings".

- **Quick Actions:** "Add New Crop", "Request Transport".

- **Crop Listings Management:** Table or grid of the farmer's active crops with options to edit price or quantity. Include an "Add Crop" modal.

- **Recent Orders Table:** Table showing orders received, status, buyer name, and a button to "Accept Order".

---

### 4. Transporter / Logistics Portal (`activeRole === 'transporter'`)

- **Task List:** A Kanban board or list view of delivery tasks categorized into "Pending Pickup", "In Transit", "Delivered".

- **Task Card:** Shows pickup location (Farmer), drop-off location (Customer/Hub), crop, quantity, and route distance. Include a button to update status.

---

### 5. Collection Hub Portal (`activeRole === 'hub'`)

- **Incoming Shipments:** Table of crops arriving from local farmers for aggregation.

- **Batch Processing:** Interface to group smaller crop quantities into larger batches for inter-city transport.

- **Quality Check:** A simple interface to approve crop grade upon arrival.

---

### 6. Admin Intelligence Portal (`activeRole === 'admin'`)

- **High-Level Dashboard:** Charts or large metric cards tracking total platform GMV, user growth, active hubs, and system health.

- **User Management:** Table listing all registered farmers, transporters, and buyers with their verification status.

- **Dispute Resolution:** A mock section showing flagged orders or delivery delays.

---

### 7. Farmer Onboarding View (Separate flow or modal)

- **Multi-step Form:**

  1. Personal Info (Name, Mobile, State, District).

  2. Farm Details (Area, Main Crops).

  3. Geolocation (Use Leaflet map for farmer to pin their farm location).

- **Success View:** A beautiful "Welcome to Khet2Kart" success card generating their unique Farmer ID (e.g., `FC-TG-MDL-26-000184`).

**Final Instruction for Lovable:** Ensure the entire application is fully responsive (mobile-first), uses Tailwind for all styling, feels extremely premium and modern, and uses placeholder images (like Unsplash source URLs) for crops and farmer profiles. Wire up basic interactions so clicking "Add to Cart" or switching tabs actually updates the UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d7e3ac5d-f99b-4afb-a822-16ce4bc1ad64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
