import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import useNftDetailStyle from 'assets/styles/nftDetailStyle';
import { pages } from 'components/Header';
import HouseLoading from 'components/HouseLoading';
import CryptoJS from 'crypto-js';
import { BigNumber, ethers } from 'ethers';
import { useHouseBusinessContract, useHouseDocContract } from 'hooks/useContractHelpers';
import { houseError, houseSuccess, houseWarning } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { apiURL, secretKey, zeroAddress } from 'mainConfig';
import { decryptContract } from 'utils';
import FileUpload from 'utils/ipfs';
import Histories from './Histories';
import NFTdetail from './NFTdetail';
import NewHistory from './NewHistory';

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
	const walletAccount = props.account.account;
	const injected = props.account.injected;
	const historyTypes = props.historyTypes.historyTypes;
	const { houseNftID } = useParams();

	const houseBusinessContract = useHouseBusinessContract();
	const houseDocContract = useHouseDocContract();

	const classes = useNftDetailStyle();
	const [simpleNFT, setSimpleNFT] = useState({});
	const [otherInfo, setOtherInfo] = useState('');
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
	const [solorDate, setSolorDate] = useState(null);
	const [changeDate, setChangeDate] = useState(false);
	const [MPrice, setMprice] = useState(0.01);
	const [Hprice, setHprice] = useState(1);
	const [totalPrice, setTotalPrice] = useState(0);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [cContract, setCContract] = useState('');
	const [contracts, setContracts] = useState([]);
	const [oldHistoryTypeIds, setOldHistoryTypeIds] = useState([]);
	const [changinghistoryType, setChangingHistoryType] = useState('0');

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const initialConfig = async () => {
		var minPrice = await houseBusinessContract.methods.minPrice().call();
		var maxPrice = await houseBusinessContract.methods.maxPrice().call();
		setMprice(web3.utils.fromWei(minPrice));
		setHprice(web3.utils.fromWei(maxPrice));
	};

	const loadNFT = async (_id) => {
		if (walletAccount) {
			var allContracts = await houseDocContract.methods.getAllDocContracts().call();
			var _housePrice = await houseBusinessContract.methods.getExtraPrice(_id).call();
			var cArr = [];
			for (let i = 0; i < allContracts.length; i++) {
				if ((allContracts[i].owner).toLowerCase() == walletAccount.toLowerCase()) {
					const contract = decryptContract(allContracts[i]);
					cArr.push({
						...contract,
						label: `${historyTypes[contract.contractType].hLabel} contract in ${contract.companyName}`,
					});
				}
			}
			setContracts(cArr);
			setTotalPrice(_housePrice)

			var nfts = await houseBusinessContract.methods.getAllHouses().call();
			var nft = nfts.filter((item) => item.houseID === _id)[0];
			var chistories = await houseBusinessContract.methods.getHistory(_id).call();
			var arr = [];
			for (var i = 0; i < chistories.length; i++) {
				arr.push(chistories[i].historyTypeId)
			}
			setOldHistoryTypeIds(arr);
			setHistories(chistories);

			if (nft) {
				if (nft.contributor.buyer) {
					setSpecialBuyer(nft.contributor.buyer);
				}
				if (nft.contributor.currentOwner === walletAccount) {
					var flag = false;
					for (let i = 0; i < pages.length; i++) {
						if (pages[i].router === _id) {
							flag = true;
						}
					}
					if (nft) {
						var bytes = CryptoJS.AES.decrypt(nft.tokenURI, secretKey);
						var decryptedURI = bytes.toString(CryptoJS.enc.Utf8);
						var bytesName = CryptoJS.AES.decrypt(nft.tokenName, secretKey);
						var decryptedName = bytesName.toString(CryptoJS.enc.Utf8);
						var bytesType = CryptoJS.AES.decrypt(nft.tokenType, secretKey);
						var decryptedType = bytesType.toString(CryptoJS.enc.Utf8);
						setSimpleNFT({
							...nft,
							tokenURI: decryptedURI,
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
		}
	};

	const handleAddHistory = async () => {
		setLoading(true);
		var flag = false;
		var _houseId = simpleNFT.houseID,
			_houseImg = '',
			_otherInfo = otherInfo || '',
			_desc = '',
			_brand = '',
			_brandType = '',
			_yearField = 1;

		var homeHistory = historyTypes[hID];

		if (homeHistory.imgNeed === true) {
			if (image) {
				_houseImg = await FileUpload(image);
			}
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
			if (changeDate) {
				if (solorDate == null) {
					_yearField = 1;
				} else {
					_yearField = solorDate.valueOf();
					if (_yearField < 0) flag = true;
				}
			} else _yearField = 1;
		}

		try {
			var encryptedHouseImage = CryptoJS.AES.encrypt(_houseImg, secretKey).toString();
			var encryptedBrand = CryptoJS.AES.encrypt(_brand, secretKey).toString();
			var encryptedOtherInfo = CryptoJS.AES.encrypt(_otherInfo, secretKey).toString();
			var encryptedDesc = CryptoJS.AES.encrypt(_desc, secretKey).toString();
			var encryptedBrandType = CryptoJS.AES.encrypt(_brandType, secretKey).toString();

			if (!account) {
				const data = houseBusinessContract.methods
					.addHistory(
						Number(_houseId),
						Number(cContract),
						hID,
						encryptedHouseImage,
						encryptedBrand,
						encryptedOtherInfo,
						encryptedDesc,
						encryptedBrandType,
						_yearField,
						flag
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
						setLoading(false);
						houseSuccess('You added the history successfully!');
					})
					.catch(err => {
						setLoading(false);
						houseError(err.message)
					});

				loadNFT(_houseId);
				setHID('0');
				setHistory('');
				setImage('');
				setPictureDesc('');
				setBrand('');
				setBrandType('');
				setSolorDate(0);
			} else {
				try {
					await houseBusinessContract.methods
						.addHistory(
							Number(_houseId),
							Number(cContract),
							hID,
							encryptedHouseImage,
							encryptedBrand,
							encryptedOtherInfo,
							encryptedDesc,
							encryptedBrandType,
							_yearField,
							flag
						).send({ from: account });
					houseSuccess('You added the history successfully!');

					loadNFT(_houseId);
					setHID('0');
					setOtherInfo('');
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
			}
		} catch (err) {
			houseError('Something Went wrong!');
			setLoading(false);
			console.log('err', err)
		}
	};

	const handleDisconnectContract = async (hIndex, contractId) => {
		const houseID = simpleNFT.houseID;
		setLoading(true);
		if (!injected) {
			const data = houseBusinessContract.methods.disconnectContract(houseID, hIndex, contractId).encodeABI();
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
					setLoading(false)
					loadNFT(houseID);
				})
				.catch(err => {
					setLoading(false)
					houseError(err)
				});
		} else {
			try {
				await houseBusinessContract.methods.disconnectContract(houseID, hIndex, contractId).send({ from: account });
				houseSuccess('You disconnected contract sucessfully!');
				setLoading(false)
				loadNFT(houseID);
			} catch (error) {
				houseError('Something went wrong!');
				setLoading(false)
				console.error(error);
			}
		}
	};

	const handleConnectContract = async (hIndex, contractId) => {
		const houseID = simpleNFT.houseID;
		setLoading(true);
		if (!injected) {
			const data = houseBusinessContract.methods.connectContract(houseID, hIndex, contractId).encodeABI();
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
					houseSuccess('You connected contract sucessfully!');
					setLoading(false)
					loadNFT(houseID);
				})
				.catch(err => {
					setLoading(false)
					houseError(err)
				});
		} else {
			try {
				console.log("After", houseID, hIndex, contractId)
				await houseBusinessContract.methods.connectContract(houseID, hIndex, contractId).send({ from: account });
				houseSuccess('You connected contract sucessfully!');
				setLoading(false)
				loadNFT(houseID);
			} catch (error) {
				houseError('Something went wrong!');
				setLoading(false)
				console.error(error);
			}
		}
	};

	const handleImageChange = async (e) => {
		var uploadedImage = e.target.files[0];
		if (uploadedImage) {
			setImage(uploadedImage);
		}
	};

	const handleBuyerEdit = async () => {
		if (web3.utils.fromWei(simpleNFT.price) == 0) {
			houseWarning("Please set NFT price to set payable");
			return;
		}
		// check if the buyer is valid
		if (!ethers.utils.isAddress(specialBuyer)) {
			houseWarning('Please input valid Ethereum wallet address');
			return;
		}

		if (specialBuyer === walletAccount) {
			houseWarning('You are already owner of this NFT');
			return;
		}

		if (!injected) {
			const data = houseBusinessContract.methods.setPayable(simpleNFT.houseID, specialBuyer, true).encodeABI();

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
					houseSuccess('Success!');
					setSpecialBuyer('');
					setBuyerFlag(false);
					loadNFT(simpleNFT.houseID);
				})
				.catch(err => {
					houseError(err)
				});
		} else {
			try {
				await houseBusinessContract.methods.setPayable(simpleNFT.houseID, specialBuyer, true).send({ from: account });
				houseSuccess('Success!');
				setSpecialBuyer('');
				setBuyerFlag(false);
				loadNFT(simpleNFT.houseID);
			} catch (err) {
				console.log(err);
				houseError("Something went wrong!")
			}
		}
	};

	const changeHousePrice = async (houseID, housePrice) => {
		if (!walletAccount) {
			houseInfo("Please connect your wallet!")
		} else {
			if (Number(housePrice) < Number(MPrice)) {
				houseWarning(`Please set the NFT price above the min price`);
				return;
			}
			if (Number(housePrice) > Number(Hprice)) {
				houseWarning(`Please Set the NFT price below the max price`);
				return;
			}
			const _housePrice = BigNumber.from(`${Number(housePrice) * 10 ** 18}`);
			if (!injected) {
				const data = houseBusinessContract.methods.changeHousePrice(Number(houseID), _housePrice).encodeABI();

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
					.then(async (res) => {
						if (res.status !== 200) {
							return res.json().then(error => {
								houseError(`Error: ${error.message}`);
								setLoading(false);
							});
						}

						houseSuccess("You have successfully set your House price!")
						setLoading(false);
						loadNFT(houseID);
					})
					.catch(err => {
						setLoading(false);
						houseError(err)
						return;
					});
			} else {
				try {
					await houseBusinessContract.methods.changeHousePrice(Number(houseID), _housePrice).send({ from: account });

					setLoading(false);
					houseSuccess("You have successfully set your House price!")
				} catch (error) {
					console.log(error);
					setLoading(false);
					houseError('Something went wrong!');
				}
				loadNFT(houseID);
			}
		}
	}

	const handlePayable = async (flag) => {
		setLoading(true);

		if (web3.utils.fromWei(totalPrice) == 0) {
			houseWarning("Please set NFT price to set payable");
			return;
		}

		const buyer = (buyerFlag === true) ? specialBuyer : zeroAddress;

		if (!injected) {
			const data = houseBusinessContract.methods.setPayable(simpleNFT.houseID, buyer, flag).encodeABI();
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
						});
					}

					houseSuccess('Success!');
					setSpecialBuyer('');
					setBuyerFlag(false);
					setLoading(false);
					loadNFT(simpleNFT.houseID);
				})
				.catch(err => {
					houseError(err)
					setLoading(false);
					return;
				});
		} else {
			try {
				await houseBusinessContract.methods.setPayable(simpleNFT.houseID, buyer, flag).send({ from: walletAccount });
				houseSuccess('Success!');
				setSpecialBuyer('');
				setBuyerFlag(false);
				setLoading(false);
				loadNFT(simpleNFT.houseID);
			} catch (err) {
				console.log(err);
				setLoading(false);
				houseError("Something went wrong");
			}
		}
	};

	const handleViewable = async (flag) => {
		setLoading(true);
		if (!injected) {
			const data = houseBusinessContract.methods.setViewable(simpleNFT.houseID, flag).encodeABI();
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
						});
					}

					houseSuccess('Success!');
					setSpecialBuyer('');
					setBuyerFlag(false);
					setLoading(false);
					loadNFT(simpleNFT.houseID);
				})
				.catch(err => {
					houseError(err)
					setLoading(false);
					return;
				});
		} else {
			try {
				await houseBusinessContract.methods.setViewable(simpleNFT.houseID, flag).send({ from: walletAccount });
				houseSuccess('Success!');
				setLoading(false);
				loadNFT(simpleNFT.houseID);
			} catch (err) {
				console.log(err);
				setLoading(false);
				houseError("Something went wrong");
			}
		}
	}

	useEffect(() => {
		if (walletAccount) {
			initialConfig();
		}
	}, [walletAccount]);

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
			{(simpleNFT && simpleNFT.tokenName) ? (
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
						totalPrice={totalPrice}
						loading={loading}
						setLoading={setLoading}
						buyerFlag={buyerFlag}
						setBuyerFlag={setBuyerFlag}
						specialBuyer={specialBuyer}
						setSpecialBuyer={setSpecialBuyer}
						handleBuyerEdit={handleBuyerEdit}
						handlePayable={handlePayable}
						handleViewable={handleViewable}
						changeHousePrice={changeHousePrice}
					/>
					<Grid item xl={12} md={12}>
						<Box component={'h3'}>House History</Box>
						<Histories
							classes={classes}
							simpleNFT={simpleNFT}
							disabledArr={disabledArr}
							histories={histories}
							contracts={contracts}
							changinghistoryType={changinghistoryType}
							setChangingHistoryType={setChangingHistoryType}
							historyTypes={historyTypes}
							houseID={simpleNFT.houseID}
							loadNFT={loadNFT}
							walletAccount={walletAccount}
							injected={injected}
							connectContract={handleConnectContract}
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
									otherInfo={otherInfo}
									setOtherInfo={setOtherInfo}
									hID={hID}
									setHID={setHID}
									historyTypes={historyTypes}
									oldHistoryTypeIds={oldHistoryTypeIds}
									image={image}
									brandType={brandType}
									setBrandType={setBrandType}
									brand={brand}
									setBrand={setBrand}
									solorDate={solorDate}
									setSolorDate={setSolorDate}
									setChangeDate={setChangeDate}
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
		historyTypes: state.historyTypes
	};
}

export default connect(mapStateToProps)(HouseDetails);