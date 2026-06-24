import { redirect } from "next/navigation"

export default async function OrderBidsRedirectPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  redirect(`/orders/${params.orderId}`)
}
