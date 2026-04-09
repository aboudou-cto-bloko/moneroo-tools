# Responses format

When interacting with the Moneroo APIs, it is essential to understand the format of the responses you will receive. This will help you properly interpret the responses and handle them appropriately in your application.

***

### **Response Structure**

Responses from the Moneroo API are returned in the JSON format and follow a consistent structure. Here's an example of a typical response:

```json
{
  "message": "Transaction initialized successfully.",
  "data": {},
  "errors" : null
}
```

Each part of this response carries specific information:

* **`message`**

This is a string field that provides a human-readable message about the result of the operation. If the API call is a success, this message usually confirms what has been achieved. If the API call has failed, this message usually provides information about what went wrong.

* **`data`**

This object contains any data returned by the operation. Its structure varies based on the specific API endpoint and the information it's designed to provide. For instance, a payment-related API might furnish payment details in this field. If no data is available, this field will be represented as an empty object (`{}`).

Please refer to the specific API endpoint documentation to understand the structure and content of the `data` field for each endpoint.

* **`errors`**

When interacting with the Moneroo APIs, you may encounter an `errors` field in the response body, especially in cases where the operation fails to execute as expected. This field is an array of error objects, each providing detailed context about specific issues encountered during the operation. These objects contain information such as the type of error, a detailed error message, and sometimes, a hint or steps to resolve the issue.&#x20;

Understanding this response format is crucial to making the most of the Moneroo APIs, as it will allow you to handle both successful operations and errors in a robust and user-friendly way.
