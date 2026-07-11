import { expect, test, type Browser, type Page } from "@playwright/test"

const credentials = {
  buyer: [process.env.E2E_BUYER_EMAIL, process.env.E2E_BUYER_PASSWORD],
  manufacturer: [process.env.E2E_MANUFACTURER_EMAIL, process.env.E2E_MANUFACTURER_PASSWORD],
  admin: [process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD],
} as const
const pilotAccountsConfigured = Object.values(credentials).flat().every(Boolean)

async function signedInPage(browser: Browser, role: keyof typeof credentials) {
  const [email, password] = credentials[role]
  if (!email || !password) throw new Error(`Missing E2E_${role.toUpperCase()}_EMAIL or password`)
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto("/login")
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  return { context, page }
}

async function openListing(page: Page, title: string) {
  await page.goto("/marketplace")
  await page.getByPlaceholder("Search RFQs, buyers, destinations").fill(title)
  await page.getByRole("heading", { name: title }).click()
}

test.describe("pilot transaction spine", () => {
  test.skip(!pilotAccountsConfigured && !process.env.CI, "Configure buyer, manufacturer, and admin pilot accounts")
  test.beforeAll(() => {
    if (!pilotAccountsConfigured) throw new Error("CI requires configured buyer, manufacturer, and admin pilot accounts")
  })

  test("buyer and manufacturer complete one persisted order", async ({ browser }) => {
    const uniqueTitle = `Pilot kits ${Date.now()}`
    const buyer = await signedInPage(browser, "buyer")
    const manufacturer = await signedInPage(browser, "manufacturer")
    const admin = await signedInPage(browser, "admin")

    await buyer.page.goto("/marketplace")
    await buyer.page.getByRole("button", { name: "New RFQ" }).click()
    const rfqDialog = buyer.page.getByRole("dialog")
    const fields = rfqDialog.locator("input")
    await fields.nth(0).fill(uniqueTitle)
    await rfqDialog.locator("textarea").first().fill("Persisted end-to-end sportswear pilot RFQ")
    await fields.nth(1).fill("100")
    await fields.nth(2).fill("12")
    await fields.nth(3).fill("15")
    await rfqDialog.getByRole("button", { name: "Publish RFQ" }).click()
    await expect(buyer.page.getByRole("heading", { name: uniqueTitle })).toBeVisible()

    await openListing(manufacturer.page, uniqueTitle)
    await manufacturer.page.getByRole("button", { name: "Place or revise bid" }).click()
    const bidDialog = manufacturer.page.getByRole("dialog")
    await bidDialog.getByPlaceholder("Explain capacity, materials, certifications, and delivery assumptions.").fill("Verified pilot capacity and materials confirmed.")
    await bidDialog.getByRole("button", { name: "Submit bid" }).click()

    await openListing(buyer.page, uniqueTitle)
    await buyer.page.getByRole("button", { name: /Compare/ }).click()
    buyer.page.once("dialog", (dialog) => dialog.accept())
    await buyer.page.getByRole("button", { name: "Accept", exact: true }).click()
    await expect(buyer.page).toHaveURL(/\/orders\/[0-9a-f-]+$/)
    const orderPath = new URL(buyer.page.url()).pathname

    await admin.page.goto(orderPath)
    await admin.page.getByPlaceholder("Bank or USDC reference").fill(`pilot-${Date.now()}`)
    await admin.page.getByRole("button", { name: "Record entry" }).click()
    await expect(admin.page.getByText("Escrow entry recorded.")).toBeVisible()

    await buyer.page.goto(orderPath)
    if (await buyer.page.getByRole("button", { name: "Approve sample" }).isVisible()) {
      await buyer.page.getByRole("button", { name: "Approve sample" }).click()
    }

    await manufacturer.page.goto(orderPath)
    const fileInput = manufacturer.page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({ name: "qc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% pilot QC evidence") })
    await expect(manufacturer.page.getByText("Attachment ready to send.")).toBeVisible()
    await manufacturer.page.getByRole("button", { name: "Submit attached QC evidence" }).click()

    await buyer.page.goto(orderPath)
    await buyer.page.getByRole("button", { name: "Review QC" }).click()

    await manufacturer.page.goto(orderPath)
    const prompts = ["TRACK-PILOT-1", "DHL"]
    manufacturer.page.on("dialog", async (dialog) => dialog.accept(prompts.shift() || ""))
    await manufacturer.page.getByRole("button", { name: "Add tracking" }).first().click()
    await manufacturer.page.getByRole("button", { name: "Mark delivered" }).click()

    await buyer.page.goto(orderPath)
    await buyer.page.getByRole("button", { name: "Confirm delivery" }).click()
    await expect(buyer.page.getByText("Complete", { exact: true })).toBeVisible()

    await Promise.all([buyer.context.close(), manufacturer.context.close(), admin.context.close()])
  })
})
