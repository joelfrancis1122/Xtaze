import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card"; // Adjust path
import ArtistSidebar from "./artistComponents/artist-aside"; // Adjust path
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { checkCardStatus, fetchSongEarnings, saveCard } from "../../services/artistService";

// Load Stripe outside the component
const stripePromise = loadStripe("pk_test_51QuvsvQV9aXBcHmZPYCW1A2NRrd5mrEffAOVJMFOlrYDOl9fmb028A85ZE9WfxKMdNgTTA5MYoG4ZwCUQzHVydZj00eBUQVOo9");

interface SongEarnings {
  trackId: string;
  trackName: string;
  totalPlays: number;
  monthlyPlays: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

const CardInput = ({ artistId, onCardSaved }: { artistId: string; onCardSaved: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardLoading, setCardLoading] = useState(false);

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !artistId) return;

    setCardLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: artistId }, // Use artistId or fetch username if needed
      });

      if (error) throw new Error(error.message);

      await saveCard(artistId, paymentMethod!.id);
      onCardSaved(); // Update parent state
      toast.success("Card saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save card");
    } finally {
      setCardLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveCard} className="space-y-4">
      <CardElement options={{ style: { base: { color: "#fff" } } }} />
      <button
        type="submit"
        disabled={cardLoading || !stripe}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {cardLoading ? "Saving..." : "Save Card"}
      </button>
    </form>
  );
};

export default function ArtistMonetizePage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SongEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCard, setHasCard] = useState(false);
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch song earnings
        if (!user) {
          return
        }
        const songData = await fetchSongEarnings(user._id);
        setSongs(songData);
        const cardStatus = await checkCardStatus(user._id);
        setHasCard(cardStatus);
      } catch (err) {
        console.error(err);
        setError("no data awailable");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Apply dark theme
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      body, * {
        background-color: var(--background) !important;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      if (styleSheet.parentNode) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [user?._id]);


  const handleCardSaved = () => {
    setHasCard(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <ArtistSidebar />
        <main className="flex-1 pl-0.4 pr-6 pt-5 pb-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition mb-2"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold">Monetize</h1>
              <div className="text-sm text-muted-foreground">Your song earnings overview</div>
            </div>
          </div>

          {/* Earnings Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Summary</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ${songs.reduce((sum, song) => sum + song.totalEarnings, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">This Month’s Earnings</p>
                <p className="text-2xl font-bold">
                  ${songs.reduce((sum, song) => sum + song.monthlyEarnings, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-gray-400 mt-4">
              Payout Status: {hasCard ? "Eligible" : "Add card details to enable payouts"}
            </p>
          </Card>

          {/* Card Input */}
          {!hasCard && (
            <Card className="mt-6 p-6">
              <h2 className="text-lg font-semibold mb-4">Add Card Details</h2>
              <Elements stripe={stripePromise}>
                <CardInput artistId={user?._id || ""} onCardSaved={handleCardSaved} />
              </Elements>
            </Card>
          )}

          {/* Songs Table */}
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading song data...</p>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : songs.length > 0 ? (
            <Card className="mt-6 p-6">
              <h2 className="text-lg font-semibold mb-4">Your Songs</h2>
              <div className="overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-gray-400 text-lg font-semibold border-b border-gray-700">
                  <span>Track Name</span>
                  <span>Total Plays</span>
                  <span>Monthly Plays</span>
                  <span>Total Earnings</span>
                  <span>Monthly Earnings</span>
                </div>
                {songs.map((song, index) => (
                  <div
                    key={song.trackId || index}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-[#212121] transition-all duration-200 items-center"
                  >
                    <span className="text-white truncate">{song.trackName}</span>
                    <span className="text-gray-400">{song.totalPlays}</span>
                    <span className="text-gray-400">{song.monthlyPlays}</span>
                    <span className="text-gray-400">${song.totalEarnings.toFixed(2)}</span>
                    <span className="text-gray-400">${song.monthlyEarnings.toFixed(2)}</span>
                  </div>
                ))}

              </div>
            </Card>
          ) : (
            <Card className="mt-6 p-8 text-center">
              <p className="text-gray-400 text-lg">No data available.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}