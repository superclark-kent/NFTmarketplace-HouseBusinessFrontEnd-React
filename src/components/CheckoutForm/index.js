import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentElement, CardElement, IdealBankElement } from '@stripe/react-stripe-js';
import Modal from "@mui/material/Modal";
import {
  Box, Button, Divider, Grid, IconButton, InputBase,
  Paper, styled, TextField
} from '@mui/material';

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error, paymentIntent } = await stripe.paymentIntents.create({
      amount: 1000, // amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    if (!error) {

      const { error, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: window.location.href
          }
        }
      );

      if (error) {
        console.log(error);
      } else if (paymentIntent.status === "succeeded") {
        console.log(paymentIntent);
        // send paymentIntent.id to your smart contract to complete the payment
      }
    }

    setLoading(false);
  };

  return (
    <form>
      <IdealBankElement />
      <Button onClick={handlePaymentSubmit} variant="contained" color="primary" style={{ marginTop: '20px' }} disabled={!stripe || loading}>Submit Payment</Button>
    </form>
  )
}

export default CheckoutForm;