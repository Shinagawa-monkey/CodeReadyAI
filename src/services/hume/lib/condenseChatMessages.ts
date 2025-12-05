import { ConnectionMessage } from "@humeai/voice-react"
import { Hume } from "hume"

type Message = Hume.empathicVoice.JsonMessage | ConnectionMessage | Hume.empathicVoice.ReturnChatEvent // ReturnChatEvent is the onlyone on the BE

export function condenseChatMessages(messages: Message[]) {
  return messages.reduce((acc, message) => {
    const data = getChatEventData(message) ?? getJsonMessageData(message)
    if (data == null || data.content == null) {
      return acc
    } // if it's not a chatEvent or JsonMessage ignore it

    const lastMessage = acc.at(-1)
    if (lastMessage == null) {
      acc.push({ isUser: data.isUser, content: [data.content] })
      return acc
    } // retuen last message ib the array

    if (lastMessage.isUser === data.isUser) { // condence messages from the same person into the single object
      lastMessage.content.push(data.content)
    } else {
      acc.push({ isUser: data.isUser, content: [data.content] })
    }

    return acc
  }, [] as { isUser: boolean; content: string[] }[]) // content is an arry of the things user said
}

function getJsonMessageData(message: Message) {
  if (message.type !== "user_message" && message.type !== "assistant_message") {
    return null
  } // if no message from user or the assistant, return null

  return {
    isUser: message.type === "user_message",
    content: message.message.content,
  }
}

function getChatEventData(message: Message) {
  if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
    return null
  }

  return {
    isUser: message.type === "USER_MESSAGE",
    content: message.messageText,
  }
}