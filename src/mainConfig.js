import { InjectedConnector } from '@web3-react/injected-connector';
// import WalletConnect from "@walletconnect/client";
import QRCodeModal from '@walletconnect/qrcode-modal';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import dotenv from "dotenv";
dotenv.config();

export const POLLING_INTERVAL = 12000;

export const ERC20Address = '0xa8C19667794191A730B3983eB3a8087CfF2b788e';
export const HouseBusinessAddress = '0x55fbA89a4888E367c59f5ab7c1e7108B93A2E5d2';
export const HouseDocAddress = '0xF402D4621870CDE84a926A71C905e7bce2dA32b3';
export const StakingAddress = '0xBFD97e8fA9bfaa240B0c1be0a3206fAC1De54516';
export const ThirdPartyAddress = '0x7A4f4eceFEaF1B77005D52e60D0fC9B01a6F5207';
export const OperatorAddress = '0x59F36192176Dc050a84A0e3B623b9186a558De54';

const config = {
	// development: {
	//   CHAIN_NAME: 'Goerli Testnet',
	//   CHAIN_ID: 5,
	//   CURRENCY: 'ETH',
	//   EXPLORER: 'https://goerli.etherscan.io/',
	//   WEBSOCKET_1: 'wss://goerli.infura.io/ws',
	//   RPC_URL_1: `https://goerli.infura.io/v3/${INFURA_KEY}`,
	//   RPC_URL_2: `https://goerli.infura.io/v3/${INFURA_KEY}`,
	//   RPC_URL_3: `https://goerli.infura.io/v3/${INFURA_KEY}`,
	// },
	development: {
		CHAIN_NAME: "Polygon Testnet",
		CHAIN_ID: 80001,
		CURRENCY: "MATIC",
		EXPLORER: "https://mumbai.polygonscan.com/",
		WEBSOCKET_1: "wss://mumbai-dagger.matic.today",
		RPC_URL_1: "https://matic-mumbai.chainstacklabs.com",
		RPC_URL_2: "https://rpc-mumbai.maticvigil.com",
		// RPC_URL_3: "https://matic-testnet-archive-rpc.bwarelabs.com",
	},
	production: {
		CHAIN_NAME: 'Polygon Mainnet',
		CHAIN_ID: 137,
		CURRENCY: 'MATIC',
		EXPLORER: 'https://polygonscan.com/',
		WEBSOCKET: 'wss://rpc-mainnet.matic.network',
		RPC_URL_1: 'https://matic-mainnet.chainstacklabs.com',
		RPC_URL_2: 'https://rpc-mainnet.maticvigil.com',
		RPC_URL_3: 'https://rpc-mainnet.matic.quiknode.pro',
	},
};

export const networkConfig = config['development'];
// export const apiURL = "http://localhost:8080"; // Development server
export const apiURL = "https://off-backend.azurewebsites.net"; // Production server

export const secretKey = 'defi-business@Sec!*@#';

export const stripePublishKey =
	process.env.REACT_APP_STRIPE_API_KEY || 'pk_test_51NASr5DlH3rUeTvspdEFX05R8hZVZMj7GUZ1NKP3NvdhaSPbNX7vpOJybsKRUnB4z5oytvL98F6gA0e6K1uZ6Pwu00MJa941iy';

export const injected = new InjectedConnector({
	supportedChainIds: [
		1, // Ethereum Mainnet
		5, // Goerli Testnet
		56, // Binance Smart Chain Mainnet
		97, // Binance Smart Chain Testnet
		137, // Polygon Mainnet
		80001, // Polygon Mumbai Testnet
	],
});

export const walletconnect = new WalletConnectConnector({
	rpcUrl: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`,
	bridge: 'https://bridge.walletconnect.org',
	qrcodeModal: QRCodeModal,
	qrcode: true,
});

export const walletlink = new WalletLinkConnector({
	url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`,
	appName: 'web3-react-demo',
});

export const connectorsByName = {
	injected: injected,
	walletConnect: walletconnect,
	coinbaseWallet: walletlink,
};

export const zeroAddress = '0x0000000000000000000000000000000000000000';
