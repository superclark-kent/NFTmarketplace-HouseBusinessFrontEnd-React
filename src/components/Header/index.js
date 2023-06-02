import { Fragment, cloneElement, useEffect, useState } from "react";
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";

import SaveIcon from '@mui/icons-material/Save';
import MuiAppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Zoom from "@mui/material/Zoom";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { Button, Grid, TextField } from '@mui/material';
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ExtensionIcon from "@mui/icons-material/Extension";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Logout from "@mui/icons-material/Logout";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import Settings from "@mui/icons-material/Settings";
import WidgetsIcon from "@mui/icons-material/Widgets";
import Modal from "@mui/material/Modal";

// Import assets
import useHeaderStyles from "assets/styles/headerStyle";

import { useHouseDocContract, useHouseBusinessContract, useMarketplaceContract } from "hooks/useContractHelpers";

import { houseInfo, houseWarning } from "hooks/useToast";
import { setAccount, setInjected } from "redux/actions/account";
import { setHistoryTypes } from "redux/actions/historyTypes";
import CryptoJS from 'crypto-js';

import Coinbase from "assets/images/Coinbase.png";
import Metamask from "assets/images/Metamask.png";
import MainLogo from "assets/images/Offero.png";
import WalletConnectAvatar from "assets/images/WalletConnect.png";
import defaultAvatar from "assets/images/avatar.png";
import { connectorsByName, secretKey } from "mainConfig";
import { useCookies } from "react-cookie";
import { useWeb3 } from 'hooks/useWeb3';

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "1px solid black",
	boxShadow: 24,
	p: 4,
	borderRadius: "10px",
};

export const pages = [
	{
		label: "Dashboard",
		router: "../../house/app",
	},
	{
		label: "My NFTs",
		router: "../../house/myNfts",
	},
	{
		label: "Mint NFT",
		router: "../../house/mint",
	},
	{
		label: "Stake NFT",
		router: "../../house/staking",
	},
	{
		label: "Create Contract",
		router: "../../contract/create",
	},
	{
		label: "My Contracts",
		router: "../../contract/main",
	},
];

export const houseMenu = [
	{
		label: "Dashboard",
		router: "../../house/app",
		authRequired: false,
	},
	{
		label: "My NFTs",
		router: "../../house/myNfts",
		authRequired: true,
	},
	{
		label: "Mint NFT",
		router: "../../house/mint",
		authRequired: true,
	},
	{
		label: "Stake NFT",
		router: "../../house/staking",
		authRequired: true,
	},
];

export const contractMenu = [
	{
		label: "Create Contract",
		router: "../../contract/create",
		authRequired: true,
	},
	{
		label: "Contract",
		router: "../../contract/main",
		authRequired: true,
	},
];

export const adminMenu = [
	{
		label: "Admin",
		router: "../../admin/main",
		authRequired: true,
	},
];

export const thirdPartyMenu = [
	{
		label: "Third Party",
		router: "../../third-party/main",
		authRequired: true,
	},
];

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

function ScrollTop(props) {
	const { children, window } = props;
	// Note that you normally won't need to set the window ref as useScrollTrigger
	// will default to window.
	// This is only being set here because the demo is in an iframe.
	const trigger = useScrollTrigger({
		target: window ? window() : undefined,
		disableHysteresis: true,
		threshold: 100,
	});

	const handleClick = (event) => {
		const anchor = (event.target.ownerDocument || document).querySelector(
			"#back-to-top-anchor"
		);

		if (anchor) {
			anchor.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	};

	return (
		<Zoom in={trigger}>
			<Box
				onClick={handleClick}
				role="presentation"
				sx={{ position: "fixed", bottom: 16, right: 16 }}
			>
				{children}
			</Box>
		</Zoom>
	);
}

function ElevationScroll(props) {
	const { children, window } = props;
	// Note that you normally won't need to set the window ref as useScrollTrigger
	// will default to window.
	// This is only being set here because the demo is in an iframe.
	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
		target: window ? window() : undefined,
	});

	return cloneElement(children, {
		elevation: trigger ? 4 : 0,
	});
}

function Header(props) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const web3 = useWeb3();
	const { account, activate, deactivate } = useWeb3React();
	const marketplaceContract = useMarketplaceContract();
	const houseDocContract = useHouseDocContract();
	const walletAccount = props.account.account;
	const injected = props.account.injected;
	const classes = useHeaderStyles();
	const houseBusinessContract = useHouseBusinessContract();

	const [notifies, setNotifies] = useState([]);
	const [badgeLeng, setBadgeLeng] = useState("");
	const [cookies, setCookie] = useCookies(["connected", "notifies", "walletAccount"]);
	const [isMember, setIsMember] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [notifyOpen, setNotifyOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [open, setOpen] = useState(false);
	const [isWalletInstalled, setIsWalletInstalled] = useState(false);

	const [airdropWalletOpen, setAirdropWalletOpen] = useState(false);
	const [airdropWalletID, setAirdropWalletID] = useState('');

	const isUserMenuOpen = Boolean(userMenuOpen);
	const isNotifyOpen = Boolean(notifyOpen);

	const toggleDrawer = () => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}

		setDrawerOpen(!drawerOpen);
	};

	const pathname = location.pathname;

	const handleMenuClick = (page) => { navigate(page.router); };
	const handleNotify = () => { navigate("../../contract/main"); };

	const handleNotifyMenuOpen = (event) => {
		setCookie("notifies", JSON.stringify(notifies), { path: "/" });
		setNotifyOpen(event.currentTarget);
	};

	const handleProfileMenuOpen = (event) => { setUserMenuOpen(event.currentTarget); };

	const accountPage = () => {
		if (walletAccount) {
			navigate(`../../account/${walletAccount}`);
		}
	}

	const handleDisconnectWallet = () => {
		deactivate();
		setCookie("connected", false, { path: "/" });
		dispatch(setAccount(null));
		dispatch(setInjected(false));
	};

	const checkAdmin = async () => {
		var isMember = await houseBusinessContract.methods
			.member(walletAccount)
			.call();
		setIsMember(isMember);
	};

	const loadNotifies = async () => {
		if (walletAccount == '' || walletAccount == undefined) {
			return;
		}
		var notifies = await houseDocContract.methods.getAllNotifies(walletAccount).call();
		var arr = [], nArr = [];
		for (let i = 0; i < notifies.length; i++) {
			if (notifies[i].status === false) {
				var bytesNotify = CryptoJS.AES.decrypt(notifies[i].notifyContent, secretKey);
				var decryptedNotify = bytesNotify.toString(CryptoJS.enc.Utf8);
				arr.push({
					...notifies[i],
					notifyContent: decryptedNotify
				});
			}
			if (!cookies.notifies) {
				nArr.push(notifies[i]);
			} else if (
				cookies.notifies.findIndex(
					(item) => item[3] === notifies[i].notifySentTime
				) === -1 &&
				notifies[i].status === false
			) {
				nArr.push(notifies[i]);
			}
		}
		setNotifies(arr);
		setBadgeLeng(nArr.length);
	};

	const getAllHistoryTypes = async () => {
		var hTypes = await marketplaceContract.methods.getAllHistoryTypes().call();
		var allHTypes = [];
		for (let i = 0; i < hTypes.length; i++) {
			if (hTypes[i].hLabel === '') continue;
			allHTypes.push({
				...hTypes[i],
				mValue: web3.utils.fromWei(hTypes[i].mValue),
				eValue: web3.utils.fromWei(hTypes[i].eValue),
			});
		}
		dispatch(setHistoryTypes(allHTypes));
	}

	const handleOpen = () => {
		if (typeof window.ethereum === 'undefined') {
			setIsWalletInstalled(false);
		} else {
			handleConnectWallet(connectorsByName.injected, 'injected');
			setIsWalletInstalled(true);
		}
		setOpen(true);
	}

	const handleClose = () => {
		setOpen(false);
		setAirdropWalletOpen(false);
		setAirdropWalletID('');
	}

	const setProvider = (type) => { window.localStorage.setItem("provider", type); };

	const handleConnectWallet = (con, conName) => {
		activate(con);
		setProvider(conName);
		handleClose();
	};

	const handleInstallWallet = () => {
		window.open('https://metamask.io/', '_blank');
		handleClose();
	}

	const handleConnectAirdropWallet = () => {
		setOpen(false);
		setAirdropWalletOpen(true);
	}

	const handleCreateAccount = () => {
		// check the walletID is valid address
		if (!ethers.utils.isAddress(airdropWalletID)) {
			houseWarning('Please input valid Ethereum wallet address');
		} else {
			// set account state with the airdrop wallet id
			setCookie("connected", true, { path: "/" });
			setCookie("walletAccount", airdropWalletID, { path: "/" });

			dispatch(setAccount(airdropWalletID));
			dispatch(setInjected(false));
			handleClose();
		}
	}

	useEffect(() => {
		if (cookies.connected === true) {
			dispatch(setAccount(cookies.walletAccount));
			dispatch(setInjected(true));
		}

		if (pathname != "/house/app") {
			if (!walletAccount && cookies.connected !== true) {
				houseInfo("Please connect your wallet");
				navigate("../../house/app");
			}
		}
	}, [pathname]);

	useEffect(() => {
		console.log('addr', walletAccount)
		if (walletAccount != null || walletAccount != undefined) {
			checkAdmin();
			loadNotifies();
		}
	}, [walletAccount])

	useEffect(() => {
		if (account) {
			dispatch(setAccount(account));
			dispatch(setInjected(true));
		} else {
			dispatch(setAccount(null));
			dispatch(setInjected(false));
		}
	}, [account]);

	useEffect(() => {
		if (typeof window.ethereum === 'undefined') {
			setIsWalletInstalled(false);
		} else {
			handleConnectWallet(connectorsByName.injected, 'injected');
			setIsWalletInstalled(true);
		}
		getAllHistoryTypes();
	}, [])

	return (
		<div>
			<CssBaseline />
			<AppBar className={classes.appbar}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={toggleDrawer()}
						edge="start"
						sx={{ mr: 2 }}
					>
						<WidgetsIcon />
					</IconButton>

					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
					>
						<img alt="house business main logo" src={MainLogo} />
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
						<Typography
							variant="h6"
							noWrap
							component="div"
							sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
						>
							House Business History
						</Typography>
					</Box>

					<Box sx={{ flexGrow: 1 }} />
					<Box sx={{ display: { xs: "none", md: "flex" } }}>
						<IconButton
							size="large"
							aria-label={`show ${badgeLeng} new notifications`}
							// aria-controls={notifyId}
							onClick={handleNotifyMenuOpen}
							color="inherit"
						>
							{badgeLeng > 0 ? (
								<Badge badgeContent={badgeLeng} color="error">
									<NotificationsIcon />
								</Badge>
							) : (
								<NotificationsIcon />
							)}
						</IconButton>
						<Tooltip title="Account settings">
							<IconButton
								size="large"
								edge="end"
								aria-label="account of current user"
								// aria-controls={menuId}
								aria-haspopup="true"
								onClick={handleProfileMenuOpen}
								color="inherit"
							>
								<Avatar alt="Borget" src={defaultAvatar} />
							</IconButton>
						</Tooltip>
					</Box>
				</Toolbar>
			</AppBar>
			<ElevationScroll {...props}>
				<Drawer anchor={"left"} open={drawerOpen} onClose={toggleDrawer()}>
					<Box
						sx={{ width: 250 }}
						role="presentation"
						onClick={toggleDrawer()}
						onKeyDown={toggleDrawer()}
					>
						<Box component={"h3"} gutterBottom sx={{ p: 2, pb: 0 }}>
							NFT
						</Box>
						<Divider />
						<List>
							{houseMenu.map((page, index) => {
								if (page.authRequired === true && !walletAccount) {
									return null;
								}
								return (
									<ListItem
										button
										key={index}
										onClick={() => handleMenuClick(page)}
									>
										<ListItemIcon>
											<ExtensionIcon />
										</ListItemIcon>
										<ListItemText primary={page.label} />
									</ListItem>
								);
							})}
						</List>

						{walletAccount ? (
							<>
								<Box component={"h3"} gutterBottom sx={{ p: 2, pb: 0 }}>
									Contract
								</Box>
								<Divider />
								<List>
									{contractMenu.map((page, index) => {
										if (page.authRequired === true && !walletAccount) {
											return null;
										}
										return (
											<ListItem
												button
												key={index}
												onClick={() => handleMenuClick(page)}
											>
												<ListItemIcon>
													<ManageSearchIcon />
												</ListItemIcon>
												<ListItemText primary={page.label} />
											</ListItem>
										);
									})}
								</List>
							</>
						) : (
							<></>
						)}
						{isMember === true && walletAccount ? (
							<>
								<Box component={"h3"} gutterBottom sx={{ p: 2, pb: 0 }}>
									Admin
								</Box>
								<Divider />
								<List>
									{adminMenu.map((page, index) => (
										<ListItem
											button
											key={index}
											onClick={() => handleMenuClick(page)}
										>
											<ListItemIcon>
												<AdminPanelSettingsIcon />
											</ListItemIcon>
											<ListItemText primary={page.label} />
										</ListItem>
									))}
								</List>
							</>
						) : (
							<></>
						)}
						{walletAccount ? (
							<>
								<Box component={"h3"} gutterBottom sx={{ p: 2, pb: 0 }}>
									Third Party
								</Box>
								<Divider />
								<List>
									{thirdPartyMenu.map((page, index) => {
										if (page.authRequired === true && !walletAccount) {
											return null;
										}
										return (
											<ListItem
												button
												key={index}
												onClick={() => handleMenuClick(page)}
											>
												<ListItemIcon>
													<AssignmentIndIcon />
												</ListItemIcon>
												<ListItemText primary={page.label} />
											</ListItem>
										);
									})}
								</List>
							</>
						) : (
							<></>
						)}
					</Box>
				</Drawer>
			</ElevationScroll>

			{/* User Menu */}
			<Menu
				anchorEl={userMenuOpen}
				id="account-menu"
				open={isUserMenuOpen}
				onClose={() => setUserMenuOpen(false)}
				onClick={() => setUserMenuOpen(false)}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
						mt: 1.5,
						"& .MuiAvatar-root": {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: "background.paper",
							transform: "translateY(-50%) rotate(45deg)",
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={walletAccount ? () => { } : handleOpen}>
					<ListItemIcon>
						<AccountBalanceWalletIcon fontSize="small" />
					</ListItemIcon>
					{walletAccount ? `${walletAccount.slice(0, 8)}...` : "Connect Wallet"}
				</MenuItem>
				<MenuItem onClick={accountPage}>
					<ListItemIcon>
						<PermContactCalendarIcon fontSize="small" />
					</ListItemIcon>
					Profile
				</MenuItem>
				<Divider />
				<MenuItem>
					<ListItemIcon>
						<Settings fontSize="small" />
					</ListItemIcon>
					Settings
				</MenuItem>
				<MenuItem onClick={() => handleDisconnectWallet()}>
					<ListItemIcon>
						<Logout fontSize="small" />
					</ListItemIcon>
					Logout
				</MenuItem>
			</Menu>

			{/* Notify Menu */}
			<Menu
				sx={{ mt: "45px" }}
				anchorEl={notifyOpen}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				id="notify-menu"
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={isNotifyOpen}
				onClose={() => setNotifyOpen(false)}
			>
				<Paper square sx={{ pb: "50px", width: "500px", boxShadow: "none" }}>
					<Typography
						variant="h5"
						gutterBottom
						component="div"
						sx={{ p: 2, pb: 0 }}
					>
						Notifies
					</Typography>
					<List sx={{ mb: 2 }} onClick={handleNotify}>
						{notifies.map(({ hdID, nSender, notifyContent }, key) => (
							<Fragment key={key}>
								<ListItem>
									<ListItemAvatar>
										<Avatar alt="Profile Picture" src={defaultAvatar} />
									</ListItemAvatar>
									<ListItemText
										primary={notifyContent}
										secondary={`From ${nSender} in contract id: ${hdID}`}
									/>
								</ListItem>
							</Fragment>
						))}
					</List>
				</Paper>
			</Menu>

			<Toolbar id="back-to-top-anchor" />
			<ScrollTop {...props}>
				<Fab
					color="primary"
					size="small"
					aria-label="scroll back to top"
					className={classes.topScroll}
				>
					<KeyboardArrowUpIcon />
				</Fab>
			</ScrollTop>

			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Select Wallet
					</Typography>

					<MenuItem
						onClick={() => {
							isWalletInstalled ?
								handleConnectWallet(connectorsByName.injected, "injected") :
								handleInstallWallet();
						}}
					>
						<ListItemIcon>
							<Avatar alt="metamask" src={Metamask} />
						</ListItemIcon>
						MetaMask
					</MenuItem>

					<MenuItem
						onClick={() => {
							handleConnectWallet(
								connectorsByName.walletConnect,
								"walletConnect"
							);
						}}
					>
						<ListItemIcon>
							<Avatar alt="walletconnect" src={WalletConnectAvatar} />
						</ListItemIcon>
						Wallet Connect
					</MenuItem>

					<MenuItem
						onClick={() => {
							handleConnectWallet(
								connectorsByName.coinbaseWallet,
								"coinbaseWallet"
							);
						}}
					>
						<ListItemIcon>
							<Avatar alt="coinbase" src={Coinbase} />
						</ListItemIcon>
						Coinbase
					</MenuItem>

					<Typography id="modal-modal-title" variant="h6" component="h2">
						Other Options
					</Typography>

					<MenuItem
						onClick={() => {
							handleConnectAirdropWallet();
						}}
					>
						{/* <ListItemIcon>
              <Avatar alt="coinbase" src={Coinbase} />
            </ListItemIcon> */}
						Connect your Airdrop wallet
					</MenuItem>
				</Box>
			</Modal>

			<Modal
				open={airdropWalletOpen}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				size="small"
			>
				<Box sx={style}>
					<Grid container spacing={3}>
						<Grid item md={12}>
							<Box component={'h3'}>Set Airdrop Wallet ID</Box>
							<Grid item md={12} sx={{ display: 'flex' }}>
								<Grid item md={8}>
									<TextField
										value={airdropWalletID}
										fullWidth
										onChange={(e) => setAirdropWalletID(e.target.value)}
										placeholder="Airdrop Wallet ID"
										inputProps={{ 'aria-label': 'package' }}
									/>
								</Grid>
								<Button
									size="small"
									color="primary"
									onClick={handleCreateAccount}
									startIcon={<SaveIcon />}
									variant="contained"
									style={{ marginLeft: '20px' }}
								>
									Save
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Box>
			</Modal>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		account: state.account,
		historyTypes: state.historyTypes
	};
}

export default connect(mapStateToProps)(Header);