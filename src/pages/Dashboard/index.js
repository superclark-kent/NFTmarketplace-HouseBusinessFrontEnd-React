import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { Button, Grid } from '@mui/material';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import useNftStyle from 'assets/styles/nftStyle';
import CryptoJS from "crypto-js";
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseInfo, houseSuccess, houseError } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { secretKey, zeroAddress, apiURL } from 'mainConfig';
import MoreDetail from './MoreDetail';
import { setAllHouseNFTs, setAllMyNFTs } from 'redux/actions/houseNft';
import { setAccount } from 'redux/actions/account';

function Dashboard(props) {
  const nftClasses = useNftStyle()
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const dispatch = useDispatch();
  const { allMyNFTs, allNFTs } = props.houseNft;
  const walletAccount = props.account.account;
  const houseBusinessContract = useHouseBusinessContract()
  const navigate = useNavigate()

  const loadNFTs = async () => {
    var nfts = [];
    houseBusinessContract.methods.getAllHouses().call()
      .then(gNFTs => {
        for (let i = 0; i < gNFTs.length; i++) {
          var bytes = CryptoJS.AES.decrypt(gNFTs[i].tokenURI, secretKey);
          var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
          var bytesName = CryptoJS.AES.decrypt(gNFTs[i].tokenName, secretKey);
          var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
          var bytesType = CryptoJS.AES.decrypt(gNFTs[i].tokenType, secretKey);
          var decryptedType = bytesType.toString(CryptoJS.enc.Utf8)
          nfts.push({
            ...gNFTs[i],
            tokenURI: decryptedData,
            tokenName: decryptedName,
            tokenType: decryptedType
          })
          dispatch(setAllHouseNFTs(nfts));
        }
      })
      .catch(err => console.log(err));
  }

  const handleBuyNFT = async (item) => {
    if (!walletAccount) {
      houseInfo("Please connect your wallet!")
    } else {
      try {
        const data = houseBusinessContract.methods.buyHouseNft(item.tokenId, walletAccount).encodeABI();
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
          .then(res => {
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
      } catch (err) {
        console.log('err', err)
      }
    }
  }

  const handleClickMoreDetail = async (item) => {
    navigate(`../../item/${item.tokenId}`)
  }

  useEffect(() => {
    if (account) {
      dispatch(setAccount(account));
    } else {
      dispatch(setAccount(null));
    }
  }, []);

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
          allNFTs.length > 0 ? allNFTs.map((item) => {
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
                      (item.contributor.buyer === zeroAddress || item.contributor.buyer === account) && item.nftPayable === true ?
                        <Button
                          variant='outlined'
                          onClick={() => handleBuyNFT(item)}
                          className={nftClasses.nftHouseButton}
                          startIcon={<BusinessCenterIcon />}
                        >
                          <Box component={'span'} className={nftClasses.nftHouseBuyButton} textTransform={'capitalize'} >{`Buy NFT`}</Box>
                        </Button> : <></>
                    }
                    {account ? <MoreDetail account={account} item={item} nftClasses={nftClasses} handleClickMoreDetail={handleClickMoreDetail} houseBusinessContract={houseBusinessContract} /> : <></>}
                  </Grid>
                </Grid>
              </Grid>
            )
          }): ''
        }
      </Grid>
    </Grid>
  )
}

function mapStateToProps(state) {
  return {
    account: state.account,
    houseNft: state.houseNft
  };
}

export default connect(mapStateToProps)(Dashboard);