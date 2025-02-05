

import { useState, useRef, type KeyboardEvent } from "react"
import { Input } from "../components/ui/input"
import { useNavigate } from "react-router-dom"


export default function OTPVerification() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)

            // Move to next input if value is entered
            if (value && index < 5) {
                inputRefs[index + 1].current?.focus()
            }
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
    }
    const navigate = useNavigate(); // Initialize navigate

    const goToLogin = () => {
        navigate("/");
      };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold">Continue with Xtaze</h1>
                </div>

                <div className="text-sm text-gray-400 text-center">
                    If you don't have an account yet, we have sent a code to example@email.com. Enter it below.
                </div>

                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <Input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={inputRefs[index]}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg bg-zinc-800 border-zinc-700"
                        />
                    ))}
                </div>



                    <button className="w-full py-2 px-4 border border-gray-500 rounded-md text-white hover:bg-gray-800">
                        SUBMIT 
                    </button>

                <div className="space-y-4">
                    <div className="bg-yellow-900 text-yellow-300 border border-yellow-700 p-3 rounded-md flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.93 6.58a1 1 0 011.88 0l.89 3.17a1 1 0 00.95.72h3.33a1 1 0 01.63 1.78l-2.69 1.95a1 1 0 00-.36 1.12l1.03 3.71a1 1 0 01-1.54 1.12l-2.69-1.95a1 1 0 00-1.17 0l-2.69 1.95a1 1 0 01-1.54-1.12l1.03-3.71a1 1 0 00-.36-1.12L4.19 12.3a1 1 0 01.63-1.78h3.33a1 1 0 00.95-.72l.89-3.17z" clipRule="evenodd"></path>
                        </svg>
                        Do you already have an account? If you're still waiting on your code, try signing in instead.
                    </div>
                </div>

                <div className="text-center">
                <p className="text-neutral-600 dark:text-neutral-300">
              Already have an account?{" "}
              <button onClick={goToLogin} className="text-blue-500 hover:underline">
                Log In
              </button>
            </p>
                </div>
            </div>
        </div>
    )
}

