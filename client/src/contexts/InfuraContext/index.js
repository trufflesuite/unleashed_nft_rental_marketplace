import { createContext, useContext, useState } from "react";
import { SDK, Auth } from "@infura/sdk";

const auth = new Auth({
  projectId: "fac5ca24f1a74c67ac0ad40890ec2f70",
  secretId: "9dc9819c9de44f27bfa3a117d459d64b",
  privateKey:
    "99ef73e2cfbcb061cc110c59c5253553f05803b286b490725d212c1b353cef89",
  chainId: 5,
});

const InfuraContext = createContext();

function InfuraProvider({ children }) {
  const [sdk, _setSdk] = useState(new SDK(auth));

  return (
    <InfuraContext.Provider value={{ sdk }}>{children}</InfuraContext.Provider>
  );
}

const useInfura = () => useContext(InfuraContext);

export { InfuraProvider, useInfura };
