import profileImg from "../../../assets/spidey.jpeg";

const popularArtists = [
    { name: "Taylor Swift", followers: "45.2M", monthlyListeners: "62.3M" },
    { name: "Drake", followers: "39.8M", monthlyListeners: "58.7M" },
    { name: "Ariana Grande", followers: "37.5M", monthlyListeners: "54.1M" },
    { name: "Ed Sheeran", followers: "35.9M", monthlyListeners: "51.8M" },
    { name: "Billie Eilish", followers: "33.2M", monthlyListeners: "49.5M" },
];

export function PopularArtists() {
    return (
        <table className="w-full border-separate border-spacing-y-1">
            {/* Table Header */}
            <thead className="bg-gray-900 text-white">
                <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold border-b">Artist</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold border-b">Followers</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold border-b">Monthly Listeners</th>
                </tr>
            </thead>

            {/* Table Body */}
            <tbody>
                {popularArtists.map((artist, index) => (
                    <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">
                                <img
                                    src={profileImg}
                                    alt={artist?.name || "Default Avatar"}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                                {artist.name}
                            </div>
                        </td>
                        <td className="px-4 py-2 text-center text-sm">{artist.followers}</td>
                        <td className="px-4 py-2 text-center text-sm">{artist.monthlyListeners}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
