# Errors

Moneroo API is RESTful and as such, uses conventional HTTP response codes to indicate the success or failure of requests. This section describes the summary of these codes and what they mean in our context.

### Summary

* Codes in the **2XX** range mean that the API request was processed successfully.
* Codes in the **4XX** range mean that something was wrong with the data that you sent. For example, you might have missed some required parameters/headers, or you might be using the wrong API credentials.
* Codes in the **5XX** range indicate an error in processing on our end

### Common HTTP Codes

<table><thead><tr><th width="136">Code</th><th>Description</th></tr></thead><tbody><tr><td><strong>200</strong></td><td><strong>OK</strong> - Request was successful</td></tr><tr><td><strong>201</strong></td><td><strong>Created</strong> - The request was successful, and a resource was created as a result</td></tr><tr><td><strong>202</strong></td><td>Accepted - Request has been accepted and acknowledged. We will now go ahead to process the request and notify you of the status afterwards.</td></tr><tr><td><strong>400</strong></td><td><strong>Bad Request</strong> - Malformed request or missing required parameters</td></tr><tr><td><strong>401</strong></td><td><strong>Unauthorized</strong> - Missing required headers, wrong Public or Secret Key etc</td></tr><tr><td><strong>403</strong></td><td><strong>Forbidden</strong> - You are trying to access a resource for which you don't have proper access rights.</td></tr><tr><td><strong>404</strong></td><td><strong>Not Found</strong> - You are trying to access a resource that does not exist</td></tr><tr><td><strong>422</strong></td><td><strong>Unprocessable Entity</strong> - You provided all the required parameters but they are not proper for the request</td></tr><tr><td><strong>429</strong></td><td><strong>Too Many Requests</strong> - You have exceeded the number of requests allowed in a given time frame.</td></tr><tr><td><strong>500</strong></td><td><strong>Internal Server Error</strong> - We had a glitch in our servers. Retry the request in a little while or <a href="mailto:support@moneroo.io">contact support</a>. Rarely happens.</td></tr><tr><td><strong>503</strong></td><td><strong>Service Unavailable</strong> – We are temporarily offline for maintenance. Please try again later. Rarely happens.</td></tr></tbody></table>
