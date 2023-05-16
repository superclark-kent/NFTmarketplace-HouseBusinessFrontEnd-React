import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import CryptoJS from 'crypto-js';
import { setAccount } from "redux/actions/account";

import useNftDetailStyle from 'assets/styles/nftDetailStyle';
import { pages } from 'components/Header';
import HouseLoading from 'components/HouseLoading';
import { useCleanContract, useHouseBusinessContract } from 'hooks/useContractHelpers';
import { houseError, houseSuccess, houseWarning } from 'hooks/useToast';
import { secretKey, zeroAddress, apiURL } from 'mainConfig';
import { decryptContract } from 'utils';
import { BigNumber, ethers } from 'ethers';
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

function HouseDetails(props) {
	const navigate = useNavigate();
	const { account } = useWeb3React();
	const web3 = useWeb3();
	const dispatch = useDispatch();
	const walletAccount = props.account.account;
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
		var allMyContracts = await cleanContract.methods.getAllContractsByOwner(walletAccount).call();
		var cArr = [];
		for (let i = 0; i < allMyContracts.length; i++) {
			const contract = decryptContract(allMyContracts[i]);
			cArr.push({
				...contract,
				label: `${historyTypes[contract.contractType].hLabel} contract in ${contract.companyName}`,
			});
		}
		setContracts(cArr);

		var nfts = await houseBusinessContract.methods.getAllHouses().call();
		var nft = nfts.filter((item) => item.tokenId === _id)[0];
		var chistories = await houseBusinessContract.methods.getHistory(_id).call();

		setHistories(chistories);

		if (nft) {
			if (nft.contributor.buyer) {
				setSpecialBuyer(nft.contributor.buyer);
			}
			var confirm = await houseBusinessContract.methods.checkAllowedList(nft.tokenId, walletAccount).call();
			if (nft.contributor.currentOwner === walletAccount || confirm === true) {
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
		var _tokenId = simpleNFT.tokenId,
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

			const data = houseBusinessContract.methods
				.addHistory(
					_tokenId,
					Number(cContract),
					encryptedHouseImage,
					encryptedBrand,
					encryptedHistory,
					encryptedDesc,
					encryptedBrandType,
					_yearField,
					walletAccount
				).encodeABI();
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
				.then(res => {
					if (res.status !== 200) {
						return res.json().then(error => {
							houseError(`Error: ${error.message}`);
							setLoading(false);
						});
					}
					houseSuccess('You added the history successfully!');
				})
				.catch(err => {
					houseError(err)
					setLoading(false);
					return;
				});

			loadNFT(_tokenId);
			setHID('0');
			setHistory('');
			setImage('');
			setPictureDesc('');
			setBrand('');
			setBrandType('');
			setSolorDate(0);
		} catch (err) {
			houseError('Something Went wrong!');
			console.log('err', err)
		}
		setLoading(false);
	};

	const handleDisconnectContract = async (hIndex, contractId) => {
		const tokenId = simpleNFT.tokenId;
		setLoading(true);
		try {
			const data = houseBusinessContract.methods.disconnectContract(tokenId, hIndex, contractId, walletAccount).encodeABI();
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
				.then(res => {
					if (res.status !== 200) {
						return res.json().then(error => {
							houseError(`Error: ${error.message}`);
						});
					}
					houseSuccess('You disconnected contract sucessfully!');
					loadNFT(tokenId);
				})
				.catch(err => {
					houseError(err)
				});
		} catch (error) {
			houseError('Something went wrong!');
			console.error(error);
		}
		setLoading(false);
	};

	const handleBuyerEdit = async () => {
		// check if the buyer is valid
		if (!ethers.utils.isAddress(specialBuyer)) {
			houseWarning('Please input valid Ethereum wallet address');
			return;
		}

		if (specialBuyer === walletAccount) {
			houseWarning('You are already owner of this NFT');
			return;
		}

		const data = houseBusinessContract.methods.setPayable(simpleNFT.tokenId, specialBuyer, true, walletAccount).encodeABI();

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
			.then(res => {
				if (res.status !== 200) {
					return res.json().then(error => {
						houseError(`Error: ${error.message}`);
					});
				}
			})
			.catch(err => {
				houseError(err)
			});
		houseSuccess('Success!');
		setSpecialBuyer('');
		setBuyerFlag(false);
		loadNFT(simpleNFT.tokenId);
	};

	const changeHousePrice = async (tokenId, housePrice) => {
		console.log('tokenId', tokenId, typeof tokenId)
		if (!walletAccount) {
			houseInfo("Please connect your wallet!")
		} else {
			const _housePrice = BigNumber.from(`${Number(housePrice) * 10 ** 18}`);
			// const estimateGas = await houseBusinessContract.methods.changeHousePrice(Number(tokenId), _housePrice).estimateGas();
			const data = houseBusinessContract.methods.changeHousePrice(Number(tokenId), _housePrice, walletAccount).encodeABI();

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
				.then(res => {
					if (res.status !== 200) {
						return res.json().then(error => {
							houseError(`Error: ${error.message}`);
							setLoading(false);
						});
					}
				})
				.catch(err => {
					houseError(err)
					return;
				});

			houseSuccess("You have successfully set your House price!")
			loadNFT(tokenId);
		}
	}

	const handlePayable = async (flag) => {
		if (web3.utils.fromWei(simpleNFT.price) == 0) {
			houseWarning("Please set NFT price to set payable");
			return;
		}
		let data;
		if (buyerFlag === true) {
			data = houseBusinessContract.methods.setPayable(simpleNFT.tokenId, specialBuyer, flag, walletAccount).encodeABI();
		} else {
			data = houseBusinessContract.methods.setPayable(simpleNFT.tokenId, zeroAddress, flag, walletAccount).encodeABI();
		}

		const transactionObject = {
			to: houseBusinessContract.options.address,
			data
		}

		// Send trx data and sign
		fetch(`${apiURL}/signTransaction`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				transactionObject,
				user: walletAccount
			}),
		})
			.then(res => {
				if (res.status !== 200) {
					return res.json().then(error => {
						houseError(`Error: ${error.message}`);
						setLoading(false);
					});
				}
			})
			.catch(err => {
				houseError(err)
				return;
			});

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
			dispatch(setAccount(account));
		} else if (walletAccount) {
			dispatch(setAccount(walletAccount));
		} else {
			dispatch(setAccount(null));
		}

		if (walletAccount) {
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
						account={walletAccount}
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
							tokenId={simpleNFT.tokenId}
							loadNFT={loadNFT}
							disconnectContract={handleDisconnectContract}
						/>
						{simpleNFT.contributor.currentOwner === `${walletAccount}` ? (
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

function mapStateToProps(state) {
	return {
		account: state.account,
	};
}

export default connect(mapStateToProps)(HouseDetails);