import { createContext, useContext, useState } from "react";
import { SDK, Auth } from "@infura/sdk";
import { useEth } from "../EthContext";
import env from "../../env.json";

const auth = new Auth(env.infura.sdk.authOptions);

const InfuraContext = createContext();

function InfuraProvider({ children }) {
  const { active } = env.infura.sdk;
  const [sdk, _setSdk] = useState(new SDK(auth));
  const {
    state: { web3, artifacts },
  } = useEth();

  const getOwnedRentableNfts = async (publicAddress) => {
    const { assets } = await sdk.getNFTs({
      publicAddress,
      includeMetadata: true,
    });

    const filtered = [];

    for (const asset of assets) {
      const contract = new web3.eth.Contract(
        artifacts.RentableNft.abi,
        asset.contract
      );
      try {
        await contract.methods.userExpires(asset.tokenId).call();
        filtered.push(asset);
      } catch {
        // Not rentable
      }
    }

    return filtered;
  };

  return (
    <InfuraContext.Provider value={{ active, sdk, getOwnedRentableNfts }}>
      {children}
    </InfuraContext.Provider>
  );
}

const useInfura = () => useContext(InfuraContext);

export { InfuraProvider, useInfura };
