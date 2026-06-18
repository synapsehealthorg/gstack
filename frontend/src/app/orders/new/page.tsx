import { OrderCreationProvider } from "@/components/orders/OrderCreationContext"
import OrderCreationWizard from "@/components/orders/OrderCreationWizard"

export default function NewOrderPage() {
  return (
    <OrderCreationProvider>
      <OrderCreationWizard />
    </OrderCreationProvider>
  )
}
