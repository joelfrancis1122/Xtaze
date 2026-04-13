
import { useEffect, useState } from "react";
import { Music, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    useEffect(() => {
        const styles = `
      body, * {
        background-color: var(--background) !important; /* Dark background */
      }
    `;
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    navigate(-1);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleHomeRedirect = () => {
        navigate("/home");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white">
            <div className="text-center space-y-8">
                <div className="flex justify-center">
                    <Music className="h-24 w-24 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="text-xl">Oops! The beat dropped, but the page didn't.</p>
                <p className="text-gray-400">Redirecting you in {countdown} seconds...</p>
                <div className="flex justify-center space-x-4">
                    <Button onClick={handleHomeRedirect}>
                        <Home className="h-4 w-4" />

                    </Button>
                </div>
            </div>
        </div>
    );
}
