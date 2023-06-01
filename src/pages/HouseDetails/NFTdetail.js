import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { Box } from "@mui/system";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from '@mui/icons-material/Preview';
import SaveAsIcon from "@mui/icons-material/SaveAs";
import CancelIcon from "@mui/icons-material/Cancel";
import { useWeb3 } from "hooks/useWeb3";

export default function NFTdetail({
  account,
  classes,
  simpleNFT,
  totalPrice,
  loading,
  setLoading,
  buyerFlag,
  setBuyerFlag,
  specialBuyer,
  setSpecialBuyer,
  handleBuyerEdit,
  handlePayable,
  handleViewable,
  changeHousePrice
}) {
  const [isBuyerEdit, setIsBuyerEdit] = useState(false);
  const [housePrice, setHousePrice] = useState(0);
  const web3 = useWeb3();

  useEffect(() => {
    if (simpleNFT && totalPrice) {
      setHousePrice(web3.utils.fromWei(simpleNFT.price))
      setIsBuyerEdit(!Boolean(simpleNFT.contributor.buyer));
    }

  }, [simpleNFT, totalPrice]);

  return (
    <Grid item xl={6} md={12}>
      <Grid className={classes.contentRight}>
        <Grid className={classes.itemDetail}>
          <Box component={"h2"}>{simpleNFT.tokenName}</Box>
        </Grid>
        <Grid className={classes.clientInfo}>
          <Grid className={classes.metaInfo}>
            <Box component={"span"}>Owned By</Box>
            <Box component={"h4"} className={classes.nftHouseOwner}>
              {simpleNFT.contributor.currentOwner}
            </Box>
          </Grid>
          <Grid className={classes.dataPoints}>
            <Box component={"span"}>Current Value</Box>
            <Box component={"h4"} className={classes.nftHouseOwner}>
              {web3.utils.fromWei(totalPrice)} MATIC
            </Box>
          </Grid>
        </Grid>
        <Grid className={classes.nftHousePrice}>
          <TextField
            type="number"
            variant="filled"
            label="Selling Price"
            value={housePrice}
            onChange={(e) => setHousePrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">MATIC</InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setLoading(true)
              changeHousePrice(simpleNFT.houseID, housePrice)
            }}
            className={classes.changePriceBtn}
            startIcon={<BusinessCenterIcon />}
            disabled={loading}
          >
            {loading ?
              <CircularProgress size={25} /> :
              <Box
                component={"span"}
                className={classes.nftHouseBuyButton}
                textTransform={"capitalize"}
              >{`Change Price`}</Box>
            }
          </Button>
        </Grid>
        {simpleNFT.contributor.currentOwner !== `${account}` &&
          simpleNFT.nftPayable === true ? (
          <Grid className={classes.buyButtonGroup}>
            <Button
              variant="outlined"
              onClick={() => {
                setLoading(true)
                handleBuyNFT(simpleNFT)
              }}
              className={classes.nftHouseButton}
              startIcon={<BusinessCenterIcon />}
              disabled={loading}
            >
              {loading ?
                <CircularProgress size={25} /> :
                <Box
                  component={"span"}
                  className={classes.nftHouseBuyButton}
                  textTransform={"capitalize"}
                >{`Buy NFT`}</Box>
              }
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
                className={classes.enableButton}
                startIcon={<BusinessCenterIcon />}
                disabled={loading}
              >
                {loading ?
                  <CircularProgress size={25} /> :
                  <Box
                    component={"span"}
                    className={classes.nftHouseBuyButton}
                    textTransform={"capitalize"}
                  >{`${simpleNFT.nftPayable === false
                    ? "Set Payable for everyone"
                    : "Set Unpayable"
                    }`}</Box>
                }
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleViewable(!simpleNFT.nftViewable)}
                className={classes.enableButton}
                startIcon={<PreviewIcon />}
                disabled={loading}
              >
                {loading ?
                  <CircularProgress size={25} /> :
                  <Box
                    component={"span"}
                    className={classes.nftHouseBuyButton}
                    textTransform={"capitalize"}
                  >{`${simpleNFT.nftViewable === false
                    ? "Set Viewable for everyone"
                    : "Set Unviewable"
                    }`}</Box>
                }
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
                >{`${simpleNFT.nftPayable === false
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
