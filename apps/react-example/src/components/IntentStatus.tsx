import React, {useState} from "react"
import {useQuery} from "@tanstack/react-query";
import {IntentService} from "balanced-solver-sdk";
import type {IntentErrorResponse, IntentStatusResponse, Result} from "balanced-solver-sdk/dist/types";
import {statusCodeToMessage} from "@/lib/utils";

export default function IntentStatus(
  {
    task_id
  } : {
    task_id: string
  }
) {
  const [status, setStatus] = useState<Result<IntentStatusResponse, IntentErrorResponse> | undefined>(undefined);

  useQuery({
    queryKey: [task_id],
    queryFn: async () => {
      const intentResult = await IntentService.getStatus({ task_id});
      setStatus(intentResult)

      return intentResult
    },
    refetchInterval: 3000, // 3s
  })

  if (status) {
    if (status.ok) {
      return (
        <div className="flex flexitems-center content-center justify-center text-center pb-4">
          <span>Intent task_id: {task_id}</span>
          <span>Status: {statusCodeToMessage(status.value.status)}</span>
        </div>
      )
    } else {
      return (
        <div className="flex">
          <span>Error: {status.error.detail.message}</span>
        </div>
      )
    }
  }

  return null;
}
