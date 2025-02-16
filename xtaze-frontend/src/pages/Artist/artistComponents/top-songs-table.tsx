import { Table,TableBody, TableCell, TableRow } from "../../../components/ui/table"
import { Play } from "lucide-react"

const topSongs = [
  { title: "Starlight", plays: "2.5M", duration: "3:42" },
  { title: "Ocean Eyes", plays: "2.1M", duration: "3:20" },
  { title: "Neon Dreams", plays: "1.8M", duration: "4:05" },
  { title: "Midnight Memories", plays: "1.6M", duration: "3:55" },
  { title: "Sunflower", plays: "1.4M", duration: "3:30" },
]

export function TopSongsTable() {
  return (
    <Table>
    <thead className="bg-gray-900 text-white">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-semibold border-b">##</th>
        <th className="px-4 py-2 text-left text-sm font-semibold border-b">Title</th>
        <th className="px-4 py-2 text-center text-sm font-semibold border-b">Plays</th>
        <th className="px-4 py-2 text-center text-sm font-semibold border-b">Duration</th>
      </tr>
    </thead>
  
    <TableBody>
      {topSongs.map((song, index) => (
        <TableRow key={index}>
          <TableCell>
            <Play className="h-4 w-4" />
          </TableCell>
          <TableCell className="font-medium">{song.title}</TableCell>
          <TableCell>{song.plays}</TableCell>
          <TableCell>{song.duration}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  
  )
}
