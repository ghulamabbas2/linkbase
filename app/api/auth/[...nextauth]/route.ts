import { handlers } from "@/lib/auth";

// First-party NextAuth callback endpoint. Route Handlers are otherwise reserved
// for webhooks/callbacks (docs/routing.md); everything else uses Server Actions.
export const { GET, POST } = handlers;
