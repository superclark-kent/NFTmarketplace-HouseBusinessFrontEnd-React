import React, { useEffect, useState } from 'react';
import { Grid, ListItem, TextField, MenuItem, IconButton, Avatar, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CancelIcon from '@mui/icons-material/Cancel';
import DocumentIcon from '@mui/icons-material/DocumentScanner';
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff';
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseInfo, houseSuccess } from 'hooks/useToast';
import { useWeb3React } from '@web3-react/core';
import CryptoJS from 'crypto-js';
import FileUpload from 'utils/ipfs';
import { secretKey } from 'mainConfig';
import ContractDetailDialog from 'components/ContractDetailDialog';

const StyledInput = styled('input')({
  display: 'none',
});

export default function Histories({
  classes,
  tokenID,
  cHID,
  histories,
  contracts,
  changinghistoryType,
  setChangingHistoryType,
  historyTypes,
  loadNFT,
  disconnectContract,
}) {
  const { account } = useWeb3React();
  const houseBusinessContract = useHouseBusinessContract();

  const [cHistories, setCHistories] = useState([]);
  const [disabledArr, setDisabledArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cImage, setCImage] = useState('');
  const [cPicDesc, setCPicDesc] = useState('');
  const [cBrand, setCBrand] = useState('');
  const [cBrandType, setCBrandType] = useState('');
  const [cYearField, setCYearField] = useState('');
  const [cHistory, setCHistory] = useState('');
  const [cContract, setCContract] = useState({});
  const [showCContract, setShowCContract] = useState(false);

  const handleHistorySave = async (homeHistory, historyIndex) => {
    setLoading(true);
    var historyItem = { ...histories[historyIndex] };
    var _historyType = historyItem.historyType;
    var _houseImg = historyItem.houseImg;
    var _history = historyItem.history;
    var _desc = historyItem.desc;
    var _brand = historyItem.houseBrand;
    var _brandType = historyItem.brandType;
    var _yearField = Number(historyItem.yearField);

    var changedFlag = false;
    if (_houseImg != cImage && homeHistory.imgNeed === true) {
      _houseImg = await FileUpload(cImage);
      changedFlag = true;
    }
    if (_desc != cPicDesc && homeHistory.descNeed === true) {
      _desc = cPicDesc;
      changedFlag = true;
    }
    if (_brand != cBrand && homeHistory.brandNeed === true) {
      _brand = cBrand;
      changedFlag = true;
    }
    if (_brandType != cBrandType && homeHistory.brandTypeNeed === true) {
      _brandType = cBrandType;
      changedFlag = true;
    }
    if (_yearField != cYearField.valueOf() && homeHistory.yearNeed === true) {
      _yearField = cYearField.valueOf();
      changedFlag = true;
    }
    if (_history != cHistory) {
      _history = cHistory;
      changedFlag = true;
    }

    if (changedFlag === true) {
      try {
        await houseBusinessContract.methods
          .editHistory(tokenID, historyIndex, _houseImg, _brand, _history, _desc, _brandType, _yearField)
          .send({ from: account });

        initialConf();
        loadNFT(tokenID);
        houseSuccess('You changed the history successfully!');
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    } else {
      houseInfo('There is nothing to change');
      setLoading(false);
    }
  };

  const handleHistoryEdit = async (historyIndex) => {
    setCImage(histories[historyIndex].houseImg);
    setCPicDesc(histories[historyIndex].desc);
    setCBrand(histories[historyIndex].houseBrand);
    setCBrandType(histories[historyIndex].brandType);
    setCYearField(new Date(Number(histories[historyIndex].yearField)));
    setCHistory(histories[historyIndex].history);

    var dArr = [];
    for (let i = 0; i < histories.length; i++) {
      if (i === historyIndex) {
        dArr[i] = false;
      } else {
        dArr[i] = true;
      }
    }
    setDisabledArr(dArr);
  };

  const initialConf = () => {
    var dArr = [];
    var tempHistory = [];
    for (let i = 0; i < histories.length; i++) {
      var bytesHistory = CryptoJS.AES.decrypt(histories[i].history, secretKey);
      var decryptedHistory = bytesHistory.toString(CryptoJS.enc.Utf8);
      var bytesBrandType = CryptoJS.AES.decrypt(histories[i].brandType, secretKey);
      var decryptedBrandType = bytesBrandType.toString(CryptoJS.enc.Utf8);
      var bytesHouseBrand = CryptoJS.AES.decrypt(histories[i].houseBrand, secretKey);
      var decryptedHouseBrand = bytesHouseBrand.toString(CryptoJS.enc.Utf8);
      var bytesDesc = CryptoJS.AES.decrypt(histories[i].desc, secretKey);
      var decryptedDesc = bytesDesc.toString(CryptoJS.enc.Utf8);
      tempHistory.push({
        ...histories[i],
        history: decryptedHistory,
        brandType: decryptedBrandType,
        houseBrand: decryptedHouseBrand,
        desc: decryptedDesc,
      });
      dArr[i] = true;
    }
    setCHistories(tempHistory);
    setDisabledArr(dArr);
  };

  useEffect(() => {
    initialConf();
  }, [histories]);

  return (
    <Grid>
      {cHistories.map((item, index) => {
        var homeHistory = historyTypes[historyTypes.findIndex((option) => option.hID === item.hID)];
        return (
          <ListItem className={classes.historyItem} key={index} component="div" disablePadding>
            <TextField
              className={classes.listhistoryType}
              id="filled-select-currency"
              select
              label="History Type"
              value={disabledArr[index] === false ? changinghistoryType : homeHistory.hLabel}
              onChange={(e) => setChangingHistoryType(e.target.value)}
              variant="filled"
              // disabled={disabledArr[index] || loading}
              disabled={true}
            >
              {historyTypes.map((option) => (
                <MenuItem key={option.hLabel} value={option.hLabel}>
                  {option.hLabel}
                </MenuItem>
              ))}
            </TextField>

            {homeHistory.imgNeed === true ? (
              <Grid className={classes.imgLabel}>
                <label htmlFor={`${item.historyType}-imag`}>
                  <Grid>
                    <StyledInput
                      accept="image/*"
                      id={`${item.historyType}-imag`}
                      multiple
                      type="file"
                      onChange={(e) => {
                        var uploadedImage = e.target.files[0];
                        if (uploadedImage) {
                          setCImage(uploadedImage);
                        }
                      }}
                      disabled={disabledArr[index] || loading}
                    />
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      disabled={disabledArr[index] || loading}
                    >
                      <Avatar
                        alt="Image"
                        src={
                          disabledArr[index] === false && typeof cImage === 'object'
                            ? URL.createObjectURL(cImage)
                            : item.houseImg
                        }
                      />
                    </IconButton>
                  </Grid>
                </label>
              </Grid>
            ) : null}
            {homeHistory.descNeed === true ? (
              <TextField
                id="standard-multiline-static"
                label={'Picture Description'}
                rows={4}
                variant="filled"
                className={classes.addHistoryField}
                value={disabledArr[index] === false ? cPicDesc : item.desc}
                disabled={disabledArr[index] || loading}
                onChange={(e) => setCPicDesc(e.target.value)}
              />
            ) : null}
            {homeHistory.brandNeed === true ? (
              <TextField
                id="standard-multiline-static"
                label={'Brand'}
                rows={4}
                variant="filled"
                className={classes.addHistoryField}
                value={disabledArr[index] === false ? cBrand : item.houseBrand}
                disabled={disabledArr[index] || loading}
                onChange={(e) => setCBrand(e.target.value)}
              />
            ) : null}
            {homeHistory.brandTypeNeed === true ? (
              <TextField
                id="standard-multiline-static"
                label={'Brand Type'}
                rows={4}
                variant="filled"
                className={classes.addHistoryField}
                value={disabledArr[index] === false ? cBrandType : item.brandType}
                disabled={disabledArr[index] || loading}
                onChange={(e) => setCBrandType(e.target.value)}
              />
            ) : null}
            {homeHistory.yearNeed === true ? (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container justify="space-around">
                  <DatePicker
                    views={['year', 'month', 'day']}
                    label="Date"
                    //format={"DD/MM/YYYY"}
                    value={disabledArr[index] === true ? new Date(Number(item.yearField)) : cYearField}
                    onChange={(date) => setCYearField(date)}
                    disabled={disabledArr[index] || loading}
                    renderInput={(params) => (
                      <TextField className={classes.needField} variant="filled" {...params} helperText={null} />
                    )}
                  />
                </Grid>
              </LocalizationProvider>
            ) : null}

            <TextField
              id="standard-multiline-static"
              label={'Other information'}
              rows={4}
              variant="filled"
              className={classes.listHistoryField}
              value={disabledArr[index] === false || (cHID != null && index === cHID) ? cHistory : item.history}
              disabled={disabledArr[index] || loading}
              onChange={(e) => setCHistory(e.target.value)}
            />
            {item.hID > 0 && (
              <>
                <IconButton
                  onClick={() => {
                    console.log('item', item, 'ccc', contracts)
                    const contract = contracts.find((c) => c.contractId == item.contractId);
                    setCContract(contract);
                    setShowCContract(true);
                  }}
                >
                  <DocumentIcon />
                </IconButton>
                <IconButton onClick={() => disconnectContract(index, item.contractId)}>
                  <SubtitlesOffIcon />
                </IconButton>
              </>
            )}
            {disabledArr[index] === true ? (
              <IconButton onClick={() => handleHistoryEdit(index)}>
                <EditIcon />
              </IconButton>
            ) : (
              <>
                {loading === true ? (
                  <Grid className={classes.grid}>
                    <CircularProgress />
                  </Grid>
                ) : (
                  <>
                    <IconButton onClick={() => handleHistorySave(homeHistory, index)}>
                      <SaveAsIcon />
                    </IconButton>
                    <IconButton onClick={() => initialConf()}>
                      <CancelIcon />
                    </IconButton>
                  </>
                )}
              </>
            )}
          </ListItem>
        );
      })}
      <ContractDetailDialog open={showCContract} onClose={() => setShowCContract(false)} contract={cContract} />
    </Grid>
  );
}
