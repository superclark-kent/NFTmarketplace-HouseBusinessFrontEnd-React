import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { Button, Grid } from '@mui/material';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import useNftStyle from 'assets/styles/nftStyle';
import CryptoJS from "crypto-js";
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseInfo, houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { secretKey, zeroAddress } from 'mainConfig';
import MoreDetail from './MoreDetail';

export default function Dashboard() {
  const nftClasses = useNftStyle()
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const houseBusinessContract = useHouseBusinessContract()
  const navigate = useNavigate()
  const [allMyNFTs, setAllMyNFTs] = useState([])

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
          console.log('nfts', nfts)

        }
      })
      .catch(err => console.log(err));
    if (account) {
      var otherNFTs = [];
      for (var i = 0; i < nfts.length; i++) {
        if (nfts[i].contributor.currentOwner === `${account}`) continue;
        otherNFTs.push(nfts[i]);
      }
      setAllMyNFTs(otherNFTs);
    } else {
      setAllMyNFTs(nfts);
    }
  }

  const handleBuyNFT = async (item) => {
    if (!account) {
      houseInfo("Please connect your wallet!")
    } else {
      await houseBusinessContract.methods.buyHouseNft(item.houseID).send({ from: account, value: item.price });
      houseSuccess("You bought successfully!")
      loadNFTs()
    }
  }

  const handleClickMoreDetail = async (item) => {
    navigate(`../../item/${item.houseID}`)
  }

  useEffect(() => {
    loadNFTs()
  }, [account])

  return (
    <Grid>
      <Box component={'h2'}>Dashboard</Box>
      <Grid container spacing={3}>
        {
          allMyNFTs.length > 0 ? allMyNFTs.map((item) => {
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
                    <Box component={'h3'} className={nftClasses.nftHouseTitle}>{`${item.tokenName} - ${item.houseID}`}</Box>
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
          }) : ''
        }
      </Grid>
    </Grid>
  )
}
