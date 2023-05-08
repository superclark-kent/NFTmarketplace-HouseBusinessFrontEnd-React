import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { useCookies } from "react-cookie";

import { injected } from "mainConfig";
import simpleRpcProvider from "utils/simpleRpcProvider";

export function useEagerConnect() {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);
  const [cookies, setCookie] = useCookies(["housebusiness"]);

  useEffect(() => {
    if (cookies.connected === "true") {
      activate(injected, undefined, true).catch(() => {
        setTried(true);
      });
      // injected.isAuthorized().then(isAuthorized => {
      // if (isAuthorized) {
      // } else {
      //   setTried(true);
      // }
      // });
    }
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window;
    // if (ethereum && ethereum.on && !active && !error && !suppress) {
    if (ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          activate(injected);
        }
      };

      const handleChainChanged = (networkId) => {
        window.location.reload();
        activate(injected);
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }

    return () => {};
  }, [active, error, suppress, activate]);
}

export const useWeb3 = () => {
  const web3 = new Web3(simpleRpcProvider);
  return web3;
};
