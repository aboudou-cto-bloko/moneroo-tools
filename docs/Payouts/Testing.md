# Testing

Testing your integration is a crucial step in ensuring a seamless payout experience with Moneroo. Moneroo provides a dedicated sandbox environment for testing purposes, allowing you to validate your integration before going live. In the sandbox mode, you can simulate real transactions without processing actual payments.

To perform testing in the sandbox environment, you will use specific keys known as "sandbox keys" or "test keys." These keys are distinct from the live keys and are meant for testing purposes only. They provide a secure and controlled environment to experiment and validate your integration.

By utilizing the sandbox keys and the Moneroo sandbox environment, you can thoroughly test your integration, ensure compatibility, and address any issues before deploying to the live production environment.

{% hint style="warning" %}
Sandbox data is automatically deleted after 90 days. This only affects transactions and customers.
{% endhint %}

### **Default Payout Gateway: Moneroo Test Payout Gateway**

By default, your Moneroo app includes the "Moneroo Test Payout Gateway" as the default payout gateway in the sandbox environment. This payout gateway allows you to simulate various transaction scenarios and observe how your system responds in each case.

To simulate different payout transaction scenarios and thoroughly test your integration, Moneroo provides specific test phone numbers. These numbers can be used to simulate both successful and failed transactions, allowing you to evaluate how your system handles each scenario. During your testing process, you can use these test phone numbers to mimic the behavior of real transactions and observe your integration's responses accordingly.

{% hint style="info" %}

* The test phone numbers are only available for the Moneroo Test Payout Gateway and cannot be used with other payout gateways in the sandbox mode.
* These numbers can be used to simulate their respective scenarios for all payment methods associated with the Moneroo Test Payout Gateway.
  {% endhint %}

<table><thead><tr><th>Phone Number</th><th width="244">Scenario</th><th width="125">Currency</th><th>Country</th></tr></thead><tbody><tr><td>4149518161</td><td><span data-gb-custom-inline data-tag="emoji" data-code="2705">✅</span> Successful transaction</td><td>USD</td><td>US</td></tr><tr><td>4149518162</td><td><span data-gb-custom-inline data-tag="emoji" data-code="274c">❌</span> Failed transaction</td><td>USD</td><td>US</td></tr><tr><td>4149518163</td><td><span data-gb-custom-inline data-tag="emoji" data-code="23f3">⏳</span> ending transaction</td><td>USD</td><td>US</td></tr></tbody></table>

### Testing with Other Payout Gateways in Sandbox Mode

Moneroo offers the ability to integrate with other payout gateways in the sandbox mode.

For each payment gateway available in the sandbox mode, consult the specific payment gateway's documentation for their test instructions. These instructions will provide you with the necessary information on how to integrate with the payment gateway, utilize the test keys or credentials, and simulate different transaction scenarios specific to that payment gateway.

Moneroo is continuously working on expanding the availability of supported payment gateways in the sandbox mode. Therefore, be sure to stay updated with the latest announcements and updates from Moneroo regarding new integrations and sandbox testing options.

Here are the links to the documentation for each payment gateway supported in the sandbox mode for test instructions:

<table><thead><tr><th width="364">Payment Processor</th><th>Test Instructions</th></tr></thead><tbody><tr><td>KkiaPay (Sandbox)</td><td><a href="https://docs.kkiapay.me/v1/v/en-1.0.0/compte/kkiapay-sandbox-guide-de-test">View Instructions</a></td></tr><tr><td>Flutterwave (Test)</td><td><a href="https://developer.flutterwave.com/docs/integration-guides/testing-helpers">View Instructions</a></td></tr><tr><td>Paydunya (Sandbox)</td><td><a href="https://developers.paydunya.com/doc/EN/introduction#section-3">View Instructions</a></td></tr><tr><td>Paystack (Sandbox)</td><td><a href="https://paystack.com/docs/payments/test-payments/">View Instructions</a></td></tr><tr><td>Stripe (Sandbox)</td><td><a href="https://stripe.com/docs/testing">View Instructions</a></td></tr><tr><td>Fedapay (Sandbox)</td><td><a href="https://docs.fedapay.com/paiements/test">View Instructions</a></td></tr><tr><td>PawaPay (Sandbox)</td><td><a href="https://docs.pawapay.co.uk/#section/Using-the-API/Correspondents">View Instructions</a></td></tr></tbody></table>
