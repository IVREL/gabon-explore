// ============================
// GABONEXPLORE – RESERVATIONS JS
// Booking System + Stripe Payment
// ============================

// ---- STATE ----
let currentStep = 1;
let bookingData = {
  destination: null, price: 0, days: 0,
  pax: 2, logement: 'standard', options: 0,
  total: 0, deposit: 0
};

// ---- DESTINATIONS DATA ----
const destinations = {
  lope: { name: 'Parc de la Lopé – Safari Gorilles', price: 290, days: 7 },
  loango: { name: 'Parc de Loango – Côte Sauvage', price: 350, days: 7 },
  libreville: { name: 'Libreville – Ville & Culture', price: 180, days: 3 },
  crystal: { name: 'Monts de Cristal – Aventure', price: 220, days: 5 },
  ivindo: { name: 'Parc d\'Ivindo – Chutes de Kongou', price: 310, days: 7 },
  'gabon-full': { name: 'Grand Tour du Gabon', price: 890, days: 14 }
};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const dateInput = document.getElementById('dateDepart');
  if (dateInput) dateInput.min = minDate;

  // Check URL params for pre-selected destination
  const params = new URLSearchParams(window.location.search);
  const dest = params.get('dest');
  if (dest) {
    const select = document.getElementById('destSelect');
    if (select) {
      select.value = dest;
      updatePrice();
    }
  }

  updatePrice();
});

// ---- PRICE CALCULATION ----
function updatePrice() {
  const select = document.getElementById('destSelect');
  if (!select) return;

  const selectedOpt = select.options[select.selectedIndex];
  const destKey = select.value;
  const basePrice = parseInt(selectedOpt.dataset.price || 0);
  const days = parseInt(selectedOpt.dataset.days || 0);
  const pax = parseInt(document.getElementById('nbPersonnes').value || 2);

  // Logement supplement
  const logement = document.querySelector('input[name="logement"]:checked')?.value || 'standard';
  const logSupp = logement === 'premium' ? 80 : logement === 'lodge' ? 40 : 0;
  const logName = logement === 'premium' ? 'Premium' : logement === 'lodge' ? 'Écolodge' : 'Standard';

  // Options
  let optionsTotal = 0;
  document.querySelectorAll('.checkbox-group input[type=checkbox]:checked').forEach(cb => {
    optionsTotal += parseInt(cb.value || 0);
  });

  const pricePerPax = basePrice + logSupp + optionsTotal;
  const total = pricePerPax * pax;
  const deposit = Math.round(total * 0.3);

  bookingData = { destination: destKey, destName: destinations[destKey]?.name || '–', price: basePrice, days, pax, logement, logName, options: optionsTotal, total, deposit };

  // Update summary
  document.getElementById('sumDest').textContent = destinations[destKey]?.name || '–';
  const dateVal = document.getElementById('dateDepart')?.value;
  if (dateVal) {
    const start = new Date(dateVal);
    const end = new Date(start); end.setDate(end.getDate() + days);
    document.getElementById('sumDates').textContent = `${formatDate(start)} → ${formatDate(end)}`;
  } else {
    document.getElementById('sumDates').textContent = '–';
  }
  document.getElementById('sumPax').textContent = pax === 1 ? '1 personne' : pax >= 5 ? 'Groupe 5+' : `${pax} personnes`;
  document.getElementById('sumLogement').textContent = logName;
  document.getElementById('sumSubtotal').textContent = basePrice > 0 ? `${basePrice * pax}€` : '0€';

  if (optionsTotal > 0) {
    document.getElementById('sumOptionsRow').style.display = 'flex';
    document.getElementById('sumOptions').textContent = `+${optionsTotal * pax}€`;
  } else {
    document.getElementById('sumOptionsRow').style.display = 'none';
  }

  document.getElementById('sumTotal').textContent = total > 0 ? `${total}€` : '–';
  document.getElementById('sumDeposit').textContent = deposit > 0 ? `${deposit}€` : '–';
  document.getElementById('totalDisplay').textContent = deposit > 0 ? `${deposit}€` : '0€';
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---- STEP NAVIGATION ----
function goToStep(step) {
  // Validate current step
  if (step > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && step !== 4) return; // payment handles its own transition
  }

  document.getElementById(`step${currentStep}`).classList.remove('active');
  document.getElementById(`step-ind-${currentStep}`).classList.remove('active');

  if (step > currentStep) {
    document.getElementById(`step-ind-${currentStep}`).classList.add('done');
  }

  currentStep = step;

  document.getElementById(`step${currentStep}`).classList.add('active');
  document.getElementById(`step-ind-${currentStep}`).classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep1() {
  const dest = document.getElementById('destSelect').value;
  if (!dest) {
    showError('Veuillez sélectionner une destination.');
    return false;
  }
  const date = document.getElementById('dateDepart').value;
  if (!date) {
    showError('Veuillez choisir une date de départ.');
    return false;
  }
  updatePrice();
  return true;
}

function validateStep2() {
  const prenom = document.getElementById('prenom').value.trim();
  const nom = document.getElementById('nom').value.trim();
  const email = document.getElementById('email').value.trim();
  const tel = document.getElementById('telephone').value.trim();

  if (!prenom || !nom) { showError('Veuillez entrer votre prénom et nom.'); return false; }
  if (!email || !email.includes('@')) { showError('Veuillez entrer un email valide.'); return false; }
  if (!tel) { showError('Veuillez entrer votre numéro de téléphone.'); return false; }
  return true;
}

function showError(msg) {
  const existing = document.querySelector('.booking-error');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'booking-error';
  div.style.cssText = 'background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.4);color:#ffaaaa;padding:0.8rem 1rem;border-radius:8px;font-size:0.85rem;margin-bottom:1rem;';
  div.textContent = '⚠️ ' + msg;

  const activeStep = document.querySelector('.booking-step.active');
  const firstBtn = activeStep.querySelector('.btn-step, .step-buttons');
  if (firstBtn) activeStep.insertBefore(div, firstBtn);

  setTimeout(() => div.remove(), 4000);
}

// ---- CARD FORMATTING ----
function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + ' / ' + v.substring(2);
  input.value = v;
}

// ---- PAYMENT PROCESSING ----
async function processPayment() {
  if (!document.getElementById('cgvAccept').checked) {
    showError('Veuillez accepter les conditions générales de vente.');
    return;
  }

  const cardName = document.getElementById('cardName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiry = document.getElementById('cardExpiry').value;
  const cvc = document.getElementById('cardCvc').value.trim();

  if (!cardName) { showError('Veuillez entrer le nom sur la carte.'); return; }
  if (cardNumber.length < 16) { showError('Numéro de carte invalide.'); return; }
  if (!expiry || expiry.length < 7) { showError('Date d\'expiration invalide.'); return; }
  if (!cvc || cvc.length < 3) { showError('CVV invalide.'); return; }

  // Simulate payment processing (replace with actual Stripe integration)
  const payBtn = document.getElementById('payBtn');
  payBtn.disabled = true;
  document.getElementById('payBtnText').innerHTML = '⏳ Traitement en cours...';

  // STRIPE INTEGRATION NOTE:
  // In production, replace the simulation below with:
  // 1. Call your Netlify Function to create a Stripe PaymentIntent
  // 2. Use stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })
  // 3. Handle the result

  try {
    // Simulate API call delay (2.5 seconds)
    await simulatePayment();

    // SUCCESS → go to confirmation
    const ref = 'GE-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('bookingRef').textContent = ref;
    document.getElementById('confirmMsg').textContent =
      `Merci ${document.getElementById('prenom').value} ! Votre réservation pour "${bookingData.destName}" est confirmée. Confirmation envoyée à ${document.getElementById('email').value}.`;

    // Save order to localStorage for demo
    const order = {
      ref,
      dest: bookingData.destName,
      total: bookingData.total,
      deposit: bookingData.deposit,
      date: document.getElementById('dateDepart').value,
      pax: bookingData.pax,
      client: `${document.getElementById('prenom').value} ${document.getElementById('nom').value}`,
      email: document.getElementById('email').value,
      createdAt: new Date().toISOString()
    };
    const orders = JSON.parse(localStorage.getItem('gabonexplore_orders') || '[]');
    orders.push(order);
    localStorage.setItem('gabonexplore_orders', JSON.stringify(orders));

    goToStep(4);

  } catch (err) {
    payBtn.disabled = false;
    document.getElementById('payBtnText').innerHTML = `💳 Payer <span id="totalDisplay">${bookingData.deposit}€</span>`;
    showError('Erreur de paiement. Veuillez vérifier vos informations et réessayer.');
  }
}

function simulatePayment() {
  return new Promise((resolve) => setTimeout(resolve, 2500));
}

/* ============================
   PRODUCTION STRIPE INTEGRATION
   ============================

To activate real Stripe payments:

1. Install Stripe: npm install stripe
2. Create netlify/functions/create-payment-intent.js:

   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   exports.handler = async (event) => {
     const { amount } = JSON.parse(event.body);
     const paymentIntent = await stripe.paymentIntents.create({
       amount: amount * 100, // cents
       currency: 'eur',
       metadata: { integration: 'gabonexplore' }
     });
     return {
       statusCode: 200,
       body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
     };
   };

3. Replace simulatePayment() above with:

   const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY');
   const { clientSecret } = await fetch('/.netlify/functions/create-payment-intent', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ amount: bookingData.deposit })
   }).then(r => r.json());

   const result = await stripe.confirmCardPayment(clientSecret, {
     payment_method: {
       card: cardElement, // Stripe Elements card
       billing_details: { name: cardName }
     }
   });
   if (result.error) throw result.error;

4. Set env variables in Netlify:
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
*/
