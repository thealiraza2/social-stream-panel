const placeOrder = async (apiUrl, apiKey, service, link, quantity) => {
  const response = await fetch('https://social-stream-panel-nine.vercel.app/api/place-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiUrl,
      apiKey,
      service,
      link,
      quantity
    }),
  });
