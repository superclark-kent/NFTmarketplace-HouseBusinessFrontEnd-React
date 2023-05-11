import { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentElement, CardElement, IdealBankElement } from '@stripe/react-stripe-js';
import Modal from "@mui/material/Modal";
import {
  Box, Button, Divider, Grid, IconButton, InputBase,
  Paper, styled, TextField
} from '@mui/material';
import { houseInfo, houseWarning, houseError, houseSuccess } from "hooks/useToast";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.href}`
      }
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      houseError(error.message);
    } else {
      houseError("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs"
  }

  return (
    <form>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '30px' }} disabled={!stripe || !elements || isLoading}>
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </Button>
    </form>
  )
}

export default CheckoutForm;