import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputBase, Paper, TextField } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import useContractStyle from 'assets/styles/contractStyle';
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract, useHouseDocContract } from 'hooks/useContractHelpers';
import { houseError, houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { secretKey, zeroAddress } from 'mainConfig';
import { useEffect, useState } from 'react';
import decryptfile from 'utils/decrypt';

export default function Contract() {
  const { account } = useWeb3React();
  const web3 = useWeb3();
  const classes = useContractStyle();
  const houseBusinessContract = useHouseBusinessContract();
  const houseDocContract = useHouseDocContract();

  const [cSC, setCSC] = useState('');
  const [allContracts, setAllContracts] = useState([]);
  const [notifyContent, setNotifyContent] = useState('');
  const [notifyArr, setNotifyArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cSArr, setCSArr] = useState([]);

  const [allReceiveContracts, setAllReceiveContracts] = useState([]);
  const [rNotifyArr, setRNotifyArr] = useState([]);
  const [rNotifyContent, setRNotifyContent] = useState('');

  const [editFlag, setEditFlag] = useState(-1);
  const [CSigner, setCSigner] = useState('');
  const [newSgnerLoading, setNewSgnerLoading] = useState(false);
  const [historyTypes, setHistoryTypes] = useState([]);

  const decryptFileFromUrl = async (url) => {
    const __decryptedFile = await decryptfile(url);
    return __decryptedFile;
  };

  const loadContracts = async () => {
    setLoading(true);

    const allCleanContracts = await houseDocContract.methods.getAllCleanContracts().call();

    var allCons = [], allOCons = [];
    for (let i = 0; i < allCleanContracts.length; i++) {
      if (allCleanContracts[i].owner == account) {
        var bytes = CryptoJS.AES.decrypt(allCleanContracts[i].contractURI, secretKey);
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        var bytesCompany = CryptoJS.AES.decrypt(allCleanContracts[i].companyName, secretKey);
        var decryptedCompany = bytesCompany.toString(CryptoJS.enc.Utf8);
        var bytesCurrency = CryptoJS.AES.decrypt(allCleanContracts[i].currency, secretKey);
        var decryptedCurrency = bytesCurrency.toString(CryptoJS.enc.Utf8);
        var contractURI = await decryptFileFromUrl(decryptedData);
        allCons.push({
          ...allCleanContracts[i],
          contractURI: contractURI,
          companyName: decryptedCompany,
          currency: decryptedCurrency,
        });
      }
      if (allCleanContracts[i].contractSigner == account) {
        var bytes = CryptoJS.AES.decrypt(allCleanContracts[i].contractURI, secretKey);
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        var bytesCompany = CryptoJS.AES.decrypt(allCleanContracts[i].companyName, secretKey);
        var decryptedCompany = bytesCompany.toString(CryptoJS.enc.Utf8);
        var bytesCurrency = CryptoJS.AES.decrypt(allCleanContracts[i].currency, secretKey);
        var decryptedCurrency = bytesCurrency.toString(CryptoJS.enc.Utf8);
        var contractURI = await decryptFileFromUrl(decryptedData);
        allOCons.push({
          ...allCleanContracts[i],
          contractURI: contractURI,
          companyName: decryptedCompany,
          currency: decryptedCurrency,
        });
      }
    }

    var arr = [];
    for (let i = 0; i < allCons.length; i++) {
      arr.push(false);
    }
    setCSArr(arr);
    setNotifyArr(arr);
    setAllContracts(allCons);
    arr = [];
    for (let i = 0; i < allOCons.length; i++) {
      arr.push(false);
    }
    setRNotifyArr(arr);
    setAllReceiveContracts(allOCons);
    setLoading(false);
  };

  const handleSign = async (item) => {
    setLoading(true);
    if (item.creator === account) {
      if (item.contractSigner === zeroAddress) {
        houseError('Add Contract Signer First.');
        setLoading(false);
      } else {
        await houseDocContract.methods.signContract(item.contractId).send({ from: account });
        loadContracts();
      }
    } else {
      await houseDocContract.methods.signContract(item.contractId).send({ from: account });
      loadContracts();
    }
  };

  const setCSAdd = (cSIndex, checked) => {
    var arr = [];
    for (let i = 0; i < cSArr.length; i++) {
      if (i == cSIndex) arr.push(checked);
      else arr.push(false);
    }
    setCSArr(arr);
  };

  const handleContractSigner = async (item) => {
    if (cSC === '') {
      houseError('Contract Signer is empty');
    } else {
      setLoading(true);
      try {
        await houseDocContract.methods.addContractSigner(item.contractId, cSC).send({ from: account });

        loadContracts();
        setTimeout(loadContracts, 3000);
      } catch (err) {
        console.log('err', err)
      }
    }
    // }
  };

  const setNotifyAdd = (notifyIndex, checked) => {
    var arr = [];
    for (let i = 0; i < notifyArr.length; i++) {
      if (i == notifyIndex) arr.push(checked);
      else arr.push(false);
    }
    setNotifyArr(arr);
  };

  const setRNotifyAdd = (notifyIndex, checked) => {
    var arr = [];
    for (let i = 0; i < rNotifyArr.length; i++) {
      if (i == notifyIndex) arr.push(checked);
      else arr.push(false);
    }
    setRNotifyArr(arr);
  };

  const handleSendNotify = async (item, _owner) => {
    setLoading(true);
    var notifyReceiver = account === item.owner ? item.contractSigner : item.owner;
    var sentNotifies = await houseDocContract.methods.getAllNotifies(notifyReceiver).call({ from: notifyReceiver });
    var flag = false;
    for (let i = 0; i < sentNotifies.length; i++) {
      if (item.contractId === sentNotifies[i].ccId) {
        flag = true;
      }
    }
    if ((_owner === 'creator' && notifyContent === '') || (_owner === 'signer' && rNotifyContent === '')) {
      houseError('Notify content 1 is empty');
      setLoading(false);
    } else if (_owner === 'creator' && notifyReceiver === zeroAddress) {
      houseError('Add contract Signer first.');
      setLoading(false);
    } else {
      if (flag === false) {
        try {
          await houseDocContract.methods
            .sendNotify(notifyReceiver, _owner === 'creator' ? notifyContent : rNotifyContent, item.contractId)
            .send({ from: account });
        } catch (err) {
          console.log('err', err)
          setLoading(false);
        }
        loadContracts();
      } else {
        houseError('You already sent notify to this signer');
        setLoading(false);
      }
    }
  };

  const generateDate = (time) => {
    var dt = new Date(Number(time));
    var yr = dt.getFullYear();
    var mt = dt.getMonth() + 1 < 10 ? `0${dt.getMonth() + 1}` : dt.getMonth() + 1;
    var dy = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate();
    return `${dy}-${mt}-${yr}`;
  };

  const getAllHistoryTypes = async () => {
    var hTypes = await houseBusinessContract.methods.getAllHistoryTypes().call();
    var allHTypes = [];
    for (let i = 0; i < hTypes.length; i++) {
      allHTypes.push(hTypes[i]);
    }
    setHistoryTypes(allHTypes);
  }

  useEffect(() => {
    if (account) {
      getAllHistoryTypes();
      loadContracts();
    }
  }, [account]);

  function ChangeSigner(index) {
    setCSigner(allContracts[index].contractSigner);
    setEditFlag(index);
  }

  const SaveNewSigner = async (k) => {
    let temp = [...allContracts];
    try {
      await houseDocContract.methods.addContractSigner(temp[k].contractId, CSigner).send({ from: account });
      temp[k].contractSigner = CSigner;
      setAllContracts(temp);
      houseSuccess('Successed Changing Signer!');
    } catch (err) {
      console.log('err', err)
    }
    setEditFlag(-1);
  };

  return (
    <Grid>
      <Box component={'h2'}>My Contracts</Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {allContracts.map((item, index) => {
          return (
            <Grid
              item
              xl={3}
              lg={4}
              md={6}
              sm={6}
              key={index}
              className={classes.contractItem}
              component="fieldset"
              variant="filled"
              sx={{ border: '0 !important' }}
            >
              <Grid className={classes.contractCard}>
                <embed className={classes.contractPdf} src={item.contractURI}></embed>
                <Grid className={classes.contractDesc} m={3}>
                  <Grid className={classes.agreedPrice} m={1}>
                    ContractID: <Box component={'b'}>#{item.contractId}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Contract Type: <Box component={'b'}>{historyTypes[item.contractType].hLabel}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Company: <Box component={'b'}>{item.companyName}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Agreed Price:{' '}
                    <Box component={'b'}>
                      {item.currency === 'MATIC' ? web3.utils.fromWei(item.agreedPrice) : item.agreedPrice}{' '}
                      {item.currency}
                    </Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Date From: <Box component={'b'}>{generateDate(item.dateFrom)}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Date To: <Box component={'b'}>{generateDate(item.dateTo)}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Whole Status: <Box component={'b'}>{item.status}</Box>
                  </Grid>
                  {`${item.contractSigner}` != zeroAddress ? (
                    <>
                      <Grid className={classes.agreedPrice} m={1}>
                        Signer wallet-address:{' '}
                        {editFlag === index ? (
                          <Box
                            component={'b'}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            disabled={newSgnerLoading}
                          >
                            <Paper
                              component="form"
                              sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: 400,
                              }}
                            >
                              <InputBase
                                value={CSigner}
                                onChange={(e) => setCSigner(e.target.value)}
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="New Contract Signer"
                                inputProps={{ 'aria-label': 'package' }}
                              />
                              <IconButton
                                aria-label="edit"
                                color="primary"
                                onClick={() => {
                                  SaveNewSigner(index);
                                }}
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton aria-label="edit" color="primary" onClick={() => setEditFlag(-1)}>
                                <CloseIcon />
                              </IconButton>
                            </Paper>
                          </Box>
                        ) : (
                          <Box
                            component={'b'}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              wordBreak: 'break-all',
                            }}
                          >
                            {item.contractSigner}
                            {item.signerApproval === false ? (
                              <IconButton
                                aria-label="edit"
                                color="primary"
                                onClick={() => {
                                  ChangeSigner(index);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            ) : null}
                          </Box>
                        )}
                      </Grid>
                      <Grid className={classes.agreedPrice} m={1}>
                        Signer status:{' '}
                        <Box component={'b'}>
                          {item.signerApproval === false
                            ? `signer contract signer didn't sign yet.`
                            : `contract signer signed in ${generateDate(`${item.signerSignDate}000`)}`}
                        </Box>
                      </Grid>
                    </>
                  ) : (
                    <></>
                  )}
                </Grid>
                {`${item.contractSigner}` === zeroAddress ? (
                  <Grid>
                    <Grid sx={{ m: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={cSArr[index]}
                            onChange={(e) => {
                              setCSC('');
                              setCSAdd(index, e.target.checked);
                            }}
                            name="gilad"
                          />
                        }
                        label="Add Contract Signer"
                      />
                      <TextField
                        className={classes.notifyContent}
                        variant="filled"
                        label="Contract Signer"
                        value={cSArr[index] ? cSC : ''}
                        multiline
                        disabled={!cSArr[index] || loading}
                        onChange={(e) => setCSC(e.target.value)}
                      />
                    </Grid>
                    <Grid className={classes.sendNotify}>
                      <LoadingButton
                        loading={loading}
                        variant="outlined"
                        disabled={!cSArr[index]}
                        onClick={() => handleContractSigner(item)}
                      >
                        Add Contract Signer
                      </LoadingButton>
                    </Grid>
                  </Grid>
                ) : (
                  <></>
                )}
                {item.status === 'pending' ? (
                  <>
                    <Grid sx={{ m: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notifyArr[index]}
                            onChange={(e) => {
                              setNotifyContent('');
                              setNotifyAdd(index, e.target.checked);
                            }}
                            name="gilad"
                          />
                        }
                        label="Send Notify?"
                      />
                      <TextField
                        className={classes.notifyContent}
                        variant="filled"
                        label="Notify Content"
                        value={notifyArr[index] ? notifyContent : ''}
                        multiline
                        disabled={!notifyArr[index] || loading}
                        onChange={(e) => {
                          if (notifyContent.length < 280) {
                            setNotifyContent(e.target.value);
                          }
                        }}
                      />
                    </Grid>
                    <Grid className={classes.sendNotify}>
                      <LoadingButton
                        loading={loading}
                        variant="outlined"
                        disabled={!notifyArr[index]}
                        onClick={() => handleSendNotify(item, 'creator')}
                      >
                        Send Notify
                      </LoadingButton>
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                <Grid className={classes.sign}>
                  {item.creatorApproval === false ? (
                    <LoadingButton onClick={() => handleSign(item)} loading={loading} variant="contained">
                      Sign Contract
                    </LoadingButton>
                  ) : (
                    <Button variant="contained" disabled={true}>
                      You already signed Contract
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          );
        })}
      </Grid>

      <Box component={'h2'}>Received Contracts</Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {allReceiveContracts.map((item, index) => {
          return (
            <Grid
              item
              xl={3}
              lg={4}
              md={6}
              sm={6}
              key={index}
              className={classes.contractItem}
              component="fieldset"
              variant="filled"
              sx={{ border: '0 !important' }}
            >
              <Grid className={classes.contractCard}>
                <embed className={classes.contractPdf} src={item.contractURI}></embed>
                <Grid className={classes.contractDesc} m={3}>
                  <Grid className={classes.agreedPrice} m={1}>
                    ContractID: <Box component={'b'}>{item.contractId}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Contract Type: <Box component={'b'}>{historyTypes[item.contractType].hLabel}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Company: <Box component={'b'}>{item.companyName}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Agreed Price:{' '}
                    <Box component={'b'}>
                      {item.currency === 'MATIC' ? web3.utils.fromWei(item.agreedPrice) : item.agreedPrice}{' '}
                      {item.currency}
                    </Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    From: <Box component={'b'}>{generateDate(item.dateFrom)}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    To: <Box component={'b'}>{generateDate(item.dateTo)}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Whole Status: <Box component={'b'}>{item.status}</Box>
                  </Grid>
                  <Grid className={classes.CCreator} m={1}>
                    Contract Creator: <Box component={'b'}>{item.creator}</Box>
                  </Grid>
                  <Grid className={classes.agreedPrice} m={1}>
                    Creator status:{' '}
                    <Box component={'b'}>
                      {item.creatorApproval === false
                        ? `contract creator didn't sign yet.`
                        : `contract creator signed in ${generateDate(`${item.creatorSignDate}000`)}`}
                    </Box>
                  </Grid>
                </Grid>
                {item.status === 'pending' ? (
                  <>
                    <Grid sx={{ m: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rNotifyArr[index]}
                            onChange={(e) => {
                              setRNotifyContent('');
                              setRNotifyAdd(index, e.target.checked);
                            }}
                            name="gilad"
                          />
                        }
                        label="Add Text"
                      />
                      <TextField
                        className={classes.notifyContent}
                        variant="filled"
                        label="Notify Content"
                        value={rNotifyArr[index] ? rNotifyContent : ''}
                        multiline
                        disabled={!rNotifyArr[index]}
                        onChange={(e) => setRNotifyContent(e.target.value)}
                      />
                    </Grid>
                    <Grid className={classes.sendNotify}>
                      <LoadingButton
                        loading={loading}
                        variant="contained"
                        disabled={!rNotifyArr[index]}
                        onClick={() => handleSendNotify(item, 'signer')}
                      >
                        Send Notify
                      </LoadingButton>
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                <Grid className={classes.sign}>
                  {item.signerApproval === false ? (
                    <LoadingButton
                      loading={loading}
                      variant="contained"
                      onClick={() => handleSign(item)}
                    >
                      Sign Contract
                    </LoadingButton>
                  ) : (
                    <Button variant="contained" disabled={true}>
                      You already signed
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}
