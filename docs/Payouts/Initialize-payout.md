# Initialize payout

Moneroo's Payout API lets you send money to your customers. You can use it for refunds, rebates, salary payments, and more.

**How It Works**

1. **Send a POST Request**
   * From your server, send a POST request to Moneroo's Payout API with the payment details.
2. **Processing the Request**
   * Moneroo processes the request through the appropriate payment processor based on your chosen payout method.
3. **Receive the Response**
   * Moneroo will return a response with the status of your request.

### Step 1: Collect payout details

First, gather the payment details and format them as a JSON object to send to our API.

Here are the fields that you need to gather:

<table><thead><tr><th width="248">Field Name</th><th width="101" align="center">Type</th><th width="96" align="center">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>amount</code></td><td align="center">integer</td><td align="center">Yes</td><td>The payout amount.</td></tr><tr><td><code>currency</code></td><td align="center">string</td><td align="center">Yes</td><td>The currency of the payment. Currency should be a supported currency in valid <a href="https://en.wikipedia.org/wiki/ISO_4217">ISO 4217</a> format.</td></tr><tr><td><code>description</code></td><td align="center">string</td><td align="center">Yes</td><td>Description of the payment.</td></tr><tr><td><code>method</code></td><td align="center">string</td><td align="center">Yes</td><td>Payout method. Should be a valid supported payout method. Please check the supported payout method list</td></tr><tr><td><code>customer</code></td><td align="center">object</td><td align="center">Yes</td><td>Customer details.</td></tr><tr><td><code>customer.email</code></td><td align="center">string</td><td align="center">Yes</td><td>Customer's email address.</td></tr><tr><td><code>customer.first_name</code></td><td align="center">string</td><td align="center">Yes</td><td>Customer's first name.</td></tr><tr><td><code>customer.last_name</code></td><td align="center">string</td><td align="center">Yes</td><td>Customer's last name.</td></tr><tr><td><code>customer.phone</code></td><td align="center">integer</td><td align="center">No</td><td>Customer's phone number.</td></tr><tr><td><code>customer.address</code></td><td align="center">string</td><td align="center">No</td><td>Customer's address.</td></tr><tr><td><code>customer.city</code></td><td align="center">string</td><td align="center">No</td><td>Customer's city.</td></tr><tr><td><code>customer.state</code></td><td align="center">string</td><td align="center">No</td><td>Customer's state.</td></tr><tr><td><code>customer.country</code></td><td align="center">string</td><td align="center">No</td><td>Customer's country. Should be Should be a code in valid <a href="https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2">ISO 3166-1 alpha-2</a> format.</td></tr><tr><td><code>customer.zip</code></td><td align="center">string</td><td align="center">No</td><td>Customer's zip code.</td></tr><tr><td><code>metadata</code></td><td align="center">array</td><td align="center">No</td><td>Additional data for the payment.</td></tr></tbody></table>

### Step 2: Add required fields for specific payout methods

Each payout method has its [required fields](https://docs.moneroo.io/available-methods#required-fields). Please check the supported payout method list to see the required fields for each payout method.  These  required fields should be provided via `recipient` fields\
For example, the `mtn_bj` (MTN Mobile Money Benin) method requires you to provide `msisdn` via the following object:

<pre class="language-json"><code class="lang-json">"recipient" : {
<strong>    "msisdn" : "22951345020" //the MTN Mobile Money Phone number of customer
</strong>} 
</code></pre>

### Step 3: Send the payout request

Next, initiate the payout by calling our API with the collected payout details (don't forget to authorize with your secret key).

#### Example request :

<pre class="language-bash"><code class="lang-bash">POST /v1/payouts/initialize
Host: https://api.moneroo.io
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
Accept: application/json
{
    "amount": 1000,
    "currency": "XOF",
    "description": "Order refund",
    "customer": {
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },

    "metadata": {
        "payout_request": "123",
        "customer_id": "123"
    },
    "method": "mtn_bj",
    "recipient" : {
<strong>        "msisdn" : "22951345020"
</strong><strong>    } 
</strong>}
</code></pre>

#### Example response :

```json
{
  "success": true,
  "message": "Payout transaction initialized successfully",
  "data": {
    "id": "5f7b1b2c-1b2c-5f7b-0000-000000000000"
  }
}
```

### Step 3: After the payout request is sent

Once the payout is made (successful or failed), four things will occur:

1. **Webhook Notification**: If you have activated webhooks, we will send you a notification. For more information and examples, check out our guide on webhooks.
2. **Email Notification**: We will email you unless you have disabled this feature.
3. **Server-Side Verification**: You can verify the transaction on the server side by calling our API with the transaction ID.
4. **Failed Payout Notification**: If webhooks are enabled, we'll notify you for each failed payout. This can help you reach out to customers or take other actions. See our webhooks guide for an example.

If you have the webhooks setting enabled on your Moneroo application, we'll send you a notification for each failed payout. This is useful in case you want to later reach out to customers or perform other actions. See our webhooks guide for an example.

### Example

{% hint style="info" %}

* Please do not forget to replace `YOUR_SECRET_KEY` with your actual secret key.
* All following examples should be made in the backend, never expose your secret key to the public.
  {% endhint %}

#### cURL

```bash
curl -X POST https://api.moneroo.io/v1/payouts/initialize \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Accept: application/json" \
     -d '{
    "amount": 1000,
    "currency": "XOF",
    "description": "Order refund",
    "customer": {
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },

    "metadata": {
        "payout_request": "123",
        "customer_id": "123"
    },
    "method": "mtn_bj",
    "recipient" : {
        "msisdn" : "22951345020"
    } 
}'
```
