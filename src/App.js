import { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { networkParams } from "./networks";
import { connectors } from "./connectors";
import { toHex, truncateAddress } from "./utils";
import WalletConnectProvider from "@walletconnect/web3-provider";


export default function Home() {
  const { account, library, activate, deactivate, active } = useWeb3React();
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
      // const web3Provider = new providers.Web3Provider(provider);
      // const signer = web3Provider.getSigner();
      // let contract = new ethers.Contract(
      //   "0xbcc6254E4E8D9d8909b1B02D61ccaa17a9806F9F",
      //   abi,
      //   signer
      // );
      // let price = await contract.PRICE();
      // setPrice(utils.formatEther(price));

      // setContract(contract);
    }
    if (active) {
      init();
    }
  }, [active]);
 
  return (
    <div>
      {active ? (
        <div>
          {" "}
          <button onClick={switchNetwork}>change network</button>
          <button onClick={disconnect}>logout</button>
          <h3>{truncateAddress(account)}</h3>
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
