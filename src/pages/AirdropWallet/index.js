import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
    Box, Button, Divider, Grid, IconButton, InputBase,
    Paper, styled, TextField
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export default function AirdropWallet() {
    const { walletID } = useParams();

    return (
        <p>
            {walletID}
        </p>
    );
}