import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Box } from "@mui/system";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EditIcon from "@mui/icons-material/Edit";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import CancelIcon from "@mui/icons-material/Cancel";
import { BigNumber } from 'ethers';
import { useWeb3 } from "hooks/useWeb3";
import { houseInfo, houseSuccess } from 'hooks/useToast';

export default function NFTdetail({
  account,
  classes,
  simpleNFT,
  buyerFlag,
  setBuyerFlag,
  specialBuyer,
  setSpecialBuyer,
  handleBuyerEdit,
  handlePayable,
  houseBusinessContract
}) {
  const [isBuyerEdit, setIsBuyerEdit] = useState(false);
  const [housePrice, setHousePrice] = useState(0);
  const web3 = useWeb3();
                                 
  const changeHousePrice = async (houseID) => {
    if (!account) {
      houseInfo("Please connect your wallet!")
    } else {
      const _housePrice = BigNumber.from(`${Number(housePrice) * 10 ** 18}`);
      await houseBusinessContract.methods.changeHousePrice(houseID, _housePrice).send({ from: account });
      houseSuccess("You have successfully set your House price!")
      // loadNFTs()
    }
  }

  useEffect(() => {
    if (simpleNFT) {
      setHousePrice(web3.utils.fromWei(simpleNFT.price))
      setIsBuyerEdit(!Boolean(simpleNFT.contributor.buyer));
    }
  }, [simpleNFT]);

  return (
    <Grid item xl={6} md={12}>
      <Grid className={classes.contentRight}>
        <Grid className={classes.itemDetail}>
          <Box component={"h2"}>{`"${simpleNFT.tokenName}"`}</Box>
        </Grid>
        <Grid className={classes.clientInfo}>
          <Grid className={classes.metaInfo}>
            <Box component={"span"}>Owned By</Box>
            <Box component={"h4"} className={classes.nftHouseOwner}>
              {simpleNFT.contributor.currentOwner}
            </Box>
          </Grid>
        </Grid>
        <Grid className={classes.nftHousePrice}>
          <TextField
            type="number"
            variant="filled"
            label="Current Price"
            value={housePrice}
            onChange={(e) => setHousePrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">MATIC</InputAdornment>
              ),
            }}
          />
          {
            
          }
          <Button
              variant="outlined"
              onClick={() => changeHousePrice(simpleNFT.houseID)}
              className={classes.nftHouseButton}
              startIcon={<BusinessCenterIcon />}
            >
              <Box
                component={"span"}
                className={classes.nftHouseBuyButton}
                textTransform={"capitalize"}
              >{`Change Price`}</Box>
            </Button>
        </Grid>
        {simpleNFT.contributor.currentOwner !== `${account}` &&
        simpleNFT.nftPayable === true ? (
          <Grid className={classes.buyButtonGroup}>
            <Button
              variant="outlined"
              onClick={() => handleBuyNFT(simpleNFT)}
              className={classes.nftHouseButton}
              startIcon={<BusinessCenterIcon />}
            >
              <Box
                component={"span"}
                className={classes.nftHouseBuyButton}
                textTransform={"capitalize"}
              >{`Buy NFT`}</Box>
            </Button>
          </Grid>
        ) : (
          ""
        )}
        {simpleNFT.contributor.currentOwner === `${account}` ? (
          simpleNFT.contributor.buyer ? (
            <Grid>
              <Grid className={classes.nftBuyer}>
                <TextField
                  id="standard-multiline-static"
                  label={"Wallet-address of Buyer"}
                  rows={4}
                  variant="filled"
                  className={classes.addHistoryField}
                  value={specialBuyer}
                  onChange={(e) => setSpecialBuyer(e.target.value)}
                  disabled={!isBuyerEdit}
                />
                {isBuyerEdit === false ? (
                  <Grid>
                    <IconButton onClick={() => setIsBuyerEdit(true)}>
                      <EditIcon />
                    </IconButton>
                  </Grid>
                ) : (
                  <Grid style={{ display: "flex" }}>
                    <IconButton
                      onClick={() => {
                        setIsBuyerEdit(false);
                        handleBuyerEdit();
                      }}
                    >
                      <SaveAsIcon />
                    </IconButton>
                    <IconButton onClick={() => setIsBuyerEdit(false)}>
                      <CancelIcon />
                    </IconButton>
                  </Grid>
                )}
              </Grid>

              <Button
                variant="outlined"
                onClick={() => handlePayable(!simpleNFT.nftPayable)}
                className={classes.nftHouseButton}
                startIcon={<BusinessCenterIcon />}
              >
                <Box
                  component={"span"}
                  className={classes.nftHouseBuyButton}
                  textTransform={"capitalize"}
                >{`${
                  simpleNFT.nftPayable === false
                    ? "Set Payable for everyone"
                    : "Set Unpayable"
                }`}</Box>
              </Button>
            </Grid>
          ) : (
            <Grid className={classes.buyButtonGroup}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={buyerFlag}
                    onChange={(e) => {
                      setSpecialBuyer("");
                      setBuyerFlag(e.target.checked);
                    }}
                    name="gilad"
                  />
                }
                label="Add Wallet-address of Buyer?"
              />
              {buyerFlag === true ? (
                <TextField
                  id="standard-multiline-static"
                  label={"Wallet-address of Buyer"}
                  rows={4}
                  variant="filled"
                  className={classes.addHistoryField}
                  value={specialBuyer}
                  onChange={(e) => setSpecialBuyer(e.target.value)}
                />
              ) : (
                <></>
              )}
              <Button
                variant="outlined"
                onClick={() => handlePayable(!simpleNFT.nftPayable)}
                className={classes.nftHouseButton}
                startIcon={<BusinessCenterIcon />}
              >
                <Box
                  component={"span"}
                  className={classes.nftHouseBuyButton}
                  textTransform={"capitalize"}
                >{`${
                  simpleNFT.nftPayable === false
                    ? "Set Payable"
                    : "Set Unpayable"
                }`}</Box>
              </Button>
            </Grid>
          )    
        ) : (
          ""
        )}
      </Grid>
    </Grid>
  );
}
