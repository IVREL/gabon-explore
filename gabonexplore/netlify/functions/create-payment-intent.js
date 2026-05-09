// ============================
// NETLIFY FUNCTION: create-payment-intent
// GabonExplore × Stripe
// Deploy at: /.netlify/functions/create-payment-intent
// ============================

// Install: npm install stripe
// Set env var in Netlify dashboard: STRIPE_SECRET_KEY=sk_live_...

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const body = JSON.parse(event.body);

    const { amount, currency = 'eur', customerEmail, bookingRef, destination } = body;

    if (!amount || amount < 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Montant invalide' }) };
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      receipt_email: customerEmail,
      metadata: {
        booking_ref: bookingRef,
        destination: destination,
        platform: 'gabonexplore'
      },
      description: `GabonExplore – Réservation ${destination}`,
      automatic_payment_methods: { enabled: true }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Erreur de paiement' })
    };
  }
};
