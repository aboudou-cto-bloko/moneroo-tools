# Retrieve payout

The Moneroo platform's API offers an endpoint that allows you to fetch the detailed information of a specific payout transaction based on its unique `transaction ID`.

This guide will walk you through the process of retrieving a payout transaction using Moneroo's API.

### Request

```bash
GET /v1/payouts/{payoutId} HTTP/1.1
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
```

#### Parameters

* Endpoint: `/v1/payouts/{payoutId}`
* Method: `GET`

<table><thead><tr><th width="200">Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td><code>payoutId</code></td><td>String</td><td>Yes</td><td>The unique ID of the payout transaction to retrieve.</td></tr></tbody></table>

### **Response Structure**

The response from this API endpoint will be in the standard Moneroo API response format.

You'll get a response that looks like this:

```json
{
  "success": true,
  "message": "Payout transaction fetched successfully",
  "data": {
    // Details of the payout transaction
  }
}
```

**Successful Response:**

Upon successful retrieval, the endpoint returns a HTTP status code of 200, and the details of the payout transaction in the response body.

**Error Responses:**

If there's an issue with your request, the API will return an error response. The type of error response depends on the nature of the issue. Check out our [response format page](https://docs.moneroo.io/introduction/responses-format) for more information.

### Security Considerations

This endpoint requires an API key for authentication. Include the bearer token in the `Authorization` header of your request. Ensure the token is kept secure and not shared or exposed inappropriately.

### Request example

#### Curl

```bash
curl --location --request GET 'https://api.moneroo.io/v1/payouts/{payoutId}' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

#### PHP

```php
<?php

$payoutId = 'your_payout_public_id';
$token = 'your_token';

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.moneroo.io/v1/payouts/{$payoutId}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer {$token}"
  ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
  $responseData = json_decode($response, true);
  // Handle successful response and retrieve the payout transaction details
} else {
  // Handle error response
}

curl_close($curl);
```

#### Python

```python
import requests

payout_public_id = 'your_payout_public_id'
token = 'your_token'

headers = {
  'Authorization': f'Bearer {token}'
}

response = requests.get(f'https://api.moneroo.io/v1/payouts/{payout_public_id}', headers=headers)

if response.status_code == 200:
  data = response.json()
  # Handle successful response and retrieve the payout transaction details
else:
  # Handle error response
```

#### Go

```go
package main

import (
	"fmt"
	"net/http"
	"io/ioutil"
)

func main() {
	payoutPublicID := "your_payout_public_id"
	token := "your_token"

	url := fmt.Sprintf("https://api.moneroo.io/v1/payouts/%s", payoutPublicID)
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

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		// Handle error
	}

	if resp.StatusCode == 200 {
		// Handle successful response and retrieve the payout transaction details
	} else {
		// Handle error response
	}
}
```

#### JavaScript (Node.js)

```javascript
const axios = require("axios");

const payoutId = "your_payout_public_id";
const token = "your_token";

axios
  .get(`https://api.moneroo.io/v1/payouts/${payoutId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    if (response.status === 200) {
      const data = response.data;
      // Handle successful response and retrieve the payout transaction details
    } else {
      // Handle error response
    }
  })
  .catch((error) => {
    // Handle error
  });
```

Please replace `'payoutId'` with the actual payout transaction Id and `'your_token'` with your valid authorization token in the code snippets above.

### Response example

You'll get a response that looks like this:

```json
{
  "message": "Payout transaction fetched successfully",
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
    "payout_phone_number": "+1234567890",
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
