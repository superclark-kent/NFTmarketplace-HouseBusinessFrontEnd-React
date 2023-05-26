import Web3 from 'web3';
import getRpcUrl from 'utils/getRpcUrl';

import ERC20Abi from 'assets/abi/ERC20.json';
import HouseBusinessAbi from 'assets/abi/HouseBusiness.json';
import HouseDocAbi from 'assets/abi/HouseDoc.json';
import StakingAbi from 'assets/abi/Staking.json';
import ThirdPartyAbi from 'assets/abi/ThirdParty.json';
import OperatorAbi from 'assets/abi/Operator.json';

import { ERC20Address, HouseBusinessAddress, HouseDocAddress, ThirdPartyAddress, StakingAddress, OperatorAddress } from 'mainConfig';

const RPC_URL = getRpcUrl();

export const useWeb3Content = () => {
  const web3 = new Web3(window.ethereum || RPC_URL);
  return web3;
};

export const useContract = (abi, address) => {
  const web3 = useWeb3Content();
  return new web3.eth.Contract(abi, address);
};

export const useERC20Contract = () => {
  return useContract(ERC20Abi, ERC20Address);
};

export const useHouseBusinessContract = () => {
  return useContract(HouseBusinessAbi, HouseBusinessAddress);
};

export const useStakingContract = () => {
  return useContract(StakingAbi, StakingAddress);
};

export const useHouseDocContract = () => {
  return useContract(HouseDocAbi, HouseDocAddress);
};

export const useThirdPartyContract = () => {
  return useContract(ThirdPartyAbi, ThirdPartyAddress);
};

export const useOperatorContract = () => {
  return useContract(OperatorAbi, OperatorAddress);
};