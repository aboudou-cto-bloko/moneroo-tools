# Transaction verification

After initiating a payment, you should confirm that the transaction was processed through Monero before crediting/debiting your customer in your application. This step ensures that the payment aligns with your expectations.&#x20;

Here are some key points to verify during the payment confirmation:

* **Confirm the Transaction Reference:** Ensure that the transaction reference matches the one you generated.
* **Check the Transaction Status:** Verify the transaction status is marked as `success` for successful payments. For more information on transaction statuses, refer to the Transaction Status Section.
* **Verify the Currency:** Confirm that the payment's currency matches the expected currency.
* **Ensure Correct Payment Amount:** Check that the paid amount is equal to or greater than the anticipated amount. If the amount is higher, provide the customer with the corresponding value and refund the surplus.

To authenticate a payment, use the `verify transaction` endpoint. Specify the transaction ID in the URL. You can obtain the transaction ID from the `data.id` field in the response after creating a transaction, as well as from the webhook payload for any transaction.

### Request

```bash
GET /v1/payments/{paymentId}/verify HTTP/1.1
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
```

#### Parameters

* Endpoint: `/v1/payments/{paymentId}/verify`
* Method: `GET`

<table><thead><tr><th width="143">Name</th><th width="81">Type</th><th width="102">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>paymentId</code></td><td>String</td><td>Yes</td><td>The unique ID of the payment transaction to verify.</td></tr></tbody></table>

### **Response Structure**

The response from this API endpoint will be in the standard Moneroo API response format. You'll get a response that looks like this:

```json
{
  "message": "Payment transaction fetched successfully",
  "data": {
    // Details of the payment transaction
  }
}
```

**Successful Response:**

Upon successful retrieval, the endpoint returns a HTTP status code of 200, and the details of the payment transaction in the response body.

**Error Responses:**

If there's an issue with your request, the API will return an error response. The type of error response depends on the nature of the issue. Check out our response format page for more information.

### Security considerations

This endpoint requires a bearer token for authentication. The bearer token must be included in the `Authorization` header of the request. Ensure the token is kept secure and not shared or exposed inappropriately.

### Request examples

Please replace `'paymentId'` with the actual payment transaction ID and `'your_token'` with your valid authorization token in the code snippets above.

{% tabs %}
{% tab title="Curl" %}

```bash
curl --location --request GET 'https://api.moneroo.io/v1/payments/{paymentId}/verify' \
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

```javascript
const axios = require("axios");

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
```

{% endtab %}
{% endtabs %}

### Response example

You'll get a response that looks like this:

```json
{
    "message": "Payment transaction fetched successfully!",
    "data": {
        "id": "k4su1ii7abdz",
        "status": "success",
        "is_processed": false,
        "processed_at": null,
        "amount": 200,
        "amount_formatted": "XOF 200",
        "currency": {
            "name": "CFA Franc BCEAO",
            "symbol": "XOF",
            "symbol_first": false,
            "decimals": 0,
            "decimal_mark": ",",
            "thousands_separator": ".",
            "subunit": "Centime",
            "subunit_to_unit": 100,
            "symbol_native": "XOF",
            "decimal_digits": 0,
            "rounding": 0,
            "code": "XOF",
            "name_plural": "CFA francs BCEAO",
            "icon_url": "https://assets.cdn.moneroo.io/currencies/XOF.svg"
        },
        "description": "Payment for order #124",
        "return_url": "https://axaship.com?paymentId=k4su1ii7abdz&paymentStatus=success",
        "environment": "sandbox",
        "initiated_at": "2024-01-31T14:46:13.000000Z",
        "metadata": {
            "order_id": "124",
            "customer_id": "124"
        },
        "app": {
            "id": "01HHJYSA4VCBVK135N4KTYF76J",
            "name": "Smarthome",
            "website_url": "https://www.smarthome.com",
            "icon_url": "https://assets.cdn.moneroo.io/samples/business.svg",
            "created_at": "2023-12-14T01:24:17.000000Z",
            "updated_at": "2023-12-14T01:24:17.000000Z",
            "is_enabled": false
        },
        "customer": {
            "id": "tzowl42roc7z",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": null,
            "address": null,
            "city": null,
            "state": null,
            "country_code": null,
            "country": null,
            "zip_code": null,
            "profile_url": "https://eu.ui-avatars.com/api/?name=John+Doe&background=5F6368&color=fff&size=256&rounded=true&bold=true",
            "created_at": "2023-12-14T01:49:28.000000Z",
            "updated_at": "2023-12-14T01:49:28.000000Z"
        },
        "capture": {
            "identifier": "14189ccd-4c52-4f29-bbd2-75ab45fc8c80",
            "rate": null,
            "rate_formatted": null,
            "correction_rate": null,
            "phone_number": "22951345780",
            "failure_message": null,
            "failure_error_code": null,
            "failure_error_type": null,
            "metadata": {
                "network_transaction_id": null,
                "amount_debited": null,
                "commission": null,
                "fees": null,
                "selected_payment_method": null
            },
            "amount": 200,
            "amount_formatted": "XOF 200",
            "currency": {
                "name": "CFA Franc BCEAO",
                "symbol": "XOF",
                "symbol_first": false,
                "decimals": 0,
                "decimal_mark": ",",
                "thousands_separator": ".",
                "subunit": "Centime",
                "subunit_to_unit": 100,
                "symbol_native": "XOF",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "XOF",
                "name_plural": "CFA francs BCEAO",
                "icon_url": "https://assets.cdn.moneroo.io/currencies/XOF.svg"
            },
            "method": {
                "id": "kt1itmi9xv0g",
                "name": "MTN MoMo Benin",
                "short_code": "mtn_bj",
                "icon_url": "https://assets.cdn.moneroo.io/icons/circle/mtn_xof.svg"
            },
            "gateway": {
                "id": "6eip4udyt8o6",
                "account_name": "Acme Inc",
                "name": "PawaPay (Sandbox)",
                "short_code": "pawapay_sandbox",
                "icon_url": "https://assets.cdn.moneroo.io/icons/circle/pawapay.svg",
                "transaction_id": "14189ccd-4c52-4f29-bbd2",
                "transaction_status": "COMPLETED",
                "transaction_failure_message": null
            },
            "context": {
                "ip": "2a09:bac5:52d:c8",
                "user_agent": {
                    "is_desktop": true,
                    "is_robot": false,
                    "platform": "OS X",
                    "browser": "Chrome",
                    "version": "120.0.0.0",
                    "device": "Macintosh",
                    "is_mobile": false,
                    "is_phone": false,
                    "is_tablet": false,
                    "is_ios": false,
                    "is_android": false
                },
                "country": {
                    "name": "Benin",
                    "code": "BJ",
                    "alpha_3_code": "BEN",
                    "dial_code": "+229",
                    "currency": "XOF",
                    "currency_symbol": "CFA",
                    "flag": "https://cdn.axazara.com/flags/svg/BJ.svg"
                },
                "local": "en"
            }
        },
        "created_at": "2024-01-31T14:46:13.000000Z"
    },
    "errors": null
}

```

The transaction details are contained in the data object. For instance:

* `id`: A unique identifier for the payment transaction.
* `status`: The current status of the transaction (`success`, `pending`, `failed`).
* `is_processed`: A boolean value indicating whether the transaction has been mark as processed.
* `processed_at`: A timestamp of when the transaction was processed. `null` if not processed yet.
* `amount`: The total amount of the transaction.
* `currency`: An object containing details of the currency used for the transaction.
* `amount_formatted`: A string representing the formatted amount of the transaction.
* `description`: A brief description of the payment transaction.
* `return_url`: The URL where the user will be redirected post-transaction.
* `environment`: Indicates the environment where the transaction was processed (`sandbox` or `live`).
* `capture` : An object detailing specifics details about payment transaction ( `method`, `gateway`, `context` )
* `initiated_at`: The timestamp when the transaction was initiated.
* `metadata`: An object that stores additional information passed along with the transaction.
* `app`: An object containing information about the application through which the transaction was made.

Transaction object

| Field Name             | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `id`                   | The public ID of the transaction.                    |
| `status`               | The status of the transaction.                       |
| `is_processed`         | Indicates whether the transaction is processed.      |
| `processed_at`         | The time when the transaction was processed.         |
| `amount`               | The amount involved in the transaction.              |
| `currency`             | The currency used in the transaction.                |
| `amount_formatted`     | The formatted amount involved in the transaction.    |
| `description`          | The description of the transaction.                  |
| `return_url`           | The URL to return to after the transaction.          |
| `environment`          | The environment in which the transaction occurred.   |
| `initiated_at`         | The time when the transaction was initiated.         |
| `checkout_url`         | The URL to checkout the transaction.                 |
| `payment_phone_number` | The phone number associated with the payment method. |
| `app`                  | The app associated with the transaction.             |
| `customer`             | The customer associated with the transaction.        |
| `method`               | The payment method associated with the transaction.  |
| `gateway`              | The payment gateway associated with the transaction. |
| `metadata`             | The metadata associated with the transaction.        |
| `context`              | The context associated with the transaction.         |

**`capture` Object:**

| Field Name           | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `identifier`         | A unique identifier for the payment capture.                                |
| `rate`               | The exchange rate applied to the transaction, if any. Null if not applied.  |
| `rate_formatted`     | The formatted string of the applied exchange rate. Null if not applied.     |
| `correction_rate`    | Any correction to the initial rate that was applied. Null if not applied.   |
| `phone_number`       | The phone number associated with the payment method.                        |
| `failure_message`    | A message detailing any failure that occurred during capture. Null if none. |
| `failure_error_code` | The error code associated with the failure, if any. Null if no error.       |
| `failure_error_type` | The type of error encountered during capture, if any. Null if no error.     |
| `metadata`           | Additional metadata related to the capture process.                         |
| `amount`             | The amount that was captured.                                               |
| `amount_formatted`   | The formatted amount that was captured according to the currency rules.     |
| `currency`           | A nested object detailing the currency used in the capture.                 |
| `method`             | A nested object describing the payment method used for capture.             |
| `gateway`            | A nested object with details about the payment gateway used.                |
| `context`            | A nested object containing contextual details about the transaction.        |
