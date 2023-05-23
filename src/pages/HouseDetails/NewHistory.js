import React, { useEffect, useState } from 'react';
import { Button, Grid, TextField, MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import styled from '@emotion/styled';
import LoadingButton from '@mui/lab/LoadingButton';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  setCContract,
  handleConnectContract,
  otherInfo,
  setOtherInfo,
  historyTypes,
  oldHistoryTypeIds,
  hID,
  setHID,
  image,
  brand,
  setBrand,
  brandType,
  setBrandType,
  solorDate,
  setSolorDate,
  setChangeDate,
  pictureDesc,
  setPictureDesc,
  handleImageChange,
  handleAddHistory,
  loading,
}) {
  const [homeHistory, setHomeHistory] = useState(null);

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
          console.log('id', e.target.value)
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
      {homeHistory ? (
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container justify="space-around">
                <DatePicker
                  views={['year', 'month', 'day']}
                  label="Date"
                  value={solorDate}
                  disabled={loading}
                  onChange={(date) => {
                    setChangeDate(true);
                    setSolorDate(date);
                  }}
                  renderInput={(params) => (
                    <TextField className={classes.addHistoryField} variant="filled" {...params} helperText={null} />
                  )}
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
      <LoadingButton
        className={classes.nftHouseButton}
        onClick={() => handleAddHistory()}
        endIcon={<SaveAsIcon />}
        loading={loading}
        loadingPosition="end"
        variant="contained"
      >
        Add History
      </LoadingButton>
    </Grid>
  );
}
