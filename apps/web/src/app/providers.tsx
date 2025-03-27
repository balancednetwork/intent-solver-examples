// "use client";
//
// import {createConfig, WagmiProvider, http} from 'wagmi'
// import {arbitrum} from 'wagmi/chains'
// import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
// import {MultiWalletProvider} from "@/app/contexts/MultiWalletContext";
//
//
// export const config = createConfig({
//   chains: [arbitrum],
//   transports: {
//     [arbitrum.id]: http(),
//   },
// })
//
// export const queryClient = new QueryClient()
//
// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//         <WagmiProvider config={config}>
//               <MultiWalletProvider>
//                       {children}
//               </MultiWalletProvider>
//         </WagmiProvider>
//     </QueryClientProvider>
//   );
// }
