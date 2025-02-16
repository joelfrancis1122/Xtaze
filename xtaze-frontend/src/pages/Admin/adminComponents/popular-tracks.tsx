
const popularTracks = [
  { title: "Blinding Lights", artist: "The Weeknd", plays: "1.2M" },
  { title: "Shape of You", artist: "Ed Sheeran", plays: "980K" },
  { title: "Dance Monkey", artist: "Tones and I", plays: "875K" },
  { title: "Someone You Loved", artist: "Lewis Capaldi", plays: "820K" },
  { title: "Watermelon Sugar", artist: "Harry Styles", plays: "790K" },
]
export function PopularTracks() {
    return (
      <table className="w-full border-separate border-spacing-y-1">
        {/* Table Header */}
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-bold border-b border-gray-400">
              Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold border-b border-gray-400">
              Artist
            </th>
            <th className="px-4 py-3 text-center text-sm font-bold border-b border-gray-400">
              Plays
            </th>
          </tr>
        </thead>
  
        {/* Table Body */}
        <tbody>
          {popularTracks.map((track, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-3 text-sm font-medium">{track.title}</td>
              <td className="px-4 py-3 text-sm font-medium">{track.artist}</td>
              <td className="px-4 py-3 text-center text-sm font-medium">
                {track.plays}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  