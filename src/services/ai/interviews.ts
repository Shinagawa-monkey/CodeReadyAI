import { JobInfoTable } from "@/drizzle/schema"
import { fetchChatMessages } from "../hume/lib/api"
import { generateText, stepCountIs } from "ai"
import { google } from "./models/google"


export async function generateAiInterviewFeedback({ humeChatId, jobInfo, userName }: { humeChatId: string, jobInfo: Pick<typeof JobInfoTable.$inferSelect, "title" | "description" | "experienceLevel">, userName: string }) {
  const messages = await fetchChatMessages(humeChatId)

  const formattedMessages = messages.map((message) => { // null if it's not the message from the AI or the user
    if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
      return null
    }

    if (message.messageText == null) return null

    return {
      speaker: message.type === "USER_MESSAGE" ? "Interviewee" : "Interviewer",
      text: message.messageText,
      emptionFeatures: message.role === "USER" ? message.emotionFeatures : undefined,
    }
  }).filter(f => f != null)

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: JSON.stringify(formattedMessages),
    stopWhen: stepCountIs(10),
    // experimental_continueSteps: true, // experimental_continueSteps has been removed, Use newer models with higher output token limits instead
    system: `You are an expert interview coach and evaluator. Your role is to analyze a mock job interview transcript and provide clear, detailed, and structured feedback on the interviewee's performance based on the job requirements. Your output should be in markdown format.
  
---

Additional Context:

Interviewee's name: ${userName}
Job title: ${jobInfo.title}
Job description: ${jobInfo.description}
Job Experience level: ${jobInfo.experienceLevel}

---

Transcript JSON Format:

speaker: "interviewee" or "interviewer"
text: "The actual spoken text of the message"
emotionFeatures: "An object of emotional features where the key is the emotion and the value is the intensity (0-1). This is only provided for interviewee messages."

---

Your Task:

Review the full transcript and evaluate the interviewee's performance in relation to the role. Provide detailed, structured feedback organized into the following primary categories (do not repeat the subcategories in your response and instead just use them as reference for what to look for and include in your response):

---

Feedback Categories:

1. **Communication Clarity**
   - Was the interviewee articulate and easy to understand?
   - Did they use structured and appropriate language for this job and experience level?

2. **Confidence and Emotional State**
   - Based on the provided emotional cues and speech content, how confident did the interviewee appear?
   - Highlight any nervous or hesitant moments that may have affected the impression they gave.

3. **Response Quality**
   - Did the interviewee respond with relevant, well-reasoned answers aligned with the job requirements?
   - Were answers appropriately scoped for their experience level (e.g., detail depth, use of examples)?

4. **Pacing and Timing**
   - Analyze delays between interviewer questions and interviewee responses.
   - Point out long or unnatural pauses that may indicate uncertainty or unpreparedness.

5. **Engagement and Interaction**
   - Did the interviewee show curiosity or ask thoughtful questions?
   - Did they engage with the conversation in a way that reflects interest in the role and company?

6. **Role Fit & Alignment**
   - Based on the job description and the candidate's answers, how well does the interviewee match the expectations for this role and level?
   - Identify any gaps in technical or soft skills.

7. **Overall Strengths & Areas for Improvement**
   - Summarize top strengths.
   - Identify the most important areas for improvement.
   - Provide a brief overall performance assessment.

---

Additional Notes:

- Reference specific moments from the transcript, including quotes and timestamps where useful. Do not return specific emotional features in your response.
- Tailor your analysis and feedback to the specific job description and experience level provided.
- Be clear, constructive, and actionable. The goal is to help the interviewee grow.
- Do not include an h1 title or information about the job description in your response, just include the feedback.
- Refer to the interviewee as "you" in your feedback. This feedback should be written as if you were speaking directly to the interviewee.
- Include a number rating (out of 10) in the heading for each category (e.g., "Communication Clarity: 8/10") as well as an overall rating at the very start of the response.
- Stop generating output as soon you have provided the full feedback.`,
  })

  return text
}