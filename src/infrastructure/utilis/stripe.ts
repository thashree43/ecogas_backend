import Stripe from 'stripe';

const secret = "sk_test_51Q2oHQ07bhNnobEeL2Wz4oIOqIk1Bjt4pp75hDnQV1fzCPBivbNYcHzrogTibMqSCG6dG6dcNKyIkraFG3fkpaXE00l57qO0rM"

const stripe = new Stripe(secret, {
  apiVersion: '2024-06-20', 
});

export default stripe;