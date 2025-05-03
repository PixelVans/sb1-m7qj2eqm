import { loadStripe } from '@stripe/stripe-js'


export const makePayment = async () => {
    setIsProcessing(true); // Set processing to true when payment starts

    const stripe = await loadStripe('pk_test_51Pz6WERoTuW6EzfZMfdekxghKcp4HeLFpylRthgBdNLRu7HOOFasCgsWxBHtBxz5VLgkJNYVqIqYSMPQ0nPUVMU500iSvuZ0et');
    
    const body = { products: cart };
    const headers = { "Content-Type": "application/json" };

    try {
      const response = await fetch(`http://localhost:5000`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      const session = await response.json();
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        console.log(result.error);
      }
    } catch (error) {
      console.log('Payment error: ', error);
    } finally {
      setIsProcessing(false); // Set processing to false after payment process ends
    }
  };