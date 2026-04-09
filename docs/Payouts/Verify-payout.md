# Verify payout

After a payout, it's crucial to confirm that the transaction was processed through Moneroo before crediting value to your customer wallet or balance in your application. This precaution ensures the payment received aligns with your expectations.

Here are some key points to verify during the payment confirmation:

1. **Transaction Reference**: Confirm that the transaction reference corresponds with the one you generated.
2. **Transaction Status**: Check the transaction status for accuracy. The status should be "success" for successful payments. To learn more about transaction statuses, see the transaction status section.
3. **Payment Currency**: Verify that the payment's currency matches the expected currency.
4. **Paid Amount**: Ensure the paid amount is equal to or greater than the anticipated amount. If the amount is higher, you can provide the customer with the corresponding value and refund the surplus.

To authenticate a payment, use the "verify transaction" endpoint, specifying the transaction ID in the URL. You can obtain the transaction ID from the `data.id` field in the response after transaction creation, as well as in the webhook payload for any transaction.

### Request

```bash
GET /v1/payouts/{payoutId}/verify HTTP/1.1
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
```

#### Parameters

* Endpoint: `/v1/payouts/{payoutId}/verify`
* Method: `GET`

| Name       | Type   | Required | Description                                        |
| ---------- | ------ | -------- | -------------------------------------------------- |
| `payoutId` | String | Yes      | The unique ID of the payout transaction to verify. |

### **Response Structure**

The response from this API endpoint will be in the standard Moneroo API response format. You'll get a response that looks like this:

```json
{
  "message": "Payout transaction fetched successfully",
  "data": {
    // Details of the payout transaction
  }
}
```

**Successful Response:**

Upon successful retrieval, the endpoint returns an HTTP status code of 200 and the details of the payment transaction in the response body.

**Error Responses**:

1. **401 Unauthorized**: This error is returned if you didn't provide a valid authorization token in your request.
2. **404 Not Found**: This error is returned if the provided `payoutId` doesn't correspond to any transaction in the system.
3. **500 Internal Server Error**: This error indicates an unexpected issue on the server while processing your request. It happens rarely.

### Security considerations

This endpoint requires a bearer token for authentication. The bearer token must be included in the `Authorization` header of the request. Ensure the token is kept secure and not shared or exposed inappropriately.

### Request examples

{% hint style="info" %}
Replace *`'paymentId'`* with the actual payment transaction ID and *`'your_token'`* with a valid API key in the code snippets above.
{% endhint %}

{% tabs %}
{% tab title="Curl" %}

```bash
curl --location --request GET 'https://api.moneroo.io/v1/payouts/{payoutId}/verify' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

{% endtab %}

{% tab title="PHP" %}

```php
<?php

$paymentId = 'your_payment_id';
$token = 'your_token';

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.moneroo.io/v1/payments/{$paymentId}/verify",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer {$token}"
  ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
  // Handle successful response
} else {
  // Handle error response
}

curl_close($curl);
```

{% endtab %}

{% tab title="Python" %}

```python
import requests

paymentId = 'your_payment_id'
token = 'your_token'

headers = {
  'Authorization': f'Bearer {token}'
}

response = requests.get(f'https://api.moneroo.io/v1/payments/{paymentId}/verify', headers=headers)

if response.status_code == 200:
  # Handle successful response
else:
  # Handle error response
```

{% endtab %}

{% tab title="Go" %}

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	paymentId := "your_payment_id"
	token := "your_token"

	url := fmt.Sprintf("https://api.moneroo.io/v1/payments/%s/verify", paymentId)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		// Handle error
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// Handle error
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		// Handle successful response
	} else {
		// Handle error response
	}
}
```

{% endtab %}

{% tab title="JavaScript (Node.js)" %}

<pre class="language-javascript"><code class="lang-javascript"><strong>const axios = require("axios");
</strong>
const paymentId = "your_payment_id";
const token = "your_token";

axios
  .get(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    if (response.status === 200) {
      // Handle successful response
    } else {
      // Handle error response
    }
  })
  .catch((error) => {
    // Handle error
  });
</code></pre>

{% endtab %}
{% endtabs %}

You'll get a response that looks like this:

```json
{
    "message": "Payout transaction fetched successfully!",
    "data": {
        "id": "go86j8csuq51",
        "status": "success",
        "amount": 500,
        "currency": {
            "name": "US Dollar",
            "symbol": "$",
            "symbol_first": true,
            "decimals": 2,
            "decimal_mark": ".",
            "thousands_separator": ",",
            "subunit": "Cent",
            "subunit_to_unit": 100,
            "symbol_native": "$",
            "decimal_digits": 2,
            "rounding": 0,
            "code": "USD",
            "name_plural": "US dollars",
            "icon_url": "https://assets.cdn.moneroo.io/currencies/USD.svg"
        },
        "amount_formatted": "$ 500.00",
        "description": "hello",
        "environment": "sandbox",
        "metadata": [],
        "app": {
            "id": "01HHJYSA4VCBVKN4KTYF76J",
            "name": "Smarte",
            "website_url": "https://www.smarthome.com",
            "icon_url": "https://assets.cdn.moneroo.io/samples/business.svg",
            "created_at": "2023-12-14T01:24:17.000000Z",
            "updated_at": "2023-12-14T01:24:17.000000Z",
            "is_enabled": false
        },
        "customer": {
            "id": "fsbh12wot2c3",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@test.com",
            "phone": null,
            "address": null,
            "city": null,
            "state": null,
            "country_code": null,
            "country": null,
            "zip_code": null,
            "profile_url": "https://eu.ui-avatars.com/api/?name=John+Dow&background=ffcc00&color=fff&size=256&rounded=true&bold=true",
            "created_at": "2023-12-22T01:00:37.000000Z",
            "updated_at": "2024-01-08T13:09:23.000000Z"
        },
        "disburse": {
            "id": "0nj13p3bheje",
            "identifier": "pd_65miz6qf4u9y",
            "failure_message": null,
            "failure_error_code": null,
            "failure_error_type": null,
            "method": {
                "id": "6zyu010zn6wo",
                "name": "Test Payout Method",
                "short_code": "moneroo_payout_demo",
                "icon_url": "https://assets.cdn.moneroo.io/icons/circle/moneroo.svg"
            },
            "gateway": {
                "id": "8heokxp8yyxj",
                "account_name": "Moneroo Test Payout Gateway",
                "name": "Test Payout Gateway (Sandbox)",
                "short_code": "moneroo_payout_test",
                "icon_url": "https://assets.cdn.moneroo.io/icons/circle/moneroo.svg",
                "transaction_id": "b1f26365-3e02-4360-b646-39c2e91adce1",
                "transaction_status": "test_success",
                "transaction_failure_message": "This is a failed test payout, you do not use valid test phone number."
            }
        },
        "failed_at": null,
        "pending_at": "2023-12-26T22:04:49.000000Z",
        "success_at": "2023-12-26T22:04:50.000000Z"
    },
    "errors": null
}
```

The transaction details are contained in the `data` object. For instance:

* The status of the transaction is in `data.status`.
* The details of the customer are in the `data.customer` field.
* The `data.amount` field says how much the customer was charged.
* Some fields will vary depending on the type of transaction or state of the transaction.
* The `data.method` field contains the payment method used by the customer.
* The `data.gateway` field contains the payment gateway used to process the transaction.
* The `data.metadata` field contains any custom metadata you may have provided when creating the transaction.
* The `data.context` field contains the context of the transaction.
* The `data.app` field contains the app details.

<table><thead><tr><th width="268">Field Name</th><th>Description</th></tr></thead><tbody><tr><td><code>id</code></td><td>The public ID of the transaction.</td></tr><tr><td><code>status</code></td><td>The status of the transaction.</td></tr><tr><td><code>is_processed</code></td><td>Indicates whether the transaction is processed.</td></tr><tr><td><code>processed_at</code></td><td>The time when the transaction was processed.</td></tr><tr><td><code>amount</code></td><td>The amount involved in the transaction.</td></tr><tr><td><code>currency</code></td><td>The currency used in the transaction.</td></tr><tr><td><code>amount_formatted</code></td><td>The formatted amount involved in the transaction.</td></tr><tr><td><code>description</code></td><td>The description of the transaction.</td></tr><tr><td><code>return_url</code></td><td>The URL to return to after the transaction.</td></tr><tr><td><code>environment</code></td><td>The environment in which the transaction occurred.</td></tr><tr><td><code>initiated_at</code></td><td>The time when the transaction was initiated.</td></tr><tr><td><code>checkout_url</code></td><td>The URL to checkout the transaction.</td></tr><tr><td><code>app</code></td><td>The app associated with the transaction.</td></tr><tr><td><code>customer</code></td><td>The customer associated with the transaction.</td></tr><tr><td><code>method</code></td><td>The payment method associated with the transaction.</td></tr><tr><td><code>gateway</code></td><td>The payment gateway associated with the transaction.</td></tr><tr><td><code>metadata</code></td><td>The metadata associated with the transaction.</td></tr><tr><td><code>context</code></td><td>The context associated with the transaction.</td></tr></tbody></table>
