import { InjectedConnector } from '@web3-react/injected-connector';
// import WalletConnect from "@walletconnect/client";
import QRCodeModal from '@walletconnect/qrcode-modal';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import dotenv from "dotenv";
dotenv.config();

export const POLLING_INTERVAL = 12000;

export const ERC20Address = '0x7E687b50cBB1D58be37Cae9a8D2aa920973d97d7';
export const HouseBusinessAddress = '0xE85f7905d4a90c5C0Aa2Bbace2598dFB7a65FB45';
export const HouseDocAddress = '0x5F223df92c6aca551854FDb6D9ea844046Bb23Af';
export const StakingAddress = '0x3a767303a74F29ce42Df34B8adce27c8d869b3e3';
export const ThirdPartyAddress = '0x1356C570D1447A21dAf42A9E8d37a2B9ff1d6Cb8';
export const OperatorAddress = '0x230a2c6216aDCF093a8963cAB02b9986D7a73077';

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
export const apiURL = "http://localhost:5000";

export const secretKey = 'defi-business@Sec!*@#';

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
