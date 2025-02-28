
import { Search, Power, Play, Pause, Plus, Heart, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./userComponents/SideBar"; //Sidebar component for navigation.
import MusicPlayer from "./userComponents/TrackBar"; //Music player component for playback controls.
import PreviewModal from "./PreviewPage"; //Modal for previewing track details.
import { WavyBackground } from "../../components/ui/wavy-background";
import type { Track } from "./Types"; //Defines the structure of a track object (e.g., _id, title, artist).
import { useDispatch, useSelector } from "react-redux";
import { clearSignupData, saveSignupData } from "../../redux/userSlice";
import { setCurrentTrack, setIsPlaying, toggleShuffle, setShuffleIndices, setCurrentShuffleIndex, toggleRepeat, clearAudioState } from "../../redux/audioSlice";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { audio } from "../../utils/audio"; //Likely an HTML Audio instance for playing tracks.
import { PlaceholdersAndVanishInput } from "../../utils/placeholders-and-vanish-input";
import axios from "axios";

export default function Home() {
  //State to store the list of tracks fetched from the server.
  const [tracks, setTracks] = useState<Track[]>([]);
  //State to indicate if tracks are currently loading.
  const [loading, setLoading] = useState(true);
  //State to control the visibility of the preview modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  //State to track which songs have been played (to increment listeners only once).
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  //State to track which songs the user has liked.
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.signupData);
  //Select audio related current track ,  playback status
  const { currentTrack, isPlaying, isShuffled, isRepeating, shuffleIndices, currentShuffleIndex } = useSelector(
    (state: RootState) => state.audio
  );
  //Effect to initialize likedSongs state from Redux user data on mount or when likedSongs changes.
  useEffect(() => {
    if (user?.likedSongs) {
      //likedSongs array to array.
      setLikedSongs(new Set(user.likedSongs?.map(String) || []));
    }
  }, [user?.likedSongs]); //rerun when user.likedSongs changes.

  useEffect(() => {
    const fetchTracks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found or invalid role. Please login.");
        return;
      }

      try {
        let response;
        if (user?.premium) {
          //For premium users
          response = await axios.get(`http://localhost:3000/provider/getAllTracks?userId=${user?._id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.data) throw new Error("Failed to fetch premium tracks");
          const data = response.data;
          dispatch(saveSignupData(data.user));
          const formattedTracks: Track[] = data.tracks.map((track: any) => ({
            _id: track._id,
            title: track.title,
            album: track.album,
            artist: Array.isArray(track.artists) ? track.artists : JSON.parse(track.artists),
            genre: track.genre,
            fileUrl: track.fileUrl,
            img: track.img,
            listeners: track.listeners || 0,
          }));
          setTracks(formattedTracks); //Update tracks state
        } else {
          //For free users,
          response = await axios.get(`http://localhost:3000/api/songs/deezer?userId=${user?._id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.data) throw new Error("Failed to fetch free tracks from Deezer");
          const data = await response.data;
          dispatch(saveSignupData(data.user));
          const formattedTracks: Track[] = data.songs.map((track: any) => ({
            _id: track._id || track.fileUrl,
            title: track.title,
            album: track.album || "Unknown Album",
            artist: track.artist,
            genre: track.genre || "Unknown Genre",
            fileUrl: track.fileUrl,
            img: track.img,
            listeners: track.listeners || 0,
          }));
          setTracks(formattedTracks); //Update tracks state.
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [dispatch, user?._id, user?.premium]); //re-run if these change.

  //increment the listener count
  const incrementListeners = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId) return;
    try {
      const response = await axios.post(
        `http://localhost:3000/artist/incrementListeners`,
        { trackId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track._id === trackId ? { ...track, listeners: (track.listeners || 0) + 1 } : track
          )
        );
      }
    } catch (error) {
      console.error("Error incrementing listeners:", error);
    }
  };

  //play/pause of a track.
  const handlePlay = (track: Track) => {
    if (currentTrack?.fileUrl === track.fileUrl) {
      //If the same track is clicked
      if (isPlaying) {
        audio.pause();
        dispatch(setIsPlaying(false)); //Update Redux
      } else {
        audio.play(); //Resume playing.
        dispatch(setIsPlaying(true)); //Update Redux 
      }
    } else {
      //If a new track is selected
      audio.src = track.fileUrl; //Set the new track URL
      audio.play(); //Start playing.
      dispatch(setCurrentTrack(track)); //Update Redux with the current track.
      dispatch(setIsPlaying(true)); //Update Redux state to playing.

      //Increment listeners if the track hasn’t been played before.
      if (!playedSongs.has(track._id || track.fileUrl)) {
        incrementListeners(track._id || track.fileUrl); //Call increment.
        setPlayedSongs((prev) => new Set(prev).add(track._id || track.fileUrl)); //Add to played songs
      }
    }
  };

  //Function to toggle liking a track.
  const handleLike = async (trackId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !trackId) return;

    const isCurrentlyLiked = likedSongs.has(trackId); //if the track is already liked

    try {
      //toggle the like status.
      const response = await axios.post(
        `http://localhost:3000/user/toggle-like?userId=${user?._id}`,
        { trackId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log(response.data, "ith an correct");
        dispatch(saveSignupData(response.data.user)); //Update Redux with new data
        //Update likedSongs state locally.
        setLikedSongs((prev) => {
          const newLiked = new Set(prev);
          if (isCurrentlyLiked) {
            newLiked.delete(trackId); //Unlike the track
          } else {
            newLiked.add(trackId); //Like the track.
          }
          return newLiked;
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  //toggle preview modal visibility.
  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState); //Toggle the isModal
  };

  //generate shuffled indices for tracks.
  const generateShuffleIndices = () => {
    const indices = Array.from({ length: tracks.length }, (_, i) => i); //[0, 1, 2, ...].
    for (let i = indices.length - 1; i > 0; i--) {
      //Fisher-Yates shuffle algorithm.
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]; //swap
    }
    return indices; //shuffled indices.
  };

  //skip to the next track.
  const handleSkipForward = () => {
    if (!currentTrack || tracks.length === 0) return; //Exit if no track is playing or no tracks exist
    if (isShuffled) {
      //If shuffle is on
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length; //Get next index (loop back if at end).

      dispatch(setCurrentShuffleIndex(nextShuffleIndex)); //Update Redux with new shuffle index.
      handlePlay(tracks[shuffleIndices[nextShuffleIndex]]); //Play the next shuffled track.
    } else {
      //shuffle is disabled...
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl); //Find current track index.
      const nextIndex = (currentIndex + 1) % tracks.length; //Get next index (loop back if at end).
      handlePlay(tracks[nextIndex]); //Play the next track.
    }
  };

  //Function to skip to the previous track.
  const handleSkipBack = () => {
    if (!currentTrack || tracks.length === 0) return; //Exit if no track is playing or no tracks exist
    if (isShuffled) {
      //If shuffle is enabled
      const prevShuffleIndex = currentShuffleIndex === 0 ? shuffleIndices.length - 1 : currentShuffleIndex - 1; //Get previous index.
      dispatch(setCurrentShuffleIndex(prevShuffleIndex)); //Update Redux with new shuffle index.
      handlePlay(tracks[shuffleIndices[prevShuffleIndex]]); //Play the previous shuffled track.
    } else {
      //If shuffle is disabled...
      const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl); //Find current track index.
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1; //Get previous index (loop back if at start).
      handlePlay(tracks[prevIndex]); //Play the previous track.
    }
  };

  //Function to toggle shuffle mode.
  const handleToggleShuffle = () => {
    dispatch(toggleShuffle()); //Toggle shuffle state in Redux.
    if (!isShuffled) {
      const newShuffleIndices = generateShuffleIndices(); //Generate new shuffled indices.
      dispatch(setShuffleIndices(newShuffleIndices)); //Update Redux with shuffle indices.
      if (currentTrack) {
        //If a track is playing...
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack.fileUrl); //Find current track index.
        dispatch(setCurrentShuffleIndex(newShuffleIndices.indexOf(currentIndex))); //Set the current shuffle index.
      }
    }
  };

  //Function to toggle repeat mode.
  const handleToggleRepeat = () => {
    dispatch(toggleRepeat()); //Toggle repeat state in Redux.
    audio.loop = !isRepeating; //Set the audio loop property (true if enabling repeat).
  };

  //Effect to handle what happens when a track ends.
  useEffect(() => {
    const handleEnded = () => {
      if (isRepeating) {
        //If repeat is enabled...
        audio.currentTime = 0; //Reset to start.
        audio.play(); //Replay the track.
      } else if (isShuffled) {
        //If shuffle is enabled...
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length; //Get next shuffled index.
        dispatch(setCurrentShuffleIndex(nextShuffleIndex)); //Update Redux.
        handlePlay(tracks[shuffleIndices[nextShuffleIndex]]); //Play next shuffled track.
      } else {
        //If neither repeat nor shuffle is enabled...
        const currentIndex = tracks.findIndex((track) => track.fileUrl === currentTrack?.fileUrl); //Find current track index.
        const nextIndex = (currentIndex + 1) % tracks.length; //Get next index (loop back if at end).
        handlePlay(tracks[nextIndex]); //Play the next track.
      }
    };
    audio.addEventListener("ended", handleEnded); //Add event listener for when audio ends.
    return () => audio.removeEventListener("ended", handleEnded); //Cleanup listener on unmount.
  }, [audio, isRepeating, isShuffled, currentShuffleIndex, tracks, currentTrack, dispatch]); //Dependencies for effect.

  //Function to handle logout.
  const handleClick = () => {
    audio.pause();
    audio.src = "";
    localStorage.removeItem("token");
    dispatch(clearSignupData()); //Clear user data from Redux.
    dispatch(clearAudioState()); //Clear audio state from Redux.
    navigate("/", { replace: true }); //Navigate to root route and replace history.
  };

  //Placeholder text for the search input.
  const placeholders = ["Cout me out?", "What's the first rule of Fight Club?", "Send me an angel"];
  //Handle search input change (currently just logs the value).
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value);
  //Handle search form submission (currently just logs "submitted").
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  //Slice tracks into "New Arrivals" (first 5) and "Explore More" (rest).
  const newArrivals = tracks.slice(0, 5);
  const otherSongs = tracks.slice(5);
  //Memoized random index for selecting a featured track.
  const randomIndex = useMemo(() => Math.floor(Math.random() * tracks.length), [tracks]); //Recalculates when tracks change.


  const handleUpgradeClick = () => {
    navigate("/plans");
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 bg-black overflow-y-auto">
          <header className="flex justify-between items-center p-4 sticky top-0 bg-black z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} />
            </div>
            <button className="p-2 hover:bg-[#242424] rounded-full" onClick={handleClick}>
              <Power size={20} /> {/* Power icon for logout */}
            </button>
          </header>

          <section className="px-6 py-4 pb-25">
            <div className="mb-8">
              {user?.premium ? (
                <>
                  <h2 className="text-3xl font-bold mb-4 font-sans">Featured Today</h2>
                  <div
                    className="relative w-full h-[300px] bg-[#1d1d1d] rounded-lg overflow-hidden cursor-pointer shadow-lg"
                    onClick={() => tracks[randomIndex] && handlePlay(tracks[randomIndex])} //Play random track on click
                  >
                    <img
                      src={tracks[randomIndex]?.img}
                      alt="Featured Banner"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent shadow-inner z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <button className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <Play size={32} className="text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-2xl font-bold text-white shadow-text">
                        {tracks[randomIndex]?.title || "Featured Track"}
                      </h3>
                      <p className="text-gray-300 shadow-text">
                        {Array.isArray(tracks[randomIndex]?.artist)
                          ? tracks[randomIndex]?.artist.join(", ")
                          : tracks[randomIndex]?.artist || "Various Artists"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Enhance Your Experience</h2>
                  <div
                    className="relative w-full h-[300px] bg-[#000000] rounded-lg shadow-lg cursor-pointer overflow-hidden"
                    onClick={handleUpgradeClick}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent shadow-inner z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="overflow-visible w-full h-full flex items-center justify-center">
                        <WavyBackground
                          className="w-full h-[400px] flex flex-col items-center justify-center"
                          style={{ transform: "translateY(-50px)" }}                        >
                          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
                            Listen. Discover. Repeat
                          </p>
                          <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
                            Hear your music in the best-in-class sound.
                          </p>
                        </WavyBackground>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* New Arrivals section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
              {loading ? ( //Show loading message if tracks are still fetching
                <div className="text-center py-4">Loading tracks...</div>
              ) : (
                
                //Grid layout for new arrivals
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {newArrivals.map((track, index) => ( //Map over the first 5 tracks
                    <div
                      key={index} //Use index as key (not ideal, better to use track._id if unique)
                      className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                    >
                      <div className="w-full h-[200px] flex flex-col mb-3">
                        <div className="relative w-full h-[90%]">
                          <img
                            src={track.img || "/placeholder.svg"} 
                            alt="Track Cover Top"
                            className="w-full h-full object-cover rounded-t-md"
                          />
                          
                          {/* Play/pause button (visible on hover) */}
                          <button
                            onClick={() => handlePlay(track)} //Play or pause the track
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-t-md"
                          >
                            {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                              <Pause size={24} className="text-white" /> //Show pause if playing
                            ) : (
                              <Play size={24} className="text-white" /> //Show play if not playing
                            )}
                          </button>
                        </div>
                        {/* Blurred bottom image */}
                        <img
                          src={track.img || "/placeholder.svg"}
                          alt="Track Cover Bottom"
                          className="w-full h-[10%] object-cover rounded-b-md blur-lg"
                        />
                      </div>
                      <div className="text-white font-semibold truncate">{track.title}</div>
                      <div className="text-gray-400 text-sm truncate">
                        {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist} 
                      </div>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Plus size={16} /> 
                        </button>
                        <button
                          onClick={() => handleLike(track._id || track.fileUrl)} //Toggle like status
                          className={`p-1 hover:bg-[#333333] rounded-full ${likedSongs.has(track._id || track.fileUrl) ? 'text-red-500' : 'text-white' //Red if liked
                            }`}
                        >
                          <Heart
                            size={16}
                            fill={likedSongs.has(track._id || track.fileUrl) ? 'currentColor' : 'none'} //Filled if liked
                          />
                        </button>
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <MoreHorizontal size={16} /> 
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explore More section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Explore More</h2>
              {loading ? ( //Show loading message if tracks are still fetching
                <div className="text-center py-4">Loading tracks...</div>
              ) : (
                //Grid layout for remaining tracks
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {otherSongs.map((track, index) => ( //Map over remaining tracks
                    <div
                      key={index} //Use index as key (not ideal, better to use track._id if unique)
                      className="group bg-[#1d1d1d] rounded-lg p-4 hover:bg-[#242424] transition-colors flex flex-col"
                    >
                      {/* Track image container */}
                      <div className="w-full h-[200px] flex flex-col mb-3">
                        <div className="relative w-full h-[90%]">
                          <img
                            src={track.img || "/placeholder.svg"} //Track image or fallback
                            alt="Track Cover Top"
                            className="w-full h-full object-cover rounded-t-md"
                          />
                          {/* Play/pause button (visible on hover) */}
                          <button
                            onClick={() => handlePlay(track)} //Play or pause the track
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-t-md"
                          >
                            {currentTrack?.fileUrl === track.fileUrl && isPlaying ? (
                              <Pause size={24} className="text-white" /> //Show pause if playing
                            ) : (
                              <Play size={24} className="text-white" /> //Show play if not playing
                            )}
                          </button>
                        </div>
                        {/* Blurred bottom image */}
                        <img
                          src={track.img || "/placeholder.svg"}
                          alt="Track Cover Bottom"
                          className="w-full h-[10%] object-cover rounded-b-md blur-lg"
                        />
                      </div>
                      <div className="text-white font-semibold truncate">{track.title}</div>
                      <div className="text-gray-400 text-sm truncate">
                        {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist} 
                      </div>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <Plus size={16} /> 
                        </button>
                        <button
                          onClick={() => handleLike(track._id || track.fileUrl)} //Toggle like status
                          className={`p-1 hover:bg-[#333333] rounded-full ${likedSongs.has(track._id || track.fileUrl) ? 'text-red-500' : 'text-white' //Red if liked
                            }`}
                        >
                          <Heart
                            size={16}
                            fill={likedSongs.has(track._id || track.fileUrl) ? 'currentColor' : 'none'} //Filled if liked
                          />
                        </button>
                        <button className="p-1 hover:bg-[#333333] rounded-full">
                          <MoreHorizontal size={16} /> 
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Render bottom bar if a track is selected */}
      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack} //Pass the current track
          isPlaying={isPlaying} //Pass playback status
          handlePlay={handlePlay} //Pass play/pause func
          handleSkipBack={handleSkipBack} //Pass skip back func
          handleSkipForward={handleSkipForward} //Pass skip forward func
          toggleShuffle={handleToggleShuffle} //Pass shuffle toggle func
          toggleRepeat={handleToggleRepeat} //Pass repeat toggle func
          isShuffled={isShuffled} //Pass shuffle status
          isRepeating={isRepeating} //Pass repeat status
          audio={audio} //Pass audio object
          toggleModal={toggleModal} //Pass modal toggle fun
        />
      )}

      {/* Render PreviewModal if a track is selected */}
      {currentTrack && (
        <PreviewModal
          track={currentTrack} //Pass the current track
          isOpen={isModalOpen} //Pass modal open status
          toggleModal={toggleModal} //Pass modal toggle function
        />
      )}
    </div>
  );
}