import type { State } from "./model";
export const initial: State = {
  schema: 1,
  revision: 0,
  products: [
    {
      id: "p-automation",
      version: 1,
      title: "Automation Field Manual",
      creator: "Mina Studio",
      category: "Operations",
      description:
        "A practical system for turning repeated service work into audited automation playbooks.",
      priceCents: 3900,
      active: true,
      accent: "#ff6b35",
    },
    {
      id: "p-saas-kit",
      version: 1,
      title: "SaaS Launch Room",
      creator: "Northstar Labs",
      category: "Startups",
      description:
        "Production screens, pricing models, onboarding flows, and investor-ready launch assets.",
      priceCents: 14900,
      active: true,
      accent: "#2ec4b6",
    },
    {
      id: "p-membership",
      version: 1,
      title: "Creator CFO Membership",
      creator: "Ledger House",
      category: "Finance",
      description:
        "Monthly operating reviews, tax-ready revenue models, and payout planning for solo founders.",
      priceCents: 2900,
      active: true,
      accent: "#3a86ff",
    },
    {
      id: "p-motion",
      version: 1,
      title: "Motion Brand Pack",
      creator: "Frame Foundry",
      category: "Design",
      description:
        "A full motion identity kit for product launches, social drops, and creator-led campaigns.",
      priceCents: 8900,
      active: true,
      accent: "#ffbe0b",
    },
    {
      id: "p-course",
      version: 1,
      title: "High Trust Checkout Course",
      creator: "Conversion Desk",
      category: "Marketing",
      description:
        "Checkout audits, launch sequences, and proof systems for digital products over $100.",
      priceCents: 24900,
      active: false,
      accent: "#8338ec",
    },
    {
      id: "p-local",
      version: 1,
      title: "Local Services OS",
      creator: "Service Stack",
      category: "Business",
      description:
        "A client pipeline, estimate workflow, and after-service follow-up system for local operators.",
      priceCents: 11900,
      active: false,
      accent: "#06d6a0",
    },
  ],
  discounts: [
    {
      id: "discount-build20",
      version: 1,
      code: "BUILD20",
      percent: 20,
      active: true,
    },
  ],
  orders: [],
};
