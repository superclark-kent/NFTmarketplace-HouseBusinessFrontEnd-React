import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from "react";

import CancelIcon from "@mui/icons-material/Close";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Switch
} from "@mui/material";
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { BigNumber } from 'ethers';

import { useMarketplaceContract } from "hooks/useContractHelpers";

const hHeaders = [
  "History Label",
  "Contract",
  "Image",
  "Brand",
  "Description",
  "Brand Type",
  "Year",
  "OtherInfo",
  "Actions",
];

const togggleLabels = [
  "Enable/Disable",
  "Contract",
  "Image",
  "Brand",
  "Description",
  "Brand Type",
  "Year",
  "OtherInfo"
];
const labelsValue = [
  0.1,
  0.2,
  0.1,
  0.1,
  0.2,
  0.3,
  0.1
];

const label = { inputProps: { 'aria-label': 'Color switch demo' } };

export default function TypePercent({ 
  classes, 
  labelPercents, 
  getLabelPercent
}) {

  const { account } = useWeb3React();
  const marketplaceContract = useMarketplaceContract();

  const [editPercent, setEditPercent] = useState(false);
  const [editValue, setEditValue] = useState(false);
  const [contract, setContract] = useState(0);
  const [image, setImage] = useState(0);
  const [brand, setBrand] = useState(0);
  const [desc, setDesc] = useState(0);
  const [bType, setBType] = useState(0);
  const [year, setYear] = useState(0);
  const [otherInfo, setOtherInfo] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [toggleLabel, setToggleLabel] = useState({
    gilad: true,
    jason: false,
    antoine: true,
  });

  const handleChange = (event) => {
    setToggleLabel({
      ...toggleLabel,
      [event.target.name]: event.target.checked,
    });
  };

  const savePercent = async () => {
    setLoading(true);
    let _labelPercents = [contract, image, brand, desc, bType, year, otherInfo];
    try {
      await marketplaceContract.methods.setLabelPercents(_labelPercents).send({ from: account });
    } catch (err) {
      console.log('err', err)
    }
    setLoading(false);
    setDisabled(true);
    setEditPercent(false);
    getLabelPercent();
  }

  useEffect(() => {
    setContract(labelPercents[0])
    setImage(labelPercents[1])
    setBrand(labelPercents[2])
    setDesc(labelPercents[3])
    setBType(labelPercents[4])
    setYear(labelPercents[5])
    setOtherInfo(labelPercents[6])
  }, [labelPercents])

  return (
    <>
      <Grid item md={12}>
        <Grid className={classes.addHeader}>
          <Box component={"h3"}>Set Percent of History Labels</Box>
        </Grid>
        <Grid container disabled>
          <Grid container className={classes.historyHeader}>
            {hHeaders.map((item, index) => {
              return (
                <Grid
                  item
                  key={`history-header-${index}`}
                  sx={{ fontWeight: "500" }}
                  className={index === 0 ? classes.firstgrid : classes.percentGrid}
                >
                  {item}
                </Grid>
              );
            })}
          </Grid>
          <Grid container className={classes.historyItems}>
            <Grid
              key={`history-header-percent`}
              sx={{ fontWeight: "500" }}
              className={classes.firstgrid}
            >
              <label>Percent</label>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={contract}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setContract(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={image}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setImage(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={brand}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setBrand(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={desc}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setDesc(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={bType}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setBType(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={year}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setYear(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.perLabel}>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  size="small"
                  type="number"
                  value={otherInfo}
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    setOtherInfo(e.target.value)
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.grid}>
              {!editPercent ?
                <IconButton
                  aria-label="edit"
                  color="primary"
                  onClick={() => {
                    setEditPercent(true)
                    setDisabled(false);
                  }}
                >
                  <EditIcon />
                </IconButton>
                :
                (
                  <>
                    {
                      loading === true ?
                        <CircularProgress /> :
                        <>
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={savePercent}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            aria-label="cancel"
                            color="primary"
                            onClick={() => {
                              setEditPercent(false)
                              setDisabled(true);
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                    }
                  </>
                )
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
