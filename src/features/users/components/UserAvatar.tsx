import { ComponentProps } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar"

export function UserAvatar({
  user,
  ...props
}: {
  user: { name: string; imageURL: string }
} & ComponentProps<typeof Avatar>) {
  return (
    <Avatar {...props}>
      <AvatarImage src={user.imageURL} alt={user.name} />
      <AvatarFallback className="uppercase">
        {user.name
          .split(" ")
          .slice(0, 2) // take first 2 letters of the name
          .map(n => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  )
}