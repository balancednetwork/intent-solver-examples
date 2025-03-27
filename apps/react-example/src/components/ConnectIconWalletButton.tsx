import React from "react";
import {HanaWalletConnector, IconProvider} from "icon-intents-sdk";
import {useMultiWallet} from "@/contexts/MultiWalletContext";
import {Button} from "@/components/ui/button";


export default function ConnectIconWalletButton() {
  const { setIconProvider } = useMultiWallet()


  const onConnectClick = async () => {
    const addressResult = await HanaWalletConnector.requestAddress()

    if (addressResult.ok) {
      setIconProvider(new IconProvider({
        iconRpcUrl: "https://ctz.solidwallet.io/api/v3",
        iconDebugRpcUrl: "https://ctz.solidwallet.io/api/v3d",
        wallet: {
          address: addressResult.value
        }
      }));
    } else {
      alert("Failed to request Hana Wallet address!");
    }
  }

  return (
    <Button onClick={() => onConnectClick()}>
      Connect Icon Wallet
    </Button>
  )
}
