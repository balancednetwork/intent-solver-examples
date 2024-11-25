import React from "react";
import {createContext, ReactNode, useContext, useState} from "react";
import {EvmProvider, SuiProvider} from "balanced-solver-sdk";

export interface MultiWalletContextProps {
  evmProvider: EvmProvider | undefined;
  suiProvider: SuiProvider | undefined;
  setEvmProvider: (value: EvmProvider) => void;
  setSuiProvider: (value: SuiProvider) => void;
}

const MultiWalletContext = createContext<MultiWalletContextProps | undefined>(
  undefined,
);

export const MultiWalletProvider = ({ children }: { children: ReactNode }) => {
  const [evmProvider, setEvmProvider] = useState<EvmProvider | undefined>(undefined);
  const [suiProvider, setSuiProvider] = useState<SuiProvider | undefined>(undefined);

  let values = {
    evmProvider,
    suiProvider,
    setEvmProvider,
    setSuiProvider,
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
