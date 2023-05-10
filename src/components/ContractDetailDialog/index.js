import decryptfile from 'utils/decrypt';
import { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, Grid } from '@mui/material';
import useContractStyle from 'assets/styles/contractStyle';
import web3 from 'web3';

const ContractDetailDialog = ({ contract, open, onClose }) => {
  const classes = useContractStyle();

  const [contractURI, setContractURI] = useState('');

  const generateDate = (time) => {
    var dt = new Date(Number(time));
    var yr = dt.getFullYear();
    var mt = dt.getMonth() + 1 < 10 ? `0${dt.getMonth() + 1}` : dt.getMonth() + 1;
    var dy = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate();
    return `${dy}-${mt}-${yr}`;
  };

  useEffect(() => {
    const decryptFile = async () => {
      if (open) {
        const __decryptedFile = await decryptfile(contract.contractURI);
        setContractURI(__decryptedFile)
      }
    }
    decryptFile();
  }, [open])

  useEffect(() => {
    console.log('here is dialog page')
  }, [])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Contract Detail</DialogTitle>
      <Grid
        item
        xl={3}
        lg={4}
        md={6}
        sm={6}
        className={classes.contractItem}
        component="fieldset"
        variant="filled"
        sx={{ border: '0 !important' }}
      >
        <Grid className={classes.contractCard}>
          <embed className={classes.contractPdf} src={contractURI}></embed>
          <Grid className={classes.contractDesc} m={3}>
            <Grid className={classes.agreedPrice} m={1}>
              ContractID: <Box component={'b'}>#{contract.contractId}</Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Contract Type: <Box component={'b'}>{contract.contractType}</Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Company: <Box component={'b'}>{contract.companyName}</Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Agreed Price:{' '}
              <Box component={'b'}>
                {contract.currency === 'MATIC' ? web3.utils.fromWei(contract.agreedPrice) : contract.agreedPrice}{' '}
                {contract.currency}
              </Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Date From: <Box component={'b'}>{generateDate(contract.dateFrom)}</Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Date To: <Box component={'b'}>{generateDate(contract.dateTo)}</Box>
            </Grid>
            <Grid className={classes.agreedPrice} m={1}>
              Whole Status: <Box component={'b'}>{contract.status}</Box>
            </Grid>
            <>
              <Grid className={classes.agreedPrice} m={1}>
                Signer wallet-address:{' '}
                <Box
                  component={'b'}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    wordBreak: 'break-all',
                  }}
                >
                  {contract.contractSigner}
                </Box>
              </Grid>
              <Grid className={classes.agreedPrice} m={1}>
                Signer status:{' '}
                <Box component={'b'}>
                  {contract.signerApproval === false
                    ? `signer contract signer didn't sign yet.`
                    : `contract signer signed in ${generateDate(`${contract.signerSignDate}000`)}`}
                </Box>
              </Grid>
            </>
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default ContractDetailDialog;
