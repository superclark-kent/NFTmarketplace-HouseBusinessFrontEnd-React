import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LoadingButton from "@mui/lab/LoadingButton";
import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useWeb3React } from '@web3-react/core';
import useNftStyle from 'assets/styles/nftStyle';
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseError, houseInfo, houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { apiURL, secretKey, zeroAddress } from 'mainConfig';
import { setAllHouseNFTs } from 'redux/actions/houseNft';
import MoreDetail from './MoreDetail';

function Dashboard(props) {
  const nftClasses = useNftStyle()
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const dispatch = useDispatch();
  const { allNFTs } = props.houseNft;
  const walletAccount = props.account.account;
  const houseBusinessContract = useHouseBusinessContract()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [viewDatapoint, setViewDatapoint] = useState(false);

  const loadNFTs = async () => {
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
          nfts.push({
            ...gNFTs[i],
            price: housePrice,
            tokenURI: decryptedURI,
            tokenName: decryptedName,
            tokenType: decryptedType
          })
        }
        if (account) {
          var otherNFTs = [];
          for (var i = 0; i < nfts.length; i++) {
            if (nfts[i].contributor.currentOwner === `${account}`) continue;
            otherNFTs.push(nfts[i]);
          }
          dispatch(setAllHouseNFTs(otherNFTs));
        } else {
          dispatch(setAllHouseNFTs(nfts));
        }
      })
      .catch(err => console.log(err));
  }

  const handleBuyNFT = async (item) => {
    if (!walletAccount) {
      houseInfo("Please connect your wallet!")
    } else {
      setLoading(true);
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
          })
          .catch(err => {
            houseError(err)
          });
      } else {
        try {
          await houseBusinessContract.methods.buyHouseNft(item.houseID, account).send({ from: account });
          houseSuccess("You bought successfully!")
          loadNFTs()
        } catch (err) {
          console.log('err', err)
        }
      }

      setLoading(false);
    }
  }

  const addAllowMe = async (item) => {
    try {
      await houseBusinessContract.methods.addAllowList(item.houseID, account).send({ from: account })
    } catch (err) {
      console.log('err', err)
    }
  }

  const handleClickMoreDetail = async (item) => {
    navigate(`../../item/${item.houseID}`)
  }

  const handleClickViewDatapoint = async () => {

  }

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log('useEffect triggered with walletAccount:', walletAccount);
    if (walletAccount) {
      loadNFTs();
    }
  }, [walletAccount]);

  return (
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
                        <Box component={'span'}>Current Price</Box>
                        <Box component={'h4'}>{`${web3.utils.fromWei(item.price)} MATIC`}</Box>
                      </Grid>}
                  </Grid>
                  <Grid className={nftClasses.nftHouseBottom}>
                    {
                      item.contributor.currentOwner !== walletAccount && (item.contributor.buyer === zeroAddress || item.contributor.buyer === walletAccount) && item.nftPayable === true ?
                        <LoadingButton
                          variant='contained'
                          onClick={() => handleBuyNFT(item)}
                          loadingPosition="end"
                          disabled={loading}
                          className={nftClasses.nftHouseButton}
                          endIcon={<BusinessCenterIcon />}
                        >
                          <Box component={'span'} className={nftClasses.nftHouseBuyButton} textTransform={'capitalize'} >{`Buy NFT`}</Box>
                        </LoadingButton> : <></>
                    }
                    {/* <MoreDetail account={walletAccount} item={item} nftClasses={nftClasses} handleClickMoreDetail={handleClickMoreDetail} houseBusinessContract={houseBusinessContract} /> */}
                    <Box
                      component={'a'}
                      className={nftClasses.nftHouseHistory}
                      onClick={handleClickOpen}
                    >
                      <CachedIcon />
                      {`View Datapoint`}
                    </Box>
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
      >
        <DialogTitle id="alert-dialog-title">
          {"You don't have permission to view datapoint for this House"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you want to view the datapoint, please pay for it
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleClose} autoFocus>
            Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

function mapStateToProps(state) {
  return {
    account: state.account,
    houseNft: state.houseNft,
  };
}

export default connect(mapStateToProps)(Dashboard);