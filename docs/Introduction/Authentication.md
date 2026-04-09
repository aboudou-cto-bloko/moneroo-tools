# Authentication

Moneroo API endpoints are secured with API keys, which you can create from the dashboard. You must include your API key in all API requests to the server as a header field.

To interact with the Moneroo API, you must follow each of your requests with an Authorization header including your secret key in the Authorization header. You can manage your API keys from the dashboard.

We generally provide both public and secret keys. Public keys are intended for use from your interface when integrating using JavaScript SDKs and in our mobile SDKs only. By design, public keys cannot modify any part of your account except to initiate transactions. On the other hand, secret keys must remain secret and should not be used publicly. For better safety, always use the secret keys on the backend server as environment variables if possible. If you suspect your secret key has been compromised or want to reset it, you can do so from the dashboard.

To create API keys, go to the **developer** section of the Moneroo dashboard.

<figure><img src="https://content.gitbook.com/content/F5haoTqXskovPQsHHfUI/blobs/YJz9lcxfUW2SoQZzmeBH/create_api_keys.png" alt=""><figcaption><p>Moneroo.io Create API Keys</p></figcaption></figure>

{% hint style="danger" %}
Do not commit your secret keys to git, or use them in client-side code.
{% endhint %}

As you build and test your integration, think about using Sandbox API keys for a secure environment. You'll find more about Sandbox mode in our detailed Moneroo API testing guide. When you're confident and ready to handle real payments, smoothly switch to Live API keys.

Remember, keeping all API keys secure is vital. Never share them. If by chance a key gets out, you can delete it immediately. Make sure to update your code with the new keys to keep everything running smoothly.

### API key Authentication

Each API request should include the API key or token, sent within the Authorization header of the HTTP call using the Bearer method. For instance, a valid **Authorization header** looks like this: `Bearer test_dHar4XY7LxsDOtmarVtjNVWXLSlXsM`.

Typically, our [SDKs](https://docs.moneroo.io/sdks) offer shortcuts to simplify setting the API key or access token and interacting with the API.

In the example below, we utilize a test API key for the GET method of the payment resource, which retrieves a payment with the payment ID `test_yyfbwekjnsd`.

```bash
curl https://api.moneroo.io/v1/payments/test_yyfbwekjnsd
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
```

{% hint style="warning" %}
Do not set VERIFY\_PEER to FALSE. Ensure your server verifies the SSL connection to Moneroo.
{% endhint %}

### Rate Limiting

The **Moneroo API** enforces a rate limit of 120 requests per minute. If you surpass this threshold, subsequent requests will receive a `429 Too Many Requests` response. In such cases, wait for ***60 seconds*** before attempting to retry your request.
