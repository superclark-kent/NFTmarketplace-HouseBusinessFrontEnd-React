import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core';
import { Button, Grid } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CryptoJS from "crypto-js";
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { useNavigate } from 'react-router-dom';
import useNftStyle from 'assets/styles/nftStyle';
import { houseInfo, houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { Box } from '@mui/system';
import MoreDetail from './MoreDetail';
import { secretKey, zeroAddress } from 'mainConfig';
import { CoPresentOutlined } from '@mui/icons-material';

export default function Dashboard() {
  const nftClasses = useNftStyle()
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const houseBusinessContract = useHouseBusinessContract()
  const navigate = useNavigate()
  const [allMyNFTs, setAllMyNFTs] = useState([])

  const loadNFTs = async () => {
    var nfts = [];
    var gNFTs = await houseBusinessContract.methods.getAllHouses().call();
    for(let i = 0 ; i < gNFTs.length ; i++) {
      var bytes = CryptoJS.AES.decrypt(gNFTs[i].tokenURI, secretKey);
      var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      var bytesName = CryptoJS.AES.decrypt(gNFTs[i].tokenName, secretKey);
      var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
      var bytesType = CryptoJS.AES.decrypt(gNFTs[i].tokenType, secretKey);
      var decryptedType = bytesType.toString(CryptoJS.enc.Utf8)
      nfts.push({
        ...gNFTs[i],
        tokenURI :decryptedData,
        tokenName: decryptedName,
        tokenType: decryptedType
      })
    console.log('nfts', nfts)

    }
    if (account) {
      var otherNFTs = [];
      for (var i = 0; i < nfts.length; i++) {
        if (nfts[i].currentOwner === `${account}`) continue;
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
      await houseBusinessContract.methods.buyHouseNft(item.tokenId).send({ from: account, value: item.price });
      houseSuccess("You bought successfully!")
      loadNFTs()
    }
  }

  const handleClickMoreDetail = async (item) => {
    console.log('detail', item)
    navigate(`../../item/${item.tokenId}`)
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
                key={item.tokenId}
                className={nftClasses.nftHouseItem}
              >
                <Grid className={nftClasses.nftHouseCard}>
                  <Grid className={nftClasses.nftHouseMedia}>
                    <img className={nftClasses.nftImg} src={item.tokenURI} />
                  </Grid>
                  <Grid>
                    <Box component={'h3'} className={nftClasses.nftHouseTitle}>{`"${item.tokenName}"`}</Box>
                  </Grid>
                  <Grid className={nftClasses.nftHouseMetaInfo}>
                    <Grid className={nftClasses.nftHouseInfo}>
                      <Box component={'span'}>Owned By</Box>
                      <Box component={'h4'} className={nftClasses.nftHouseOwner}>{item.currentOwner}</Box>
                    </Grid>
                    <Grid className={nftClasses.nftHousePrice}>
                      <Box component={'span'}>Current Price</Box>
                      <Box component={'h4'}>{`${web3.utils.fromWei(item.price)} ETH`}</Box>
                    </Grid>
                  </Grid>
                  <Grid className={nftClasses.nftHouseBottom}>
                    {
                      (item.buyer === zeroAddress || item.buyer === account) && item.nftPayable === true ?
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
