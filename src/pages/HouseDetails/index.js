import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import CryptoJS from 'crypto-js';

import FileUpload from 'utils/ipfs';
import { houseInfo, houseError, houseSuccess } from 'hooks/useToast';
import { useCleanContract, useHouseBusinessContract } from 'hooks/useContractHelpers';
import useNftDetailStyle from 'assets/styles/nftDetailStyle';
import { pages } from 'components/Header';
import NewHistory from './NewHistory';
import Histories from './Histories';
import NFTdetail from './NFTdetail';
import { secretKey, zeroAddress } from 'mainConfig';
import HouseLoading from 'components/HouseLoading';
import { decryptContract } from 'utils';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '100%',
  bgcolor: 'transparent',
  boxShadow: 24,
  p: 4,
  '& img': {
    height: '100%',
  },
};

export default function HouseDetails() {
  const navigate = useNavigate();
  const { account } = useWeb3React();
  const { houseNftID } = useParams();

  const cleanContract = useCleanContract();
  const houseBusinessContract = useHouseBusinessContract();

  const classes = useNftDetailStyle();
  const [simpleNFT, setSimpleNFT] = useState({});
  const [history, setHistory] = useState('');
  const [hID, setHID] = useState('0');
  const [disabledArr, setDisabledArr] = useState([]);
  const [histories, setHistories] = useState([]);

  const [buyerFlag, setBuyerFlag] = useState(false);
  const [specialBuyer, setSpecialBuyer] = useState('');

  // Image
  const [image, setImage] = useState(null);
  const [pictureDesc, setPictureDesc] = useState('');
  const [brand, setBrand] = useState('');
  const [brandType, setBrandType] = useState('');
  const [solorDate, setSolorDate] = useState(new Date().valueOf());

  const [loading, setLoading] = useState(false);

  const [cHID, setCHID] = useState(null);

  const [cContract, setCContract] = useState('');
  const [contracts, setContracts] = useState([]);

  const [changinghistoryType, setChangingHistoryType] = useState('0');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [historyTypes, setHistoryTypes] = useState([]);

  const initialConfig = async () => {
    var hTypes = await houseBusinessContract.methods.getHistoryType().call();
    var allHTypes = [];
    for (let i = 0; i < hTypes.length; i++) {
      console.log('hType[i]', hTypes[i]);
      if (hTypes[i].hLabel === '') continue;
      allHTypes.push(hTypes[i]);
    }
    setHistoryTypes(allHTypes);
  };

  const loadNFT = async (_id) => {
    console.log('---loadNFT---');
    var allMyContracts = await cleanContract.methods.getAllContractsByOwner().call({ from: account });
    var cArr = [];
    for (let i = 0; i < allMyContracts.length; i++) {
      const contract = decryptContract(allMyContracts[i]);
      cArr.push({
        ...contract,
        label: `${contract.contractType} contract in ${contract.companyName}`,
      });
    }
    console.log({ contracts: cArr });
    setContracts(cArr);

    var nfts = await houseBusinessContract.methods.getAllHouses().call();
    var nft = nfts.filter((item) => item.tokenId === _id)[0];
    var chistories = await houseBusinessContract.methods.getHistory(_id).call();

    console.log('chistories', chistories);
    setHistories(chistories);

    if (nft.buyer) {
      setSpecialBuyer(nft.buyer);
    }
    if (nft) {
      var confirm = await houseBusinessContract.methods.checkAllowedList(nft.tokenId, account).call();
      if (nft.currentOwner === account || confirm === true) {
        var flag = false;
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].router === _id) {
            flag = true;
          }
        }
        if (nft) {
          var bytes = CryptoJS.AES.decrypt(nft.tokenURI, secretKey);
          var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
          var bytesName = CryptoJS.AES.decrypt(nft.tokenName, secretKey);
          var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
          var bytesType = CryptoJS.AES.decrypt(nft.tokenType, secretKey);
          var decryptedType = bytesType.toString(CryptoJS.enc.Utf8);
          setSimpleNFT({
            ...nft,
            tokenURI: decryptedData,
            tokenName: decryptedName,
            tokenType: decryptedType,
          });
          var dArr = [];
          for (let i = 0; i < chistories.length; i++) {
            dArr[i] = true;
          }
          setDisabledArr(dArr);
        } else if (flag === true) {
          navigate(`../../house/${_id}`);
        } else {
          houseError('Invalid Url or NFT ID');
          navigate('../../house/app');
        }
      } else {
        houseError("You don't have permission to view this NFT detail");
        navigate('../../house/app');
      }
    } else {
      houseError('Invalid Url or NFT ID');
      navigate('../../house/app');
    }
  };

  const handleAddHistory = async () => {
    setLoading(true);
    var _tokenID = simpleNFT.tokenId,
      _houseImg = '',
      _history = history || '',
      _desc = '',
      _brand = '',
      _brandType = '',
      _yearField = 0;

    var homeHistory = historyTypes.filter((option) => option.hID === hID)[0];

    if (homeHistory.imgNeed === true) {
      if (!image) {
        houseError('Upload Image');
        setLoading(false);
        return;
      }
      _houseImg = await FileUpload(image);
    }
    if (homeHistory.descNeed === true) {
      _desc = pictureDesc;
    }
    if (homeHistory.brandNeed === true) {
      _brand = brand;
    }
    if (homeHistory.brandTypeNeed === true) {
      _brandType = brandType;
    }
    if (homeHistory.yearNeed === true) {
      _yearField = solorDate.valueOf();
    }
    try {
      var encryptedHouseImage = CryptoJS.AES.encrypt(_houseImg, secretKey).toString();
      var encryptedBrand = CryptoJS.AES.encrypt(_brand, secretKey).toString();
      var encryptedHistory = CryptoJS.AES.encrypt(_history, secretKey).toString();
      var encryptedDesc = CryptoJS.AES.encrypt(_desc, secretKey).toString();
      var encryptedBrandType = CryptoJS.AES.encrypt(_brandType, secretKey).toString();

      await houseBusinessContract.methods
        .addHistory(
          _tokenID,
          cContract,
          hID,
          encryptedHouseImage,
          encryptedBrand,
          encryptedHistory,
          encryptedDesc,
          encryptedBrandType,
          _yearField
        )
        .send({ from: account });
      houseSuccess('You added the history successfully!');
      loadNFT(_tokenID);
      setHID('0');
      setHistory('');
      setImage('');
      setPictureDesc('');
      setBrand('');
      setBrandType('');
      setSolorDate(0);
      setLoading(false);
    } catch (err) {
      houseError('Something Went wrong!');
      setLoading(false);
    }
  };

  const handleBuyerEdit = async () => {
    await houseBusinessContract.methods.setPayable(simpleNFT.tokenId, specialBuyer, true).send({ from: account });
    houseSuccess('Success!');
    setSpecialBuyer('');
    setBuyerFlag(false);
    loadNFT(simpleNFT.tokenId);
  };

  const handlePayable = async (flag) => {
    if (buyerFlag === true) {
      await houseBusinessContract.methods.setPayable(simpleNFT.tokenId, specialBuyer, flag).send({ from: account });
    } else {
      await houseBusinessContract.methods.setPayable(simpleNFT.tokenId, zeroAddress, flag).send({ from: account });
    }
    houseSuccess('Success!');
    setSpecialBuyer('');
    setBuyerFlag(false);
    loadNFT(simpleNFT.tokenId);
  };

  const handleImageChange = async (e) => {
    var uploadedImage = e.target.files[0];
    if (uploadedImage) {
      setImage(uploadedImage);
    }
  };

  useEffect(() => {
    if (account) {
      initialConfig();
    }
  }, [account]);

  useEffect(() => {
    if (houseNftID) {
      if (historyTypes.length > 0) {
        loadNFT(houseNftID);
      }
    } else {
      houseError('Invalid Url or NFT ID');
      navigate('../../house/app');
    }
  }, [houseNftID, historyTypes]);

  return (
    <>
      {simpleNFT.tokenName ? (
        <Grid container spacing={5}>
          <Grid item xl={6} md={12}>
            <Grid className={classes.nftMedia}>
              <Button onClick={() => handleOpen()} className={classes.nftImg}>
                <img alt={simpleNFT.tokenURI} src={simpleNFT.tokenURI} />
              </Button>
            </Grid>
          </Grid>
          <NFTdetail
            classes={classes}
            account={account}
            simpleNFT={simpleNFT}
            buyerFlag={buyerFlag}
            setBuyerFlag={setBuyerFlag}
            specialBuyer={specialBuyer}
            setSpecialBuyer={setSpecialBuyer}
            handleBuyerEdit={handleBuyerEdit}
            handlePayable={handlePayable}
          />
          <Grid item xl={12} md={12}>
            <Box component={'h3'}>House History</Box>
            <Histories
              classes={classes}
              cHID={cHID}
              disabledArr={disabledArr}
              histories={histories}
              contracts={contracts}
              changinghistoryType={changinghistoryType}
              setChangingHistoryType={setChangingHistoryType}
              historyTypes={historyTypes}
              tokenID={simpleNFT.tokenId}
              loadNFT={loadNFT}
            />
            {simpleNFT.currentOwner === `${account}` ? (
              <Grid className={classes.addHistorySection}>
                <NewHistory
                  classes={classes}
                  contracts={contracts}
                  cContract={cContract}
                  setCContract={setCContract}
                  loading={loading}
                  history={history}
                  setHistory={setHistory}
                  hID={hID}
                  setHID={setHID}
                  historyTypes={historyTypes}
                  image={image}
                  brandType={brandType}
                  setBrandType={setBrandType}
                  brand={brand}
                  setBrand={setBrand}
                  solorDate={solorDate}
                  setSolorDate={setSolorDate}
                  pictureDesc={pictureDesc}
                  setPictureDesc={setPictureDesc}
                  handleImageChange={handleImageChange}
                  handleAddHistory={handleAddHistory}
                />
              </Grid>
            ) : (
              <></>
            )}
          </Grid>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Button sx={style} onClick={() => handleClose()}>
              <img alt={simpleNFT.tokenURI} src={simpleNFT.tokenURI} />
            </Button>
          </Modal>
        </Grid>
      ) : (
        <HouseLoading />
      )}
    </>
  );
}
