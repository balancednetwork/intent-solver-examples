import React, {SetStateAction, useState} from "react"
import {ArrowDownUp, ArrowLeftRight} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChainName,
  Token,
  CreateIntentOrderPayload,
  EvmChainConfig, SuiChainConfig, IntentQuoteResponse, isEvmChainConfig, EvmProvider, ChainConfig
} from "icon-intents-sdk";
import {SelectChain} from "@/components/SelectChain";
import {calculateExchangeRate, normaliseTokenAmount, scaleTokenAmount} from "@/lib/utils";
import {Address} from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import BigNumber from "bignumber.js";
import {intentService} from "@/lib/constants";
import {useMultiWallet} from "@/contexts/MultiWalletContext";

const supportedChains = intentService.getSupportedChains();
const supportedTokensPerChain: Map<ChainName, Token[]>= new Map(
  supportedChains.map(chain => {
    return [chain, intentService.getChainConfig(chain).supportedTokens]
  })
)


export default function SwapCard(
  {
    setTaskId,
  }: {
    setTaskId: (value: SetStateAction<string | undefined>) => void,
  }) {
  const { getConnectedWalletAddress, getProvider } = useMultiWallet();
  const defaultSourceChain: ChainConfig = intentService.getChainConfig("icon");
  const defaultDestChain: ChainConfig = intentService.getChainConfig("arb");
  const [sourceChain, setSourceChain] = useState<ChainName>(defaultSourceChain.chain.name)
  const [destChain, setDestChain] = useState<ChainName>(defaultDestChain.chain.name)
  const [sourceToken, setSourceToken] = useState<Token>(defaultSourceChain.supportedTokens[0]!)
  const [destToken, setDestToken] = useState<Token>(defaultDestChain.supportedTokens[0]!)
  const [sourceAmount, setSourceAmount] = useState<string>("")
  const [quote, setQuote] = useState<IntentQuoteResponse | undefined>(undefined)
  const [exchangeRate, setExchangeRate] = useState<BigNumber | string>("")
  const [intentOrderPayload, setIntentOrderPayload] = useState<CreateIntentOrderPayload | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const onChangeDirection = () => {
    setSourceChain(destChain)
    setDestChain(sourceChain)
    setSourceToken(destToken)
    setDestToken(sourceToken)
  }

  const getQuote = async (value: string) => {
    setSourceAmount(value);

    const quoteResult = await intentService.getQuote({
      token_src: sourceToken.address,
      token_src_blockchain_id: intentService.getChainConfig(sourceChain).nid,
      token_dst: destToken.address,
      token_dst_blockchain_id: intentService.getChainConfig(destChain).nid,
      amount: scaleTokenAmount(value, sourceToken.decimals),
      quote_type: "exact_input"
    });

    if (quoteResult.ok) {
      setExchangeRate(calculateExchangeRate(new BigNumber(value), new BigNumber(normaliseTokenAmount(quoteResult.value.quoted_amount, destToken.decimals))))
      setQuote(quoteResult.value);
    } else {
     console.error(quoteResult.error.detail.message);
    }
  }

  const createIntentOrderPayload = () => {
    if (!quote) {
      console.error("Quote undefined");
      return;
    }

    setIntentOrderPayload({
      "quote_uuid": quote.uuid,
      "fromAddress": getConnectedWalletAddress(sourceChain), // address we are sending funds from (fromChain)
      "toAddress": getConnectedWalletAddress(destChain), // destination address where funds are transfered to (toChain)
      "fromChain": sourceChain, // ChainName
      "toChain": destChain, // ChainName
      "token": sourceToken.address,
      "amount":  BigInt(scaleTokenAmount(sourceAmount, sourceToken.decimals)),
      "toToken": destToken.address,
      "toAmount": quote.quoted_amount,
    });
  }

  const createIntentOrder = async (intentOrderPayload: CreateIntentOrderPayload) => {
    if (!quote) {
      console.error("Quote undefined");
      return;
    }

    const sourceChainWalletProvider = getProvider(sourceChain);

    if (!sourceChainWalletProvider) {
      console.error("No provider set");
      return;
    }

    const sourceTokenAmount = BigInt(scaleTokenAmount(sourceAmount, sourceToken.decimals));

    console.log("Checking allowance..");

    // checks if token transfer amount is approved (required for EVM, can be skipped for SUI - defaults to true)
    const isAllowanceValid = await intentService.isAllowanceValid(intentOrderPayload, sourceChainWalletProvider);

    console.log("isAllowanceValid passed..")

    if (isAllowanceValid.ok) {
      if (!isAllowanceValid.value) {
        console.log("Token allowance not valid");
        const sourceChainConfig = intentService.getChainConfig(sourceChain);
        if (sourceChainWalletProvider instanceof EvmProvider && isEvmChainConfig(sourceChainConfig)) {
          const intentContractAddress = sourceChainConfig.intentContract;

          // allowance invalid, prompt approval
          const approvalResult = await intentService.approve(
            sourceToken.address as Address,
            sourceTokenAmount,
            intentContractAddress as Address,
            sourceChainWalletProvider
          );

          if (approvalResult.ok) {
            console.log("Approval successful. Executing intent order..");
            const executionResult = await intentService.executeIntentOrder(intentOrderPayload, sourceChainWalletProvider);

            if (executionResult.ok) {
              console.log("Execution result: ", executionResult);

              setTaskId(executionResult.value.task_id)
            } else {
              // handle error
            }
          } else {
            // handle error
          }
        }
      } else {
        // token allowance is valid
        console.log(`Allowance valid. Executing intent order: ${JSON.stringify(intentOrderPayload)}`);
        const executionResult = await intentService.executeIntentOrder(intentOrderPayload, sourceChainWalletProvider);

        if (executionResult.ok) {
          console.log("Execution result: ", executionResult);

          setTaskId(executionResult.value.task_id)
        } else {
          // handle error
          console.log("Execution returned an error:", JSON.stringify(executionResult));
        }
      }
    } else {
      // handle error
      console.log("Allowance returned an error:", JSON.stringify(isAllowanceValid));
    }
}

  const handleSwap = async (intentOrderPayload: CreateIntentOrderPayload) => {
    setOpen(false);
    // Implement swap logic here
    await createIntentOrder(intentOrderPayload)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Cross-Chain Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <SelectChain
            chainList={supportedChains}
            value={sourceChain}
            setChain={(v) => {
              console.log("Setting new source chain..")
              setSourceChain(v)
            }}
            placeholder={"Select source chain"}
            id={"source-chain"}
            label={"From"}
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-grow">
            <Input
              type="number"
              placeholder="0.0"
              value={sourceAmount}
              onChange={(e) => getQuote(e.target.value)}
            />
          </div>
          <Select value={sourceToken.symbol} onValueChange={(v) =>
            setSourceToken(supportedTokensPerChain.get(sourceChain)?.find(token => token.symbol === v)!)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Token"/>
            </SelectTrigger>
            <SelectContent>
              {supportedTokensPerChain.get(sourceChain)?.map((token) => (
                <SelectItem key={token.address} value={token.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow">
          <Label htmlFor="fromAddress">Source address</Label>
          <Input
            id="fromAddress"
            type="text"
            placeholder="0.0"
            value={getConnectedWalletAddress(sourceChain)}
            disabled={true}
          />
        </div>
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={() => onChangeDirection()}>
            <ArrowDownUp className="h-4 w-4"/>
          </Button>
        </div>
        <div className="space-y-2">
          <SelectChain
            chainList={supportedChains}
            value={destChain}
            setChain={setDestChain}
            placeholder={"Select destination chain"}
            id={"dest-chain"}
            label={"To"}
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-grow">
            <Input
              type="number"
              placeholder="0.0"
              value={quote ? normaliseTokenAmount(quote?.quoted_amount, destToken.decimals) : ""}
              readOnly
            />
          </div>
          <Select value={destToken.symbol} onValueChange={(v) =>
            setDestToken(supportedTokensPerChain.get(destChain)?.find(token => token.symbol === v)!)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Token"/>
            </SelectTrigger>
            <SelectContent>
              {supportedTokensPerChain.get(destChain)!.map((token) => (
                <SelectItem key={token.address} value={token.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow">
          <Label htmlFor="toAddress">Destination address</Label>
          <Input
            id="toAddress"
            type="text"
            value={getConnectedWalletAddress(destChain)}
            disabled={true}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Exchange Rate</span>
            <span>1 {sourceToken.symbol} ≈ {exchangeRate.toString()} {destToken.symbol}</span>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => createIntentOrderPayload()}>Swap</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Intent Swap Order</DialogTitle>
              <DialogDescription>
                See details of intent order.
              </DialogDescription>
            </DialogHeader>
            <div className="">
              <div className="flex flex-col">
                <div>quote_uuid: {intentOrderPayload?.quote_uuid}</div>
                <div>fromAddress: {intentOrderPayload?.fromAddress}</div>
                <div>toAddress: {intentOrderPayload?.toAddress}</div>
                <div>fromChain: {intentOrderPayload?.fromChain}</div>
                <div>toChain: {intentOrderPayload?.toChain}</div>
                <div>token: {intentOrderPayload?.token}</div>
                <div>
                  amount: {intentOrderPayload?.amount.toString()}
                  (normalised:{normaliseTokenAmount(intentOrderPayload?.amount ?? 0n, sourceToken.decimals)})
                </div>
                <div>toToken: {intentOrderPayload?.toToken}</div>
                <div>
                  toAmount: {intentOrderPayload?.toAmount.toString()}
                  (normalised:{normaliseTokenAmount(intentOrderPayload?.toAmount ?? 0n, destToken.decimals)})
                </div>
              </div>
            </div>
            <DialogFooter>
            {
                intentOrderPayload ? (
                  <Button className="w-full" onClick={() => handleSwap(intentOrderPayload)}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> Swap
                  </Button>
                ) : <span>Intent Order undefined</span>
              }
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
