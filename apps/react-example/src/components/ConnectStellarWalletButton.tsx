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
            if (addressResult) {
                const signTransaction = async (tx) => {
                    const signedTx = await (window as any).hanaWallet.stellar.signTransaction(tx);
                    return signedTx;
                }
                //With Wallet provider
                const provider = new StellarProvider({
                    sorobanUrl: "https://stellar-soroban-public.nodies.app",
                    networkPassphrase: 'Public Global Stellar Network ; September 2015',
                    wallet: {
                        address: addressResult,
                    },
                    provider: {
                        signTransaction: signTransaction
                    }
                });
                //With private key
                // const provider = new StellarProvider({
                //     sorobanUrl: "https://stellar-soroban-public.nodies.app",
                //     networkPassphrase: 'Public Global Stellar Network ; September 2015',
                //     wallet: {
                //         address: addressResult,
                //         privateKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // You can set the private key if needed
                //     },
                // });

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