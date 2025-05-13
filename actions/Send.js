export default function(data) {
  console.log("[JS] - Handling Send with:", data);
  return "Received your message: " + data.message;
}
