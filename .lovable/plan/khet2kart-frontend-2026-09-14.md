# Khet2Kart frontend

## Goal

Build a polished, responsive single-page agritech platform that lets visitors switch between Home, Customer, Farmer, Transporter, Hub, and Admin views.

## What will be built

- Sticky mandi-price ticker and role-switching navigation with mobile controls.
- Cinematic farmer-led home page with platform metrics, supply-chain simulator, flow comparison, produce carousel, feature bento, and closing call-to-action.
- Customer marketplace with search, filters, working cart drawer, and checkout form.
- Farmer dashboard with earnings, listings, editable crop details, add-crop form, orders, and acceptance actions.
- Transporter task board with working delivery-status progression.
- Collection hub shipment table, batch creation workflow, and quality approval controls.
- Admin intelligence view with metrics, visual charts, user verification table, and flagged-order handling.
- Three-step farmer registration flow with an interactive Leaflet farm-location map and generated Farmer ID success state.
- Responsive footer and complete page metadata.

## Design direction

- Deep emerald agritech palette balanced with crisp off-white, charcoal, warm harvest gold, and produce-red accents.
- Inter typography, compact dashboard controls, restrained glass surfaces, subtle depth, and purposeful micro-motion.
- Real generated Indian agricultural photography for the opening scene and crop catalogue.

## Technical details

- Use React Context for role, listings, orders, cart, and platform statistics.
- Keep the experience on `/` while using internal role state as requested.
- Use React Leaflet only after browser hydration to preserve server rendering.
- Use semantic design tokens in the shared stylesheet and existing button primitives for controls.
- Validate through automated desktop and mobile browser checks, including core interactions.
