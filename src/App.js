import { useEffect, useState } from "react";
import abi from "./abi.json";
import { useWeb3React } from "@web3-react/core";
import { networkParams } from "./networks";
import { toHex } from "./utils";
import { ethers, utils } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { providers } from "ethers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";



export default function Home() {
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });
   const networkParams = {
    "0x63564c40": {
      chainId: "0x63564c40",
      rpcUrls: ["https://api.harmony.one"],
      chainName: "Harmony Mainnet",
      nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
      blockExplorerUrls: ["https://explorer.harmony.one"],
      iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"],
    },
    "0xa4ec": {
      chainId: "0xa4ec",
      rpcUrls: ["https://forno.celo.org"],
      chainName: "Celo Mainnet",
      nativeCurrency: { name: "CELO", decimals: 18, symbol: "CELO" },
      blockExplorerUrl: ["https://explorer.celo.org"],
      iconUrls: [
        "https://celo.org/images/marketplace-icons/icon-celo-CELO-color-f.svg",
      ],
    },
  };
  
  const walletconnect = new WalletConnectConnector({
    rpcUrl: "https://rinkeby.infura.io/v3/c3371f0579a5404eb329f775ac980d46",
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
  });
  
  
   const connectors = {
    injected: injected,
    walletConnect: walletconnect,
    //   coinbaseWallet: walletlink,
  };
  const { library, activate, deactivate, active } = useWeb3React();

  const [price, setPrice] = useState(null);
  const [contract, setContract] = useState(null);


  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(4) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(4)]],
          });
        } catch (error) {
          // setError(error);
        }
      }
    }
  };



  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);

  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };
  const setProvider = (type) => {
    window.localStorage.setItem("provider", type);
  };

  useEffect(() => {
    async function init() {
      const provider = new WalletConnectProvider({
        rpc: {
          4: "https://rinkeby.infura.io/v3/c3371f0579a5404eb329f775ac980d46",
        },
      });
      await provider.enable();
      const web3Provider = new providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      let contract = new ethers.Contract(
        "0xbcc6254E4E8D9d8909b1B02D61ccaa17a9806F9F",
        abi,
        signer
      );
      let price = await contract.PRICE();
      setPrice(utils.formatEther(price));

      setContract(contract);
    }
    if (active) {
      init();
    }
  }, [active]);
  const mint = async () => {
    try {
      let price = await contract.PRICE();
      console.log(price);
      let tx = await contract.mint(1, { value: price });
      console.log("minting...");
      await tx.wait();
      console.log("finish");
    } catch (err) {
      console.log(err);
    }
  };
  // console.log(library.provider);
  return (
    <div>
      {active ? (
        <div>
          {" "}
          <button onClick={switchNetwork}>change network</button>
          <button onClick={disconnect}>logout</button>
          <h3>price: {price}</h3>
          <button onClick={mint}>MINT</button>
        </div>
      ) : (
        <button
          onClick={() => {
            activate(connectors.walletConnect);
            setProvider("walletConnect");
          }}
        >
          connect wallet
        </button>
      )}
    </div>
  );
}
