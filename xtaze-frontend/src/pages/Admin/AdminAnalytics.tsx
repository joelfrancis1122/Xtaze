import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import Sidebar from "./adminComponents/aside-side";
import { fetchAllArtistsVerification, fetchUserDetails, updateVerificationStatus } from "../../services/adminService";
import { Button } from "../../components/ui/button";

interface Verification {
    status: "pending" | "approved" | "rejected" | "unsubmitted";
    idProof?: string;
    feedback?: string | null;
}

interface Artist {
    _id: string; // Verification record ID
    artistId: string;
    username: string;
    email: string;
    verification: Verification;
}

export default function AdminAnalytics() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                toast.error("Admin token not found. Please log in.");
                return;
            }

            try {
                const verificationData = await fetchAllArtistsVerification(token);
                console.log("Verification data:", verificationData);

                if (!verificationData || verificationData.length === 0) {
                    setArtists([]);
                    return;
                }

                const artistIds = verificationData.map((item: any) => item.artistId);
                const userDetails = await fetchUserDetails(artistIds, token);
                console.log("User details:", userDetails);

                const mergedData = verificationData.map((verification: any) => {
                    const user = userDetails.find((u) => u._id === verification.artistId);
                    return {
                        _id: verification._id,
                        artistId: verification.artistId,
                        username: user?.username || "Unknown",
                        email: user?.email || "N/A",
                        verification: {
                            status: verification.status,
                            idProof: verification.idProof,
                            feedback: verification.feedback,
                        },
                    };
                });

                setArtists(mergedData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load artist data.");
            }
        };
        fetchData();
    }, [token]);

    const handleVerify = async (verificationId: string, status: "approved" | "rejected", feedback: string | null = null) => {
        try {
            const updatedVerification = await updateVerificationStatus(status, feedback, verificationId, token as string);
            if (updatedVerification) {
                setArtists((prevArtists) =>
                    prevArtists.map((artist) =>
                        artist._id === verificationId
                            ? { ...artist, verification: { ...artist.verification, status, feedback } }
                            : artist
                    )
                );
                toast.success(`Artist ${status} successfully!`);
            }
        } catch (error) {
            console.error("Error updating verification:", error);
            toast.error("Failed to update verification status.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Sidebar />
            <main className="p-6 lg:ml-64">
                <Card className="bg-black border border-white p-5">
                    <h1 className="text-2xl font-bold text-white mb-6">Artist Verification Analytics</h1>
                    {artists.length === 0 ? (
                        <p className="text-white">Loading artists or no artists found...</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white">
                                    <th className="py-2 text-white">Artist Name</th>
                                    <th className="py-2 text-white">Email</th>
                                    <th className="py-2 text-white">Status</th>
                                    <th className="py-2 text-white">ID Proof</th>
                                    <th className="py-2 text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artists.map((artist) => (
                                    <tr key={artist._id} className="border-b border-gray-700">
                                        <td className="py-2 text-white">{artist.username}</td>
                                        <td className="py-2 text-white">{artist.email}</td>
                                        <td className="py-2 text-white">{artist.verification.status}</td>
                                        <td className="py-2">
                                            {artist.verification.idProof ? (
                                               <div className="relative group inline-block">
                                               <a
                                                 href={artist.verification.idProof}
                                                 target="_blank"
                                                 className="text-blue-400 underline font-medium transition duration-200"
                                               >
                                                 View ID
                                               </a>
                                             
                                               <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 hidden group-hover:block">
                                                 <div className="relative rounded-xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/20 overflow-hidden transition-transform duration-300 transform group-hover:scale-100 scale-95">
                                                   <img
                                                     src={artist.verification.idProof}
                                                     alt="ID Preview"
                                                     className="max-w-sm max-h-72 object-contain rounded-xl"
                                                   />
                                                 </div>
                                               </div>
                                             </div>
                                             
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                        <td className="py-2">
                                            {artist.verification.status === "pending" && (
                                                <>
                                                    <Button
                                                        className="bg-[#0d1e00] hover:bg-[#1b2414]" onClick={() => handleVerify(artist._id, "approved")}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        className="ml-4 bg-[#380000] hover:bg-[#241111]" onClick={() => {
                                                            const feedback = prompt("Enter rejection feedback (optional):");
                                                            handleVerify(artist._id, "rejected", feedback);
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </main>
        </div>
    );
}