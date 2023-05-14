import { useEffect, useState } from 'react';
import dotenv from "dotenv";
import { useLocation, useParams } from 'react-router-dom';
import Web3 from "web3";
dotenv.config();

import {
    Box, Button, Divider, Grid, IconButton, InputBase,
    Paper, styled, TextField, Alert
} from '@mui/material';
import Modal from "@mui/material/Modal";
import { houseError, houseInfo, houseSuccess, houseWarning } from "hooks/useToast";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from 'components/CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "1px solid black",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px",
};

import { OperatorAddress, apiURL } from 'mainConfig';
import {
    useOperatorContract,
    useERC20Contract,
    useWeb3Content
} from "hooks/useContractHelpers";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function AirdropWallet() {
    const { account } = useWeb3React();
    const web3 = useWeb3Content();
    const OperatorContract = useOperatorContract();
    const ERC20TokenContract = useERC20Contract();

    const navigate = useNavigate();
    const location = useLocation();
    const { walletID: urlWalletID } = useParams();
    const [walletID, setWalletID] = useState(urlWalletID);
    const [message, setMessage] = useState(null);
    const [creditBalance, setCreditBalance] = useState(0);
    const [amountToDeposit, setAmountToDeposit] = useState('');
    const [operatorAddressOpen, setOperatorAddressOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(1000);
    const [checkoutFormOpen, setCheckoutFormOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        setWalletID(urlWalletID);
    }, [urlWalletID]);

    useEffect(() => {
        if (account) {
            setWalletID(account);
        } else {
            setWalletID(urlWalletID);
        }
    }, [account]);

    useEffect(() => {
        getCreditBalance();
    }, [walletID]);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch(`${apiURL}/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: paymentAmount,
                currency: 'usd'
            }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret));

        if (account) {
            setWalletID(account);
        }
    }, []);

    useEffect(async () => {
        const searchParams = new URLSearchParams(location.search);
        const clientSecretNew = searchParams.get('payment_intent_client_secret');

        if (clientSecretNew) {
            stripePromise.then(stripe => {
                stripe.retrievePaymentIntent(clientSecretNew).then(({ paymentIntent }) => {
                    switch (paymentIntent.status) {
                        case "succeeded":
                            houseSuccess("Payment succeeded!, please wait for a while to receive the airdrop minted $HBT.");
                            airdropERC20Token();
                            break;
                        case "processing":
                            houseInfo("Your payment is processing.");
                            break;
                        case "requires_payment_method":
                            houseError("Your payment was not successful, please try again.");
                            break;
                        default:
                            houseWarning("Something went wrong.");
                            break;
                    }
                });
            });
        }
    }, [location.search]);

    const appearance = {
        theme: 'flat',
    };

    const options = {
        clientSecret,
        appearance,
    };

    const getCreditBalance = async () => {
        try {
            // Get the ERC20 token balance.
            const creditBalance = await OperatorContract.methods.balanceOf(walletID).call();
            setCreditBalance(Web3.utils.fromWei(`${creditBalance}`));
        } catch (err) {
            console.log(err);
        }
    };

    const airdropERC20Token = () => {
        try {
            const amount = Web3.utils.toWei(`${paymentAmount}`, 'ether');
            const data = OperatorContract.methods.mintAndStore(walletID, amount).encodeABI();

            const transactionObject = {
                to: OperatorAddress,
                data
            };

            // mint ERC20 token
            fetch(`${apiURL}/signTransaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionObject
                }),
            })
                .then(res => res.json())
                .then(data => {
                    houseSuccess(`Congratulations, you received ${paymentAmount} $HBT token airdrop.`);
                    getCreditBalance();
                })
                .catch(err => {
                    throw new Error(err);
                });

        } catch (err) {
            houseError(err);
        }
        navigate(`${window.location.pathname}`);
    };

    const handleDeposit = async (e) => {
        if (!account) {
            return;
        }

        // Rough Validation
        if (amountToDeposit <= 0) {
            setMessage('Invalid amount');
            return;
        }

        const amountInWei = Web3.utils.toWei(`${amountToDeposit}`, 'ether');

        // Approve the token amount
        await ERC20TokenContract.methods.approve(OperatorAddress, amountInWei).send({ from: account });

        // Deposit the $HBT
        OperatorContract.methods
            .deposit(amountInWei)
            .send({ from: account })
            .then(receipt => {
                houseSuccess('Successfully Deposited');
                getCreditBalance();
            })
            .catch(error => {
                console.error(error);
            });

        setMessage('');
        setOperatorAddressOpen(false);
    }

    return (
        <>
            <Grid>
                <Grid item xs={12}>
                    <Box component={'h3'}>Airdrop wallet address</Box>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <div style={{ flex: '1' }}>
                            {walletID}
                        </div>
                    </Item>
                </Grid>
                <Grid item xs={12}>
                    <Box component={'h3'}>Credit $HBT balance</Box>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <div style={{ flex: '1' }}>
                            {creditBalance}
                        </div>
                    </Item>
                </Grid>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Button onClick={() => setCheckoutFormOpen(true)} variant="contained" color="secondary" style={{ marginTop: '20px' }}>
                        Purchase Credit $HBT ($10)
                    </Button>
                    <Button onClick={() => setOperatorAddressOpen(true)} variant="contained" color="primary" style={{ marginTop: '20px' }} disabled={account ? false : true}>
                        Deposit $HBT
                    </Button>
                </Box>
            </Grid>

            {account && (
                <Modal
                    open={operatorAddressOpen}
                    onClose={() => setOperatorAddressOpen(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    size="small"
                >
                    <Box sx={style}>
                        <Grid container spacing={3}>
                            <Grid item md={12}>
                                <Box component={'h3'}>Deposit $HBT to the credit account directly.</Box>
                                <Grid item md={12} sx={{ display: 'flex' }}>
                                    <Grid item md={12}>
                                        <Item>
                                            <div style={{ flex: '1' }}>
                                                {OperatorAddress}
                                            </div>
                                        </Item>
                                    </Grid>
                                </Grid>
                                <Grid item md={12} sx={{ display: 'flex', marginTop: '20px' }}>
                                    {/* Set the desired height in pixels */}
                                    <Grid item md={8} sx={{ height: '60px' }}>
                                        <TextField
                                            value={amountToDeposit}
                                            fullWidth
                                            onChange={(e) => setAmountToDeposit(e.target.value)}
                                            placeholder="$HBT amount to deposit"
                                            inputProps={{ 'aria-label': 'package' }}
                                        />
                                    </Grid>
                                    <Grid item md={4}>
                                        <Button onClick={handleDeposit} variant="contained" color="secondary" sx={{ marginLeft: '50px', height: '55px' }}>
                                            Deposit
                                        </Button>
                                    </Grid>
                                </Grid>
                                {/* Show any error or success messages */}
                                {message && <Alert className="my-alert" severity="error">{message}</Alert>
                                }
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
            )}

            <Modal
                open={checkoutFormOpen}
                onClose={() => setCheckoutFormOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                size="small"
            >
                <Box sx={style}>
                    <Grid container spacing={3}>
                        <Grid item md={12}>
                            {/* Stripe payment form */}
                            {clientSecret && (
                                <Elements stripe={stripePromise} options={options}>
                                    <CheckoutForm />
                                </Elements>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </>
    );
}