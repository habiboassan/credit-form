export async function handler(event) {
  const { reference } = JSON.parse(event.body);

  if (!reference) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing payment reference" }),
    };
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.data.status === "success") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          verified: true,
          amount: data.data.amount,
          customer: data.data.customer.email,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ verified: false }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Verification failed" }),
    };
  }
}
