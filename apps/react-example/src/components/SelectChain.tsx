"use client"

import React from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ChainName} from "icon-intents-sdk";
import {SetStateAction} from "react";
import {Label} from "@/components/ui/label";

export function SelectChain(
  {
    chainList,
    value,
    setChain,
    placeholder,
    id,
    label
  }: {
    chainList: ChainName[],
    value: ChainName,
    setChain: (value: SetStateAction<ChainName>) => void,
    placeholder: string,
    id: string,
    label: string
  }) {

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => setChain(v as ChainName)}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>
        <SelectContent>
          {chainList.map((chain) => (
            <SelectItem key={chain} value={chain}>
              {chain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    )
  }
