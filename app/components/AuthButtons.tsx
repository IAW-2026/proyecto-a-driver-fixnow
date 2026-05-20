'use client'

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function AuthButtons() {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Show when="signed-out">
                <SignInButton mode="modal">
                    <button className="bg-transparent border border-[#04395E] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Ingresar
                    </button>
                </SignInButton>

                <SignUpButton mode="modal">
                    <button className="bg-[#FFB800] text-[#031D44] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Registrarse
                    </button>
                </SignUpButton>
            </Show>

            <Show when="signed-in">
                <UserButton />
            </Show>
        </header>
    )
}