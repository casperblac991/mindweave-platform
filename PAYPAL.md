# PayPal checkout setup

The checkout now supports PayPal Orders API in Sandbox or Live mode. The browser receives only the public Client ID. The Client Secret is read by `server.js` from the hosting environment and is never committed to GitHub or sent to the browser.

## Required environment variables

```text
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=your_public_client_id
PAYPAL_CLIENT_SECRET=your_private_client_secret
```

For live payments, change only `PAYPAL_ENVIRONMENT` to `live` after completing Sandbox tests. Do not use a Sandbox credential in Live mode.

## Safe setup

1. In PayPal Developer, stay in **Sandbox** and copy the public Client ID from the API Credentials page.
2. Add `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_ENVIRONMENT=sandbox` to the Render service environment variables. Do not paste the secret into source code or chat.
3. Redeploy the service and open `checkout.html` with a product in the cart.
4. Use a Sandbox personal buyer account to complete a test payment. Never use the merchant account as the buyer.
5. Confirm that the server logs show no secret and that the PayPal order reaches `COMPLETED` before enabling Live mode.

The server calculates the amount from the repository product catalog instead of trusting the browser total. It creates a PayPal order and captures it only after PayPal approval. A future fulfillment step should verify the capture and store a deduplicated purchase record in Supabase before granting downloads.
