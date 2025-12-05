import { HumeClient, Hume } from "hume"
import { env } from "@/data/env/server"

export async function fetchChatMessages(humeChatId: string) {
  "use cache" // once interview is done I can cache the messages, they don't change

  const client = new HumeClient({ apiKey: env.HUME_API_KEY })
  const allChatEvents: Hume.empathicVoice.ReturnChatEvent[] = []
  const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(humeChatId, { pageNumber: 0, pageSize: 100 }) // get the largest number of chats at a time and I keep adding them to the array untill I get all of them

  for await (const chatEvent of chatEventsIterator) {
    allChatEvents.push(chatEvent)
  }

  return allChatEvents
}