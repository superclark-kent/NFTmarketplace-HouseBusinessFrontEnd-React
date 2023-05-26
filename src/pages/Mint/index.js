import styled from "@emotion/styled";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, FormLabel, Grid, Stack, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useWeb3React } from "@web3-react/core";
import useHouseMintStyle from "assets/styles/houseMintStyle";
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract, useWeb3Content } from "hooks/useContractHelpers";
import { houseError, houseInfo, houseSuccess } from "hooks/useToast";
import { apiURL, secretKey, zeroAddress } from 'mainConfig';
import { useEffect, useState } from "react";
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { setAccount } from "redux/actions/account";
import FileUpload from "utils/ipfs";

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

function Mint(props) {
  const { account } = useWeb3React();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useHouseMintStyle();
  const houseBusinessContract = useHouseBusinessContract();
	const walletAccount = props.account.account;
	const web3 = useWeb3Content()

	// House NFT
	const [image, setImage] = useState(null);
	const [imageName, setImageName] = useState("");

  const [houseName, setHouseName] = useState("");
  const [houseType, setHouseType] = useState("terraced");
  const [solarDate, setSolarDate] = useState(new Date("1970"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      dispatch(setAccount(account));
    } else {
      dispatch(setAccount(null));
    }
  }, [account]);

	const handleImageChange = async (e) => {
		var uploadedImage = e.target.files[0];
		setImage(uploadedImage);
		setImageName(uploadedImage.name);
	};

  const handleHouseMint = async () => {
    var year = solarDate.valueOf();
    var flag = year < 0 ? true : false;
    if (year < -2208991965000) {
      houseError("Please choose correct Year");
      return;
    }
    if (!account && !walletAccount) {
      houseInfo("Please connect your wallet.");
    } else {
      if (
        new Date(solarDate).getFullYear() > new Date().getFullYear()
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
        if (ipfsUrl === false) {
          houseError("Something went wrong with IPFS");
          setImageName("");
          // setLoading(false);
        } else {
          try {
            const encryptedipfsUrl = CryptoJS.AES.encrypt(ipfsUrl, secretKey).toString();
            const encryptedName = CryptoJS.AES.encrypt(houseName, secretKey).toString();
            const encryptedType = CryptoJS.AES.encrypt(houseType, secretKey).toString();
            if (!account) {
              // Create transaction data
              const data = houseBusinessContract.methods
                .mintHouse(walletAccount, encryptedName, encryptedipfsUrl, encryptedType, Math.abs(year), flag)
                .encodeABI();
							console.log('walletAccount: ', walletAccount);

							const transactionObject = {
								to: houseBusinessContract.options.address,
								data
							};

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
									setImage("");
									setImageName("");
									setHouseName("");
									setHouseType("terraced");
									setHouseDescription(new Date("1970"));
									houseSuccess("House NFT minted successfuly.");
									navigate("../../house/myNfts");
									setLoading(false);
								})
								.catch(err => {
									houseError(err)
								});
						} else {
              try {
                await houseBusinessContract.methods
                  .mintHouse(zeroAddress, encryptedName, encryptedipfsUrl, encryptedType, Math.abs(year), flag)
                  .send({ from: account });
                  houseSuccess("House NFT minted successfuly.");
                  navigate("../../house/myNfts");
              } catch (err) {
                console.log('err', err)
              }
            }

            setLoading(false);
            setImage("");
            setImageName("");
            setHouseName("");
            setHouseType("terraced");
            setSolarDate(new Date("1970"));
          } catch (error) {
            console.log(error);
            houseError('Something went wrong');
            setLoading(false);
          }
        }
      }
    }
  };

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
            onChange={(e) => {
              setHouseType(e.target.value)
            }
            }
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
                value={solarDate}
                maxDate={new Date("2023")}
                onChange={(date) => {
                  setSolarDate(date);
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


function mapStateToProps(state) {
	return {
		account: state.account,
	};
}

export default connect(mapStateToProps)(Mint);