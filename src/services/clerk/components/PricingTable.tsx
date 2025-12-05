import { PricingTable as ClerkPricingTable } from "@clerk/nextjs"

export function PricingTable() {
  return <ClerkPricingTable newSubscriptionRedirectUrl="/app" />
}