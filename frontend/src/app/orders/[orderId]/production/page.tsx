import { redirect } from "next/navigation"

export default async function OrderProductionRedirectPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  redirect(`/orders/${params.orderId}`)
}
