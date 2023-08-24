import React, { useEffect, useState } from 'react';
import { Button, Grid, TextField, MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import styled from '@emotion/styled';
import LoadingButton from '@mui/lab/LoadingButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ConnectContract from './ConnectContract';
const StyledInput = styled('input')({
  display: 'none',
});

export default function NewHistory({
  classes,
  contracts,
  cContract,
  historyTypes,
  oldHistoryTypeIds,
  loading,
  hID,
  image,
  brand,
  brandType,
  solorDate,
  pictureDesc,
  otherInfo,
  setHID,
  setBrand,
  setBrandType,
  setSolorDate,
  setChangeDate,
  setPictureDesc,
  setOtherInfo,
  handleImageChange,
  handleAddHistory,
  setCContract,
  handleConnectContract,
}) {
  const [homeHistory, setHomeHistory] = useState(null);

  const formatDate = (date) => {
    if (date instanceof Date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  };

  useEffect(() => {
    setHomeHistory(historyTypes[hID]);
  }, [hID]);

  return (
    <Grid className={classes.addHistory}>
      <Box component={'h3'}>New History or Event</Box>
      <TextField
        className={classes.historyType}
        id="filled-select-currency"
        select
        label="History Type"
        value={hID}
        onChange={(e) => {
          setHID(e.target.value);
          setCContract(0);
        }}
        helperText="Please select your history type"
        variant="filled"
      >
        {historyTypes.map((historyItem, hIndex) => {
          return (
            !oldHistoryTypeIds.includes(`${hIndex}`) &&
            <MenuItem key={hIndex} value={hIndex}>
              {historyItem.hLabel}
            </MenuItem>
          )
        }
        )}
      </TextField>
      {hID != "0" && homeHistory ? (
        <>
          {homeHistory.connectContract === true ? (
            <ConnectContract
              classes={classes}
              contracts={contracts.filter((item, idx) => item.contractType == hID)}
              cContract={cContract}
              setCContract={setCContract}
              handleConnectContract={handleConnectContract}
            />
          ) : null}
          {homeHistory.brandNeed === true ? (
            <TextField
              id="standard-multiline-static"
              label={'Brand'}
              rows={4}
              variant="filled"
              className={classes.addHistoryField}
              value={brand}
              disabled={loading}
              onChange={(e) => setBrand(e.target.value)}
            />
          ) : null}
          {homeHistory.brandTypeNeed === true ? (
            <TextField
              id="standard-multiline-static"
              label={'Type'}
              rows={4}
              variant="filled"
              className={classes.addHistoryField}
              value={brandType}
              disabled={loading}
              onChange={(e) => setBrandType(e.target.value)}
            />
          ) : null}
          {homeHistory.yearNeed === true ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container justify="space-around">
                <DatePicker
                  views={['year', 'month', 'day']}
                  label="Date"
                  format="MM/DD/YYYY"
                  clearable
                  value={solorDate}
                  onChange={(date) => {
                    setChangeDate(true);
                    setSolorDate(date);
                  }}
                  input={<TextField />}
                  renderInput={(props) =>
                    <TextField
                      {...props}
                      className={classes.addHistoryField}
                      variant="filled"
                      value={solorDate ? formatDate(solorDate) : ''}
                    />}
                />
              </Grid>
            </LocalizationProvider>
          ) : null}
          {homeHistory.imgNeed === true ? (
            <Grid className={classes.imgPart}>
              <label htmlFor={`${hID}-imag`}>
                <Grid sx={{ marginTop: '10px', marginBottom: '10px' }}>
                  <StyledInput accept="image/*" id={`${hID}-imag`} multiple type="file" onChange={handleImageChange} />
                  <Button variant="contained" component="span" disabled={loading} startIcon={<PhotoCamera />}>
                    Upload Brand
                  </Button>
                </Grid>
              </label>
              {image ? (
                <Grid component="fieldset" variant="filled">
                  <img className={classes.image} src={URL.createObjectURL(image)} />
                </Grid>
              ) : (
                ''
              )}
            </Grid>
          ) : null}
          {homeHistory.descNeed === true ? (
            <TextField
              id="standard-multiline-static"
              label={'Picture Description'}
              rows={4}
              variant="filled"
              className={classes.addHistoryField}
              value={pictureDesc}
              disabled={loading}
              onChange={(e) => setPictureDesc(e.target.value)}
            />
          ) : null}
          {homeHistory.otherInfo && <TextField
            id="standard-multiline-static"
            label={'Other Information'}
            multiline
            rows={4}
            value={otherInfo}
            variant="standard"
            className={classes.addHistoryField}
            onChange={(e) => setOtherInfo(e.target.value)}
          />}
        </>
      ) : null}
      {
        hID != "0" && <LoadingButton
          className={classes.nftHouseButton}
          onClick={() => handleAddHistory()}
          endIcon={<SaveAsIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
        >
          Add History
        </LoadingButton>
      }
    </Grid>
  );
}
