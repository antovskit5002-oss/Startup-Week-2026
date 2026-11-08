// Central, easy-to-edit configuration for company info, links, and prices.
// Prices are in cents (EUR). Use null to show "Coming Soon".

export const site = {
  name: "Smart Plants",
  tagline: "Smart Plant Care",
  description:
    "Smart Plants combines sensors, solar power, automatic watering and AI to help your plants thrive with less effort.",
  email: "hello@verdia.example",
  supportEmail: "support@verdia.example",
  businessEmail: "business@verdia.example",
  phone: "+00 000 000 000",
  callCenter: "+00 000 000 001",
  address: "Company address — to be added",
  // Replace with the final App Store listing URL.
  appStoreUrl: "https://apps.apple.com/app/id0000000000",
  appPriceLabel: "€3.99 / month",
  socials: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    facebook: "https://facebook.com",
    x: "https://x.com",
  },
};

export type Product = {
  id: string;
  name: string;
  short: string;
  description: string;
  priceCents: number | null;
  purchasable: boolean;
  image: "hero" | "components" | "lifestyle";
  includes: string[];
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    id: "smart-plant-bundle",
    name: "Smart Plant Complete Bundle",
    short: "Device, sensors, automatic watering and solar power — plus 3 months of Premium.",
    description:
      "Everything you need for effortless plant care. The Smart Plant device monitors soil, air and light around the clock, waters automatically when needed, and runs on solar energy. Includes a unique Gift Code to activate 3 months of Premium in the mobile app.",
    priceCents: null,
    purchasable: true,
    image: "hero",
    includes: [
      "Physical Smart Plant device",
      "Smart environmental sensors",
      "Automatic watering system",
      "Solar panel",
      "Mobile application access",
      "3 months of Premium included",
      "Unique Gift Code for Premium activation",
    ],
    specs: [
      { label: "Controller", value: "Arduino-based" },
      { label: "Sensors", value: "Soil moisture, temperature, humidity, light" },
      { label: "Watering", value: "Integrated micro water pump" },
      { label: "Power", value: "Solar panel with rechargeable battery" },
      { label: "Connectivity", value: "Connects to the Smart Plants iOS app" },
      { label: "Dimensions", value: "To be confirmed" },
    ],
  },
  {
    id: "spare-sensor-kit",
    name: "Sensor Expansion Kit",
    short: "Add monitoring to another plant — sensors and probe only.",
    description:
      "Extend smart monitoring to more plants with an additional soil probe and climate sensor module. Requires a Smart Plant device.",
    priceCents: null,
    purchasable: true,
    image: "components",
    includes: ["Soil moisture probe", "Temperature & humidity module", "Mounting accessories"],
    specs: [
      { label: "Compatibility", value: "Smart Plant device" },
      { label: "Sensors", value: "Soil moisture, temperature, humidity" },
      { label: "Availability", value: "Coming soon" },
    ],
  },
];

export const appPlans = [
  {
    id: "app",
    name: "Mobile Application",
    priceLabel: site.appPriceLabel,
    note: "Monthly subscription on the App Store",
    features: [
      "Standalone application",
      "Plant identification",
      "AI plant analysis",
      "Disease detection",
      "Personalized care recommendations",
      "No physical hardware included",
    ],
  },
  {
    id: "premium",
    name: "Premium Subscription",
    priceLabel: "Coming Soon",
    note: "In-app subscription",
    features: [
      "Advanced AI features",
      "Additional plant analysis capabilities",
      "Extended personalized recommendations",
    ],
  },
];

export function formatPrice(cents: number | null) {
  if (cents == null) return "Coming Soon";
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export const getProduct = (id: string) => products.find((p) => p.id === id);
