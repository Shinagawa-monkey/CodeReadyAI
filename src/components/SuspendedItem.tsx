import { ReactNode, Suspense } from "react"

export function SuspendedItem<T>({ // inner component does the actual acync work in the app so it's not async itself
  item, // the promise we're waiting for
  fallback, // what to show while waiting
  result, // what to show when the promise is resolved
}: {
  item: Promise<T>
  fallback: ReactNode
  result: (item: T) => ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <InnerComponent item={item} result={result} />
    </Suspense>
  )
}

async function InnerComponent<T>({
  item,
  result,
}: {
  item: Promise<T>
  result: (item: T) => ReactNode
}) {
  return result(await item)
}