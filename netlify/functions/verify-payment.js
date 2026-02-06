export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { reference } = JSON.parse(event.body || "{}");

  if (!reference) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing reference" }),
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

    console.log("Paystack response:", data);

    if (data.status === true && data.data.status === "success") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: {
            amount: data.data.amount / 100,
            reference: data.data.reference,
            status: data.data.status,
            email: data.data.customer.email,
          },
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "Payment not successful",
        paystackStatus: data.data?.status,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Verification error",
        details: error.message,
      }),
    };
  }
}

