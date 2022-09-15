import { useEffect, useState } from "react";
import abi from "./abi.json";
import { useWeb3React } from "@web3-react/core";
import { networkParams } from "./networks";
import { connectors } from "./connectors";
import { toHex } from "./utils";
import { ethers, utils } from "ethers";
// import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { providers } from "ethers";

export default function Home() {
  const { library, activate, deactivate, active } = useWeb3React();
  // const [signature, setSignature] = useState("");
  // const [error, setError] = useState("");
  // const [network, setNetwork] = useState(undefined);
  // const [message, setMessage] = useState("");
  // const [signedMessage, setSignedMessage] = useState("");
  // const [verified, setVerified] = useState();
  const [price, setPrice] = useState(null);
  const [contract, setContract] = useState(null);
  // const handleNetwork = (e) => {
  //   const id = e.target.value;
  //   setNetwork(Number(id));
  // };

  // const handleInput = (e) => {
  //   const msg = e.target.value;
  //   setMessage(msg);
  // };

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

  // const signMessage = async () => {
  //   if (!library) return;
  //   try {
  //     const signature = await library.provider.request({
  //       method: "personal_sign",
  //       params: [message, account],
  //     });
  //     setSignedMessage(message);
  //     setSignature(signature);
  //   } catch (error) {
  //     setError(error);
  //   }
  // };

  // const verifyMessage = async () => {
  //   if (!library) return;
  //   try {
  //     const verify = await library.provider.request({
  //       method: "personal_ecRecover",
  //       params: [signedMessage, signature],
  //     });
  //     setVerified(verify === account.toLowerCase());
  //   } catch (error) {
  //     setError(error);
  //   }
  // };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    // setNetwork("");
    // setMessage("");
    // setSignature("");
    // setVerified(undefined);
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
