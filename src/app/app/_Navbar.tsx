"use client"

import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileSlidersIcon,
  LogOut,
  SpeechIcon,
  User,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { UserAvatar } from "@/features/users/components/UserAvatar"
import { useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
]

export function Navbar({ user }: { user: { name: string; imageURL: string } }) {
  const { openUserProfile } = useClerk()
  const { jobInfoId } = useParams()
  const pathName = usePathname()

  return (
    <nav className="h-header border-b">
      <div className="container flex h-full items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold">CodeReadyAI</span>
        </Link>

        <div className="flex items-center gap-4">
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/app/job-infos/${jobInfoId}/${href}`

              return (
                <Button
                  variant={pathName === hrefPath ? "secondary" : "ghost"}
                  key={name}
                  asChild
                  className="cursor-pointer max-sm:hidden"
                >
                  <Link href={hrefPath}>
                    <Icon />
                    {name}
                  </Link>
                </Button>
              )
            })}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <User className="mr-2" />
                Profile
              </DropdownMenuItem>
              <SignOutButton>
                <DropdownMenuItem>
                  <LogOut className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}