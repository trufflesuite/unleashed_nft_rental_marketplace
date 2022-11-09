import { SDK, Auth } from '@infura/sdk';
import { config as loadEnv } from 'dotenv';

loadEnv();

console.log(process.env.INFURA_PROJECT_ID)

const auth = new Auth({
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          privateKey: process.env.WALLET_PRIVATE_KEY,
          chainId: 5,
          rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        });