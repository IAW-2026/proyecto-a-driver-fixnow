"use client"

import { UserButton } from "@clerk/nextjs"

export default function HomeUserMenu() {
  return (
    <div className="flex items-center gap-3">
      <UserButton />
    </div>
  )
}