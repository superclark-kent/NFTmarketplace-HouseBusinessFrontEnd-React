import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core';
import { Box, Button, Grid } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CachedIcon from '@mui/icons-material/Cached';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import useNftStyle from 'assets/styles/nftStyle';

import { houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { secretKey, zeroAddress } from 'mainConfig';

export default function Nfts() {
  const navigate = useNavigate()
  const nftClasses = useNftStyle()
  const { account } = useWeb3React()
  const web3 = useWeb3()
  const houseBusinessContract = useHouseBusinessContract()
  const [allMyNFTs, setAllMyNFTs] = useState([])

  const loadNFTs = async () => {
    if (account) {
      var nfts = await houseBusinessContract.methods.getAllMyHouses().call({ from: account });
      var otherNFTs = [];
      for (var i = 0; i < nfts.length; i++) {
        if (nfts[i].currentOwner === zeroAddress) continue;
        console.log("nft[i]", nfts[i])
        var bytes = CryptoJS.AES.decrypt(nfts[i].tokenURI, secretKey);
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        var bytesName = CryptoJS.AES.decrypt(nfts[i].tokenName, secretKey);
        var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);

        otherNFTs.push({
          ...nfts[i],
          tokenName: decryptedName,
          tokenURI: decryptedData
        });
      }
      setAllMyNFTs(otherNFTs);
    }
  }

  const handlePayable = async (item, payable) => {
    try {
      await houseBusinessContract.methods.setPayable(item.tokenId, zeroAddress, payable).send({ from: account })
      houseSuccess("Your House NFT can be sold now.")
      loadNFTs()
    } catch (error) {
      console.log(error)
    }
  }

  const handleClickMoreDetail = async (item) => {
    navigate(`../../item/${item.tokenId}`)
  }

  useEffect(() => {
    if (account) {
      loadNFTs()
    }
  }, [account])

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
          }) : ''
        }
      </Grid>
    </Grid>
  )
}
