import { InjectedConnector } from '@web3-react/injected-connector';
// import WalletConnect from "@walletconnect/client";
import QRCodeModal from '@walletconnect/qrcode-modal';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import dotenv from "dotenv";
dotenv.config();

export const POLLING_INTERVAL = 12000;

// p => 0x4bF6b957744eE2E99e40c43612Cb0D25a63b2454
// m => 0xc4AF5D47A46Ade2865652CE834Ca7F47539cc30C
export const ERC20Address = '0x9fB92eB75b868826c8d8B2Ae9FbE643E2872aC51';
export const HouseBusinessAddress = '0x931097fbC2204aDA5F95f463a9A9417040Cf50bB';
export const ContractAddress = '0x88fBFbEd421F6B505BaBB4550b82D2ECc3F323e8';
export const StakingAddress = '0x7F870290c8C28a9Eb3Af6A3958b52eBE04D7A0eD';
export const ThirdPartyAddress = '0xa0035a51433cAe275C0B24463132E1843626C613';
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
