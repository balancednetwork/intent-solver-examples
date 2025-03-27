// "use client"
//
// import React from "react";
// import "@mysten/dapp-kit/dist/index.css";
// import {createNetworkConfig, SuiClientProvider, WalletProvider} from "@mysten/dapp-kit";
// import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
// import { getFullnodeUrl } from '@mysten/sui/client';
//
//
//
// const { networkConfig } = createNetworkConfig({
//   localnet: { url: getFullnodeUrl('localnet') },
//   mainnet: { url: getFullnodeUrl('mainnet') },
// });
//
// const suiQueryClientProvider = new QueryClient();
//
// function MystenConnect({children}: Readonly<{ children: React.ReactNode}>) {
//
//   return (
//       <QueryClientProvider client={suiQueryClientProvider}>
//         <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
//           <WalletProvider autoConnect>
//             {children}
//           </WalletProvider>
//         </SuiClientProvider>
//       </QueryClientProvider>
//   )
// }
//
// export default MystenConnect;
