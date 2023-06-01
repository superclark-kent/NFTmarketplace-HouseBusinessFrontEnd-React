import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { connect, useDispatch } from 'react-redux';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CachedIcon from '@mui/icons-material/Cached';
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import useNftStyle from 'assets/styles/nftStyle';
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract, useHouseDocContract } from 'hooks/useContractHelpers';
import { houseError, houseInfo, houseSuccess, houseWarning } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { apiURL, secretKey, zeroAddress } from 'mainConfig';
import { setAllHouseNFTs } from 'redux/actions/houseNft';

import styled from '@emotion/styled';
import DocumentIcon from '@mui/icons-material/DocumentScanner';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaymentIcon from '@mui/icons-material/Payment';
import { Avatar, Grid, IconButton, ListItem, MenuItem, TextField } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import useNftDetailStyle from 'assets/styles/nftDetailStyle';
import ContractDetailDialog from 'components/ContractDetailDialog';
import { decryptContract } from 'utils';

const StyledInput = styled('input')({
  display: 'none',
});

const label = { inputProps: { 'aria-label': 'Switch demo' } };

function Dashboard(props) {
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { allNFTs } = props.houseNft;
  const nftClasses = useNftStyle()
  const classes = useNftDetailStyle();
  const walletAccount = props.account.account;
  const historyTypes = props.historyTypes.historyTypes;
  const houseBusinessContract = useHouseBusinessContract()
  const houseDocContract = useHouseDocContract();
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [availableHistorie, setAvailableHistories] = useState([])
  const [cContract, setCContract] = useState({});
  const [showCContract, setShowCContract] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(0)
  const [open, setOpen] = useState(false);
  const [checkHistories, setCheckHistories] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [viewable, setViewable] = useState(false);
  const [openLoading, setLoadingOpen] = useState(false);

  const loadNFTs = async () => {
    setLoadingOpen(true);

    var nfts = [];
    houseBusinessContract.methods.getAllHouses().call()
      .then(async (gNFTs) => {
        for (let i = 0; i < gNFTs.length; i++) {
          var bytes = CryptoJS.AES.decrypt(gNFTs[i].tokenURI, secretKey);
          var decryptedURI = bytes.toString(CryptoJS.enc.Utf8);
          var bytesName = CryptoJS.AES.decrypt(gNFTs[i].tokenName, secretKey);
          var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
          var bytesType = CryptoJS.AES.decrypt(gNFTs[i].tokenType, secretKey);
          var decryptedType = bytesType.toString(CryptoJS.enc.Utf8)
          var housePrice = await houseBusinessContract.methods.getHousePrice(gNFTs[i].houseID).call();
          var price = housePrice - gNFTs[i].price
          nfts.push({
            ...gNFTs[i],
            price: price.toString(),
            sellingPrice: gNFTs[i].price,
            tokenURI: decryptedURI,
            tokenName: decryptedName,
            tokenType: decryptedType
          })
        }

        if (account) {
          var otherNFTs = [];
          for (var i = 0; i < nfts.length; i++) {
            if (nfts[i].contributor.currentOwner.toLowerCase() === account.toLowerCase()) continue;
            otherNFTs.push(nfts[i]);
          }
          dispatch(setAllHouseNFTs(otherNFTs));
        } else {
          dispatch(setAllHouseNFTs(nfts));
        }
      })
      .catch(err => console.log(err));
    setLoadingOpen(false);
  }

  const handleBuyNFT = async (item, price) => {
    if (!walletAccount) {
      houseInfo("Please connect your wallet!")
    } else {
      setLoading(true);
      setLoadingOpen(true);
      if (!account) {
        const data = houseBusinessContract.methods.buyHouseNft(item.houseID, walletAccount).encodeABI();
        const transactionObject = {
          data,
          to: houseBusinessContract.options.address,
          value: item.price
        }

        // Send trx data and sign
        fetch(`${apiURL}/signTransaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionObject,
            user: walletAccount
          }),
        })
          .then(async (res) => {
            if (res.status !== 200) {
              return res.json().then(error => {
                houseError(`Error: ${error.message}`);
                setLoading(false);
              });
            }
            houseSuccess("You bought successfully!")
            loadNFTs()
            navigate("../../house/myNfts");
          })
          .catch(err => {
            houseError(err)
          });
      } else {
        try {
          await houseBusinessContract.methods.buyHouseNft(item.houseID, account).send({ from: account, value: price });
          houseSuccess("You bought successfully!")
          loadNFTs()
          navigate("../../house/myNfts");
        } catch (err) {
          console.log('err', err)
        }
      }

      setLoading(false);
      setLoadingOpen(false);
    }
  }

  const handleChange = (_label, _hID, _checked) => {
    const idx = checkHistories.findIndex((item) => item.label == _label);
    const newDatas = [...checkHistories];
    newDatas[idx] = { ...newDatas[idx], checked: !newDatas[idx].checked }
    setCheckHistories(newDatas);
  }

  const addAllowUser = async () => {
    const checkedIds = checkHistories.filter((item) => item.checked).map((item) => item.hID);
    if (!viewable) {
      houseError("Can't see datapoints now!")
      return;
    }
    if (checkedIds.length == 0) {
      houseWarning("Please select the datapoint what you want to see!")
      return;
    } else {
      setLoading(true);
      const allowFee = await houseBusinessContract.methods.getAllowFee(selectedId, checkedIds).call();
      try {
        const tx = await houseBusinessContract.methods.addAllowUser(selectedId, checkedIds).send({ from: account, value: allowFee });
        getHistories(selectedId, account, false, viewable)
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    }
  }

  const handleClose = () => { setOpen(false); };
  const handleExpand = () => { setExpanded(!expanded); };

  const getHistories = async (_id, _owner, _flag, _viewable) => {
    setViewable(_viewable);
    var chistories = await houseBusinessContract.methods.getHistory(_id).call();
    var tempHistory = [], tempHistory1 = [], tempCheck = [];
    for (let i = 0; i < chistories.length; i++) {
      if (chistories[i].allowedUser.toLowerCase() == account.toLowerCase()) {
        var bytesOtherInfo = CryptoJS.AES.decrypt(chistories[i].otherInfo, secretKey);
        var decryptedHistory = bytesOtherInfo.toString(CryptoJS.enc.Utf8);
        var bytesBrandType = CryptoJS.AES.decrypt(chistories[i].brandType, secretKey);
        var decryptedBrandType = bytesBrandType.toString(CryptoJS.enc.Utf8);
        var bytesHouseBrand = CryptoJS.AES.decrypt(chistories[i].houseBrand, secretKey);
        var decryptedHouseBrand = bytesHouseBrand.toString(CryptoJS.enc.Utf8);
        var bytesDesc = CryptoJS.AES.decrypt(chistories[i].desc, secretKey);
        var decryptedDesc = bytesDesc.toString(CryptoJS.enc.Utf8);
        var bytesImg = CryptoJS.AES.decrypt(chistories[i].houseImg, secretKey);
        var decryptedImg = bytesImg.toString(CryptoJS.enc.Utf8);
        var yearField = chistories[i].flag ? chistories[i].yearField * -1 : chistories[i].yearField;
        tempHistory.push({
          ...chistories[i],
          otherInfo: decryptedHistory,
          brandType: decryptedBrandType,
          houseBrand: decryptedHouseBrand,
          desc: decryptedDesc,
          houseImg: decryptedImg,
          yearField: yearField
        });
      } else {
        var homeHistory = historyTypes[chistories[i].historyTypeId];
        tempHistory1.push({ ...chistories[i] });
        var temp = {
          "label": homeHistory.hLabel,
          "hID": chistories[i].hID,
          "checked": false
        }
        tempCheck.push(temp);
      }
    }
    setCheckHistories(tempCheck)
    setAvailableHistories(tempHistory);
    setHistories(tempHistory1);
    setSelectedId(_id)
    setOpen(true);

    var allContracts = await houseDocContract.methods.getDocContracts(_owner).call();
    var cArr = [];
    for (let i = 0; i < allContracts.length; i++) {
      const contract = decryptContract(allContracts[i]);
      cArr.push({
        ...contract,
        label: `${historyTypes[contract.contractType].hLabel} contract in ${contract.companyName}`,
      });
    }
    setContracts(cArr);
  };

  useEffect(() => {
    console.log('useEffect triggered with walletAccount:', walletAccount);
    if (walletAccount) {
      loadNFTs();
    }
  }, [walletAccount]);

  const handleCloseLoading = () => { setLoadingOpen(false); };

  return (
    <>
      <Grid>
        <Box component={'h2'}>Dashboard</Box>
        <Grid container spacing={3}>
          {
            (allNFTs && allNFTs.length > 0) ? allNFTs.map((item) => {
              return (
                <Grid
                  item
                  xl={3}
                  lg={4}
                  md={6}
                  sm={6}
                  key={item.houseID}
                  className={nftClasses.nftHouseItem}
                >
                  <Grid className={nftClasses.nftHouseCard}>
                    <Grid className={nftClasses.nftHouseMedia}>
                      <img className={nftClasses.nftImg} src={item.tokenURI} />
                    </Grid>
                    <Grid>
                      <Box component={'h3'} className={nftClasses.nftHouseTitle}>{item.tokenName}</Box>
                    </Grid>
                    <Grid className={nftClasses.nftHouseMetaInfo}>
                      <Grid className={nftClasses.nftHouseInfo}>
                        <Box component={'span'}>Owned By</Box>
                        <Box component={'h4'} className={nftClasses.nftHouseOwner}>{item.contributor.currentOwner}</Box>
                      </Grid>
                      {web3.utils.fromWei(item.price) > 0 &&
                        <Grid className={nftClasses.nftHousePrice}>
                          <Box component={'span'}>Current Value</Box>
                          <Box component={'h4'}>{`${web3.utils.fromWei(item.price)} MATIC`}</Box>
                          {item.nftPayable &&
                            <Box component={'span'} style={{ fontSize: '12px' }}>
                              Sellig Price: {item.sellingPrice > 0 ? 
                              `${web3.utils.fromWei(`${item.sellingPrice}`)} MATIC`: 
                              `${web3.utils.fromWei(`${item.price}`)} MATIC`}
                            </Box>
                          }
                        </Grid>}
                    </Grid>
                    <Grid className={nftClasses.nftHouseBottom}>
                      <Box
                        component={'a'}
                        className={nftClasses.vieDatapoint}
                        onClick={() => getHistories(item.houseID, item.contributor.currentOwner, true, item.nftViewable)}
                      >
                        {item.nftViewable &&
                          <>
                            <CachedIcon />
                            {`View Datapoint`}
                          </>
                        }
                      </Box>
                      {
                        item.contributor.currentOwner !== walletAccount && (item.contributor.buyer === zeroAddress || item.contributor.buyer === walletAccount) && item.nftPayable === true ?
                          <LoadingButton
                            variant='contained'
                            onClick={() => handleBuyNFT(item, item.price)}
                            loadingPosition="end"
                            disabled={loading}
                            className={nftClasses.nftHouseButton}
                            endIcon={<BusinessCenterIcon />}
                          >
                            <Box component={'span'} className={nftClasses.nftHouseBuyButton} textTransform={'capitalize'} >{`Buy NFT`}</Box>
                          </LoadingButton> : <></>
                      }
                    </Grid>
                  </Grid>
                </Grid>
              )
            }) : ''
          }
        </Grid>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth='lg'
        >
          <DialogContent xl={6} md={12}>
            <Grid>
              {histories.length > 0 && <Accordion expanded={expanded} onChange={handleExpand}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{availableHistorie.length ? 'More Datapoint' : 'View Datapoint'}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ListItem component="div" disablePadding>
                    <Paper sx={{ width: 320, maxWidth: '100%' }}>
                      <MenuList>
                        <MenuItem style={{ fontWeight: '700' }}>
                          <ListItemText >History Type</ListItemText>
                          <ListItemText style={{ textAlign: 'right' }}>View Datapoint</ListItemText>
                        </MenuItem>
                        <Divider />
                        {
                          checkHistories.map((item, index) => {
                            return (
                              <MenuItem key={index}>
                                <ListItemText>{item.label}</ListItemText>
                                <Switch {...label} checked={item.checked} onChange={(e) => handleChange(item.label, item.hID, e.target.checked)} name={item.label} />
                              </MenuItem>
                            )
                          })
                        }
                        <Divider />
                      </MenuList>
                      <LoadingButton
                        size="small"
                        color="secondary"
                        style={{ width: '100%' }}
                        onClick={() => addAllowUser()}
                        loading={loading}
                        loadingPosition="start"
                        startIcon={<PaymentIcon />}
                        variant="contained"
                      >
                        Pay
                      </LoadingButton>
                    </Paper>
                  </ListItem>
                </AccordionDetails>
              </Accordion>}
              {availableHistorie.map((item, index) => {
                var homeHistory = historyTypes[item.historyTypeId];
                return (
                  <ListItem key={index} component="div" disablePadding>
                    <TextField
                      className={classes.listhistoryType}
                      id="history-type"
                      label="History Type"
                      value={homeHistory.hLabel}
                      variant="standard"
                      disabled={true}
                    >
                    </TextField>
                    {homeHistory.imgNeed === true && item.houseImg != '' ? (
                      <Grid className={classes.imgLabel}>
                        <label htmlFor={`${historyTypes[item.historyTypeId].hLabel}-imag`}>
                          <Grid>
                            <StyledInput
                              accept="image/*"
                              id={`${historyTypes[item.historyTypeId].hLabel}-imag`}
                              multiple
                              type="file"
                              disabled={true}
                            />
                            <IconButton
                              color="primary"
                              aria-label="upload picture"
                              component="span"
                            >
                              <Avatar
                                alt="Image"
                                src={item.houseImg}
                              />
                            </IconButton>
                          </Grid>
                        </label>
                      </Grid>
                    ) : null}
                    {homeHistory.descNeed === true && item.desc != "" ? (
                      <TextField
                        id="standard-multiline-static"
                        label={'Picture Description'}
                        rows={4}
                        variant="standard"
                        className={classes.addHistoryField}
                        value={item.desc}
                        disabled={true}
                      />
                    ) : null}
                    {homeHistory.brandNeed === true && item.houseBrand != '' ? (
                      <TextField
                        id="standard-multiline-static"
                        label={'Brand'}
                        rows={4}
                        variant="standard"
                        className={classes.addHistoryField}
                        value={item.houseBrand}
                        disabled={true}
                      />
                    ) : null}
                    {homeHistory.brandTypeNeed === true && item.brandType != '' ? (
                      <TextField
                        id="standard-multiline-static"
                        label={'Brand Type'}
                        rows={4}
                        variant="standard"
                        className={classes.addHistoryField}
                        value={item.brandType}
                        disabled={true}
                      />
                    ) : null}
                    {homeHistory.yearNeed === true && item.yearField != '1' ? (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container justify="space-around" className={classes.addHistoryField} >
                          <DatePicker
                            views={['year', 'month', 'day']}
                            label="Date"
                            value={new Date(Number(item.yearField))}
                            renderInput={(params) => (
                              <TextField className={classes.needField} variant="standard" {...params} helperText={null} />
                            )}
                            disabled={true}
                            disableOpenPicker={true}
                          />
                        </Grid>
                      </LocalizationProvider>
                    ) : null}
                    {(homeHistory.otherInfo && item.otherInfo != '') && <TextField
                      id="standard-multiline-static"
                      label={'Other information'}
                      rows={4}
                      variant="standard"
                      className={classes.listHistoryField}
                      value={item.otherInfo}
                      disabled={true}
                    />}
                    {(item.contractId > 0) ? (
                      <>
                        <IconButton
                          onClick={() => {
                            const contract = contracts.find((c) => c.contractId == item.contractId);
                            setCContract(contract);
                            setShowCContract(true);
                          }}
                        >
                          <DocumentIcon />
                        </IconButton>
                      </>
                    ) : ""
                    }
                  </ListItem>
                );
              })}

              <ContractDetailDialog
                open={showCContract}
                onClose={() => setShowCContract(false)}
                contract={cContract}
                historyTypes={historyTypes}
              />
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid >
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openLoading}
        onClick={handleCloseLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

function mapStateToProps(state) {
  return {
    account: state.account,
    houseNft: state.houseNft,
    historyTypes: state.historyTypes
  };
}

export default connect(mapStateToProps)(Dashboard);