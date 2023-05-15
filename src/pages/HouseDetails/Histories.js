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
  houseID,
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

  const handleHistorySave = async (homeHistory, historyIndex, historyTypeId) => {
    setLoading(true);
    var historyItem = { ...histories[historyIndex] };
    var _houseImg = historyItem.houseImg;
    var _history = historyItem.history;
    var _desc = historyItem.desc;
    var _brand = historyItem.houseBrand;
    var _brandType = historyItem.brandType;
    var _yearField = Number(historyItem.yearField);

    var changedFlag = false;
    if (homeHistory.imgNeed) {
      _houseImg = await FileUpload(cImage);
      _houseImg = CryptoJS.AES.encrypt(_houseImg, secretKey).toString()
      changedFlag = true;
    }
    if (_desc != CryptoJS.AES.encrypt(cPicDesc, secretKey).toString() && homeHistory.descNeed) {
      _desc = CryptoJS.AES.encrypt(cPicDesc, secretKey).toString();
      changedFlag = true;
    }
    if (_brand != CryptoJS.AES.encrypt(cBrand, secretKey).toString() && homeHistory.brandNeed) {
      _brand = CryptoJS.AES.encrypt(cBrand, secretKey).toString();
      changedFlag = true;
    }
    if (_brandType != CryptoJS.AES.encrypt(cBrandType, secretKey).toString() && homeHistory.brandTypeNeed) {
      _brandType = CryptoJS.AES.encrypt(cBrandType, secretKey).toString();
      changedFlag = true;
    }
    if (_yearField != cYearField.valueOf() && homeHistory.yearNeed) {
      _yearField = cYearField.valueOf();
      changedFlag = true;
    }
    if (_history != CryptoJS.AES.encrypt(cHistory, secretKey).toString()) {
      _history = CryptoJS.AES.encrypt(cHistory, secretKey).toString();
      changedFlag = true;
    }

    if (changedFlag) {
      // console.table({
      //   'houseID,': houseID,
      //   'historyIndex,': historyIndex,
      //   'historyTypeId,': historyTypeId,
      //   '_houseImg,': _houseImg,
      //   '_brand,': _brand,
      //   '_history,': _history,
      //   '_desc,': _desc,
      //   '_brandType,': _brandType,
      //   '_yearField': _yearField
      // })
      try {
        await houseBusinessContract.methods
          .editHistory(
            houseID,
            historyIndex,
            historyTypeId,
            _houseImg,
            _brand,
            _history,
            _desc,
            _brandType,
            _yearField
          )
          .send({ from: account });

        initialConf();
        loadNFT(houseID);
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
    var bytesCImage = CryptoJS.AES.decrypt(histories[historyIndex].houseImg, secretKey);
    var decrypteCImage = bytesCImage.toString(CryptoJS.enc.Utf8);
    var bytesDesc = CryptoJS.AES.decrypt(histories[historyIndex].desc, secretKey);
    var decryptePicDesc = bytesDesc.toString(CryptoJS.enc.Utf8);
    var bytesBrand = CryptoJS.AES.decrypt(histories[historyIndex].houseBrand, secretKey);
    var decrypteBrand = bytesBrand.toString(CryptoJS.enc.Utf8);
    var bytesBrandType = CryptoJS.AES.decrypt(histories[historyIndex].brandType, secretKey);
    var decryptedBrandType = bytesBrandType.toString(CryptoJS.enc.Utf8);
    var bytesYearField = CryptoJS.AES.decrypt(histories[historyIndex].yearField, secretKey);
    var decryptedYearField = bytesYearField.toString(CryptoJS.enc.Utf8);
    var bytesCHistory = CryptoJS.AES.decrypt(histories[historyIndex].history, secretKey);
    var decryptedCHistory = bytesCHistory.toString(CryptoJS.enc.Utf8);
    setCImage(decrypteCImage);
    setCPicDesc(decryptePicDesc);
    setCBrand(decrypteBrand);
    setCBrandType(decryptedBrandType);
    setCYearField(new Date(Number(decryptedYearField)));
    setCHistory(decryptedCHistory);

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
      var bytesImg = CryptoJS.AES.decrypt(histories[i].houseImg, secretKey);
      var decryptedImg = bytesImg.toString(CryptoJS.enc.Utf8);
      tempHistory.push({
        ...histories[i],
        history: decryptedHistory,
        brandType: decryptedBrandType,
        houseBrand: decryptedHouseBrand,
        desc: decryptedDesc,
        houseImg: decryptedImg
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
        console.log(item, historyTypes)
        var homeHistory = historyTypes[historyTypes.findIndex((option) => option.hID === item.historyTypeId)];
        {homeHistory && (
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
                <label htmlFor={`${historyTypes[item.historyTypeId].hLabel}-imag`}>
                  <Grid>
                    <StyledInput
                      accept="image/*"
                      id={`${historyTypes[item.historyTypeId].hLabel}-imag`}
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
              value={disabledArr[index] === false ? cHistory : item.history}
              disabled={disabledArr[index] || loading}
              onChange={(e) => setCHistory(e.target.value)}
            />
            {item.contractId > 0 && (
              <>
                <IconButton
                  onClick={() => {
                    const contract = contracts.find((c) => c.contractId == item.contractId);
                    console.log('contract-->', contract)
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
                    <IconButton onClick={() => handleHistorySave(homeHistory, index, item.historyTypeId)}>
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
        )}
      })}
      <ContractDetailDialog
        open={showCContract}
        onClose={() => setShowCContract(false)}
        contract={cContract}
      />
    </Grid>
  );
}
