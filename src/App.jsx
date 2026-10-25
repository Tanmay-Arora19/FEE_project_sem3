import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive, Bell, CircleArrowDown, Clock3, Download, FolderOpen, Heart,
  House, List, ListMusic, Maximize, Maximize2, Monitor, MonitorSmartphone,
  MoreHorizontal, Music2, Pause, PenLine, Play, Plus, Search, Shuffle,
  SkipBack, SkipForward, UsersRound, Volume2, VolumeX, X, Check, Laptop,
  Smartphone, Speaker, Settings, Sliders, Shield, Info, Share2, Copy
} from 'lucide-react'
import { trackById as sampleTrackById, playlists, tracks as sampleTracks } from './data/musicData'
import { lyricsByTrackId } from './data/lyricsData'
import { podcasts } from './data/podcastData'
import { usePlayer } from './player/usePlayer'
import TrackArtwork from './components/TrackArtwork'
import { logoutDemoAccount, readDemoSession } from './auth/demoAuth'
import PublicExperience from './PublicExperience'
import './App.css'

const shortcuts = [
  ['Said & Done', 'shortcut-said-done', 'deewaana'],
  ['VIBE', 'shortcut-vibe', 'vibe'],
  ['Kaali Hoodie', 'shortcut-kaali-hoodie', 'ishqa-ve'],
  ['Barsaat Radio', 'shortcut-barsaat-radio', 'barsaat'],
  ['OG', 'shortcut-og', 'vibe'],
  ['Apollo', 'shortcut-apollo', 'itni-si-baat'],
  ['Arjan Dhillon Radio', 'shortcut-arjan-radio', 'dil-evr'],
  ['AJULA SZN 1', 'shortcut-ajula', 'ishq-mubarak'],
]

const stations = [
  ['Real Bad Man', 'With Karan Aujla, Navaan Sandhu, Ankit Tiwari...', 'radio-real-bad-man', 'galliyan'],
  ['Alvida Alvida (From "Dar-E-Nijaat")', 'With Nabeel Shaukat Ali, Wajhi Farooqi, Jubin Nautiyal...', 'radio-alvida', 'humnava-mere'],
  ['Bhalwaan', 'With Otaal, Signature By SB, Prem Dhillon, Zeeshan Ali...', 'radio-bhalwaan', 'ishqa-ve'],
  ['Taare', 'With Farak, Aditya Pushkarna, Arijit Singh and more', 'radio-taare', 'itni-si-baat'],
  ['Jordan Sandhu', 'With Prem Dhillon, Navaan Sandhu, Raghav Chaitanya...', 'radio-jordan', 'dil-evr'],
  ['Romantic Classics', 'With Arijit Singh, A.R. Rahman, Jubin Nautiyal...', 'playlist-vibe', 'deewaana'],
  ['Monsoon Melodies', 'With Banjaare, Roni, Arijit Singh...', 'shortcut-barsaat-radio', 'barsaat'],
  ['Spiritual Devotion', 'With Bhai Surinder Singh Ji Jodhpuri...', 'shortcut-og', 'ghol-ghumai'],
]

const defaultLibrary = [
  ['Liked Songs', 'Playlist · 54 songs', null, 'liked', 'playlists'],
  ['OG', 'Playlist · Jaskaran Singh', 'library-og', 'vibe', 'playlists'],
  ['VIBE', 'Playlist · Jaskaran Singh', 'library-vibe', 'vibe', 'playlists'],
  ['TOP 50 PUNJABI SONGS 2026', 'Playlist · SpiceUp', 'library-top50', 'vibe', 'playlists'],
  ['Arjan Dhillon', 'Artist', 'library-arjan', 'artist-arjan', 'artists'],
  ['My top tracks playlist', 'Playlist · Jaskaran Singh', 'library-toptracks', 'vibe', 'playlists'],
  ['Young G.O.A.T', 'Playlist · Jaskaran Singh', 'shortcut-ajula', 'vibe', 'playlists'],
]

const formatTime = (value = 0) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`
const publicRoutes = new Set(['public', 'login', 'signup', 'premium', 'support', 'download', 'account', 'legal', 'safety', 'privacy', 'cookies', 'ads', 'accessibility', 'cookie-settings'])
const playerRoutes = new Set(['home', 'vibe', 'liked', 'local'])

const readPlayerRoute = () => {
  const hashRoute = location.hash.slice(1)
  const route = hashRoute.startsWith('/playlist/') ? hashRoute.slice('/playlist/'.length) : hashRoute
  return playerRoutes.has(route) || route.startsWith('custom-') || route.startsWith('artist-') ? route : null
}

const readPublicRoute = () => {
  const view = new URLSearchParams(location.search).get('view')
  if (view === 'player') return null
  if (publicRoutes.has(view)) return view
  if (readPlayerRoute()) return null
  return 'public'
}

function SpotifyMark() {
  return <svg className="spotify-mark" viewBox="0 0 40 40" aria-label="Pulsewave" role="img"><circle cx="20" cy="20" r="20" fill="currentColor"/><path d="M9 14.2c7.8-2.3 16.4-1.7 22.2 1.7M10.2 20c6.8-1.8 14.2-1.3 19.7 1.5M11.5 25.5c5.5-1.4 11.6-.9 16.3 1.3" fill="none" stroke="#000" strokeWidth="2.25" strokeLinecap="round"/></svg>
}

function Artwork({ track, className = '' }) {
  return <TrackArtwork track={track} className={className} placeholderClassName={`track-art-placeholder ${className}`}/>
}

function TrackTable({ items, onPlay, likedIds, toggleLike, addToQueue, compact = false }) {
  const [hovered, setHovered] = useState(null)
  return <div className={`track-table ${compact ? 'is-compact-table' : ''}`}>
    <div className="track-table-head"><span>#</span><span>Title</span><span>Album</span><span>Date added</span><span><Clock3 size={17}/></span></div>
    {items.map((track, index) => <div className={`track-row ${hovered === track.id ? 'hovered' : ''}`} key={track.id} onMouseEnter={() => setHovered(track.id)} onMouseLeave={() => setHovered(null)}>
      <button className="row-number" onClick={() => onPlay(track.id, items.map((item) => item.id))} aria-label={`Play ${track.title}`}>{hovered === track.id ? <Play size={16} fill="currentColor"/> : index + 1}</button>
      <div className="row-title"><Artwork track={track}/><div><button onClick={() => onPlay(track.id, items.map((item) => item.id))}>{track.title}</button>{track.artist && <span>{track.artist}</span>}</div></div>
      <span className="row-album">{track.album || '—'}</span><span className="row-date">{track.added || '—'}</span>
      <div className="row-actions"><button aria-label={likedIds.includes(track.id) ? 'Unlike song' : 'Like song'} className={likedIds.includes(track.id) ? 'liked' : ''} onClick={() => toggleLike(track.id)}><Heart size={18} fill={likedIds.includes(track.id) ? 'currentColor' : 'none'}/></button><button aria-label="Add to queue" onClick={() => addToQueue(track.id)}><MoreHorizontal size={20}/></button><span>{track.duration || '—'}</span></div>
    </div>)}
  </div>
}

function HomePage({ navigate, playTrack, likedIds, toggleLike, addToQueue, searchQuery, allTracks, recentTrackIds, chip, setChip }) {
  const [stationsExpanded, setStationsExpanded] = useState(false)
  const found = searchQuery.trim() ? allTracks.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.filename || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) : []

  if (searchQuery.trim()) {
    return <div className="home-content search-results">
      <div className="section-heading"><h1>Search results</h1></div>
      {found.length ? <TrackTable items={found} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue}/> : <p className="empty-message">No results found for “{searchQuery}”.</p>}
    </div>
  }

  const handleShortcutClick = (name, action) => {
    if (action === 'vibe') navigate('vibe')
    else if (sampleTrackById[action]) playTrack(action, allTracks.map((t) => t.id))
    else navigate('vibe')
  }

  const handleStationPlay = (trackId) => {
    if (trackId && sampleTrackById[trackId]) {
      playTrack(trackId, allTracks.map((t) => t.id))
    } else {
      navigate('vibe')
    }
  }

  const visibleStations = stationsExpanded ? stations : stations.slice(0, 5)

  return <div className="home-content">
    <div className="chips">
      <button className={chip === 'all' ? 'selected' : ''} onClick={() => setChip('all')}>All</button>
      <button className={chip === 'music' ? 'selected' : ''} onClick={() => setChip('music')}>Music</button>
      <button className={chip === 'podcasts' ? 'selected' : ''} onClick={() => setChip('podcasts')}>Podcasts</button>
    </div>

    {chip === 'podcasts' ? (
      <section className="podcasts-section">
        <div className="section-heading"><h1>Popular Podcasts</h1></div>
        <p className="eyebrow">Hand-picked audio shows, stories, and deep conversations.</p>
        <div className="podcasts-grid">
          {podcasts.map((pod) => (
            <div className="podcast-card" key={pod.id}>
              <img src={pod.artwork} alt={pod.title}/>
              <b>{pod.title}</b>
              <p>{pod.description}</p>
              <div className="podcast-episodes">
                {pod.episodes.map((ep) => (
                  <button className="podcast-ep-btn" key={ep.id} onClick={() => playTrack(ep.trackId, allTracks.map((t) => t.id))}>
                    <span>▶ {ep.title}</span>
                    <small>{ep.duration}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : (
      <>
        <div className="shortcut-grid">
          {shortcuts.map(([name, artwork, action]) => (
            <div className="shortcut" key={name} onClick={() => handleShortcutClick(name, action)}>
              <img src={`/artwork/${artwork}.png`} alt=""/>
              <b>{name}</b>
              <button className="shortcut-play-btn" aria-label={`Play ${name}`} onClick={(e) => { e.stopPropagation(); handleShortcutClick(name, action) }}>
                <Play size={18} fill="black"/>
              </button>
            </div>
          ))}
        </div>

        <section className="station-section">
          <p className="eyebrow">Non-stop music based on your favorite songs and artists.</p>
          <div className="section-heading">
            <h1>Recommended Stations</h1>
            <button onClick={() => setStationsExpanded(!stationsExpanded)}>{stationsExpanded ? 'Show less' : 'Show all'}</button>
          </div>
          <div className="station-row">
            {visibleStations.map(([name, detail, artwork, trackId]) => (
              <div className="station" key={name} onClick={() => handleStationPlay(trackId)}>
                <div className="station-art-wrap">
                  <img src={artwork.startsWith('shortcut-') || artwork.startsWith('playlist-') ? `/artwork/${artwork}.png` : `/artwork/${artwork}.png`} alt=""/>
                  <button className="station-hover-play" aria-label={`Play station ${name}`} onClick={(e) => { e.stopPropagation(); handleStationPlay(trackId) }}>
                    <Play size={22} fill="black"/>
                  </button>
                </div>
                <b>{name}</b>
                <p>{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="jump-section">
          <div className="section-heading"><h2>Jump back in</h2></div>
          {recentTrackIds.length ? (
            <div className="home-track-cards">
              {recentTrackIds.map((id) => allTracks.find((track) => track.id === id)).filter(Boolean).map((track) => (
                <button key={track.id} onClick={() => playTrack(track.id, allTracks.map((t) => t.id))}>
                  <Artwork track={track}/>
                  <span>{track.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="recent-empty">Play a song to see it here.</p>
          )}
        </section>
      </>
    )}
  </div>
}

function LocalMusicPage({ localTracks, playTrack, likedIds, toggleLike, addToQueue, onImport }) {
  return <div className="home-content local-music-page">
    <div className="section-heading">
      <h1>Local Music</h1>
      <button className="pw-btn-primary" onClick={onImport} style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
        <FolderOpen size={18}/> Import Folder
      </button>
    </div>
    <p className="eyebrow">{localTracks.length} imported {localTracks.length === 1 ? 'track' : 'tracks'} · stored securely in your browser cache</p>
    {localTracks.length ? (
      <TrackTable items={localTracks} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue}/>
    ) : (
      <div style={{padding:'40px 0',textAlign:'center'}}>
        <p className="empty-message">Import a local music directory from your computer to play your personal MP3, M4A, FLAC, and WAV files directly inside Pulsewave.</p>
        <button className="pw-btn-primary" onClick={onImport} style={{marginTop:'12px'}}>Choose Music Folder</button>
      </div>
    )}
  </div>
}

function PlaylistPage({ liked, items, playTrack, setShuffle, likedIds, toggleLike, addToQueue, title, desc, onEditDetails, showToast, onImport }) {
  const vibe = playlists.vibe
  const list = liked ? items : vibe.trackIds.map((id) => sampleTrackById[id]).filter(Boolean)
  const [filter, setFilter] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [collabOpen, setCollabOpen] = useState(false)
  const [compactTable, setCompactTable] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const shown = list.filter((track) => !filter || `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(filter.toLowerCase()))
  const ids = shown.map((track) => track.id)
  const total = list.reduce((sum, track) => sum + (track.seconds || 0), 0)

  const handleDownload = () => {
    setDownloaded(!downloaded)
    showToast(downloaded ? 'Removed offline playlist download.' : 'Playlist downloaded for high-fidelity offline listening.')
  }

  const handleMix = () => {
    setShuffle(true)
    if (ids.length) {
      const shuffled = [...ids].sort(() => Math.random() - 0.5)
      playTrack(shuffled[0], shuffled)
      showToast('Mixed playlist order.')
    }
  }

  return <div className={`playlist-page ${liked ? 'liked-page' : 'vibe-page'}`}>
    <div className="playlist-hero">
      <div className={liked ? 'liked-cover' : 'playlist-cover'}>
        {liked ? <img src="/artwork/playlist-liked.png" alt="Liked Songs artwork"/> : <img src={vibe.artwork} alt="Playlist artwork"/>}
      </div>
      <div className="playlist-meta">
        <span>{liked ? 'Playlist' : 'Public Playlist'}</span>
        <h1>{liked ? 'Liked Songs' : title || 'VIBE'}</h1>
        {desc && <p style={{color:'#b3b3b3',fontSize:'15px',margin:'0 0 10px'}}>{desc}</p>}
        <div className="playlist-owner">
          <img src="/artwork/profile-user.png" alt=""/>
          <b>Jaskaran Singh</b>
          <span>· {liked ? `${list.length} songs, ${list.length ? `about ${Math.floor(total / 3600)} hr ${Math.round((total % 3600) / 60)} min` : 'your music library'}` : '54 songs, about 3 hr 45 min'}</span>
        </div>
      </div>
    </div>

    <div className="playlist-tools" style={{position:'relative'}}>
      <button className="large-play" aria-label="Play playlist" onClick={() => ids[0] && playTrack(ids[0], ids)}>
        <Play size={25} fill="black"/>
      </button>
      {!liked && <img className="playlist-mini-art" src={vibe.artwork} alt=""/>}
      <button className="playlist-shuffle" onClick={() => { setShuffle(true); if (ids.length) playTrack(ids[Math.floor(Math.random() * ids.length)], ids) }} aria-label="Shuffle playlist">
        <Shuffle size={21}/>
      </button>
      <button className={`playlist-download ${downloaded ? 'enabled' : ''}`} aria-label="Download" onClick={handleDownload} style={{color: downloaded ? '#1ed760' : '#b3b3b3'}}>
        <Download size={22}/>
      </button>
      {!liked && <button aria-label="Collaborators" onClick={() => setCollabOpen(!collabOpen)}>
        <UsersRound size={23}/>
      </button>}
      <button className="playlist-more" aria-label="More options" onClick={() => setMoreOpen(!moreOpen)}>
        <MoreHorizontal size={26}/>
      </button>

      {/* Collaborators Popover */}
      {collabOpen && (
        <div className="pw-popover" style={{left:'160px',top:'80px',width:'280px',padding:'14px'}}>
          <b style={{display:'block',marginBottom:'8px',fontSize:'15px'}}>Playlist Collaborators</b>
          <p style={{fontSize:'13px',color:'#b3b3b3',margin:'0 0 10px'}}>Friends can add, remove, and reorder tracks in this playlist.</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}>
              <img src="/artwork/profile-user.png" alt="" style={{width:'24px',height:'24px',borderRadius:'50%'}}/>
              <span>Jaskaran Singh (Owner)</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}>
              <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'#333',display:'grid',placeItems:'center',fontSize:'11px',fontWeight:'bold'}}>T</div>
              <span>Tanmay Arora</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}>
              <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'#333',display:'grid',placeItems:'center',fontSize:'11px',fontWeight:'bold'}}>A</div>
              <span>Ansh Arora</span>
            </div>
          </div>
          <button className="pw-btn-secondary" style={{width:'100%',textAlign:'center',padding:'8px'}} onClick={() => { setCollabOpen(false); showToast('Collaborator invite link copied to clipboard!') }}>
            Copy Invite Link
          </button>
        </div>
      )}

      {/* More Options Popover */}
      {moreOpen && (
        <div className="pw-popover" style={{left:'210px',top:'80px',width:'220px'}}>
          <button onClick={() => { ids.forEach((id) => addToQueue(id)); setMoreOpen(false); showToast('Added all playlist tracks to Queue!') }}>
            <List size={18}/> Add to queue
          </button>
          <button onClick={() => { setMoreOpen(false); showToast('Playlist link copied to clipboard!') }}>
            <Copy size={18}/> Copy link
          </button>
          <button onClick={() => { setMoreOpen(false); showToast('Shared playlist!') }}>
            <Share2 size={18}/> Share
          </button>
          <button onClick={() => { setMoreOpen(false); handleDownload() }}>
            <Download size={18}/> {downloaded ? 'Remove download' : 'Download playlist'}
          </button>
        </div>
      )}

      <div className="playlist-view-tools">
        {liked ? (
          <>
            <Search size={20}/>
            <input aria-label="Filter liked songs" placeholder="Search in playlist" value={filter} onChange={(event) => setFilter(event.target.value)}/>
          </>
        ) : (
          <button aria-label="List view" onClick={() => setCompactTable(!compactTable)}>
            <span>{compactTable ? 'Compact' : 'List'}</span>
            <List size={21}/>
          </button>
        )}
      </div>
    </div>

    {!liked && (
      <div className="playlist-subtools">
        <button onClick={onImport}><Plus size={21}/>Add</button>
        <button onClick={handleMix}><List size={19}/>Mix</button>
        <button onClick={onEditDetails}><PenLine size={19}/>Name & details</button>
      </div>
    )}

    <TrackTable items={shown} onPlay={playTrack} likedIds={likedIds} toggleLike={toggleLike} addToQueue={addToQueue} compact={compactTable}/>
  </div>
}

function LibraryPanel({ expanded, setExpanded, page, go, libraryItems, player, onImport, folderFallback, onCreatePlaylist, filter, setFilter, sort, setSort }) {
  const listRef = useRef(null)
  const listScrollTop = useRef(0)

  useEffect(() => {
    if (expanded && listRef.current) listRef.current.scrollTop = listScrollTop.current
  }, [expanded])

  const filteredItems = useMemo(() => {
    let list = libraryItems
    if (filter === 'playlists') list = list.filter((item) => item[4] === 'playlists')
    else if (filter === 'artists') list = list.filter((item) => item[4] === 'artists')
    else if (filter === 'albums') list = list.filter((item) => item[4] === 'albums')

    if (sort === 'alphabetical') {
      return [...list].sort((a, b) => a[0].localeCompare(b[0]))
    }
    return list
  }, [libraryItems, filter, sort])

  const notice = player.importing || player.importError || player.importStatus || player.needsReimport || folderFallback

  const content = filteredItems.map(([name, description, artwork, destination]) => (
    <button className={`library-item ${page === destination ? 'selected' : ''}`} key={name} aria-label={name} title={name} onClick={() => destination && go(destination)}>
      <div className={`library-art ${!artwork ? 'liked-art' : ''}`}>
        {artwork ? (
          <img src={artwork.startsWith('shortcut-') || artwork.startsWith('library-') ? `/artwork/${artwork}.png` : `/artwork/${artwork}.png`} alt=""/>
        ) : destination === 'local' ? (
          <span className="local-library-art"><Music2 size={25}/></span>
        ) : (
          <svg viewBox="0 0 60 60"><defs><linearGradient id="liked" x2="1" y2="1"><stop stopColor="#591bfa"/><stop offset="1" stopColor="#a8dbc5"/></linearGradient></defs><rect width="60" height="60" fill="url(#liked)"/><path d="M30 44 14 28c-9-12 6-23 16-11 10-12 25-1 16 11z" fill="white"/></svg>
        )}
      </div>
      <div className="library-copy">
        <b>{name}</b>
        <span>{description}</span>
      </div>
    </button>
  ))

  return <aside className="library-panel">
    {expanded ? <>
      <div className="library-heading">
        <strong>Your Library</strong>
        <button onClick={onCreatePlaylist}><Plus size={22}/>Create</button>
        <button className="expand-icon" onClick={() => setExpanded(false)} aria-label="Collapse library"><Maximize2 size={18}/></button>
      </div>
      <div className="library-filters">
        <button className={filter === 'playlists' ? 'selected' : ''} onClick={() => setFilter(filter === 'playlists' ? 'all' : 'playlists')}>Playlists</button>
        <button className={filter === 'artists' ? 'selected' : ''} onClick={() => setFilter(filter === 'artists' ? 'all' : 'artists')}>Artists</button>
        <button className={filter === 'albums' ? 'selected' : ''} onClick={() => setFilter(filter === 'albums' ? 'all' : 'albums')}>Albums</button>
      </div>
      <div className="library-tools">
        <button className="import-music-button" aria-label="Import Music" onClick={onImport}><FolderOpen size={18}/><span>Import Music</span></button>
        <button className="library-recents" style={{background:'none',color:'#b3b3b3',border:'0',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'4px'}} onClick={() => setSort(sort === 'recents' ? 'alphabetical' : 'recents')}>
          <span>{sort === 'recents' ? 'Recents' : 'A-Z'}</span>
          <List size={18}/>
        </button>
      </div>
      {notice && <div className={`music-import-notice ${player.importError ? 'has-error' : ''}`}>{folderFallback && !player.importError ? 'Choose your local music folder in the dialog. Files stay in place.' : player.importing ? player.importStatus || 'Importing audio files…' : player.importError || player.importStatus || 'Re-import your music folder to restore local tracks.'}{player.needsReimport && <button onClick={onImport}>Import again</button>}</div>}
      <div className="library-list" ref={listRef} onScroll={(event) => { listScrollTop.current = event.currentTarget.scrollTop }}>{content}</div>
    </> : <>
      <div className="compact-tools">
        <button onClick={() => setExpanded(true)} aria-label="Expand library"><ListMusic size={26}/></button>
        <button onClick={onCreatePlaylist} aria-label="Create Playlist" title="Create Playlist"><Plus size={25}/></button>
      </div>
      <div className="compact-list">
        {filteredItems.map(([name,,artwork,destination]) => (
          <button key={name} aria-label={name} onClick={() => destination ? go(destination) : setExpanded(true)}>
            {artwork ? <img src={`/artwork/${artwork}.png`} alt=""/> : destination === 'local' ? <span className="compact-liked"><Music2 size={23}/></span> : <span className="compact-liked"><Heart fill="white" strokeWidth={0}/></span>}
          </button>
        ))}
      </div>
    </>}
  </aside>
}

function App() {
  const player = usePlayer()
  const folderInputRef = useRef(null)
  const narrowLayoutRef = useRef(window.innerWidth <= 850)

  const [publicRoute, setPublicRoute] = useState(readPublicRoute)
  const [demoSession, setDemoSession] = useState(readDemoSession)
  const [expanded, setExpanded] = useState(() => !['vibe', 'liked', 'local'].includes(readPlayerRoute()))
  const [rightView, setRightView] = useState(() => readPlayerRoute() === 'liked' || window.innerWidth <= 850 ? 'none' : 'now')
  const [accountOpen, setAccountOpen] = useState(false)
  const [page, setPage] = useState(() => readPlayerRoute() || 'home')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [folderFallback, setFolderFallback] = useState(false)

  // Interactive UI features
  const [chip, setChip] = useState('all')
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [librarySort, setLibrarySort] = useState('recents')
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulsewave-custom-playlists') || '[]')
    } catch { return [] }
  })
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false)
  const [installModalOpen, setInstallModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [friendActivityOpen, setFriendActivityOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editDetailsOpen, setEditDetailsOpen] = useState(false)
  const [playlistTitle, setPlaylistTitle] = useState('VIBE')
  const [playlistDesc, setPlaylistDesc] = useState('Curated modern hits and soulful tracks.')
  const [toast, setToast] = useState('')

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3200)
  }

  const navigate = (next) => {
    setPage(next)
    setSearch('')
    setSearchOpen(false)
    if (next !== 'home') setExpanded(false)
    if (next === 'liked' || (rightView === 'none' && narrowLayoutRef.current)) setRightView('none')
    else if (next !== 'home' && rightView === 'none') setRightView('now')
  }

  useEffect(() => {
    const onResize = () => {
      const narrow = window.innerWidth <= 850
      if (narrow !== narrowLayoutRef.current) {
        narrowLayoutRef.current = narrow
        setRightView(narrow || readPlayerRoute() === 'liked' ? 'none' : 'now')
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const pop = () => {
      const route = readPublicRoute()
      setPublicRoute(route)
      if (route === null) {
        const next = readPlayerRoute() || 'home'
        setPage(next)
        setExpanded(next === 'home')
        setRightView(next === 'liked' || window.innerWidth <= 850 ? 'none' : 'now')
      }
    }
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])

  const openPublicPage = (route) => {
    history.pushState({}, '', `${location.pathname}?view=${route}`)
    setPublicRoute(route)
  }

  const enterPlayerDemo = (session = null) => {
    if (session?.email) setDemoSession(session)
    history.pushState({}, '', `${location.pathname}?view=player`)
    setPublicRoute(null)
    setPage('home')
    setExpanded(true)
    setRightView(window.innerWidth <= 850 ? 'none' : 'now')
    setSearch('')
    setSearchOpen(false)
  }

  const logout = () => {
    try { logoutDemoAccount() } catch {}
    setDemoSession(null)
    history.pushState({}, '', `${location.pathname}?view=public`)
    setPublicRoute('public')
    showToast('Signed out of Pulsewave.')
  }

  const go = (next) => {
    if (next.startsWith('artist-')) {
      const artist = next.slice('artist-'.length)
      setSearch(artist === 'arjan' ? 'Arjan Dhillon' : artist)
      setPage('home')
      return
    }
    history.pushState({}, '', `${location.pathname}?view=player${next === 'home' ? '' : `#${next}`}`)
    navigate(next)
  }

  const startImport = async () => {
    const handled = await player.chooseMusicFolder()
    setFolderFallback(!handled)
    if (!handled) folderInputRef.current?.click()
  }

  const onFallbackFiles = (event) => {
    if (event.target.files?.length) setFolderFallback(false)
    player.importFileList(event.target.files)
    event.target.value = ''
    showToast('Importing local audio files...')
  }

  const handleCreatePlaylist = () => {
    const newId = `custom-${Date.now()}`
    const newName = `My Playlist #${customPlaylists.length + 1}`
    const updated = [...customPlaylists, { id: newId, name: newName, desc: 'Personal collection', trackIds: [] }]
    setCustomPlaylists(updated)
    try { localStorage.setItem('pulsewave-custom-playlists', JSON.stringify(updated)) } catch {}
    showToast(`Created "${newName}"`)
    go('vibe')
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      showToast('Entered full screen mode.')
    } else {
      document.exitFullscreen().catch(() => {})
      showToast('Exited full screen mode.')
    }
  }

  const likedItems = useMemo(() => player.likedIds.map((id) => player.trackById[id]).filter(Boolean), [player.likedIds, player.trackById])
  const searchMatches = search ? player.tracks.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.filename || ''}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : []

  const libraryItems = [
    ...defaultLibrary,
    ...customPlaylists.map((p) => [p.name, 'Custom Playlist · You', 'library-toptracks', 'vibe', 'playlists']),
    ...(player.localTracks.length ? [['Local Music', `${player.localTracks.length} imported tracks`, null, 'local', 'playlists']] : [])
  ]

  const activeLyrics = player.track?.id ? (lyricsByTrackId[player.track.id] || []) : []

  if (publicRoute) {
    return <PublicExperience
      route={publicRoute}
      navigate={openPublicPage}
      enterPlayerDemo={enterPlayerDemo}
      demoSession={demoSession}
      onLogout={logout}
      onPlayTrack={(trackId) => {
        enterPlayerDemo()
        player.playTrack(trackId, sampleTracks.map((t) => t.id))
      }}
    />
  }

  return <div className="app-shell">
    <input ref={folderInputRef} className="folder-input" type="file" accept="audio/*,.mp3,.m4a,.aac,.flac,.ogg,.oga,.opus,.wav,.webm,.aif,.aiff,.wma" multiple webkitdirectory="" onChange={onFallbackFiles}/>

    {/* Topbar */}
    <header className="topbar">
      <div className="brand" onClick={() => go('home')} style={{cursor:'pointer'}}><SpotifyMark/></div>
      <div className="top-center">
        <button className="home-button" aria-label="Home" onClick={() => go('home')}><House size={28} fill="currentColor" strokeWidth={2.5}/></button>
        <div className="search-box">
          <Search size={26}/>
          <input aria-label="Search your music" placeholder="What do you want to play?" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setPage('home'); setSearchOpen(true) }}/>
          <i></i><Archive size={25} style={{cursor:'pointer'}} onClick={() => go('local')}/>
          {searchOpen && search && (
            <div className="search-dropdown">
              {searchMatches.length ? searchMatches.map((track) => (
                <button key={track.id} onClick={() => { player.playTrack(track.id, player.tracks.map((item) => item.id)); setSearch(''); setSearchOpen(false) }}>
                  <Artwork track={track}/>
                  <span><b>{track.title}</b><small>{track.artist || (track.source === 'local' ? 'Local music' : '')}</small></span>
                  <Play size={17}/>
                </button>
              )) : <p>No results found</p>}
            </div>
          )}
        </div>
      </div>

      <div className="top-actions">
        <button className="install" onClick={() => setInstallModalOpen(true)}><CircleArrowDown size={20}/>Install App</button>
        <button className="icon-button" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={22}/></button>
        <button className={`icon-button friends ${friendActivityOpen ? 'active' : ''}`} aria-label="Friend activity" onClick={() => setFriendActivityOpen(!friendActivityOpen)}><UsersIcon/></button>
        <button className="profile" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account"><img src="/artwork/profile-user.png" alt=""/></button>

        {/* Notifications Popover */}
        {notificationsOpen && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <b>What's New</b>
              <button onClick={() => { setNotificationsOpen(false); showToast('Marked all notifications as read.') }}>Mark read</button>
            </div>
            <div className="notification-item">
              <span style={{fontSize:'20px'}}>🎵</span>
              <div>
                <b>Arijit Singh & Pritam - Itni Si Baat</b>
                <small>Available now with original studio recording.</small>
              </div>
            </div>
            <div className="notification-item">
              <span style={{fontSize:'20px'}}>⚡</span>
              <div>
                <b>Real Bad Man Radio Station</b>
                <small>Curated Punjabi hip-hop non-stop station.</small>
              </div>
            </div>
            <div className="notification-item">
              <span style={{fontSize:'20px'}}>📁</span>
              <div>
                <b>Local Music Directory Import</b>
                <small>Import personal folders with full metadata.</small>
              </div>
            </div>
          </div>
        )}

        {/* Account Menu */}
        {accountOpen && (
          <div className="account-menu">
            {demoSession && <p className="account-session-label">Signed in as {demoSession.email}</p>}
            {[
              ['Public Home', () => openPublicPage('public')],
              ['Account', () => openPublicPage('account')],
              ['Profile', () => setProfileModalOpen(true)],
              ['Recents', () => { go('home'); setChip('all'); showToast('Showing recent playback history.') }],
              ['Support', () => openPublicPage('support')],
              ['Download', () => openPublicPage('download')],
              ['Settings', () => setSettingsModalOpen(true)],
              [demoSession ? 'Log out' : 'Log in', () => demoSession ? logout() : openPublicPage('login')]
            ].map(([item, action]) => (
              <button key={item} onClick={() => { action(); setAccountOpen(false) }}>{item}</button>
            ))}
            <div className="updates">
              <b>Your Updates</b>
              <small>Front End Engineering Semester III<br/>University Project · Chitkara University</small>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Friend Activity Drawer */}
    {friendActivityOpen && (
      <aside className="friend-panel">
        <div className="friend-panel-header">
          <b>Friend Activity</b>
          <button className="pw-modal-close" onClick={() => setFriendActivityOpen(false)}><X size={18}/></button>
        </div>
        <div className="friend-item">
          <div className="friend-avatar">J</div>
          <div className="friend-meta">
            <b>Jaskaran Singh</b>
            <span>Deewaana Deewaana</span>
            <small>● Listening right now</small>
          </div>
        </div>
        <div className="friend-item">
          <div className="friend-avatar">T</div>
          <div className="friend-meta">
            <b>Tanmay Arora</b>
            <span>Galliyan · Ek Villain</span>
            <small>● 5m ago</small>
          </div>
        </div>
        <div className="friend-item">
          <div className="friend-avatar">A</div>
          <div className="friend-meta">
            <b>Ansh Arora</b>
            <span>Humnava Mere</span>
            <small>● 18m ago</small>
          </div>
        </div>
        <div className="friend-item">
          <div className="friend-avatar">V</div>
          <div className="friend-meta">
            <b>Vishal</b>
            <span>Barsaat · Banjaare</span>
            <small>● 1h ago</small>
          </div>
        </div>
      </aside>
    )}

    {/* Workspace */}
    <div className={`workspace ${expanded && page === 'home' ? '' : 'compact'} ${rightView === 'none' ? 'right-hidden' : ''}`}>
      <LibraryPanel
        expanded={expanded}
        setExpanded={setExpanded}
        page={page}
        go={go}
        libraryItems={libraryItems}
        player={player}
        onImport={startImport}
        folderFallback={folderFallback}
        onCreatePlaylist={handleCreatePlaylist}
        filter={libraryFilter}
        setFilter={setLibraryFilter}
        sort={librarySort}
        setSort={setLibrarySort}
      />

      <main className="main-panel">
        {page === 'home' ? (
          <HomePage
            navigate={go}
            playTrack={player.playTrack}
            likedIds={player.likedIds}
            toggleLike={player.toggleLike}
            addToQueue={player.addToQueue}
            searchQuery={search}
            allTracks={player.tracks}
            recentTrackIds={player.recentTrackIds}
            chip={chip}
            setChip={setChip}
          />
        ) : page === 'local' ? (
          <LocalMusicPage
            localTracks={player.localTracks}
            playTrack={player.playTrack}
            likedIds={player.likedIds}
            toggleLike={player.toggleLike}
            addToQueue={player.addToQueue}
            onImport={startImport}
          />
        ) : (
          <PlaylistPage
            liked={page === 'liked'}
            items={likedItems}
            playTrack={player.playTrack}
            setShuffle={player.setShuffle}
            likedIds={player.likedIds}
            toggleLike={player.toggleLike}
            addToQueue={player.addToQueue}
            title={playlistTitle}
            desc={playlistDesc}
            onEditDetails={() => setEditDetailsOpen(true)}
            showToast={showToast}
            onImport={startImport}
          />
        )}
      </main>

      {/* Right panel */}
      {rightView !== 'none' && (
        <aside className={`right-panel ${rightView === 'queue' ? 'queue-panel' : 'now-playing-panel'}`}>
          {rightView === 'now' ? <>
            <h2>Now Playing</h2>
            <Artwork track={player.track} className="now-artwork"/>
            <div className={`now-meta ${player.track ? '' : 'empty'}`}>
              <div className="now-song">
                <div>
                  <b>{player.track?.title || 'Nothing playing'}</b>
                  {player.track && <span>{player.track.artist || (player.track.source === 'local' ? 'Local music' : '')}</span>}
                </div>
                {player.track && (
                  <button className={`green-check like-round ${player.likedIds.includes(player.track.id) ? 'checked' : ''}`} aria-label="Like current track" onClick={() => player.toggleLike(player.track.id)}>
                    <Heart size={17} fill={player.likedIds.includes(player.track.id) ? 'currentColor' : 'none'}/>
                  </button>
                )}
              </div>
              <div className="lyrics-preview" onClick={() => setLyricsOpen(true)} style={{cursor:'pointer'}} title="Click to view full lyrics">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <b>Lyrics Preview</b>
                  <small style={{color:'#1ed760',fontSize:'13px',fontWeight:'bold'}}>Expand</small>
                </div>
                {activeLyrics.length > 0 ? (
                  <p style={{margin:0,fontSize:'14px',color:'#e0e0e0',lineHeight:'1.4',fontStyle:'italic'}}>
                    "{activeLyrics[0].text}"
                  </p>
                ) : (
                  <p style={{margin:0,fontSize:'13px',color:'#b3b3b3'}}>Click to view synchronized song lyrics.</p>
                )}
              </div>
            </div>
          </> : <>
            <div className="queue-heading">
              <b>Queue</b>
              <button onClick={() => setRightView('now')} aria-label="Close queue"><X size={20}/></button>
            </div>
            <p className="queue-note">Up next from your playlist and recommendations</p>
            {player.track ? (
              <>
                <b className="queue-subtitle">Now playing</b>
                <div className="queue-track active">
                  <Artwork track={player.track}/>
                  <div>
                    <b>{player.track.title}</b>
                    <span>Original studio recording · {player.track.artist || 'Local music'}</span>
                  </div>
                </div>
              </>
            ) : <p className="empty-message">Nothing playing.</p>}
            <b className="queue-subtitle next">Next up</b>
            {player.queue.map((id) => {
              const track = player.trackById[id]
              return track && (
                <div className="queue-track" key={id}>
                  <button className="queue-track-main" onClick={() => player.playQueued(id)}>
                    <Artwork track={track}/>
                    <span><b>{track.title}</b><small>{track.artist || (track.source === 'local' ? 'Local music' : '')}</small></span>
                  </button>
                  <button aria-label={`Remove ${track.title} from queue`} onClick={() => player.removeFromQueue(id)}><X size={18}/></button>
                </div>
              )
            })}
            {!player.queue.length && <p className="empty-message">Your queue is empty.</p>}
          </>}
        </aside>
      )}
    </div>

    {/* Bottom Player Bar */}
    <footer className="player-bar">
      <div className={`player-track ${player.track ? '' : 'empty'}`}>
        <Artwork track={player.track}/>
        <div>
          <b>{player.track?.title || 'Choose a song to play'}</b>
          {player.track && <span>{player.track.artist || (player.track.source === 'local' ? 'Local music' : '')}</span>}
        </div>
        {player.track && (
          <button className={`player-like ${player.likedIds.includes(player.track.id) ? 'liked' : ''}`} aria-label="Like track" onClick={() => player.toggleLike(player.track.id)}>
            <Heart size={18} fill={player.likedIds.includes(player.track.id) ? 'currentColor' : 'none'}/>
          </button>
        )}
      </div>

      <div className="playback">
        <div className="transport">
          <button aria-label="Shuffle" className={`shuffle ${player.shuffle ? 'enabled' : ''}`} onClick={() => player.setShuffle(!player.shuffle)}>
            <Shuffle size={21}/>
          </button>
          <button aria-label="Previous" onClick={player.previous}>
            <SkipBack size={21} fill="currentColor"/>
          </button>
          <button className="play-pause" onClick={player.togglePlayback} aria-label={player.playing ? 'Pause' : 'Play'}>
            {player.playing ? <Pause size={22} fill="black"/> : <Play size={22} fill="black"/>}
          </button>
          <button aria-label="Next" onClick={player.next}>
            <SkipForward size={21} fill="currentColor"/>
          </button>
          <button aria-label={player.repeat === 0 ? 'Repeat off' : player.repeat === 1 ? 'Repeat playlist' : 'Repeat track'} className={player.repeat ? 'enabled' : ''} onClick={player.setRepeat}>
            <RepeatStatusIcon/>
          </button>
        </div>
        <div className="timeline">
          <span>{formatTime(player.time)}</span>
          <input aria-label="Playback position" type="range" min="0" max={Math.max(player.duration, 1)} step="0.1" value={Math.min(player.time, player.duration)} onChange={(event) => player.seek(Number(event.target.value))}/>
          <span>{player.duration ? formatTime(player.duration) : '--:--'}</span>
        </div>
        {player.error && <small className="player-audio-note has-error">{player.error}</small>}
      </div>

      <div className="player-tools">
        <button aria-label="Lyrics" className={lyricsOpen ? 'active' : ''} onClick={() => setLyricsOpen(!lyricsOpen)}>
          <PenLine size={19}/>
        </button>
        <button aria-label="Queue" className={rightView === 'queue' ? 'active' : ''} onClick={() => setRightView(rightView === 'queue' ? 'now' : 'queue')}>
          <List size={21}/>
        </button>
        <button aria-label="Toggle Now Playing panel" className={rightView === 'now' ? 'active' : ''} onClick={() => setRightView(rightView === 'none' ? 'now' : 'none')}>
          <Monitor size={20}/>
        </button>
        <button aria-label={player.muted ? 'Unmute' : 'Mute'} onClick={() => player.setMuted(!player.muted)}>
          {player.muted ? <VolumeX size={21}/> : <Volume2 size={21}/>}
        </button>
        <input className="volume-range" aria-label="Volume" type="range" min="0" max="1" step="0.01" value={player.muted ? 0 : player.volume} onChange={(event) => { player.setVolume(Number(event.target.value)); player.setMuted(false) }}/>
        <button aria-label="Connect to a device" className={deviceMenuOpen ? 'active' : ''} onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}>
          <MonitorSmartphone size={20}/>
        </button>
        <button aria-label="Full screen" onClick={toggleFullScreen}>
          <Maximize size={20}/>
        </button>

        {/* Device Picker Popup */}
        {deviceMenuOpen && (
          <div className="device-popup">
            <h4>Connect to a device</h4>
            <button className="device-item active" onClick={() => { setDeviceMenuOpen(false); showToast('Listening on Web Player (This Computer)') }}>
              <Laptop size={20}/>
              <div><b>This Computer</b><small style={{display:'block',color:'#1ed760'}}>Current device</small></div>
            </button>
            <button className="device-item" onClick={() => { setDeviceMenuOpen(false); showToast('Switched output to iPhone 16 Pro.') }}>
              <Smartphone size={20}/>
              <div><b>iPhone 16 Pro</b><small style={{display:'block',color:'#b3b3b3'}}>Spotify Connect</small></div>
            </button>
            <button className="device-item" onClick={() => { setDeviceMenuOpen(false); showToast('Switched output to Living Room Echo.') }}>
              <Speaker size={20}/>
              <div><b>Living Room Echo</b><small style={{display:'block',color:'#b3b3b3'}}>AirPlay / Cast</small></div>
            </button>
          </div>
        )}
      </div>
    </footer>

    {/* Full Screen Lyrics View */}
    {lyricsOpen && (
      <div className="lyrics-fullscreen">
        <div className="lyrics-header">
          <div className="lyrics-header-left">
            <Artwork track={player.track}/>
            <div>
              <b>{player.track?.title || 'No track selected'}</b>
              <span>{player.track?.artist || 'Pulsewave'}</span>
            </div>
          </div>
          <button className="lyrics-close-btn" onClick={() => setLyricsOpen(false)} aria-label="Close lyrics">
            <X size={24}/>
          </button>
        </div>
        <div className="lyrics-scroll-container">
          {activeLyrics.length > 0 ? (
            activeLyrics.map((line, i) => (
              <div className={`lyrics-row ${i === 1 ? 'active' : ''}`} key={i}>
                {line.text}
              </div>
            ))
          ) : (
            <div style={{color:'#b3b3b3',fontSize:'24px',paddingTop:'40px'}}>
              Lyrics are unavailable for this track recording.
            </div>
          )}
        </div>
      </div>
    )}

    {/* Toast notification */}
    {toast && (
      <div className="pulsewave-toast" role="status">
        <Check size={18}/>
        <span>{toast}</span>
      </div>
    )}

    {/* Install App Modal */}
    {installModalOpen && (
      <div className="pw-modal-overlay" onClick={() => setInstallModalOpen(false)}>
        <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pw-modal-header">
            <h3>Install Pulsewave App</h3>
            <button className="pw-modal-close" onClick={() => setInstallModalOpen(false)}><X size={20}/></button>
          </div>
          <div className="pw-modal-body">
            <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'16px',background:'#1f1f1f',display:'grid',placeItems:'center',flexShrink:0}}>
                <SpotifyMark/>
              </div>
              <div>
                <b style={{fontSize:'18px'}}>Pulsewave for Desktop</b>
                <p style={{margin:'4px 0 0',color:'#b3b3b3',fontSize:'14px'}}>Seamless background playback, media hotkeys, and lossless audio performance.</p>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.05)',padding:'14px',borderRadius:'8px',fontSize:'13px',color:'#ddd',lineHeight:'1.5'}}>
              ✓ System tray controls & hotkeys<br/>
              ✓ Offline directory access without browser limits<br/>
              ✓ Zero memory buffering latency
            </div>
          </div>
          <div className="pw-modal-footer">
            <button className="pw-btn-secondary" onClick={() => setInstallModalOpen(false)}>Later</button>
            <button className="pw-btn-primary" onClick={() => { setInstallModalOpen(false); showToast('Pulsewave installer package ready!') }}>Install App</button>
          </div>
        </div>
      </div>
    )}

    {/* Settings Modal */}
    {settingsModalOpen && (
      <div className="pw-modal-overlay" onClick={() => setSettingsModalOpen(false)}>
        <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pw-modal-header">
            <h3>Settings</h3>
            <button className="pw-modal-close" onClick={() => setSettingsModalOpen(false)}><X size={20}/></button>
          </div>
          <div className="pw-modal-body">
            <div className="pw-setting-row">
              <div className="pw-setting-info">
                <b>Lossless Audio Quality</b>
                <span>Stream and play audio in uncompressed high fidelity (320 kbps).</span>
              </div>
              <button className="pw-toggle active" onClick={() => showToast('Audio quality set to Very High (320kbps).')}><div className="pw-toggle-thumb"/></button>
            </div>
            <div className="pw-setting-row">
              <div className="pw-setting-info">
                <b>Autoplay Similar Songs</b>
                <span>Keep the music going when an album or playlist ends.</span>
              </div>
              <button className="pw-toggle active" onClick={() => showToast('Autoplay toggled.')}><div className="pw-toggle-thumb"/></button>
            </div>
            <div className="pw-setting-row">
              <div className="pw-setting-info">
                <b>Normalize Volume</b>
                <span>Set the same volume level for all tracks.</span>
              </div>
              <button className="pw-toggle active" onClick={() => showToast('Volume normalization active.')}><div className="pw-toggle-thumb"/></button>
            </div>
            <div className="pw-setting-row">
              <div className="pw-setting-info">
                <b>Crossfade Tracks (5s)</b>
                <span>Smooth transitions between consecutive songs.</span>
              </div>
              <button className="pw-toggle active" onClick={() => showToast('Crossfade enabled.')}><div className="pw-toggle-thumb"/></button>
            </div>
          </div>
          <div className="pw-modal-footer">
            <button className="pw-btn-primary" onClick={() => setSettingsModalOpen(false)}>Done</button>
          </div>
        </div>
      </div>
    )}

    {/* Profile Modal */}
    {profileModalOpen && (
      <div className="pw-modal-overlay" onClick={() => setProfileModalOpen(false)}>
        <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pw-modal-header">
            <h3>Your Profile</h3>
            <button className="pw-modal-close" onClick={() => setProfileModalOpen(false)}><X size={20}/></button>
          </div>
          <div className="pw-modal-body" style={{textAlign:'center',padding:'32px 24px'}}>
            <img src="/artwork/profile-user.png" alt="" style={{width:'96px',height:'96px',borderRadius:'50%',margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(0,0,0,0.6)'}}/>
            <h2 style={{margin:'0 0 4px',fontSize:'26px'}}>Jaskaran Singh</h2>
            <p style={{margin:'0 0 20px',color:'#b3b3b3',fontSize:'14px'}}>{demoSession ? demoSession.email : 'jaskaran@pulsewave.demo'}</p>
            <div style={{display:'flex',justifyContent:'center',gap:'32px',borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'20px'}}>
              <div><b style={{fontSize:'22px',display:'block'}}>{likedItems.length}</b><span style={{color:'#b3b3b3',fontSize:'13px'}}>Liked Songs</span></div>
              <div><b style={{fontSize:'22px',display:'block'}}>{libraryItems.length}</b><span style={{color:'#b3b3b3',fontSize:'13px'}}>Playlists</span></div>
              <div><b style={{fontSize:'22px',display:'block'}}>4</b><span style={{color:'#b3b3b3',fontSize:'13px'}}>Following</span></div>
            </div>
          </div>
          <div className="pw-modal-footer">
            <button className="pw-btn-primary" onClick={() => setProfileModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Playlist Details Modal */}
    {editDetailsOpen && (
      <div className="pw-modal-overlay" onClick={() => setEditDetailsOpen(false)}>
        <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pw-modal-header">
            <h3>Edit details</h3>
            <button className="pw-modal-close" onClick={() => setEditDetailsOpen(false)}><X size={20}/></button>
          </div>
          <div className="pw-modal-body">
            <div style={{display:'flex',gap:'16px'}}>
              <div style={{width:'120px',height:'120px',flexShrink:0,background:'#282828',borderRadius:'6px',display:'grid',placeItems:'center'}}>
                <img src="/artwork/playlist-vibe.png" alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'6px'}}/>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px',flex:1}}>
                <input
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  placeholder="Playlist name"
                  style={{background:'#333',color:'#fff',border:'0',padding:'10px 14px',borderRadius:'6px',fontSize:'15px',outline:'none'}}
                />
                <textarea
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  placeholder="Add an optional description"
                  rows={3}
                  style={{background:'#333',color:'#fff',border:'0',padding:'10px 14px',borderRadius:'6px',fontSize:'13px',outline:'none',resize:'none'}}
                />
              </div>
            </div>
          </div>
          <div className="pw-modal-footer">
            <button className="pw-btn-secondary" onClick={() => setEditDetailsOpen(false)}>Cancel</button>
            <button className="pw-btn-primary" onClick={() => { setEditDetailsOpen(false); showToast('Playlist details saved!') }}>Save</button>
          </div>
        </div>
      </div>
    )}
  </div>
}

function UsersIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.5a4 4 0 0 1 0 7.7M22 20v-1.5a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function RepeatStatusIcon() { return <svg className="repeat-status-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h10a3.5 3.5 0 0 1 3.5 3.5v6a3.5 3.5 0 0 1-3.5 3.5h-4"/><path d="M6.5 3.5A3.5 3.5 0 0 0 3 7v6a3.5 3.5 0 0 0 3.5 3.5H8"/><path d="m14 13.5 2.5 2.5-2.5 2.5"/></svg> }

export default App
