import React from "react";
import { Button } from "@/components/ui/button";
import { useMultiWallet } from "@/contexts/MultiWalletContext";
import { StellarProvider } from "icon-intents-sdk";

export default function ConnectStellarWalletButton() {
    const { setStellarProvider } = useMultiWallet();

    const onConnectClick = async () => {
        try {
            if (!(window as any).hanaWallet?.stellar) {
                alert("Stellar wallet not found! Please install a compatible wallet.");
                return;
            }

            const addressResult = await (window as any).hanaWallet.stellar.getPublicKey();
            console.log({addressResult}, '<<<<STELLAR ADDRESS RESULT');
            if (addressResult && addressResult.length > 0) {
                const provider = new StellarProvider({
                    sorobanUrl: "https://mainnet.sorobanrpc.com",
                    networkPassphrase: "Public Global Stellar Network ; September 2015",
                    wallet: {
                        address: addressResult,
                        getAddress: () => addressResult,
                        // privateKey: "", // Set private key for now, signing from wallet seems not working
                    },
                    provider: (window as any).hanaWallet.stellar
                });

                setStellarProvider(provider);
                console.log("Stellar wallet connected successfully!");
            } else {
                alert("Failed to get Stellar account address!");
            }
        } catch (error) {
            console.error("Error connecting to Stellar wallet:", error);
            alert("Failed to connect to Stellar wallet!");
        }
    };

    return (
        <Button onClick={() => onConnectClick()}>
            Connect Stellar Wallet
        </Button>
    );
}