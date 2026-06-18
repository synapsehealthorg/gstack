# proov.to

This is the open-source client-side application for **proov** (proov.to / proov.io)—a B2B reverse-auction marketplace and direct-billing escrow platform designed to resolve payment trust, quality disputes, and cross-border payout red tape between global buyers and custom manufacturers.

The application is built as a highly responsive, zero-dependency light-themed Single Page Application (SPA). It features an inDrive-style buyer/manufacturer role switcher, an algorithmic bidding quota pass generator, rules-based custom product cost floor checks, and simulated Whop checkout, Solana USDC wallets, and Fasset PKR bank off-ramps.

---

## Prerequisites

To run the application or execute the automated test suites, you will need:
*   A modern web browser (Chrome, Safari, Firefox, Edge).
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher) to execute unit assertions.

---

## Getting Started

### 1. Run the Web Interface
Since proov is a client-side SPA, you can open `index.html` directly in your browser. For optimal asset and routing performance, we recommend running a simple local development server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js npx
npx serve .
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### 2. Dual-Mode Database Configuration (`db.js`)
By default, proov stores all demands, bids, orders, and logs in `localStorage` inside a fully functional, multiplayer-ready Firestore Simulator.

To connect the application to a live, synchronized Google Cloud Firestore instance, add your project credentials to the config block in `db.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
```
If these credentials are left blank or offline, the app automatically and gracefully falls back to the local simulator mode.

---

## Running Tests

We run Node.js unit assertions to test the state machine transitions, fee allocations, escrow releases, and off-ramp rates.

Execute the test suite with:

```bash
node test.js
```

### What is tested:
1.  **Seed Verification:** Validates database structure and initial YC-based case study profiles (Phantom Sports, Pakistan Apparel).
2.  **Algorithmic Quota Limits:** Verifies the dynamic bidding pass allocation curve ($3 for 8 bids up to 16 bids, scaling with 24-hour daily demand flow).
3.  **Whop webhook processing:** Validates that credit card checkouts trigger successful webhook callbacks and shift orders to "Held in Escrow".
4.  **Premium Milestone Rule:** Asserts that premium factories immediately receive a 50% milestone advance payment in their Solana USDC wallet, while standard manufacturers are held at 100% until delivery.
5.  **Escrow Settling:** Validates delivery confirmation and final fund payouts over Solana.
6.  **Fasset Off-ramping:** Tests Fasset USDC -> PKR bank rate calculations (1 USDC = 278.55 PKR) and clears active wallet balances.

---

## Contributing

We welcome contributions to proov. To keep quality high and PR reviews fast, we follow antiwork/gumroad guidelines:

### 1. Keep PRs small and focused
Try to limit your changes to under 200 lines of code. Large, sprawling pull requests will be closed immediately.

### 2. Run tests locally
Never submit a PR that fails the unit suite. Run `node test.js` before pushing your branch and attach the terminal output to your description.

### 3. Add video walkthroughs
If you are changing UI layouts, forms, or role-toggle menus, record a short video walkthrough demonstrating your changes and include it in your pull request.

### 4. Declare AI usage
If you used LLMs or coding assistants (such as Antigravity, Copilot, or Cursor) to draft, refactor, or test the code, disclose it clearly at the top of your PR description.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
