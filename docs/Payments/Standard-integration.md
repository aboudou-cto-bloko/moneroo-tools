# Standard Integration

### Overview

Moneroo Standard is our "standard" payments flow that redirects your customer to a Moneroo-hosted payments page.

Here's how it works:

1. From your server, call the payment initialization endpoint with the payment details.
2. We'll return a link to a payment page. Redirect your customer to this link to make the payment.
3. Upon completion of the transaction, we'll redirect the customer back to you (to the return\_url you provided) with the payment details.

### Step 1: Collect payment details

First, you need to assemble payment details that will be sent to your API as a JSON object.

Here fields you need to collect:

<table><thead><tr><th width="348">Field Name</th><th width="120">Type</th><th width="76">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>amount</code></td><td>integer</td><td>Yes</td><td>The payment amount.</td></tr><tr><td><code>currency</code></td><td>string</td><td>Yes</td><td>The currency of the payment.</td></tr><tr><td><code>description</code></td><td>string</td><td>Yes</td><td>Description of the payment.</td></tr><tr><td><code>return_url</code></td><td>string</td><td>Yes</td><td>Return URL where your customer will be redirected after payment.</td></tr><tr><td><code>customer.email</code></td><td>string</td><td>Yes</td><td>Customer's email address.</td></tr><tr><td><code>customer.first_name</code></td><td>string</td><td>Yes</td><td>Customer's first name.</td></tr><tr><td><code>customer.last_name</code></td><td>string</td><td>Yes</td><td>Customer's last name.</td></tr><tr><td><code>customer.phone</code></td><td>string</td><td>No¹</td><td>Customer's phone number.</td></tr><tr><td><code>customer.address</code></td><td>string</td><td>No¹</td><td>Customer's address.</td></tr><tr><td><code>customer.city</code></td><td>string</td><td>No¹</td><td>Customer's city.</td></tr><tr><td><code>customer.state</code></td><td>string</td><td>No¹</td><td>Customer's state.</td></tr><tr><td><code>customer.country</code></td><td>string</td><td>No¹</td><td>Customer's country.</td></tr><tr><td><code>customer.zip</code></td><td>string</td><td>No¹</td><td>Customer's zip code.</td></tr><tr><td><code>metadata</code></td><td>array</td><td>No²</td><td>Additional data for the payment.</td></tr><tr><td><code>methods</code></td><td>array</td><td>No³</td><td>Payment method you want to make available for this transaction.</td></tr><tr><td><code>restrict_country_code</code></td><td>string</td><td>No⁴</td><td>Restrict the payment to a specific country.</td></tr><tr><td><code>restricted_phone</code></td><td>object</td><td>No⁴</td><td>Restrict the payment to a specific phone number.</td></tr><tr><td><code>restricted_phone.number</code></td><td>string</td><td>Yes⁵</td><td>The phone number to restrict the payment to.</td></tr><tr><td><code>restricted_phone.country_code</code></td><td>string</td><td>Yes⁵</td><td>The country code of the restricted phone number.</td></tr></tbody></table>

1. If not provided, the customer can be prompted to enter these details during the payment process based on the selected payment method.
2. There should be an array of key-value pairs. Only string values are allowed.
3. If not provided, all available payment methods will be allowed. The array should contain only the supported [payment method's](https://docs.moneroo.io/payments/available-methods) shortcodes.
4. You can use either `restrict_country_code` or restricted\_phone, but not both. They are mutually exclusive.
5. Required if `restricted_phone` is provided.

### Step 2: Obtain a Payment Link

Next, initiate the payment by calling the API with the collected payment details using the secret key for authorization.

#### Example request :

```bash
POST /v1/payments/initialize
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
{
    "amount": 100,
    "currency": "USD",
    "description": "Payment for order #123",
    "customer": {
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },
    "return_url": "https://example.com/payments/thank-you"
    "metadata": {
        "order_id": "123",
        "customer_id": "123" 
    },
    "methods": ["mtn_bj", "moov_bj"] # Once again, it is not required
}
```

#### Example response :

```json
{
  "message": "Transaction initialized successfully",
  "data": {
    "id": "5f7b1b2c",
    "checkout_url": "https://checkout.moneroo.io/5f7b1b2c"
  }
}
```

### Step 3: Redirect the User to the Payment Link

You only need to redirect your customer to the link returned in `data.checkout_url`. We will display our payment interface for the customer to make the payment.

### Step 4: After Payment

Once the payment is made, whether successful or failed, four things will occur:

* We redirect your user to your `return_url` with the status, **`paymentId`**, and **`paymentStatus`** in the query parameters once the payment is completed.
* We will send you a webhook if you have activated it. For more information on webhooks and to see examples, check out our [webhooks guide](https://docs.moneroo.io/introduction/webhooks).
* If the payment is successful, we will send an acknowledgment email to your customer (unless you have disabled this feature).
* We will email you (unless you have disabled this feature).
* On the server side, you need to handle the redirection and always check the [final status of the transaction](https://docs.moneroo.io/payments/transaction-verification).&#x20;

If you have webhooks enabled, we'll send you a notification for each failed payment attempt. This is useful in case you want to later reach out to customers who had issues paying. See our [webhooks guide](https://docs.moneroo.io/introduction/webhooks) for an example.

### Example

{% hint style="danger" %}

* Do not forget to replace `YOUR_SECRET_KEY` with your actual secret key.
* All subsequent examples should be executed in the backend. Never expose your secret key to the public.
  {% endhint %}

{% tabs %}
{% tab title="cURL" %}

```
curl -X POST https://api.moneroo.io/v1/payments/initialize \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Accept: application/json" \
     -d '{
         "amount": 100,
         "currency": "USD",
         "description": "Payment for order #123",
         "customer": {
             "email": "john@example.com",
             "first_name": "John",
             "last_name": "Doe"
         },
         "return_url": "https://example.com/payments/thank-you",
         "metadata": {
             "order_id": "123",
             "customer_id": "123"
         },
         "methods": ["qr_ngn", "bank_transfer_ngn"]
     }'
```

{% endtab %}

{% tab title="PHP" %}

<pre class="language-php"><code class="lang-php"><strong>&#x3C;?php
</strong>
$url = 'https://api.moneroo.io/v1/payments/initialize';

$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer YOUR_SECRET_KEY'
    'Accept: application/json'
];

$data = [
    "amount" => 100,
    "currency" => "USD",
    "description" => "Payment for order #123",
    "customer" => [
        "email" => "john@example.com",
        "first_name" => "John",
        "last_name" => "Doe"
    ],
    "return_url" => "https://example.com/payments/thank-you",
    "metadata" => [
        "order_id" => "123",
        "customer_id" => "123",
    ],
    "methods" => ["qr_ngn", "bank_transfer_ngn"]
];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($httpcode != 201) {
    die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
}

$response_data = json_decode($response, true);

// Redirect to the checkout page
header("Location: " . $response_data['checkout_url']);

?>

</code></pre>

{% endtab %}

{% tab title="Python" %}

```python
import requests
import json

url = 'https://api.moneroo.io/v1/payments/initialize'

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_KEY'
    'Accept': 'application/json'
}

data = {
    "amount": 100,
    "currency": "USD",
    "description": "Payment for order #123",
    "customer": {
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },
    "return_url": "https://example.com/payments/thank-you",
    "metadata": {
        "order_id": "123",
        "customer_id": "123",
    },
    "methods": ["qr_ngn", "bank_transfer_ngn"]
}

response = requests.post(url, headers=headers, data=json.dumps(data))

if response.status_code != 201:
    raise Exception(f"Request failed with status {response.status_code}")

checkout_url = response.json()['checkout_url']
print(f"Redirect to: {checkout_url}")
```

{% endtab %}

{% tab title="Go" %}

```go
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"fmt"
)

func main() {
	data := map[string]interface{}{
		"amount": 100,
		"currency": "USD",
		"description": "Payment for order #123",
		"customer": map[string]string{
			"email": "john@example.com",
			"first_name": "John",
			"last_name": "Doe",
		},
		"return_url": "https://example.com/payments/thank-you",
		"metadata": map[string]string{
			"order_id": "123",
			"customer_id": "123",
		},
		"methods": []string{"qr_ngn", "bank_transfer_ngn"},
	}

	bytesRepresentation, _ := json.Marshal(data)

	req, _ := http.NewRequest("POST", "https://api.moneroo.io/v1/payments/initialize", bytes.NewBuffer(bytesRepresentation))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer YOUR_SECRET_KEY")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	response, _ := client.Do(req)
	defer response.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(response.Body).Decode(&result)

	if response.StatusCode != 201 {
		panic(fmt.Sprintf("Request failed with status %d", response.StatusCode))
	}

	fmt.Printf("Redirect to: %s", result["checkout_url"])
}
```

{% endtab %}

{% tab title="JavaScript (Node.js)" %}

```javascript
const axios = require('axios');

const data = {
    "amount": 100,
    "currency": "USD",
    "description": "Payment for order #123",
    "customer": {
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },
    "return_url": "https://example.com/payments/thank-you",
    "metadata": {
        "order_id": "123",
        "customer_id": "123",
    },
    "methods": ["qr_ngn", "bank_transfer_ngn"]
};

const options = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_KEY'
    'Accept': 'application/json'
  }
};

axios.post('https://api.moneroo.io/v1/payments/initialize', data, options)
    .then((response) => {
        if (response.status !== 201) {
            throw new Error(`Request failed with status ${response.status}`);


 }
        console.log(`Redirect to: ${response.data.checkout_url}`);
    })
    .catch((error) => {
        console.error(error);
    });
```

{% endtab %}
{% endtabs %}
