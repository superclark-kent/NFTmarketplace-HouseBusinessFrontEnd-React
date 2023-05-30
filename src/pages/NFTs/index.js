import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CachedIcon from '@mui/icons-material/Cached';
import { Box, Button, Grid } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import CryptoJS from 'crypto-js';

import useNftStyle from 'assets/styles/nftStyle';
import { useHouseBusinessContract } from 'hooks/useContractHelpers';

import { houseInfo, houseSuccess, houseWarning } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { HouseBusinessAddress, apiURL, secretKey, zeroAddress } from 'mainConfig';
import { setAccount } from "redux/actions/account";
import { setAllMyNFTs } from 'redux/actions/houseNft';

function Nfts(props) {
  const navigate = useNavigate()
  const nftClasses = useNftStyle()
  const dispatch = useDispatch();
  const walletAccount = props.account.account;
  const { allMyNFTs } = props.houseNft
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const houseBusinessContract = useHouseBusinessContract()

  const loadNFTs = async () => {
    if (account) {
      var nfts = await houseBusinessContract.methods.getAllHouses().call();
      var otherNFTs = [];
      for (var i = 0; i < nfts.length; i++) {
        if ((nfts[i].contributor.currentOwner).toLowerCase() !== account.toLowerCase()) continue;
        var housePrice = await houseBusinessContract.methods.getHousePrice(nfts[i].houseID).call();
        var bytes = CryptoJS.AES.decrypt(nfts[i].tokenURI, secretKey);
        var decryptedURI = bytes.toString(CryptoJS.enc.Utf8);
        var bytesName = CryptoJS.AES.decrypt(nfts[i].tokenName, secretKey);
        var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
        otherNFTs.push({
          ...nfts[i],
          price: housePrice,
          tokenName: decryptedName,
          tokenURI: decryptedURI
        });
      }
      dispatch(setAllMyNFTs(otherNFTs));
    }
  }

  const handlePayable = async (item, payable) => {
    if (web3.utils.fromWei(item.price) == 0 && payable == true) {
      houseWarning("Please set NFT price to set payable");
      return;
    }
    if (!account) {
      try {
        const data = houseBusinessContract.methods.setPayable(item.houseID, zeroAddress, payable).encodeABI();
        const transactionObject = {
          data,
          to: houseBusinessContract.options.address
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
            houseSuccess("Your House NFT can be sold from now.")
            loadNFTs()
          })
          .catch(err => {
            houseError(err)
          });

      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await houseBusinessContract.methods.setPayable(item.houseID, zeroAddress, payable).send({ from: account })
        houseSuccess("Your House NFT can be sold from now.")
        loadNFTs()
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleClickMoreDetail = async (item) => {
    navigate(`../../item/${item.houseID}`)
  }

  useEffect(() => {
    if (account || walletAccount) {
      loadNFTs()
    }
    if (account) {
      dispatch(setAccount(account));
    } else {
      dispatch(setAccount(null));
    }
  }, [account])

  useEffect(() => {
    // if (allMyNFTs.length == 0) {
    //   console.log('allMyNFTs', allMyNFTs)
    //   houseInfo("There are no Houses to display on this page")
    //   return;
    // }
    console.log('house', HouseBusinessAddress)
  }, [])


  return (
    <Grid>
      <Box component={'h2'}>My NFTs</Box>
      <Grid container spacing={3}>
        {
          allMyNFTs.length > 0 ? allMyNFTs.map((item, index) => {
            return (
              <Grid
                item
                xl={3}
                lg={4}
                md={6}
                sm={6}
                key={index}
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
                    <Grid className={nftClasses.nftHousePrice}>
                      <Box component={'span'}>Current Price</Box>
                      <Box component={'h4'}>{`${web3.utils.fromWei(item.price)} MATIC`}</Box>
                    </Grid>
                  </Grid>
                  <Grid className={nftClasses.nftHouseBottom}>
                    <Button
                      variant='outlined'
                      onClick={() => handlePayable(item, item.nftPayable === false)}
                      className={nftClasses.nftHouseButton}
                      startIcon={<BusinessCenterIcon />}
                    >
                      <Box
                        component={'span'}
                        className={nftClasses.nftHouseBuyButton}
                        textTransform={'capitalize'}
                      >{`${item.nftPayable === false ? 'Set Payable' : 'Set Unpayable'}`}</Box>
                    </Button>
                    <Box component={'a'} className={nftClasses.nftHouseHistory} onClick={() => handleClickMoreDetail(item)} >
                      <CachedIcon />
                      {`More Detail`}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            )
          }) : ""
        }
      </Grid>
    </Grid>
  )
}


function mapStateToProps(state) {
  return {
    account: state.account,
    houseNft: state.houseNft,
  };
}

export default connect(mapStateToProps)(Nfts);