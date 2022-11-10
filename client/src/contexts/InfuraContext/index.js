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
    state: { contracts },
  } = useEth();

  const getOwnedRentableNfts = async (publicAddress) => {
    const { assets } = await sdk.getNFTs({
      publicAddress,
      includeMetadata: true,
    });

    const filtered = [];

    for (const asset of assets) {
      if (await contracts.Marketplace.methods.isRentableNFT(asset.contract).call()) {
        filtered.push(asset);
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
