import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Stack,
  TextField,
  Grid,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import styled from "@emotion/styled";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import Web3 from "web3";
import CryptoJS from "crypto-js";

import useHouseMintStyle from "assets/styles/houseMintStyle";
import FileUpload from "utils/ipfs";
import { useHouseBusinessContract } from "hooks/useContractHelpers";
import { houseInfo, houseError, houseSuccess } from "hooks/useToast";
import { secretKey } from "mainConfig";

const Input = styled("input")({
  display: "none",
});

const houseTypes = [
  {
    value: "terraced",
    label: "Terraced House",
  },
  {
    value: "detached",
    label: "Detached House",
  },
  {
    value: "semidetached",
    label: "Semi-detached House",
  },
  {
    value: "corner",
    label: "Corner House",
  },
  {
    value: "apartment",
    label: "Apartment",
  },
];

export default function Mint() {
  const { account } = useWeb3React();
  const navigate = useNavigate();

  const classes = useHouseMintStyle();

  const houseBusinessContract = useHouseBusinessContract();

  // House NFT
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");

  const [houseName, setHouseName] = useState("");
  const [houseType, setHouseType] = useState("terraced");
  const [houseDescription, setHouseDescription] = useState(new Date("1970"));
  const [housePrice, setHousePrice] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [minPrice, setMinPrice] = useState(100000000000000000);
  const [maxPrice, setMaxPrice] = useState(1000000000000000000);

  const handleImageChange = async (e) => {
    var uploadedImage = e.target.files[0];
    setImage(uploadedImage);
    setImageName(uploadedImage.name);
  };

  const handleHouseMint = async () => {
    console.log("Minting...");
    if (!account) {
      houseInfo("Please connect your wallet.");
    } else {
      if (
        new Date(houseDescription).getFullYear() > new Date().getFullYear()
      ) {
        houseError(
          "Year of construction should be higher than 1990 and lower or equal than this year"
        );
        return;
      } else if (!image) {
        houseError("Please upload an image");
        return;
      } else {
        setLoading(true);
        var ipfsUrl = await FileUpload(image);
        console.log("IPFS Url: ", ipfsUrl)
        if (ipfsUrl === false) {
          houseError("Something went wrong with IPFS");
          setImageName("");
          // setLoading(false);
        } else {
          try {
            var description = `This house was built by ${new Date(
              houseDescription
            ).getFullYear()}`;
            var ipUrl = CryptoJS.AES.encrypt(ipfsUrl, secretKey).toString();
            var encryptedName = CryptoJS.AES.encrypt(houseName, secretKey).toString();
            var encryptedType = CryptoJS.AES.encrypt(houseType, secretKey).toString();
            var encryptedDes = CryptoJS.AES.encrypt(description, secretKey).toString();
            console.table({ 'encryptedName': encryptedName, 'ipUrl': ipUrl, 'encryptedType': encryptedType, 'encryptedDes': encryptedDes })
            await houseBusinessContract.methods
              .mintHouse(encryptedName, ipUrl, encryptedType, encryptedDes)
              .send({ from: account });
            setLoading(false);
            setImage("");
            setImageName("");
            setHouseName("");
            setHouseType("terraced");
            setHouseDescription(new Date("1970"));
            setHousePrice("");
            houseSuccess("House NFT minted successfuly.");
            navigate("../../house/myNfts");
          } catch (error) {
            console.log(error);
            setLoading(false);
          }
        }
      }
    }
  };

  const getMinMaxPrice = async () => {
    var minPrice = await houseBusinessContract.methods.minPrice().call();
    var maxPrice = await houseBusinessContract.methods.maxPrice().call();
    setMinPrice(minPrice);
    setMaxPrice(maxPrice);
    setHousePrice(Web3.utils.fromWei(`${minPrice}`));
  };

  useEffect(() => {
    getMinMaxPrice();
  }, [account]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      className={classes.mintContent}
    >
      <Grid component="fieldset" variant="filled">

        <FormLabel component="legend" htmlFor="residence-type-radio">
          Mint NFT
        </FormLabel>
        <Grid sx={{ m: 1 }}>
          <label htmlFor="contained-imag-file">
            <Input
              accept="image/*"
              id="contained-imag-file"
              multiple
              type="file"
              onChange={handleImageChange}
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCamera />}
            >
              Upload Image
            </Button>
          </label>
          {image ? (
            <Grid component="fieldset" variant="filled">
              <img
                className={classes.houseNftImg}
                src={URL.createObjectURL(image)}
              />
            </Grid>
          ) : (
            ""
          )}
          <Grid>
            {" "}
            {imageName.length > 30
              ? `${imageName.slice(0, 27)}...${imageName.slice(
                imageName.length - 5,
                imageName.length
              )}`
              : imageName}{" "}
          </Grid>
        </Grid>
        <Grid sx={{ m: 1 }}>
          <TextField
            className={classes.needField}
            variant="filled"
            label="House Name"
            placeholder="My House"
            value={houseName}
            multiline
            onChange={(e) => {
              if (houseName.length < 30) {
                setHouseName(e.target.value);
              }
            }}
          />
        </Grid>
        <Grid sx={{ m: 1 }}>
          <TextField
            className={classes.needField}
            variant="filled"
            id="outlined-select-stakingtype-native"
            select
            label="House Type"
            placeholder="Cottage..."
            value={houseType}
            onChange={(e) => setHouseType(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            {houseTypes.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className={classes.houstType}
              >
                {option.label}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid sx={{ m: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container justify="space-around">
              <DatePicker
                views={["year"]}
                label="Year of construction"
                value={houseDescription}
                onChange={(date) => {
                  if (new Date(date).getFullYear() > new Date().getFullYear()) {
                    houseError(
                      "Year of construction should be lower or equal than this year"
                    );
                    setHouseDescription(new Date());
                  } else {
                    setHouseDescription(date);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    className={classes.needField}
                    variant="filled"
                    {...params}
                    helperText={null}
                  />
                )}
              />
            </Grid>
          </LocalizationProvider>
        </Grid>
        {/* <Grid sx={{ m: 1 }}>
          <TextField
            className={classes.housePrice}
            type="number"
            variant="filled"
            // label="House NFT Price"
            label={`House NFT Price ${Web3.utils.fromWei(
              `${minPrice}`
            )} ~ ${Web3.utils.fromWei(`${maxPrice}`)} ETH`}
            placeholder="House NFT price."
            value={housePrice}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">ETH</InputAdornment>
              ),
            }}
            onChange={(e) => setHousePrice(e.target.value)}
          />
        </Grid> */}
        <Grid sx={{ m: 1 }}>
          <LoadingButton
            onClick={() => handleHouseMint()}
            endIcon={<SaveAsIcon />}
            loading={loading}
            loadingPosition="end"
            variant="contained"
          >
            Mint House NFT
          </LoadingButton>
        </Grid>
      </Grid>
    </Stack>
  );
}
