export default async function(data, store) {
 
  const existing = store.get("myApp");
  if (existing) {
    return { value: existing };
  }

  const app = {
    name: data.name,
    created: new Date().toISOString()
  };

  return {
    persist: true,
    key: "myApp",
    value: app
  };
}
