import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Web3 from "web3";
import { useWeb3React } from '@web3-react/core';
import {
    useOperatorContract,
} from "hooks/useContractHelpers";

import {
    Box, Button, Divider, Grid, IconButton, InputBase,
    Paper, styled, TextField
} from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function AirdropWallet() {
    const { account } = useWeb3React();
    const { OperatorContract } = useOperatorContract();
    const [walletID, setWalletID] = useState(useParams().walletID);
    const [creditBalance, setCreditBalance] = useState(0);

    const getCreditBalance = async () => {
        // Get the ERC20 token balance.
        var creditBalance = await OperatorContract.methods.balanceOf(walletID).call();

        setCreditBalance(Web3.utils.fromWei(`${creditBalance}`));
    };

    useEffect(() => {
        getCreditBalance();
    }, [account]);

    return (
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
        </Grid>
    );
}