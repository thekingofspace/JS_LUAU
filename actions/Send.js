export default function(data) {
  console.log("Handling Send with:", data);
  return "Received your message: " + data.message;
}
