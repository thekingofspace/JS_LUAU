import http from "http";

export default function (data) {
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
    res.on("data", (chunk) => {
      console.log(`${chunk}`);
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();

  return "Sent message to localhost:8081 with type: Test";
}
