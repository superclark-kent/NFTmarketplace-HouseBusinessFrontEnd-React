import { InjectedConnector } from '@web3-react/injected-connector';
// import WalletConnect from "@walletconnect/client";
import QRCodeModal from '@walletconnect/qrcode-modal';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const INFURA_KEY = '28e2008ae4974ac4942f6854a85fe21d';

export const POLLING_INTERVAL = 12000;

// export const ERC20Address = '0x0203089819ac721bb8EBe91B5d56EF70888c1392';
export const ERC20Address = '0x5E94F22deE6bE1e875Fa914fF88343A413D8bd76';

// export const HouseBusinessAddress = '0x6f06c35Fa3c048EB17e3B32C0AbcFDC317516676';
// export const HouseBusinessAddress = '0xca2ad1D919AE5d7Ef9b04440DF990E1De6590025';
export const HouseBusinessAddress = '0x71CdCFEe04ff1Fc89D2999b37aa0fE850210CF06';

// export const ContractAddress = '0x537828D46d9373ac7952160b9097ec998cA6c51b';
// export const ContractAddress = '0xE5c6c27F24616284Dd7319C339496239d7064eF8';
export const ContractAddress = '0x8ca4f966215320C8899963F6798BabE46D57aE77';

// export const ThirdPartyAddress = '0x2F6eEE140587AFD037f2C42C3c1f5FA4f3BD32D6';
export const ThirdPartyAddress = '0x2C5a78DAF03e3acb169F4d2Be1dF5438F735751E';

// p => 0x4bF6b957744eE2E99e40c43612Cb0D25a63b2454
// m => 0xc4AF5D47A46Ade2865652CE834Ca7F47539cc30C

const config = {
  development: {
    CHAIN_NAME: 'Goerli Testnet',
    CHAIN_ID: 5,
    CURRENCY: 'ETH',
    EXPLORER: 'https://goerli.etherscan.io/',
    WEBSOCKET_1: 'wss://goerli.infura.io/ws',
    RPC_URL_1: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    RPC_URL_2: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    RPC_URL_3: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  },
  // 'development': {
  //     CHAIN_NAME: "Polygon Testnet",
  //     CHAIN_ID: 80001,
  //     CURRENCY: "MATIC",
  //     EXPLORER: "https://mumbai.polygonscan.com/",
  //     WEBSOCKET_1: "wss://mumbai-dagger.matic.today",
  //     RPC_URL_1: "https://matic-mumbai.chainstacklabs.com",
  //     RPC_URL_2: "https://rpc-mumbai.maticvigil.com",
  //     RPC_URL_3: "https://matic-testnet-archive-rpc.bwarelabs.com",
  // },
  // 'development': {
  //     CHAIN_NAME: "Rinkeby Testnet",
  //     CHAIN_ID: 4,
  //     CURRENCY: "ETH",
  //     EXPLORER: "https://rinkey.etherscan.io",
  //     WEBSOCKET_1: "wss://rinkeby.infura.io/ws",
  //     RPC_URL_1: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  //     RPC_URL_2: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  //     RPC_URL_3: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  //  },

  //  'development': {
  //     CHAIN_NAME: "Ropsten Testnet",
  //     CHAIN_ID: 3,
  //     CURRENCY: "ETH",
  //     EXPLORER: "https://ropsten.etherscan.io",
  //     WEBSOCKET_1: "wss://ropsten.infura.io/ws",
  //     RPC_URL_1: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  //     RPC_URL_2: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  //     RPC_URL_3: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  //  },
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
    3, // Ropesten Testnet
    4, // Rinkby Testnet
    5, // Goerli Testnet
    42, // Kovan Testnet
    56, // Binance Smart Chain Mainnet
    97, // Binance Smart Chain Testnet
    137, // Polygon Mainnet
    80001, // Polygon Mumbai Testnet
  ],
});

export const walletconnect = new WalletConnectConnector({
  rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModal: QRCodeModal,
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  appName: 'web3-react-demo',
});

export const connectorsByName = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
};

export const zeroAddress = '0x0000000000000000000000000000000000000000';
