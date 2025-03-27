import React, {useState} from 'react';
import './App.css';
import {useMultiWallet} from "./contexts/MultiWalletContext";
import SwapCard from "./components/SwapCard";
import ConnectEvmWalletButton from "./components/ConnectEvmWalletButton";
import ConnectSuiWalletButton from "./components/ConnectSuiWalletButton";
import IntentStatus from "@/components/IntentStatus";
import ConnectIconWalletButton from "@/components/ConnectIconWalletButton";

function App() {
  const { evmProvider, suiProvider, iconProvider } = useMultiWallet();
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const providers = [evmProvider, suiProvider, iconProvider];

  return (<div className="flexitems-center content-center justify-center h-screen w-screen">
    <div className="flex flex-col flexitems-center content-center justify-center">
      { (!evmProvider || !suiProvider || !iconProvider) ? (
        <div className="text-center">
          <h1 className="pb-4">Please connect all wallets (Hana Wallet supported)</h1>
          <div className="flex space-x-2 flexitems-center content-center justify-center">
            { !iconProvider && <ConnectIconWalletButton/>}
            { !evmProvider && <ConnectEvmWalletButton />}
            { !suiProvider && <ConnectSuiWalletButton />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col text-center pb-6">
          { iconProvider && (
            <div>
              Connected Icon address: {iconProvider.wallet.getAddress()}
            </div>
          )}
          { evmProvider && (
            <div>
              Connected EVM address: {evmProvider.walletClient.account.address}
            </div>
          )}
          { suiProvider && (
            <div>
              Connected SUI address: {suiProvider.account.address}
            </div>
          )}
        </div>
      )}
      {taskId && <IntentStatus task_id={taskId} />}
      {providers.filter((v) => v !== undefined).length === providers.length && <SwapCard setTaskId={setTaskId} />}

    </div>
  </div>)
    ;
}

export default App;
