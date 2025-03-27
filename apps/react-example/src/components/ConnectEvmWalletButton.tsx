import React from "react";
import {EvmProvider} from "icon-intents-sdk";
import {useConnect, useSwitchChain} from "wagmi";
import { injected } from 'wagmi/connectors'
import {useMultiWallet} from "@/contexts/MultiWalletContext";
import {arbitrum} from "wagmi/chains";
import {Button} from "@/components/ui/button";


export default function ConnectEvmWalletButton() {
  const { setEvmProvider } = useMultiWallet()
  const { connectAsync } = useConnect();
  const { switchChain } = useSwitchChain();


  const onConnectClick = async () => {
    const { accounts } = await connectAsync({ connector: injected() })
    console.log("Connected accounts", accounts)
    switchChain({
      chainId: arbitrum.id,
    })
    setEvmProvider(new EvmProvider({
      userAddress: accounts[0],
      chain: "arb",
      provider: (window as any).hanaWallet.ethereum,
    }));
  }

  return (
    <Button onClick={() => onConnectClick()}>
      Connect Evm Wallet
    </Button>
  )
}
