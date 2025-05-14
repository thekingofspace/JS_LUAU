# LUAU + JS Integration

I’m not great at documentation, but here’s my best shot.

This repo demonstrates how to connect **Luau** scripts to **JavaScript** using [Lune](https://lune-org.github.io/docs/getting-started/1-installation).

---

## Requirements

* [Lune](https://lune-org.github.io/docs/getting-started/1-installation) – the runtime that makes this possible.

* [Node Knowledge](https://nodejs.org/docs/latest/api/) – The secondary language behind.

---

## Structure

* `Modules/Invoke.luau` – Handles communication between Luau and JS.
* `actions/` – Put your JavaScript modules here. These are invoked from Luau.
* `Index.js` – Main script for node, launch your program from here.
* `Index.luau` – the executed luau script.

---

## Getting Started

### 1. Setup Your Luau Script

Here’s an example `Index.luau`:

```lua
local JsHandler = require("./Modules/Invoke")
local task = require("@lune/task")

task.wait(1)

local Signal = JsHandler.On("Test")

Signal:Connect(function(data)
    print("RAN")
end)

JsHandler:Invoke("Post", "Hello", function()
    print("Request Complete")
end)
```

This code:

* Waits 1 second
* Listens for JS callbacks of type `"Test"`
* Sends a `"Post"` signal to a JS module named `Post` in `./actions/Post.js`

---

### 2. Create a JS Handler

Place this in `actions/Post.js`:

```js
import http from "http";

export default function (data) {
  console.log("[JS] - Handling Send with:", data);

  const postData = JSON.stringify({
    type: "Test",
    data: data,
  });

  const options = {
    hostname: "127.0.0.1",
    port: 8081,
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    console.log(`[JS] - Response from 8081: ${res.statusCode}`);
    res.on("data", (chunk) => {
      console.log(`[JS] - Body: ${chunk}`);
    });
  });

  req.on("error", (e) => {
    console.error(`[JS] - Request error: ${e.message}`);
  });

  req.write(postData);
  req.end();

  return "Sent message to 127.0.0.1:8081 with type: Test";
}
```