import styled from '@emotion/styled';
import CancelIcon from '@mui/icons-material/Cancel';
import DoDisturbOffIcon from '@mui/icons-material/DoDisturbOff';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DocumentIcon from '@mui/icons-material/DocumentScanner';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Avatar, CircularProgress, Grid, IconButton, ListItem, MenuItem, TextField, Menu } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWeb3React } from '@web3-react/core';
import ContractDetailDialog from 'components/ContractDetailDialog';
import CryptoJS from 'crypto-js';
import { useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseError, houseInfo, houseSuccess } from 'hooks/useToast';
import { apiURL, secretKey } from 'mainConfig';
import FileUpload from 'utils/ipfs';
import "./style.css";

const StyledInput = styled('input')({
  display: 'none',
});

export default function Histories({
  classes,
  simpleNFT,
  houseID,
  histories,
  contracts,
  changinghistoryType,
  setChangingHistoryType,
  historyTypes,
  loadNFT,
  connectContract,
  disconnectContract,
  walletAccount,
  injected
}) {
  const { account } = useWeb3React();
  const navigate = useNavigate();
  const houseBusinessContract = useHouseBusinessContract();
  const [cHistories, setCHistories] = useState([]);
  const [disabledArr, setDisabledArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cImage, setCImage] = useState('');
  const [cPicDesc, setCPicDesc] = useState('');
  const [cBrand, setCBrand] = useState('');
  const [cBrandType, setCBrandType] = useState('');
  const [cYearField, setCYearField] = useState(null);
  const [otherInfo, setOtherInfo] = useState('');
  const [cContract, setCContract] = useState({});
  const [showCContract, setShowCContract] = useState(false);
  const [changeDate, setChangeDate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [imageArea, setImageArea] = useState(Array(10).fill(false));
  const [brandArea, setBrandArea] = useState(Array(10).fill(false));
  const [brandTypeArea, setBrandTypeArea] = useState(Array(10).fill(false));
  const [yearArea, setYearArea] = useState(Array(10).fill(false));
  const [otherArea, setOtherArea] = useState(Array(10).fill(false));
  const [descArea, setDesArea] = useState(Array(10).fill(false));

  const [openModal, setOpenModal] = useState(false);
  const [index, setIndex] = useState(null);
  const [contractId, setContractId] = useState([null]);
  const [contractUnitId, setContractUnitId] = useState(null);

  function addImageArea(index) {
    var updatedImageArea = [...imageArea];
    updatedImageArea[index] = true;
    setImageArea(updatedImageArea);
  }

  function addBrandArea(index) {
    var aupdatedArea = [...brandArea];
    aupdatedArea[index] = true;
    setBrandArea(aupdatedArea)
  }

  function addBrandTypeArea(index) {
    var bupdatedArea = [...brandTypeArea];
    bupdatedArea[index] = true;
    setBrandTypeArea(bupdatedArea)
  }

  function addYearArea(index) {
    var cupdatedArea = [...yearArea];
    cupdatedArea[index] = true;
    setYearArea(cupdatedArea)
  }

  function addOtherArea(index) {
    var dupdatedArea = [...otherArea];
    dupdatedArea[index] = true;
    setOtherArea(dupdatedArea)
  }

  function addDescArea(index) {
    var eupdatedArea = [...descArea];
    eupdatedArea[index] = true;
    setDesArea(eupdatedArea)
  }

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  };

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

    if (cYearField != null) {
      const _year_ = cYearField.$y;
      if (Number(_year_) < 1900) {
        houseError("Please choose correct Year");
        setLoading(false);
        return;
      }
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
    if (changeDate) {
      if (cYearField == null) {
        _yearField = 1;
      } else {
        _yearField = cYearField.valueOf();
        if (_yearField < 0) flag = true;
      }
      changedFlag = true;
    }
    if (homeHistory.otherInfo) {
      _otherInfo = otherInfo == "" ? "" : CryptoJS.AES.encrypt(otherInfo, secretKey).toString();
      changedFlag = true;
    }

    if (changedFlag) {
      if (!injected) {
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
    if (Number(histories[historyIndex].yearField) != 1) {
      var yearField = histories[historyIndex].flag ? histories[historyIndex].yearField * -1 : histories[historyIndex].yearField;
      setCYearField(new Date(Number(yearField)));
    } else {
      setCYearField(null);
    }
    setCImage(decrypteCImage);
    setCPicDesc(decryptePicDesc);
    setCBrand(decrypteBrand);
    setCBrandType(decryptedBrandType);
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

  useEffect(() => {
    if (walletAccount == null) {
      houseError("You don't have permission this NFT");
      navigate('../../house/app');
    } else {
      if (simpleNFT.contributor.currentOwner.toLowerCase() != walletAccount.toLowerCase()) {
        houseError("You don't have permission this NFT");
        navigate('../../house/app');
      }
    }
  }, [simpleNFT, walletAccount])

  const initValue = Array(10).fill(false);

  const setAllAreasToFalse = () => {
    setImageArea(initValue);
    setBrandArea(initValue);
    setBrandTypeArea(initValue);
    setYearArea(initValue);
    setOtherArea(initValue);
    setDesArea(initValue);
  };

  function beforeConnectContract(index, contractId) {
    setOpenModal(true);
    setIndex(index);
    setContractId(contractId);
  }

  return (
    <Grid>
      <Grid>
        {cHistories.map((item, index) => {
          var homeHistory = historyTypes[item.historyTypeId];
          var tpContractId = [];
          var cnt = 0;
          console.log(contracts, "CON")
          contracts.map((tp, idx) => { if (tp.label.split(" ")[0] == homeHistory.hLabel) { tpContractId[cnt++] = tp.contractId; } });
          console.log("TP", tpContractId)
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

              {homeHistory.imgNeed === true && (item.houseImg || imageArea[index]) ? (
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
              {homeHistory.descNeed === true && (item.desc || descArea[index]) ? (
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
              {homeHistory.brandNeed === true && (item.houseBrand || brandArea[index]) ? (
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
              {homeHistory.brandTypeNeed === true && (item.brandType || brandTypeArea[index]) ? (
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
              {homeHistory.yearNeed === true && (Number(item.yearField) != 1 || yearArea[index]) ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container justify="space-around">
                    <DatePicker
                      views={['year', 'month', 'day']}
                      label="Date"
                      format="MM/DD/YYYY"
                      clearable
                      value={disabledArr[index] === true ? Number(item.yearField) != 1 ? new Date(Number(item.yearField)) : null : cYearField}
                      onChange={(date) => {
                        setCYearField(date);
                        setChangeDate(true);
                      }}
                      disabled={disabledArr[index] || loading}
                      input={<TextField />}
                      renderInput={(props) =>
                        <TextField
                          {...props}
                          className={classes.addHistoryField}
                          variant="filled"
                          value={Number(item.yearField) != 1 ? formatDate(new Date(Number(item.yearField))) : ''}
                        />
                      }
                    />
                  </Grid>
                </LocalizationProvider>
              ) : null}
              {homeHistory.otherInfo && (item.otherInfo || otherArea[index]) ? (<TextField
                id="standard-multiline-static"
                label={'Other information'}
                rows={4}
                variant="filled"
                className={classes.listHistoryField}
                value={disabledArr[index] === false ? otherInfo : item.otherInfo}
                disabled={disabledArr[index] || loading}
                onChange={(e) => setOtherInfo(e.target.value)}
              />) : null}
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
                      <IconButton onClick={() => { initialConf(); setAllAreasToFalse(); }}>
                        <CancelIcon />
                      </IconButton>
                      <IconButton onClick={handleOpenMenu}>
                        <AddCircleIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        {item.contractId == 0 && tpContractId[0] && <MenuItem onClick={() => { handleCloseMenu(); beforeConnectContract(index, tpContractId) }}>Add contract</MenuItem>}
                        {homeHistory.imgNeed && !imageArea[index] && !item.houseImg && <MenuItem onClick={() => { handleCloseMenu(); addImageArea(index); }}>Add Image</MenuItem>}
                        {homeHistory.brandNeed && !brandArea[index] && !item.houseBrand && <MenuItem onClick={() => { handleCloseMenu(); addBrandArea(index); }}>Add Brand</MenuItem>}
                        {homeHistory.brandTypeNeed && !brandTypeArea[index] && !item.brandType && <MenuItem onClick={() => { handleCloseMenu(); addBrandTypeArea(index); }}>Add Brand type</MenuItem>}
                        {homeHistory.yearNeed && !yearArea[index] && Number(item.yearField) == 1 && <MenuItem onClick={() => { handleCloseMenu(); addYearArea(index); }}>Add Date</MenuItem>}
                        {homeHistory.otherInfo && !otherArea[index] && !item.otherInfo && <MenuItem onClick={() => { handleCloseMenu(); addOtherArea(index); }}>Add Other information</MenuItem>}
                        {homeHistory.descNeed && !descArea[index] && !item.desc && <MenuItem onClick={() => { handleCloseMenu(); addDescArea(index); }}>Add Description</MenuItem>}
                      </Menu>
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
      <Dialog
        open={openModal}
        onClose={() => { setOpenModal(false) }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please select a contract.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <TextField
            style={{ width: "100%" }}
            select
            label="Contracts"
            onChange={(e) => {
              setContractUnitId(e.target.value);
            }}
            variant="filled"
          >
            {
              contractId.map((tp, idx) => {
                const contract = contracts.find(temp => temp.contractId === tp);
                const label = contract ? contract.label : 'N/A';
                return (
                  <MenuItem key={idx} value={tp}>
                    {label}
                  </MenuItem>
                );
              })
            }
          </TextField>
          <LoadingButton
            style={{ height: '55px' }}
              onClick={() => { connectContract(index, contractUnitId);setOpenModal(false)  }}
            variant="contained"
          >
            CONNECT A CONTRACT
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
