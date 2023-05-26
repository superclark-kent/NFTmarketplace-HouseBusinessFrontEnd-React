import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CancelIcon from '@mui/icons-material/Cancel';
import DoDisturbOffIcon from '@mui/icons-material/DoDisturbOff';
import DocumentIcon from '@mui/icons-material/DocumentScanner';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { Avatar, CircularProgress, Grid, IconButton, ListItem, MenuItem, TextField } from '@mui/material';

import { useWeb3React } from '@web3-react/core';
import ContractDetailDialog from 'components/ContractDetailDialog';
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseError, houseInfo, houseSuccess } from 'hooks/useToast';
import { apiURL, secretKey } from 'mainConfig';
import FileUpload from 'utils/ipfs';

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
  connectContract,
  disconnectContract,
  walletAccount
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
  const [cYearField, setCYearField] = useState(new Date("1970"));
  const [otherInfo, setOtherInfo] = useState('');
  const [cContract, setCContract] = useState({});
  const [showCContract, setShowCContract] = useState(false);

  const handleHistorySave = async (homeHistory, historyIndex, historyTypeId) => {
    setLoading(true);
    var historyItem = { ...histories[historyIndex] };
    var _houseImg = historyItem.houseImg;
    var _otherInfo = historyItem.otherInfo;
    var _desc = historyItem.desc;
    var _brand = historyItem.houseBrand;
    var _brandType = historyItem.brandType;
    var _yearField = Number(historyItem.yearField);
    var flag = false;

    const _year_ =  cYearField.toString().slice(11, 15);
    if (Number(_year_) < 1900) {
      houseError("Please choose correct Year");
      setLoading(false);
      return;
    }

    var changedFlag = false;
    if (homeHistory.imgNeed) {
      if (typeof cImage == 'string') {
        _houseImg = cImage == "" ? "" : CryptoJS.AES.encrypt(cImage, secretKey).toString()
        changedFlag = true;
      } else {
        _houseImg = await FileUpload(cImage);
        _houseImg = CryptoJS.AES.encrypt(_houseImg, secretKey).toString()
        changedFlag = true;
      }
    }
    if (homeHistory.descNeed) {
      _desc = cPicDesc == "" ? "" : CryptoJS.AES.encrypt(cPicDesc, secretKey).toString();
      changedFlag = true;
    }
    if (homeHistory.brandNeed) {
      _brand = cBrand == "" ? "" : CryptoJS.AES.encrypt(cBrand, secretKey).toString();
      changedFlag = true;
    }
    if (homeHistory.brandTypeNeed) {
      _brandType = cBrandType == "" ? "" : CryptoJS.AES.encrypt(cBrandType, secretKey).toString();
      changedFlag = true;
    }
    if (_yearField != cYearField.valueOf() && homeHistory.yearNeed) {
      _yearField = cYearField.valueOf();
      if (_yearField < 0) flag = true;
      changedFlag = true;
    }
    if (homeHistory.otherInfo) {
      _otherInfo = otherInfo == "" ? "" : CryptoJS.AES.encrypt(otherInfo, secretKey).toString();
      changedFlag = true;
    }

    if (changedFlag) {
      if (!account) {
        console.log('walletAccount', walletAccount)
        const data = houseBusinessContract.methods
          .editHistory(
            houseID,
            historyIndex,
            historyTypeId,
            _houseImg,
            _brand,
            _otherInfo,
            _desc,
            _brandType,
            Math.abs(_yearField),
            flag
          )
          .encodeABI();

        const transactionObject = {
          data,
          to: houseBusinessContract.options.address
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

            initialConf();
            loadNFT(houseID);
            houseSuccess('You changed the history successfully!');
          })
          .catch(err => {
            houseError(err)
          });
      } else {
        try {
          await houseBusinessContract.methods
            .editHistory(
              houseID,
              historyIndex,
              historyTypeId,
              _houseImg,
              _brand,
              _otherInfo,
              _desc,
              _brandType,
              Math.abs(_yearField),
              flag
            ).send({ from: account });

          initialConf();
          loadNFT(houseID);
          houseSuccess('You changed the history successfully!');
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      houseInfo('There is nothing to change');
    }

    setLoading(false);
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
    var bytesCHistory = CryptoJS.AES.decrypt(histories[historyIndex].otherInfo, secretKey);
    var decryptedOtherInfo = bytesCHistory.toString(CryptoJS.enc.Utf8);
    var yearField = histories[historyIndex].flag ? histories[historyIndex].yearField * -1 : histories[historyIndex].yearField;
    setCImage(decrypteCImage);
    setCPicDesc(decryptePicDesc);
    setCBrand(decrypteBrand);
    setCBrandType(decryptedBrandType);
    setCYearField(new Date(Number(yearField)));
    setOtherInfo(decryptedOtherInfo);

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
      var bytesOtherInfo = CryptoJS.AES.decrypt(histories[i].otherInfo, secretKey);
      var decryptedHistory = bytesOtherInfo.toString(CryptoJS.enc.Utf8);
      var bytesBrandType = CryptoJS.AES.decrypt(histories[i].brandType, secretKey);
      var decryptedBrandType = bytesBrandType.toString(CryptoJS.enc.Utf8);
      var bytesHouseBrand = CryptoJS.AES.decrypt(histories[i].houseBrand, secretKey);
      var decryptedHouseBrand = bytesHouseBrand.toString(CryptoJS.enc.Utf8);
      var bytesDesc = CryptoJS.AES.decrypt(histories[i].desc, secretKey);
      var decryptedDesc = bytesDesc.toString(CryptoJS.enc.Utf8);
      var bytesImg = CryptoJS.AES.decrypt(histories[i].houseImg, secretKey);
      var decryptedImg = bytesImg.toString(CryptoJS.enc.Utf8);
      var yearField = histories[i].flag ? histories[i].yearField * -1 : histories[i].yearField;
      tempHistory.push({
        ...histories[i],
        otherInfo: decryptedHistory,
        brandType: decryptedBrandType,
        houseBrand: decryptedHouseBrand,
        desc: decryptedDesc,
        houseImg: decryptedImg,
        yearField: yearField
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
        var homeHistory = historyTypes[item.historyTypeId];
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
              disabled={disabledArr[index] || loading}
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
            {homeHistory.otherInfo && <TextField
              id="standard-multiline-static"
              label={'Other information'}
              rows={4}
              variant="filled"
              className={classes.listHistoryField}
              value={disabledArr[index] === false ? otherInfo : item.otherInfo}
              disabled={disabledArr[index] || loading}
              onChange={(e) => setOtherInfo(e.target.value)}
            />}
            {item.contractId > 0 ? (
              <>
                <IconButton
                  onClick={() => {
                    const contract = contracts.find((c) => c.contractId == item.contractId);
                    setCContract(contract);
                    setShowCContract(true);
                  }}
                >
                  <DocumentIcon />
                </IconButton>
                <IconButton onClick={() => disconnectContract(index, item.contractId)}>
                  <DoDisturbOffIcon />
                </IconButton>
              </>
            ) : ""
              // homeHistory.connectContract &&
              // <IconButton onClick={() => connectContract(index, item.contractId)}>
              //   <AddCircleIcon />
              // </IconButton>
            }
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
        );
      })}
      <ContractDetailDialog
        open={showCContract}
        onClose={() => setShowCContract(false)}
        contract={cContract}
        historyTypes={historyTypes}
      />
    </Grid>
  );
}
