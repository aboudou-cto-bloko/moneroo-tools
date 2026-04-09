# Testing

Testing your integration is a crucial step in ensuring a seamless payment experience with Moneroo. Moneroo offers a dedicated sandbox environment for testing purposes, allowing you to validate your integration before going live. In the sandbox mode, you can simulate real transactions without processing actual payments.

#### Using the Sandbox Environment

To conduct tests in the sandbox environment, you will use specific keys known as "sandbox keys" or "test keys." These keys differ from the production keys and are intended solely for testing purposes. They provide a secure and controlled setting to experiment with and validate your integration.

#### Benefits of Using the Sandbox

By using the sandbox keys and the Moneroo sandbox environment, you can:

* Thoroughly test your integration
* Ensure compatibility with Moneroo systems
* Address any potential issues before deployment to the live production environment.

{% hint style="warning" %}
Sandbox data is automatically deleted after **90 days**. This only affects transactions and customers.
{% endhint %}

### Default Payment Processor: Moneroo Test Payment Gateway

By default, your Moneroo app includes the "Moneroo Test Payment Gateway" as the default payment gateway in the sandbox environment. This gateway allows you to simulate various transaction scenarios, providing insights into how your system responds in each case.

#### Simulating Transaction Scenarios

To thoroughly test your integration, Moneroo provides specific test phone numbers. These numbers enable you to simulate both successful and failed transactions, allowing you to assess how your system manages each scenario. During your testing, use these test phone numbers to mimic real transaction behaviors and observe how your integration responds.

#### Key Features of Test Payment Gateway

* **Flexibility in Testing:** Simulate a wide range of transaction scenarios to ensure your application is robust and reliable.
* **Realistic Response Simulation:** Observe detailed responses from your system as it would handle actual transactions, helping you to fine-tune your integration before going live.

Using these tools, you can ensure that your integration is fully prepared for production deployment, minimizing potential issues for real users.

{% hint style="info" %}

* The test phone numbers are only available for the Moneroo Test Payment Gateway and cannot be used with other payment gateways in the sandbox mode.
* These numbers can be used to simulate their respective scenarios for all payment methods associated with the Moneroo Test Payment Gateway.
  {% endhint %}

<table><thead><tr><th width="185">Phone Number</th><th width="258">Scenario</th><th width="120">Currency</th><th width="100">Country</th></tr></thead><tbody><tr><td>(414)951-8161</td><td><span data-gb-custom-inline data-tag="emoji" data-code="2705">✅</span> Successful transaction</td><td>USD</td><td>US</td></tr><tr><td>(414)951-8162</td><td><span data-gb-custom-inline data-tag="emoji" data-code="231b">⌛</span>Pending transaction</td><td>USD</td><td>US</td></tr><tr><td>(414)951-8163</td><td><span data-gb-custom-inline data-tag="emoji" data-code="274c">❌</span>Failed transaction</td><td>USD</td><td>US</td></tr></tbody></table>

### Testing with Other Payment Gateways in Sandbox Mode

Moneroo offers the ability to integrate with other payment gateways in the `sandbox` mode.

For each payment gateway available in the sandbox mode, you should consult the specific payment gateway's documentation for their test instructions. These instructions will provide you with the necessary information on how to integrate with the payment gateway, use the test keys or credentials, and simulate different transaction scenarios specific to that payment gateway.

Moneroo is continuously working on expanding the availability of supported payment gateways in the sandbox mode. Therefore, be sure to stay updated with the latest announcements and updates from Moneroo regarding new integrations and sandbox testing options. Here is a link to each payment gateway supported in the sandbox mode test instructions to their documentation:

| Payment Processor  | Test Instructions                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| KkiaPay (Sandbox)  | [View Instructions](https://docs.kkiapay.me/v1/v/en-1.0.0/compte/kkiapay-sandbox-guide-de-test) |
| Flutterwave (Test) | [View Instructions](https://developer.flutterwave.com/docs/integration-guides/testing-helpers)  |
| Paydunya (Sandbox) | [View Instructions](https://developers.paydunya.com/doc/EN/introduction#section-3)              |
| Paystack (Sandbox) | [View Instructions](https://paystack.com/docs/payments/test-payments/)                          |
| Stripe (Sandbox)   | [View Instructions](https://stripe.com/docs/testing)                                            |
| Fedapay (Sandbox)  | [View Instructions](https://docs.fedapay.com/paiements/test)                                    |
| PawaPay (Sandbox)  | [View Instructions](https://docs.pawapay.co.uk/#section/Testing-the-API)                        |
