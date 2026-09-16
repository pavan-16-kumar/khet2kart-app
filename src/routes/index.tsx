import { createFileRoute } from "@tanstack/react-router";
import { Khet2KartApp } from "@/features/khet2kart/Khet2KartApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Khet2Kart — Direct Farm Marketplace" },
      {
        name: "description",
        content:
          "Buy fresh produce directly from verified Indian farmers through a transparent agricultural supply chain.",
      },
      { property: "og:title", content: "Khet2Kart — Direct Farm Marketplace" },
      {
        property: "og:description",
        content: "Connecting farmers, hubs, transporters and buyers without middlemen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <Khet2KartApp />;
}
