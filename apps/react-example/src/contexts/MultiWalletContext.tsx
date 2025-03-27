import React from "react";
import {createContext, ReactNode, useContext, useState} from "react";
import {EvmProvider, SuiProvider, IconProvider, ChainName, type ChainProviderType} from "icon-intents-sdk";

export interface MultiWalletContextProps {
  iconProvider: IconProvider | undefined;
  evmProvider: EvmProvider | undefined;
  suiProvider: SuiProvider | undefined;
  setIconProvider: (value: IconProvider) => void;
  setEvmProvider: (value: EvmProvider) => void;
  setSuiProvider: (value: SuiProvider) => void;
  getConnectedWalletAddress: (value: ChainName) => string;
  getProvider: (value: ChainName) => ChainProviderType;
}

const MultiWalletContext = createContext<MultiWalletContextProps | undefined>(
  undefined,
);

export const MultiWalletProvider = ({ children }: { children: ReactNode }) => {
  const [evmProvider, setEvmProvider] = useState<EvmProvider | undefined>(undefined);
  const [suiProvider, setSuiProvider] = useState<SuiProvider | undefined>(undefined);
  const [iconProvider, setIconProvider] = useState<IconProvider | undefined>(undefined);

  function getProvider(chain: ChainName): ChainProviderType {
    switch (chain) {
      case "arb":
        if (!evmProvider) throw new Error("evmProvider undefined");
        return evmProvider
      case "pol":
        if (!evmProvider) throw new Error("evmProvider undefined");
        return evmProvider
      case "sui":
        if (!suiProvider) throw new Error("suiProvider undefined");
        return suiProvider
      case "icon":
        if (!iconProvider) throw new Error("iconProvider undefined");
        return iconProvider
    }
  }

  function getConnectedWalletAddress(chain: ChainName): string {
    switch (chain) {
      case "arb":
        if (!evmProvider) throw new Error("evmProvider undefined");
        return evmProvider.walletClient.account.address
      case "pol":
        if (!evmProvider) throw new Error("evmProvider undefined");
        return evmProvider.walletClient.account.address
      case "sui":
        if (!suiProvider) throw new Error("suiProvider undefined");
        return suiProvider.account.address
      case "icon":
        if (!iconProvider) throw new Error("iconProvider undefined");
        return iconProvider.wallet.getAddress()
    }
  }

  let values = {
    iconProvider,
    evmProvider,
    suiProvider,
    setIconProvider,
    setEvmProvider,
    setSuiProvider,
    getConnectedWalletAddress,
    getProvider
  }

  return (
    <MultiWalletContext.Provider value={values}>
      {children}
    </MultiWalletContext.Provider>
  );
}

export const useMultiWallet = () => {
  const context = useContext(MultiWalletContext);

  if (context === undefined) {
    throw new Error("useMultiWallet must be used within a MultiWalletProvider");
  }

  return context;
};
