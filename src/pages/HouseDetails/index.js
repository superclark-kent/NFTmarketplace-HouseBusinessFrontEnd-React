import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import CryptoJS from 'crypto-js';

import useNftDetailStyle from 'assets/styles/nftDetailStyle';
import { pages } from 'components/Header';
import HouseLoading from 'components/HouseLoading';
import { useCleanContract, useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseError, houseSuccess, houseWarning } from 'hooks/useToast';
import { secretKey, zeroAddress } from 'mainConfig';
import { decryptContract } from 'utils';
import { BigNumber } from 'ethers';
import FileUpload from 'utils/ipfs';
import Histories from './Histories';
import NewHistory from './NewHistory';
import NFTdetail from './NFTdetail';
import { useWeb3 } from 'hooks/useWeb3';

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
  const web3 = useWeb3();
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
      allHTypes.push(hTypes[i]);
    }
    setHistoryTypes(allHTypes);
  };

  const loadNFT = async (_id) => {
    var allMyContracts = await cleanContract.methods.getAllContractsByOwner(account).call({ from: account });
    var cArr = [];
    for (let i = 0; i < allMyContracts.length; i++) {
      const contract = decryptContract(allMyContracts[i]);
      cArr.push({
        ...contract,
        label: `${historyTypes[contract.contractType].hLabel} contract in ${contract.companyName}`,
      });
    }
    setContracts(cArr);

    var nfts = await houseBusinessContract.methods.getAllHouses().call({ from: account });
    var nft = nfts.filter((item) => item.houseID === _id)[0];
    var chistories = await houseBusinessContract.methods.getHistory(_id).call();

    setHistories(chistories);

    if (nft) {
      if (nft.contributor.buyer) {
        setSpecialBuyer(nft.contributor.buyer);
      }
      var confirm = await houseBusinessContract.methods.checkAllowedList(nft.houseID, account).call();
      if (nft.contributor.currentOwner === account || confirm === true) {
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
    var _houseId = simpleNFT.houseID,
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

      // const estimateGas = await houseBusinessContract.methods
      //     .addHistory(
      //       Number(_houseId),
      //       Number(cContract),
      //       Number(homeHistory.hID),
      //       encryptedHouseImage,
      //       encryptedBrand,
      //       encryptedHistory,
      //       encryptedDesc,
      //       encryptedBrandType,
      //       _yearField
      //     ).estimateGas()
      // console.log('estimateGas', estimateGas)
      const owner = await houseBusinessContract.methods.ownerOf(Number(_houseId)).call();

      try {
        await houseBusinessContract.methods
          .addHistory(
            Number(_houseId),
            Number(cContract),
            Number(homeHistory.hID),
            encryptedHouseImage,
            encryptedBrand,
            encryptedHistory,
            encryptedDesc,
            encryptedBrandType,
            _yearField
          )
          .send({from: account})
          .then((res) => {
            houseSuccess('You added the history successfully!');
          });
      } catch (err) {
        console.log('error', err.message)
        houseError('Something Went wrong!');
        setLoading(false);
      }

      loadNFT(_houseId);
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
      console.log('err', err)
    }
  };

  const handleDisconnectContract = async (hIndex, contractId) => {
    const houseID = simpleNFT.houseID;
    setLoading(true);
    try {
      await houseBusinessContract.methods.disconnectContract(houseID, hIndex, contractId).send({ from: account });
      houseSuccess('You disconnected contract sucessfully!');
      loadNFT(houseID);
    } catch (error) {
      houseError('Something went wrong!');
      console.error(error);
    }
    setLoading(false);
  };

  const handleBuyerEdit = async () => {
    await houseBusinessContract.methods.setPayable(simpleNFT.houseID, specialBuyer, true).send({ from: account });
    houseSuccess('Success!');
    setSpecialBuyer('');
    setBuyerFlag(false);
    loadNFT(simpleNFT.houseID);
  };

  const changeHousePrice = async (houseID, housePrice) => {
    console.log('houseID', houseID, typeof houseID)
    if (!account) {
      houseInfo("Please connect your wallet!")
    } else {
      const _housePrice = BigNumber.from(`${Number(housePrice) * 10 ** 18}`);
      // const estimateGas = await houseBusinessContract.methods.changeHousePrice(Number(houseID), _housePrice).estimateGas();
      await houseBusinessContract.methods.changeHousePrice(Number(houseID), _housePrice).send({ from: account });
      houseSuccess("You have successfully set your House price!")
      loadNFT(houseID)
    }
  }

  const handlePayable = async (flag) => {
    if (web3.utils.fromWei(simpleNFT.price) == 0) {
      houseWarning("Please set NFT price to set payable");
      return;
    }
    if (buyerFlag === true) {
      await houseBusinessContract.methods.setPayable(simpleNFT.houseID, specialBuyer, flag).send({ from: account });
    } else {
      await houseBusinessContract.methods.setPayable(simpleNFT.houseID, zeroAddress, flag).send({ from: account });
    }
    houseSuccess('Success!');
    setSpecialBuyer('');
    setBuyerFlag(false);
    loadNFT(simpleNFT.houseID);
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
            changeHousePrice={changeHousePrice}
          />
          <Grid item xl={12} md={12}>
            <Box component={'h3'}>House History</Box>
            <Histories
              classes={classes}
              disabledArr={disabledArr}
              histories={histories}
              contracts={contracts}
              changinghistoryType={changinghistoryType}
              setChangingHistoryType={setChangingHistoryType}
              historyTypes={historyTypes}
              houseID={simpleNFT.houseID}
              loadNFT={loadNFT}
              disconnectContract={handleDisconnectContract}
            />
            {simpleNFT.contributor.currentOwner === `${account}` ? (
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
