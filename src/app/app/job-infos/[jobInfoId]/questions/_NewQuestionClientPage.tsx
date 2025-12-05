"use client"

import { JobInfoTable, questionDifficulties, QuestionDifficulty } from "@/drizzle/schema"
import { BackLink } from "@/components/BackLink"
import { Button } from "@/components/ui/button"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { useState, useMemo } from "react"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { formatQuestionDifficulty } from "@/features/questions/formatters"
import { useCompletion } from "@ai-sdk/react"
import { errorToast } from "@/lib/errorToast"
import z from "zod"

const questionIdSchema = z.object({ questionId: z.string() })
const QUESTION_ID_MARKER = /<!--QUESTION_ID:(.+?)-->/

function extractQuestionDetails(completion: string) {
  const match = completion.match(QUESTION_ID_MARKER)
  if (match == null) {
    return { questionText: completion, questionId: null }
  }

  const parsed = questionIdSchema.safeParse({ questionId: match[1] })
  if (!parsed.success) {
    return { questionText: completion, questionId: null }
  }

  return {
    questionText: completion.replace(match[0], "").trim(),
    questionId: parsed.data.questionId,
  }
}

type Status = "awaiting-answer" | "awaiting-difficulty" | "init"

export function NewQuestionClientPage({ jobInfo }: {
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "title">
}) {
  const [status, setStatus] = useState<Status>("init")
  const [answer, setAnswer] = useState<string | null>(null)
  const [questionIds, setQuestionIds] = useState<string[]>([])

  const { complete: generateQuestion, completion: question, setCompletion: setQuestion, isLoading: isGeneratingQuestion } = useCompletion({
    api: "/api/ai/questions/generate-question",
    onFinish: (_prompt, completion) => {
      const { questionText, questionId } = extractQuestionDetails(completion)
      setQuestion(questionText ?? "")
      if (questionId != null) {
        setQuestionIds(prev => [...prev, questionId])
      }
      setStatus("awaiting-answer")
    },
    onError: error => {
      errorToast(error.message)
    },
  })

  const { complete: generateFeedback, completion: feedback, setCompletion: setFeedback, isLoading: isGeneratingFeedback } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => {
      setStatus("awaiting-difficulty")
    },
    onError: error => {
      errorToast(error.message)
    },
  })

  const questionId = useMemo(() => {
    if (questionIds.length === 0) return null
    return questionIds[questionIds.length - 1] ?? null
  }, [questionIds])

  // useEffect(() => { // to log question ids array for debugging
  //   if (questionIds.length === 0) return
  //   console.log("Question IDs for session:", questionIds)
  // }, [questionIds])

  const cleanQuestion = question.length > 0 ? question : null

  return (
    <div className="flex flex-col items-center gap-4 w-full mx-w-[2000px] mx-auto grow h-screen-header">
      <div className="container flex gap-4 mt-4 items-center justify-between">
        <div className="grow basis-0">
          <BackLink href={`/app/job-infos/${jobInfo.id}`}>
            {jobInfo.name}
          </BackLink>
        </div>
        <Controls
          reset={() => {
            setStatus("init")
            setQuestion("")
            setFeedback("")
            setAnswer(null)
          }}
          disableAnswerButton={answer == null || answer.trim() === "" || questionId == null}
          status={status}
          isLoading={isGeneratingFeedback || isGeneratingQuestion}
          generateFeedback={() => {
            if (answer == null || answer.trim() === "" || questionId == null)
              return

            generateFeedback(answer?.trim(), { body: { questionId } })
          }}
          generateQuestion={difficulty => {
            setQuestion("")
            setFeedback("")
            setAnswer(null)
            generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } })
          }}
        />
        <div className="grow hidden md:block" />
      </div>
      <QuestionContainer
        question={cleanQuestion}
        feedback={feedback}
        answer={answer}
        status={status}
        setAnswer={setAnswer}
      />
    </div>
  )
}

function QuestionContainer({ question, feedback, answer, status, setAnswer }: { question: string | null, feedback: string | null, answer: string | null, status: Status, setAnswer: (value: string) => void }) {
  return (
    <ResizablePanelGroup direction="horizontal" className="grow border-t">
      <ResizablePanel id="question-and-feedback" defaultSize={50} minSize={5}>
        <ResizablePanelGroup direction="vertical" className="grow">
          <ResizablePanel id="question" defaultSize={25} minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {status === "init" && question == null ? (
                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                  Get started by selecting a question difficulty above.
                </p>
              ) : (
                question && (
                  <MarkdownRenderer className="p-6">
                    {question}
                  </MarkdownRenderer>
                )
              )}
            </ScrollArea>
          </ResizablePanel>
          {feedback && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel id="feedback" defaultSize={75} minSize={5}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <MarkdownRenderer className="p-6">
                    {feedback}
                  </MarkdownRenderer>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="answer" defaultSize={50} minSize={5}>
        <ScrollArea className="h-full min-w-48 *:h-full">
          <Textarea
            disabled={status !== "awaiting-answer"}
            onChange={e => setAnswer(e.target.value)}
            value={answer ?? ""}
            placeholder="Type your answer here..."
            className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset text-base! p-6"
          />
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function Controls({ status, isLoading, disableAnswerButton, generateQuestion, generateFeedback, reset }: { disableAnswerButton: boolean, status: Status, isLoading: boolean, generateQuestion: (difficulty: QuestionDifficulty) => void, generateFeedback: () => void, reset: () => void }) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            onClick={reset}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>
          <Button
            onClick={generateFeedback}
            disabled={disableAnswerButton}
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        questionDifficulties.map(difficulty => (
          <Button
            key={difficulty}
            size="sm"
            disabled={isLoading}
            onClick={() => generateQuestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  )
}