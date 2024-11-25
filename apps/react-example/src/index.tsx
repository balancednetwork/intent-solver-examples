import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createConfig, http, WagmiProvider} from "wagmi";
import {MultiWalletProvider} from "./contexts/MultiWalletContext";
import {arbitrum} from "wagmi/chains";
import {SuiClientProvider, WalletProvider} from "@mysten/dapp-kit";
import { getFullnodeUrl } from '@mysten/sui/client';

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
})

const queryClient = new QueryClient()

const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SuiClientProvider networks={networks} defaultNetwork="mainnet">
          <WalletProvider>
            <MultiWalletProvider>
              <App />
            </MultiWalletProvider>
          </WalletProvider>
        </SuiClientProvider>
      </WagmiProvider>
    </QueryClientProvider>

  </React.StrictMode>
);
