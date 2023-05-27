import { Payments } from '@mui/icons-material';
import LoadingButton from "@mui/lab/LoadingButton";
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { houseError } from "hooks/useToast";
import { useState } from 'react';

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
      <LoadingButton
        onClick={handleSubmit}
        endIcon={<Payments />}
        loading={isLoading}
        loadingPosition="end"
        variant="contained"
        color="primary"
        style={{ marginTop: '30px' }}
        disabled={!stripe || !elements || isLoading}>
        <span id="button-text">
          {isLoading ? "Please wait" : "Pay now"}
        </span>
      </LoadingButton>
    </form>
  )
}

export default CheckoutForm;