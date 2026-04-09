# Retrieve payment

The Moneroo platform's API offers an endpoint that allows you to fetch the detailed information of a specific payment transaction based on its unique `transaction ID`.

This guide will walk you through the process of retrieving a payment transaction using Moneroo's API.

### Request

```bash
GET /v1/payments/{paymentId} HTTP/1.1
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
```

#### Parameters

* Endpoint: `/v1/payments/{paymentId}`
* Method: `GET`

| Name        | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `paymentId` | String | Yes      | The unique ID of the payment transaction to retrieve. |

### **Response Structure**

The response from this API endpoint will be in the standard Moneroo API response format.

You'll get a response that looks like this:

```json
{
  "success": true,
  "message": "Payment transaction fetched successfully",
  "data": {
    // Details of the payment transaction
  }
}
```

**Successful Response:**

Upon successful retrieval, the endpoint returns a HTTP status code **200**, and the payment transaction details in the response body.

**Error Responses:**

If there's an issue with your request, the API will return an error response. The type of error response depends on the nature of the issue. Check out the [response format page](https://docs.moneroo.io/introduction/errors) for more information.

### Security considerations

This endpoint requires a bearer token for authentication. The bearer token must be included in the `Authorization` header of the request. Ensure the token is kept secure and not shared or exposed inappropriately.

### Request examples

{% hint style="info" %}
Please replace `'`**`paymentId`**`'` with the actual payment transaction ID and `'`**`your_token`**`'` with your valid authorization token in the code snippets above.
{% endhint %}

{% tabs %}
{% tab title="Curl" %}

```bash
curl --location --request GET 'https://api.moneroo.io/v1/payments/{paymentId}' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

{% endtab %}

{% tab title="PHP" %}

```php
<?php

$paymentId = 'your_payment_public_id';
$token = 'your_token';

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.moneroo.io/v1/payments/{$paymentId}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer {$token}"
  ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
  $responseData = json_decode($response, true);
  // Handle successful response and retrieve the payment transaction details
} else {
  // Handle error response
}

curl_close($curl);
```

{% endtab %}

{% tab title="Python" %}

```python
import requests

payment_public_id = 'your_payment_public_id'
token = 'your_token'

headers = {
  'Authorization': f'Bearer {token}'
}

response = requests.get(f'https://api.moneroo.io/v1/payments/{payment_public_id}', headers=headers)

if response.status_code == 200:
  data = response.json()
  # Handle successful response and retrieve the payment transaction details
else:
  # Handle error response
```

{% endtab %}

{% tab title="Go" %}

<pre class="language-go"><code class="lang-go"><strong>package main
</strong>
import (
	"fmt"
	"net/http"
	"io/ioutil"
)

func main() {
	paymentPublicID := "your_payment_public_id"
	token := "your_token"

	url := fmt.Sprintf("https://api.moneroo.io/v1/payments/%s", paymentPublicID)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		// Handle error
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	client := &#x26;http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// Handle error
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		// Handle error
	}

	if resp.StatusCode == 200 {
		// Handle successful response and retrieve the payment transaction details
	} else {
		// Handle error response
	}
}
</code></pre>

{% endtab %}

{% tab title="JavaScript (Node.js)" %}

```javascript
const axios = require("axios");

const paymentId = "your_payment_public_id";
const token = "your_token";

axios
  .get(`https://api.moneroo.io/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    if (response.status === 200) {
      const data = response.data;
      // Handle successful response and retrieve the payment transaction details
    } else {
      // Handle error response
    }
  })
  .catch((error) => {
    // Handle error
  });
```

{% endtab %}
{% endtabs %}

### Response example

You'll get a response that looks like this:

```json
{
  "success": true,
  "message": "Payment transaction fetched successfully",
  "data": {
    "id": "abc123",
    "status": "success",
    "is_processed": true,
    "processed_at": "2023-05-21T12:00:00Z",
    "amount": 100.0,
    "currency": "USD",
    "amount_formatted": "$100.00",
    "description": "Purchase of goods",
    "return_url": "https://example.com/return",
    "environment": "production",
    "initiated_at": "2023-05-21T11:00:00Z",
    "checkout_url": "https://example.com/checkout",
    "payment_phone_number": "+1234567890",
    "app": {
      "id": "app1",
      "name": "Example App",
      "icon_url": "https://example.com/icon.png"
    },
    "customer": {
      "id": "cust1",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "country_code": "US",
      "country": "United States",
      "zip_code": "62701",
      "environment": "production",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-05-21T00:00:00Z"
    },
    "method": {
      "name": "Credit Card",
      "code": "cc",
      "icon_url": "https://example.com/cc.png",
      "environment": "production"
    },
    "gateway": {
      "name": "Stripe",
      "account_name": "Acme Corp",
      "code": "stripe",
      "icon_url": "https://example.com/stripe.png",
      "environment": "production"
    },
    "metadata": {
      "custom_field1": "custom_value1",
      "custom_field2": "custom_value2"
    },
    "context": {
      "ip": "192.0.2.0",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/58.0.3029.110 Safari/537",
      "country": "US",
      "local": "en-US"
    }
  }
}
```

The `data` field will contain the transaction details. The specific structure and content of this field depend on the details of the individual transaction.
