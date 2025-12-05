"use client"
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { JobInfoTable } from "@/drizzle/schema"
import { Button } from "@/components/ui/button"
import { env } from "@/data/env/client"
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react";
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages";
import { CondensedMessages } from "@/services/hume/components/CondensedMessages";
import { createInterview, updateInterview } from "@/features/interviews/actions"
import { errorToast } from "@/lib/errorToast"
import { useRouter } from "next/navigation"

export function StartCall({ jobInfo, user, accessToken }: {
  accessToken: string, jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "title" | "description" | "experienceLevel">, user: { name: string, imageURL: string }
}) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } = useVoice(); // create a new interview first and than connect to the chat session especially important because some user plan lets them have rete or person limit; chatMedata has chatId
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const durationRef = useRef(callDurationTimestamp)
  durationRef.current = callDurationTimestamp // the most update info on the duration
  const router = useRouter()

  // Sync chat ID
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId })
  }, [chatMetadata?.chatId, interviewId])

  // Sync Duration
  useEffect(() => { // hits db every 10 seconds to update the duration
    if (interviewId == null) return
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return
      updateInterview(interviewId, { duration: durationRef.current })
    }, 10000)
    return () => clearInterval(intervalId)
  }, [interviewId])

  // Handle disconnect
  useEffect(() => {
    if (readyState !== VoiceReadyState.CLOSED) return
    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`) // if user quits the call before the interview started
    }
    if (durationRef.current != null) {
      updateInterview(interviewId, { duration: durationRef.current })
    }

    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`)
  }, [interviewId, readyState, router, jobInfo.id])

  if (readyState === VoiceReadyState.IDLE) { //witing to connect to the voice
    return (
      <div className="flex justify-center items-center h-screen-header">
        <Button size="lg" onClick={async () => {
          // Create a new interview
          const res = await createInterview({ jobInfoId: jobInfo.id })
          if (res.error) {
            return errorToast(res.message)
          }
          setInterviewId(res.id)

          // Connect to the voice
          connect({
            auth: { type: "accessToken", value: accessToken },
            configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
            sessionSettings: {
              type: "session_settings",
              variables: { // names are same as in config in hume project inside {{varName}}
                userName: user.name,
                title: jobInfo.title || "Not Specified",
                description: jobInfo.description,
                experienceLevel: jobInfo.experienceLevel,
              }
            },
          })
        }}>
          Start Interview
        </Button>
      </div>
    )
  }

  if (readyState === VoiceReadyState.CONNECTING || readyState === VoiceReadyState.CLOSED) { // App is connecting or trying to redirect the user to the next page
    return (
      <div className="h-screen-header flex items-center justify-center">
        <Loader2Icon className="animate-spin size-24" />
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-screen-header flex flex-col-reverse">
      {/* outer conteiner with flex-col-reverse will always scroll down to the bottom of the container */}
      <div className="container py-6 flex flex-col items-center justify-end gap-4">
        <Messages user={user} />
        <Controls />
      </div>
    </div>
  )
}

function Messages({ user }: { user: { name: string; imageURL: string } }) {
  // micFft - our Mic, fft - their Fft; many messages will be lumped up in one for convenience
  const { messages, fft } = useVoice();
  const condensedMessages = useMemo(() => {
    return condenseChatMessages(messages);
  }, [messages]);

  return (
    <CondensedMessages messages={condensedMessages} user={user} maxFft={Math.max(...fft)} className="max-w-5xl" />
  )
}

function Controls() {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } = useVoice(); // micFFT is an array of 128 values that represent the frequency spectrum of the microphone input akak loudness

  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      <Button variant="ghost" size="icon" className="-mx-3" onClick={() => (isMuted ? unmute() : mute())}>
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-muted-foreground tabular-nums">
        {/* tabular-nums: makes the numbers use a fixed-width font */}
        {callDurationTimestamp}
      </div>
      <Button variant="ghost" size="icon" className="-mx-3" onClick={disconnect}>
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  )
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100;
        return (
          <div key={index} className="min-h-0.5 bg-primary/75 w-0.5 rounded" style={{ height: `${percent < 10 ? 0 : percent}%` }} />
        )
      })
      }
    </div>
  )
}