const dom = {
    container: document.getElementById("mainContainer"),
    backgroundStage: document.getElementById("backgroundStage"),
    backgroundBaseLayer: document.getElementById("backgroundBaseLayer"),
    backgroundTransitionLayer: document.getElementById("backgroundTransitionLayer"),
    playlist: document.getElementById("playlist"),
    playlistItems: document.getElementById("playlistItems"),
    lyrics: document.getElementById("lyrics"),
    lyricsScroll: document.getElementById("lyricsScroll"),
    lyricsContent: document.getElementById("lyricsContent"),
    mobileInlineLyrics: document.getElementById("mobileInlineLyrics"),
    mobileInlineLyricsScroll: document.getElementById("mobileInlineLyricsScroll"),
    mobileInlineLyricsContent: document.getElementById("mobileInlineLyricsContent"),
    audioPlayer: document.getElementById("audioPlayer"),
    themeToggleButton: document.getElementById("themeToggleButton"),
    showPlaylistBtn: document.getElementById("showPlaylistBtn"),
    showLyricsBtn: document.getElementById("showLyricsBtn"),
    searchInput: document.getElementById("searchInput"),
    searchBtn: document.getElementById("searchBtn"),
    sourceSelectButton: document.getElementById("sourceSelectButton"),
    sourceSelectLabel: document.getElementById("sourceSelectLabel"),
    sourceMenu: document.getElementById("sourceMenu"),
    searchResults: document.getElementById("searchResults"),
    notification: document.getElementById("notification"),
    albumCover: document.getElementById("albumCover"),
    currentSongTitle: document.getElementById("currentSongTitle"),
    currentSongArtist: document.getElementById("currentSongArtist"),
    debugInfo: document.getElementById("debugInfo"),
    playModeBtn: document.getElementById("playModeBtn"),
    playPauseBtn: document.getElementById("playPauseBtn"),
    progressBar: document.getElementById("progressBar"),
    currentTimeDisplay: document.getElementById("currentTimeDisplay"),
    durationDisplay: document.getElementById("durationDisplay"),
    volumeSlider: document.getElementById("volumeSlider"),
    volumeIcon: document.getElementById("volumeIcon"),
    qualityToggle: document.getElementById("qualityToggle"),
    playerQualityMenu: document.getElementById("playerQualityMenu"),
    qualityLabel: document.getElementById("qualityLabel"),
    mobileToolbarTitle: document.getElementById("mobileToolbarTitle"),
    mobileSearchToggle: document.getElementById("mobileSearchToggle"),
    mobileSearchClose: document.getElementById("mobileSearchClose"),
    mobilePanelClose: document.getElementById("mobilePanelClose"),
    mobileClearPlaylistBtn: document.getElementById("mobileClearPlaylistBtn"),
    mobileOverlayScrim: document.getElementById("mobileOverlayScrim"),
    mobileQualityToggle: document.getElementById("mobileQualityToggle"),
    mobileQualityLabel: document.getElementById("mobileQualityLabel"),
    mobilePanel: document.getElementById("mobilePanel"),
    mobilePanelTitle: document.getElementById("mobilePanelTitle"),
    mobileQueueToggle: document.getElementById("mobileQueueToggle"),
    searchArea: document.getElementById("searchArea"),
    playlistSyncStatus: document.getElementById("playlistSyncStatus"),
    playlistSyncBtn: document.getElementById("playlistSyncBtn"),
    playlistDropdownToggle: document.getElementById("playlistDropdownToggle"),
    playlistDropdownMenu: document.getElementById("playlistDropdownMenu"),
    currentPlaylistName: document.getElementById("currentPlaylistName"),
    createPlaylistBtn: document.getElementById("createPlaylistBtn"),
    deletePlaylistBtn: document.getElementById("deletePlaylistBtn"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    modalFooter: document.getElementById("modalFooter"),
    modalClose: document.getElementById("modalClose"),
};

window.SolaraDom = dom;

const isMobileView = Boolean(window.__SOLARA_IS_MOBILE);

const mobileBridge = window.SolaraMobileBridge || {};
mobileBridge.handlers = mobileBridge.handlers || {};
mobileBridge.queue = Array.isArray(mobileBridge.queue) ? mobileBridge.queue : [];
window.SolaraMobileBridge = mobileBridge;

function invokeMobileHook(name, ...args) {
    if (!isMobileView) {
        return undefined;
    }
    const handler = mobileBridge.handlers[name];
    if (typeof handler === "function") {
        return handler(...args);
    }
    mobileBridge.queue.push({ name, args });
    return undefined;
}

function initializeMobileUI() {
    return invokeMobileHook("initialize");
}

function updateMobileToolbarTitle() {
    return invokeMobileHook("updateToolbarTitle");
}

function runAfterOverlayFrame(callback) {
    if (typeof callback !== "function" || !isMobileView) {
        return;
    }
    const runner = () => {
        if (!document.body) {
            return;
        }
        callback();
    };
    if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(runner);
    } else {
        window.setTimeout(runner, 0);
    }
}

function syncMobileOverlayVisibility() {
    if (!isMobileView || !document.body) {
        return;
    }
    const searchOpen = document.body.classList.contains("mobile-search-open");
    const panelOpen = document.body.classList.contains("mobile-panel-open");
    if (dom.searchArea) {
        dom.searchArea.setAttribute("aria-hidden", searchOpen ? "false" : "true");
    }
    if (dom.mobileOverlayScrim) {
        dom.mobileOverlayScrim.setAttribute("aria-hidden", (searchOpen || panelOpen) ? "false" : "true");
    }
}

function updateMobileClearPlaylistVisibility() {
    if (!isMobileView) {
        return;
    }
    const button = dom.mobileClearPlaylistBtn;
    if (!button) {
        return;
    }
    const playlistElement = dom.playlist;
    const body = document.body;
    const currentView = body ? body.getAttribute("data-mobile-panel-view") : null;
    const isPlaylistView = !body || !currentView || currentView === "playlist";
    const playlistSongs = (typeof state !== "undefined" && Array.isArray(state.playlistSongs)) ? state.playlistSongs : [];
    const isEmpty = playlistSongs.length === 0 || !playlistElement || playlistElement.classList.contains("empty");
    const shouldShow = isPlaylistView && !isEmpty;
    button.hidden = !shouldShow;
    button.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function forceCloseMobileSearchOverlay() {
    if (!isMobileView || !document.body) {
        return;
    }
    document.body.classList.remove("mobile-search-open");
    if (dom.searchInput) {
        dom.searchInput.blur();
    }
    syncMobileOverlayVisibility();
}

function forceCloseMobilePanelOverlay() {
    if (!isMobileView || !document.body) {
        return;
    }
    document.body.classList.remove("mobile-panel-open");
    syncMobileOverlayVisibility();
}

function openMobileSearch() {
    return invokeMobileHook("openSearch");
}

function closeMobileSearch() {
    const result = invokeMobileHook("closeSearch");
    runAfterOverlayFrame(forceCloseMobileSearchOverlay);
    return result;
}

function toggleMobileSearch() {
    return invokeMobileHook("toggleSearch");
}

function openMobilePanel(view = "playlist") {
    return invokeMobileHook("openPanel", view);
}

function closeMobilePanel() {
    const result = invokeMobileHook("closePanel");
    runAfterOverlayFrame(forceCloseMobilePanelOverlay);
    return result;
}

function toggleMobilePanel(view = "playlist") {
    return invokeMobileHook("togglePanel", view);
}

function closeAllMobileOverlays() {
    const result = invokeMobileHook("closeAllOverlays");
    runAfterOverlayFrame(() => {
        forceCloseMobileSearchOverlay();
        forceCloseMobilePanelOverlay();
    });
    return result;
}

function updateMobileInlineLyricsAria(isOpen) {
    if (!dom.mobileInlineLyrics) {
        return;
    }
    dom.mobileInlineLyrics.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function setMobileInlineLyricsOpen(isOpen) {
    if (!isMobileView || !document.body || !dom.mobileInlineLyrics) {
        return;
    }
    state.isMobileInlineLyricsOpen = Boolean(isOpen);
    document.body.classList.toggle("mobile-inline-lyrics-open", Boolean(isOpen));
    updateMobileInlineLyricsAria(Boolean(isOpen));
}

function hasInlineLyricsContent() {
    const content = dom.mobileInlineLyricsContent;
    if (!content) {
        return false;
    }
    return content.textContent.trim().length > 0;
}

function canOpenMobileInlineLyrics() {
    if (!isMobileView || !document.body) {
        return false;
    }
    const hasSong = Boolean(state.currentSong);
    return hasSong && hasInlineLyricsContent();
}

function closeMobileInlineLyrics(options = {}) {
    if (!isMobileView || !document.body) {
        return false;
    }
    if (!document.body.classList.contains("mobile-inline-lyrics-open")) {
        updateMobileInlineLyricsAria(false);
        state.isMobileInlineLyricsOpen = false;
        return false;
    }
    setMobileInlineLyricsOpen(false);
    if (options.force) {
        state.userScrolledLyrics = false;
    }
    return true;
}

function openMobileInlineLyrics() {
    if (!isMobileView || !document.body) {
        return false;
    }
    if (!canOpenMobileInlineLyrics()) {
        return false;
    }
    setMobileInlineLyricsOpen(true);
    state.userScrolledLyrics = false;
    window.requestAnimationFrame(() => {
        const container = dom.mobileInlineLyricsScroll || dom.mobileInlineLyrics;
        const activeLyric = dom.mobileInlineLyricsContent?.querySelector(".current") ||
            dom.mobileInlineLyricsContent?.querySelector("div[data-index]");
        if (container && activeLyric) {
            scrollToCurrentLyric(activeLyric, container);
        }
    });
    syncLyrics();
    return true;
}

function toggleMobileInlineLyrics() {
    if (!isMobileView || !document.body) {
        return;
    }
    if (document.body.classList.contains("mobile-inline-lyrics-open")) {
        closeMobileInlineLyrics();
    } else {
        openMobileInlineLyrics();
    }
}

const PLACEHOLDER_HTML = `<div class="placeholder"><i class="fas fa-music"></i></div>`;
const paletteCache = new Map();
const PALETTE_STORAGE_KEY = "paletteCache.v1";
let paletteAbortController = null;
const BACKGROUND_TRANSITION_DURATION = 850;
let backgroundTransitionTimer = null;
const PALETTE_APPLY_DELAY = 140;
let pendingPaletteTimer = null;
let deferredPaletteHandle = null;
let deferredPaletteType = "";
let deferredPaletteUrl = null;
const themeDefaults = {
    light: {
        gradient: "",
        primaryColor: "",
        primaryColorDark: "",
    },
    dark: {
        gradient: "",
        primaryColor: "",
        primaryColorDark: "",
    }
};
let paletteRequestId = 0;

function safeGetLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`读取本地存储失败: ${key}`, error);
        return null;
    }
}

function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`写入本地存储失败: ${key}`, error);
    }
}

function safeRemoveLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`移除本地存储失败: ${key}`, error);
    }
}

function parseJSON(value, fallback) {
    if (!value) return fallback;
    try {
        const parsed = JSON.parse(value);
        return parsed;
    } catch (error) {
        console.warn("解析本地存储 JSON 失败", error);
        return fallback;
    }
}

function loadStoredPalettes() {
    const stored = safeGetLocalStorage(PALETTE_STORAGE_KEY);
    if (!stored) {
        return;
    }

    try {
        const entries = JSON.parse(stored);
        if (Array.isArray(entries)) {
            for (const entry of entries) {
                if (Array.isArray(entry) && typeof entry[0] === "string" && entry[1] && typeof entry[1] === "object") {
                    paletteCache.set(entry[0], entry[1]);
                }
            }
        }
    } catch (error) {
        console.warn("解析调色板缓存失败", error);
    }
}

function persistPaletteCache() {
    const maxEntries = 20;
    const entries = Array.from(paletteCache.entries()).slice(-maxEntries);
    try {
        safeSetLocalStorage(PALETTE_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.warn("保存调色板缓存失败", error);
    }
}

const PLAYLIST_SYNC_STORAGE_KEY = "playlistSync.meta.v1";
const PLAYLIST_SYNC_ENDPOINT = "/playlist";
const PLAYLIST_SYNC_SHARE_PARAM = "sync";
const PLAYLIST_SYNC_DEBOUNCE_MS = 800;

const savedPlaylistSyncMeta = (() => {
    const stored = safeGetLocalStorage(PLAYLIST_SYNC_STORAGE_KEY);
    const parsed = parseJSON(stored, null);
    if (!parsed || typeof parsed !== "object") {
        return null;
    }
    return {
        id: typeof parsed.id === "string" && parsed.id.trim() ? parsed.id.trim() : null,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
        lastSyncedAt: typeof parsed.lastSyncedAt === "string" ? parsed.lastSyncedAt : null,
        lastSyncedSnapshot: typeof parsed.lastSyncedSnapshot === "string" ? parsed.lastSyncedSnapshot : null,
    };
})();

const PLAYLIST_SYNC_PLAY_MODES = ["list", "single", "random"];
const PLAYLIST_SYNC_SCOPES = ["playlist", "search"];

const playlistSync = {
    id: savedPlaylistSyncMeta?.id || null,
    updatedAt: savedPlaylistSyncMeta?.updatedAt || null,
    lastSyncedAt: savedPlaylistSyncMeta?.lastSyncedAt || null,
    lastSyncedSnapshot: savedPlaylistSyncMeta?.lastSyncedSnapshot || null,
    pendingSnapshot: null,
    debounceTimer: null,
    inFlight: null,
    enabled: true,
    error: null,
    notifiedError: false,
};

const PLAYLISTS_STORAGE_KEY = "multiPlaylists.v1";
const CURRENT_PLAYLIST_ID_STORAGE_KEY = "currentPlaylistId.v1";
const DEFAULT_PLAYLIST_NAME = "默认列表";
const MAX_PLAYLIST_NAME_LENGTH = 36;

function generatePlaylistId() {
    return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizePlaylistName(name, fallback = DEFAULT_PLAYLIST_NAME) {
    if (typeof name !== "string") {
        return fallback;
    }
    const trimmed = name.trim().slice(0, MAX_PLAYLIST_NAME_LENGTH);
    return trimmed || fallback;
}

function normalizeSongEntry(song) {
    if (!song || typeof song !== "object") {
        return null;
    }
    const normalized = { ...song };
    if (normalized.source) {
        normalized.source = String(normalized.source);
    }
    return normalized;
}

function normalizeSongsCollection(songs) {
    if (!Array.isArray(songs)) {
        return [];
    }
    const normalized = [];
    for (const song of songs) {
        const entry = normalizeSongEntry(song);
        if (entry) {
            normalized.push(entry);
        }
    }
    return normalized;
}

function createPlaylist(name = DEFAULT_PLAYLIST_NAME, songs = []) {
    return {
        id: generatePlaylistId(),
        name: sanitizePlaylistName(name),
        songs: normalizeSongsCollection(songs),
    };
}

function normalizeStoredPlaylist(raw, fallbackName = DEFAULT_PLAYLIST_NAME) {
    if (!raw || typeof raw !== "object") {
        return null;
    }
    const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : generatePlaylistId();
    return {
        id,
        name: sanitizePlaylistName(raw.name, fallbackName),
        songs: normalizeSongsCollection(raw.songs),
    };
}

const legacyPlaylistSongs = (() => {
    const stored = safeGetLocalStorage("playlistSongs");
    const playlist = parseJSON(stored, []);
    return normalizeSongsCollection(playlist);
})();

const savedPlaylists = (() => {
    const stored = safeGetLocalStorage(PLAYLISTS_STORAGE_KEY);
    const parsed = parseJSON(stored, null);
    const normalized = Array.isArray(parsed)
        ? parsed.map(item => normalizeStoredPlaylist(item)).filter(Boolean)
        : [];
    if (normalized.length > 0) {
        return normalized;
    }
    return [
        {
            id: "default",
            name: DEFAULT_PLAYLIST_NAME,
            songs: legacyPlaylistSongs.slice(),
        },
    ];
})();

const savedCurrentPlaylistId = (() => {
    const stored = safeGetLocalStorage(CURRENT_PLAYLIST_ID_STORAGE_KEY);
    if (typeof stored === "string") {
        const trimmed = stored.trim();
        if (trimmed && savedPlaylists.some(playlist => playlist.id === trimmed)) {
            return trimmed;
        }
    }
    return savedPlaylists.length > 0 ? savedPlaylists[0].id : null;
})();

function isSameSong(a, b) {
    if (!a || !b) {
        return false;
    }
    const leftSource = a.source || "netease";
    const rightSource = b.source || "netease";
    return a.id === b.id && leftSource === rightSource;
}

function findSongIndex(songs, targetSong) {
    if (!Array.isArray(songs) || !targetSong) {
        return -1;
    }
    return songs.findIndex(song => isSameSong(song, targetSong));
}

const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function escapeHtml(value) {
    if (typeof value !== "string") {
        return "";
    }
    return value.replace(/[&<>"']/g, match => HTML_ESCAPE_MAP[match] || match);
}

let isRestoringPlaylistFromRemote = false;

function disablePlaylistSync({ message, type = "error" } = {}) {
    const wasEnabled = playlistSync.enabled;
    if (playlistSync.debounceTimer) {
        window.clearTimeout(playlistSync.debounceTimer);
        playlistSync.debounceTimer = null;
    }
    playlistSync.enabled = false;
    playlistSync.pendingSnapshot = null;
    playlistSync.inFlight = null;
    playlistSync.id = null;
    playlistSync.updatedAt = null;
    playlistSync.lastSyncedAt = null;
    playlistSync.lastSyncedSnapshot = null;
    playlistSync.error = null;
    playlistSync.notifiedError = false;
    persistPlaylistSyncMeta();
    updatePlaylistShareUrl();
    updatePlaylistSyncUI();
    if (message && wasEnabled) {
        showNotification(message, type);
    }
}

function preferHttpsUrl(url) {
    if (!url || typeof url !== "string") return url;

    try {
        const parsedUrl = new URL(url, window.location.href);
        if (parsedUrl.protocol === "http:" && window.location.protocol === "https:") {
            parsedUrl.protocol = "https:";
            return parsedUrl.toString();
        }
        return parsedUrl.toString();
    } catch (error) {
        if (window.location.protocol === "https:" && url.startsWith("http://")) {
            return "https://" + url.substring("http://".length);
        }
        return url;
    }
}

function buildAudioProxyUrl(url) {
    if (!url || typeof url !== "string") return url;

    try {
        const parsedUrl = new URL(url, window.location.href);
        if (parsedUrl.protocol === "https:") {
            return parsedUrl.toString();
        }

        if (parsedUrl.protocol === "http:" && /(^|\.)kuwo\.cn$/i.test(parsedUrl.hostname)) {
            return `${API.baseUrl}?target=${encodeURIComponent(parsedUrl.toString())}`;
        }

        return parsedUrl.toString();
    } catch (error) {
        console.warn("无法解析音频地址，跳过代理", error);
        return url;
    }
}

function getPlaylistSyncPayload() {
    const songs = Array.isArray(state.playlistSongs) ? state.playlistSongs : [];
    let currentTrackIndex = Number.isInteger(state.currentTrackIndex) ? state.currentTrackIndex : (songs.length ? 0 : -1);
    if (songs.length === 0) {
        currentTrackIndex = -1;
    } else if (currentTrackIndex < 0 || currentTrackIndex >= songs.length) {
        currentTrackIndex = Math.min(Math.max(currentTrackIndex, 0), songs.length - 1);
    }

    const payload = {
        songs,
        currentTrackIndex,
        playMode: typeof state.playMode === "string" && PLAYLIST_SYNC_PLAY_MODES.includes(state.playMode)
            ? state.playMode
            : PLAYLIST_SYNC_PLAY_MODES[0],
        playbackQuality: normalizeQuality(state.playbackQuality),
        currentPlaylist: typeof state.currentPlaylist === "string" && PLAYLIST_SYNC_SCOPES.includes(state.currentPlaylist)
            ? state.currentPlaylist
            : PLAYLIST_SYNC_SCOPES[0],
        currentSong: state.currentSong && typeof state.currentSong === "object" ? state.currentSong : null,
        currentPlaybackTime: Number.isFinite(state.currentPlaybackTime) && state.currentPlaybackTime >= 0
            ? state.currentPlaybackTime
            : 0,
    };

    if (Number.isFinite(state.volume)) {
        payload.volume = Math.min(Math.max(state.volume, 0), 1);
    }

    return payload;
}

function computePlaylistSyncSnapshot(payload = null) {
    const base = payload || getPlaylistSyncPayload();
    try {
        return JSON.stringify(base);
    } catch (error) {
        console.warn("序列化播放列表失败，使用空数据", error);
        return JSON.stringify({
            songs: [],
            currentTrackIndex: -1,
            playMode: PLAYLIST_SYNC_PLAY_MODES[0],
            playbackQuality: "320",
            currentPlaylist: PLAYLIST_SYNC_SCOPES[0],
            currentSong: null,
            currentPlaybackTime: 0,
        });
    }
}

function persistPlaylistSyncMeta() {
    if (!playlistSync.id) {
        safeRemoveLocalStorage(PLAYLIST_SYNC_STORAGE_KEY);
        return;
    }
    const meta = {
        id: playlistSync.id,
        updatedAt: playlistSync.updatedAt,
        lastSyncedAt: playlistSync.lastSyncedAt,
        lastSyncedSnapshot: playlistSync.lastSyncedSnapshot,
    };
    safeSetLocalStorage(PLAYLIST_SYNC_STORAGE_KEY, JSON.stringify(meta));
}

function formatRelativeSyncTime(isoString) {
    if (!isoString) {
        return "";
    }
    const timestamp = Date.parse(isoString);
    if (!Number.isFinite(timestamp)) {
        return isoString;
    }
    const diff = Date.now() - timestamp;
    if (diff < 45_000) {
        return "刚刚";
    }
    if (diff < 3_600_000) {
        return `${Math.round(diff / 60_000)} 分钟前`;
    }
    if (diff < 86_400_000) {
        return `${Math.round(diff / 3_600_000)} 小时前`;
    }
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function buildPlaylistShareUrl(id = playlistSync.id) {
    if (!id) {
        return window.location.href;
    }
    try {
        const url = new URL(window.location.href);
        url.searchParams.set(PLAYLIST_SYNC_SHARE_PARAM, id);
        return url.toString();
    } catch (error) {
        console.warn("生成云同步链接失败", error);
        return `${window.location.origin}${window.location.pathname}?${PLAYLIST_SYNC_SHARE_PARAM}=${encodeURIComponent(id)}`;
    }
}

function updatePlaylistShareUrl() {
    try {
        const url = new URL(window.location.href);
        if (playlistSync.id) {
            if (url.searchParams.get(PLAYLIST_SYNC_SHARE_PARAM) === playlistSync.id) {
                return;
            }
            url.searchParams.set(PLAYLIST_SYNC_SHARE_PARAM, playlistSync.id);
        } else if (url.searchParams.has(PLAYLIST_SYNC_SHARE_PARAM)) {
            url.searchParams.delete(PLAYLIST_SYNC_SHARE_PARAM);
        } else {
            return;
        }
        const nextUrl = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(window.history.state, document.title, nextUrl);
    } catch (error) {
        console.warn("更新云同步分享链接失败", error);
    }
}

function updatePlaylistSyncUI() {
    if (!dom.playlistSyncBtn || !dom.playlistSyncStatus) {
        return;
    }

    const button = dom.playlistSyncBtn;
    const status = dom.playlistSyncStatus;
    status.className = "playlist-sync-status";

    if (!playlistSync.enabled) {
        button.disabled = true;
        button.title = "云同步不可用";
        status.textContent = "云同步不可用";
        status.classList.add("playlist-sync-status--error");
        return;
    }

    if (!playlistSync.id) {
        button.disabled = true;
        button.title = "云同步初始化中...";
        status.textContent = "云同步初始化中...";
        return;
    }

    button.disabled = Boolean(playlistSync.inFlight);
    button.title = "复制云同步链接";

    if (playlistSync.inFlight) {
        status.textContent = "云同步中...";
        return;
    }

    if (playlistSync.error) {
        status.textContent = "同步失败，将自动重试";
        status.classList.add("playlist-sync-status--error");
        return;
    }

    let suffix = "";
    if (playlistSync.lastSyncedAt) {
        const relative = formatRelativeSyncTime(playlistSync.lastSyncedAt);
        suffix = relative ? ` · 更新于 ${relative}` : "";
        status.classList.add("playlist-sync-status--success");
    }
    status.textContent = `云同步 ID: ${playlistSync.id}${suffix}`;
}

function handlePlaylistSyncChange(snapshot) {
    if (!playlistSync.enabled) {
        return;
    }
    if (!snapshot) {
        snapshot = computePlaylistSyncSnapshot();
    }
    if (!playlistSync.id) {
        playlistSync.pendingSnapshot = snapshot;
        updatePlaylistSyncUI();
        return;
    }
    if (playlistSync.lastSyncedSnapshot === snapshot && !playlistSync.pendingSnapshot) {
        return;
    }
    queuePlaylistSyncUpdate(snapshot);
}

function queuePlaylistSyncUpdate(snapshot) {
    playlistSync.pendingSnapshot = snapshot;
    if (playlistSync.debounceTimer) {
        window.clearTimeout(playlistSync.debounceTimer);
    }
    if (!playlistSync.id) {
        updatePlaylistSyncUI();
        return;
    }
    playlistSync.debounceTimer = window.setTimeout(() => {
        playlistSync.debounceTimer = null;
        flushPlaylistSyncQueue();
    }, PLAYLIST_SYNC_DEBOUNCE_MS);
    updatePlaylistSyncUI();
}

async function flushPlaylistSyncQueue() {
    if (!playlistSync.enabled) {
        playlistSync.pendingSnapshot = null;
        updatePlaylistSyncUI();
        return;
    }
    if (!playlistSync.id || !playlistSync.pendingSnapshot) {
        updatePlaylistSyncUI();
        return;
    }
    if (playlistSync.inFlight) {
        return;
    }

    const snapshot = playlistSync.pendingSnapshot;
    playlistSync.pendingSnapshot = null;

    const task = sendPlaylistSyncUpdate(snapshot)
        .catch((error) => {
            playlistSync.error = error;
            playlistSync.pendingSnapshot = snapshot;
            if (!playlistSync.notifiedError) {
                showNotification("云同步失败，将自动重试", "error");
                playlistSync.notifiedError = true;
            }
            console.warn("同步播放列表失败:", error);
        })
        .finally(() => {
            playlistSync.inFlight = null;
            if (playlistSync.pendingSnapshot && !playlistSync.debounceTimer && playlistSync.enabled) {
                playlistSync.debounceTimer = window.setTimeout(() => {
                    playlistSync.debounceTimer = null;
                    flushPlaylistSyncQueue();
                }, PLAYLIST_SYNC_DEBOUNCE_MS * 2);
            }
            updatePlaylistSyncUI();
        });

    playlistSync.inFlight = task;
    updatePlaylistSyncUI();
    await task;
}

async function sendPlaylistSyncUpdate(snapshot) {
    if (!playlistSync.id) {
        throw new Error("Missing playlist sync identifier");
    }

    let payload;
    try {
        payload = JSON.parse(snapshot);
    } catch (error) {
        console.warn("解析同步数据失败", error);
        payload = getPlaylistSyncPayload();
        snapshot = computePlaylistSyncSnapshot(payload);
    }

    const response = await fetch(`${PLAYLIST_SYNC_ENDPOINT}?id=${encodeURIComponent(playlistSync.id)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 404) {
        return createPlaylistOnServer(payload, snapshot);
    }

    if (response.status === 501) {
        disablePlaylistSync({ message: "云同步不可用，将使用本地播放列表" });
        throw new Error("Playlist sync unavailable");
    }

    if (!response.ok) {
        throw new Error(`Failed to update playlist: ${response.status}`);
    }

    const data = await response.json();
    const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString();
    playlistSync.updatedAt = updatedAt;
    playlistSync.lastSyncedAt = updatedAt;
    playlistSync.lastSyncedSnapshot = snapshot;
    playlistSync.error = null;
    playlistSync.notifiedError = false;
    persistPlaylistSyncMeta();
    return data;
}

async function createPlaylistOnServer(payload, snapshot = computePlaylistSyncSnapshot(payload)) {
    const response = await fetch(PLAYLIST_SYNC_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 501) {
        disablePlaylistSync({ message: "云同步不可用，将使用本地播放列表" });
        throw new Error("Playlist sync unavailable");
    }

    if (!response.ok) {
        throw new Error(`Failed to create playlist: ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.id === "string" && data.id.trim()) {
        playlistSync.id = data.id.trim();
    }
    const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString();
    playlistSync.updatedAt = updatedAt;
    playlistSync.lastSyncedAt = updatedAt;
    playlistSync.lastSyncedSnapshot = snapshot;
    playlistSync.pendingSnapshot = null;
    playlistSync.error = null;
    playlistSync.notifiedError = false;
    persistPlaylistSyncMeta();
    updatePlaylistShareUrl();
    updatePlaylistSyncUI();
    return data;
}

async function fetchPlaylistFromServer(id) {
    const response = await fetch(`${PLAYLIST_SYNC_ENDPOINT}?id=${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (response.status === 501) {
        disablePlaylistSync({ message: "云同步不可用，将使用本地播放列表" });
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status}`);
    }

    const data = await response.json();
    const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString();
    const playlist = normalizeRemotePlaylist(data.playlist);
    return {
        updatedAt,
        playlist,
        version: data.version ?? 1,
    };
}

function normalizeRemotePlaylist(rawValue) {
    const value = rawValue && typeof rawValue === "object" ? rawValue : {};
    const songs = Array.isArray(value.songs) ? value.songs : [];

    let currentTrackIndex = Number.isInteger(value.currentTrackIndex) ? value.currentTrackIndex : (songs.length ? 0 : -1);
    if (songs.length === 0) {
        currentTrackIndex = -1;
    } else if (currentTrackIndex < 0 || currentTrackIndex >= songs.length) {
        currentTrackIndex = Math.min(Math.max(currentTrackIndex, 0), songs.length - 1);
    }

    const playMode = typeof value.playMode === "string" && PLAYLIST_SYNC_PLAY_MODES.includes(value.playMode)
        ? value.playMode
        : PLAYLIST_SYNC_PLAY_MODES[0];

    const playbackQuality = normalizeQuality(typeof value.playbackQuality === "string" ? value.playbackQuality : undefined);

    const currentPlaylist = typeof value.currentPlaylist === "string" && PLAYLIST_SYNC_SCOPES.includes(value.currentPlaylist)
        ? value.currentPlaylist
        : PLAYLIST_SYNC_SCOPES[0];

    const currentSong = value.currentSong && typeof value.currentSong === "object" ? value.currentSong : null;

    const currentPlaybackTime = typeof value.currentPlaybackTime === "number" && Number.isFinite(value.currentPlaybackTime) && value.currentPlaybackTime >= 0
        ? value.currentPlaybackTime
        : 0;

    const normalized = {
        songs,
        currentTrackIndex,
        playMode,
        playbackQuality,
        currentPlaylist,
        currentSong,
        currentPlaybackTime,
    };

    if (typeof value.volume === "number" && Number.isFinite(value.volume)) {
        normalized.volume = Math.min(Math.max(value.volume, 0), 1);
    }

    return normalized;
}

function applyRemotePlaylist(payload, snapshotString) {
    const normalized = normalizeRemotePlaylist(payload);
    isRestoringPlaylistFromRemote = true;
    try {
        setCurrentPlaylistSongs(normalized.songs);
        state.currentTrackIndex = normalized.currentTrackIndex;
        state.playMode = normalized.playMode;
        state.playbackQuality = normalized.playbackQuality;
        state.currentPlaylist = normalized.currentPlaylist;
        state.currentSong = normalized.currentSong;
        state.currentPlaybackTime = normalized.currentPlaybackTime;
        if (typeof normalized.volume === "number" && !Number.isNaN(normalized.volume)) {
            state.volume = normalized.volume;
            if (dom.audioPlayer) {
                dom.audioPlayer.volume = normalized.volume;
            }
            if (dom.volumeSlider) {
                dom.volumeSlider.value = normalized.volume;
                updateVolumeSliderBackground(normalized.volume);
                updateVolumeIcon(normalized.volume);
            }
        }
        renderPlaylist();
    } finally {
        isRestoringPlaylistFromRemote = false;
    }
    playlistSync.lastSyncedSnapshot = snapshotString || computePlaylistSyncSnapshot(normalized);
    playlistSync.pendingSnapshot = null;
    playlistSync.error = null;
    playlistSync.notifiedError = false;
    persistPlaylistSyncMeta();
    updatePlaylistSyncUI();
}

async function initializePlaylistSync() {
    if (!playlistSync.enabled) {
        updatePlaylistSyncUI();
        return;
    }

    if (typeof fetch !== "function") {
        disablePlaylistSync({ message: "当前环境不支持云同步" });
        return;
    }

    updatePlaylistSyncUI();

    let sharedId = null;
    try {
        const url = new URL(window.location.href);
        sharedId = url.searchParams.get(PLAYLIST_SYNC_SHARE_PARAM)?.trim() || null;
    } catch (error) {
        console.warn("解析云同步参数失败", error);
    }

    if (sharedId && sharedId !== playlistSync.id) {
        playlistSync.id = sharedId;
        playlistSync.updatedAt = null;
        playlistSync.lastSyncedAt = null;
        playlistSync.lastSyncedSnapshot = null;
        playlistSync.pendingSnapshot = null;
        persistPlaylistSyncMeta();
    }

    const localSnapshot = computePlaylistSyncSnapshot();

    if (!playlistSync.id) {
        try {
            await createPlaylistOnServer(getPlaylistSyncPayload(), localSnapshot);
        } catch (error) {
            console.warn("初始化云同步失败:", error);
            disablePlaylistSync({ message: "云同步不可用，将使用本地播放列表" });
            return;
        }
        updatePlaylistSyncUI();
        return;
    }

    updatePlaylistShareUrl();

    try {
        const remote = await fetchPlaylistFromServer(playlistSync.id);
        if (!playlistSync.enabled) {
            updatePlaylistSyncUI();
            return;
        }
        if (!remote) {
            await sendPlaylistSyncUpdate(localSnapshot);
            updatePlaylistSyncUI();
            return;
        }

        const remoteSnapshot = computePlaylistSyncSnapshot(remote.playlist);
        const remoteTime = Date.parse(remote.updatedAt || "");
        const localTime = playlistSync.updatedAt ? Date.parse(playlistSync.updatedAt) : NaN;
        const remoteIsNewer = Number.isFinite(remoteTime) && (!Number.isFinite(localTime) || remoteTime >= localTime);

        if (remoteIsNewer && remoteSnapshot !== playlistSync.lastSyncedSnapshot) {
            applyRemotePlaylist(remote.playlist, remoteSnapshot);
        }

        playlistSync.updatedAt = remote.updatedAt;
        playlistSync.lastSyncedAt = remote.updatedAt;
        playlistSync.lastSyncedSnapshot = remoteSnapshot;
        playlistSync.error = null;
        playlistSync.notifiedError = false;
        persistPlaylistSyncMeta();
        updatePlaylistSyncUI();

        if (remoteSnapshot !== localSnapshot) {
            queuePlaylistSyncUpdate(localSnapshot);
        } else {
            playlistSync.pendingSnapshot = null;
        }
    } catch (error) {
        if (!playlistSync.enabled) {
            updatePlaylistSyncUI();
            return;
        }
        playlistSync.error = error;
        playlistSync.notifiedError = true;
        console.warn("拉取云播放列表失败:", error);
        showNotification("同步云播放列表失败，将稍后重试", "error");
        updatePlaylistSyncUI();
    }
}

async function copyPlaylistSyncLink() {
    if (!playlistSync.id) {
        showNotification("云同步尚未初始化", "error");
        return;
    }

    const shareUrl = buildPlaylistShareUrl(playlistSync.id);
    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(shareUrl);
            showNotification("云同步链接已复制", "success");
        } else {
            const result = window.prompt("复制云同步链接", shareUrl);
            if (result !== null) {
                showNotification("请在新浏览器中打开该链接以恢复播放列表", "success");
            }
        }
    } catch (error) {
        console.warn("复制云同步链接失败", error);
        showNotification("复制失败，请手动复制链接", "error");
    }
}

const SOURCE_OPTIONS = [
    { value: "netease", label: "网易云音乐" },
    { value: "kuwo", label: "酷我音乐" },
    { value: "joox", label: "JOOX音乐" }
];

function normalizeSource(value) {
    const allowed = SOURCE_OPTIONS.map(option => option.value);
    return allowed.includes(value) ? value : SOURCE_OPTIONS[0].value;
}

const QUALITY_OPTIONS = [
    { value: "128", label: "标准音质", description: "128 kbps" },
    { value: "192", label: "高品音质", description: "192 kbps" },
    { value: "320", label: "极高音质", description: "320 kbps" },
    { value: "999", label: "无损音质", description: "FLAC" }
];

function normalizeQuality(value) {
    const match = QUALITY_OPTIONS.find(option => option.value === value);
    return match ? match.value : "320";
}

const savedCurrentTrackIndex = (() => {
    const stored = safeGetLocalStorage("currentTrackIndex");
    const index = Number.parseInt(stored, 10);
    return Number.isInteger(index) ? index : -1;
})();

const savedPlayMode = (() => {
    const stored = safeGetLocalStorage("playMode");
    const modes = ["list", "single", "random"];
    return modes.includes(stored) ? stored : "list";
})();

const savedPlaybackQuality = normalizeQuality(safeGetLocalStorage("playbackQuality"));

const savedVolume = (() => {
    const stored = safeGetLocalStorage("playerVolume");
    const volume = Number.parseFloat(stored);
    if (Number.isFinite(volume)) {
        return Math.min(Math.max(volume, 0), 1);
    }
    return 0.8;
})();

const savedSearchSource = (() => {
    const stored = safeGetLocalStorage("searchSource");
    return normalizeSource(stored);
})();

const savedPlaybackTime = (() => {
    const stored = safeGetLocalStorage("currentPlaybackTime");
    const time = Number.parseFloat(stored);
    return Number.isFinite(time) && time >= 0 ? time : 0;
})();

const savedCurrentSong = (() => {
    const stored = safeGetLocalStorage("currentSong");
    return parseJSON(stored, null);
})();

const savedCurrentPlaylist = (() => {
    const stored = safeGetLocalStorage("currentPlaylist");
    const playlists = ["playlist", "search"];
    return playlists.includes(stored) ? stored : "playlist";
})();

// API配置 - 修复API地址和请求方式
const API = {
    baseUrl: "/proxy",

    generateSignature: () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },

    fetchJson: async (url) => {
        try {
            const response = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.warn("JSON parse failed, returning raw text", parseError);
                return text;
            }
        } catch (error) {
            console.error("API request error:", error);
            throw error;
        }
    },

    search: async (keyword, source = "netease", count = 20, page = 1) => {
        const signature = API.generateSignature();
        const url = `${API.baseUrl}?types=search&source=${source}&name=${encodeURIComponent(keyword)}&count=${count}&pages=${page}&s=${signature}`;

        try {
            debugLog(`API请求: ${url}`);
            const data = await API.fetchJson(url);
            debugLog(`API响应: ${JSON.stringify(data).substring(0, 200)}...`);

            if (!Array.isArray(data)) throw new Error("搜索结果格式错误");

            return data.map(song => ({
                id: song.id,
                name: song.name,
                artist: song.artist,
                album: song.album,
                pic_id: song.pic_id,
                url_id: song.url_id,
                lyric_id: song.lyric_id,
                source: song.source,
            }));
        } catch (error) {
            debugLog(`API错误: ${error.message}`);
            throw error;
        }
    },

    getSongUrl: (song, quality = "320") => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=url&id=${song.id}&source=${song.source || "netease"}&br=${quality}&s=${signature}`;
    },

    getLyric: (song) => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=lyric&id=${song.lyric_id || song.id}&source=${song.source || "netease"}&s=${signature}`;
    },

    getPicUrl: (song) => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=pic&id=${song.pic_id}&source=${song.source || "netease"}&size=300&s=${signature}`;
    }
};

Object.freeze(API);

const initialPlaylists = savedPlaylists.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    songs: Array.isArray(playlist.songs) ? playlist.songs.slice() : [],
}));

const normalizedCurrentPlaylistId = (() => {
    if (savedCurrentPlaylistId && initialPlaylists.some(item => item.id === savedCurrentPlaylistId)) {
        return savedCurrentPlaylistId;
    }
    return initialPlaylists[0]?.id || null;
})();

const initialPlaylistSongs = (() => {
    const active = initialPlaylists.find(item => item.id === normalizedCurrentPlaylistId);
    return active ? active.songs : [];
})();

const state = {
    searchResults: [],
    renderedSearchCount: 0,
    currentTrackIndex: savedCurrentTrackIndex,
    currentAudioUrl: null,
    lyricsData: [],
    currentLyricLine: -1,
    currentPlaylist: savedCurrentPlaylist, // 'search' 或 'playlist'
    searchPage: 1,
    searchKeyword: "", // 确保这里有初始值
    searchSource: savedSearchSource,
    hasMoreResults: true,
    currentSong: savedCurrentSong,
    playlists: initialPlaylists,
    currentPlaylistId: normalizedCurrentPlaylistId,
    debugMode: false,
    isSearchMode: false, // 新增：搜索模式状态
    playlistSongs: initialPlaylistSongs,
    playMode: savedPlayMode, // 新增：播放模式 'list', 'single', 'random'
    playbackQuality: savedPlaybackQuality,
    volume: savedVolume,
    currentPlaybackTime: savedPlaybackTime,
    lastSavedPlaybackTime: savedPlaybackTime,
    pendingSeekTime: null,
    isSeeking: false,
    qualityMenuOpen: false,
    sourceMenuOpen: false,
    userScrolledLyrics: false, // 新增：用户是否手动滚动歌词
    lyricsScrollTimeout: null, // 新增：歌词滚动超时
    themeDefaultsCaptured: false,
    dynamicPalette: null,
    currentPaletteImage: null,
    pendingPaletteData: null,
    pendingPaletteImage: null,
    pendingPaletteImmediate: false,
    pendingPaletteReady: false,
    audioReadyForPalette: true,
    currentGradient: '',
    isMobileInlineLyricsOpen: false,
};

function getPlaylistById(id) {
    if (!Array.isArray(state.playlists) || state.playlists.length === 0 || !id) {
        return null;
    }
    return state.playlists.find(playlist => playlist.id === id) || null;
}

function getCurrentPlaylist() {
    if (!Array.isArray(state.playlists) || state.playlists.length === 0) {
        return null;
    }
    const playlist = getPlaylistById(state.currentPlaylistId) || state.playlists[0];
    return playlist || null;
}

function ensureCurrentPlaylistReference() {
    if (!Array.isArray(state.playlists) || state.playlists.length === 0) {
        const fallback = createPlaylist(DEFAULT_PLAYLIST_NAME, []);
        state.playlists = [fallback];
        state.currentPlaylistId = fallback.id;
        state.playlistSongs = fallback.songs;
        return fallback;
    }
    const playlist = getCurrentPlaylist();
    state.currentPlaylistId = playlist.id;
    state.playlistSongs = playlist.songs;
    return playlist;
}

function setCurrentPlaylistSongs(songs) {
    const target = ensureCurrentPlaylistReference();
    const normalizedSongs = normalizeSongsCollection(songs);
    target.songs = normalizedSongs;
    state.playlistSongs = target.songs;
}

function clampCurrentTrackIndexWithinPlaylist() {
    const songs = Array.isArray(state.playlistSongs) ? state.playlistSongs : [];
    if (songs.length === 0) {
        state.currentTrackIndex = -1;
        return;
    }
    if (!Number.isInteger(state.currentTrackIndex) || state.currentTrackIndex < 0) {
        state.currentTrackIndex = 0;
        return;
    }
    if (state.currentTrackIndex >= songs.length) {
        state.currentTrackIndex = songs.length - 1;
    }
}

function persistPlaylistsState() {
    try {
        const serialized = JSON.stringify(Array.isArray(state.playlists)
            ? state.playlists.map(playlist => ({
                id: playlist.id,
                name: sanitizePlaylistName(playlist.name, DEFAULT_PLAYLIST_NAME),
                songs: Array.isArray(playlist.songs) ? playlist.songs : [],
            }))
            : []);
        safeSetLocalStorage(PLAYLISTS_STORAGE_KEY, serialized);
    } catch (error) {
        console.warn("保存播放列表失败", error);
    }
    if (state.currentPlaylistId) {
        safeSetLocalStorage(CURRENT_PLAYLIST_ID_STORAGE_KEY, state.currentPlaylistId);
    } else {
        safeRemoveLocalStorage(CURRENT_PLAYLIST_ID_STORAGE_KEY);
    }
}

ensureCurrentPlaylistReference();
clampCurrentTrackIndexWithinPlaylist();

let sourceMenuPositionFrame = null;
let qualityMenuPositionFrame = null;
let floatingMenuListenersAttached = false;
let qualityMenuAnchor = null;
let playlistDropdownOpen = false;
let playlistDropdownOutsideHandler = null;

function buildPlaylistDropdownMenu() {
    if (!dom.playlistDropdownMenu) {
        return;
    }
    const playlists = Array.isArray(state.playlists) ? state.playlists : [];
    if (playlists.length === 0) {
        dom.playlistDropdownMenu.innerHTML = '<div class="playlist-dropdown-empty">暂无播放列表</div>';
        return;
    }
    const itemsHtml = playlists.map(playlist => {
        const isActive = playlist.id === state.currentPlaylistId;
        const count = Array.isArray(playlist.songs) ? playlist.songs.length : 0;
        return `
            <button type="button" class="playlist-dropdown-item${isActive ? " active" : ""}" data-playlist-id="${escapeHtml(playlist.id)}">
                <span class="playlist-dropdown-item__name">${escapeHtml(playlist.name)}</span>
                <span class="playlist-dropdown-item__meta">${count} 首</span>
                ${isActive ? '<i class="fas fa-check" aria-hidden="true"></i>' : ""}
            </button>
        `;
    }).join("");
    dom.playlistDropdownMenu.innerHTML = itemsHtml;
}

function updatePlaylistSelectorUI() {
    const playlist = ensureCurrentPlaylistReference();
    if (dom.currentPlaylistName) {
        dom.currentPlaylistName.textContent = playlist ? playlist.name : DEFAULT_PLAYLIST_NAME;
    }
    if (dom.playlistDropdownToggle) {
        const label = playlist ? `当前播放列表：${playlist.name}` : "选择播放列表";
        dom.playlistDropdownToggle.setAttribute("aria-label", label);
        dom.playlistDropdownToggle.setAttribute("title", label);
        dom.playlistDropdownToggle.setAttribute("aria-expanded", playlistDropdownOpen ? "true" : "false");
    }
    if (dom.deletePlaylistBtn) {
        const disableDelete = !Array.isArray(state.playlists) || state.playlists.length <= 1;
        dom.deletePlaylistBtn.disabled = disableDelete;
        dom.deletePlaylistBtn.setAttribute("aria-disabled", disableDelete ? "true" : "false");
    }
    buildPlaylistDropdownMenu();
}

function openPlaylistDropdown() {
    if (!dom.playlistDropdownMenu || !dom.playlistDropdownToggle) {
        return;
    }
    if (playlistDropdownOpen) {
        return;
    }
    ensureCurrentPlaylistReference();
    buildPlaylistDropdownMenu();
    dom.playlistDropdownMenu.classList.add("show");
    dom.playlistDropdownToggle.setAttribute("aria-expanded", "true");
    playlistDropdownOpen = true;
    playlistDropdownOutsideHandler = (event) => {
        if (!playlistDropdownOpen) {
            return;
        }
        const target = event.target;
        if ((dom.playlistDropdownMenu && dom.playlistDropdownMenu.contains(target)) ||
            (dom.playlistDropdownToggle && dom.playlistDropdownToggle.contains(target))) {
            return;
        }
        closePlaylistDropdown();
    };
    document.addEventListener("pointerdown", playlistDropdownOutsideHandler, true);
}

function closePlaylistDropdown() {
    if (!playlistDropdownOpen) {
        return;
    }
    if (dom.playlistDropdownMenu) {
        dom.playlistDropdownMenu.classList.remove("show");
    }
    if (dom.playlistDropdownToggle) {
        dom.playlistDropdownToggle.setAttribute("aria-expanded", "false");
    }
    playlistDropdownOpen = false;
    if (playlistDropdownOutsideHandler) {
        document.removeEventListener("pointerdown", playlistDropdownOutsideHandler, true);
        playlistDropdownOutsideHandler = null;
    }
}

function togglePlaylistDropdown(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (playlistDropdownOpen) {
        closePlaylistDropdown();
    } else {
        openPlaylistDropdown();
    }
}

function handlePlaylistDropdownSelection(event) {
    const option = event.target.closest("[data-playlist-id]");
    if (!option) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const { playlistId } = option.dataset;
    if (playlistId) {
        selectPlaylistById(playlistId);
    }
}

function selectPlaylistById(playlistId) {
    const playlist = getPlaylistById(playlistId);
    if (!playlist || playlist.id === state.currentPlaylistId) {
        closePlaylistDropdown();
        return;
    }
    state.currentPlaylistId = playlist.id;
    state.playlistSongs = playlist.songs;
    state.currentPlaylist = "playlist";
    const matchedIndex = findSongIndex(playlist.songs, state.currentSong);
    state.currentTrackIndex = matchedIndex >= 0 ? matchedIndex : (playlist.songs.length > 0 ? 0 : -1);
    renderPlaylist();
    updateMobileClearPlaylistVisibility();
    showNotification(`已切换到播放列表：${playlist.name}`);
    closePlaylistDropdown();
}

function openModal(title, bodyHtml, buttons = []) {
    if (!dom.modalOverlay || !dom.modalTitle || !dom.modalBody || !dom.modalFooter) {
        return;
    }
    
    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = bodyHtml;
    
    dom.modalFooter.innerHTML = '';
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `modal-btn ${btn.className || 'modal-btn-secondary'}`;
        button.textContent = btn.text;
        button.onclick = () => {
            if (btn.onClick) {
                btn.onClick();
            }
            closeModal();
        };
        dom.modalFooter.appendChild(button);
    });
    
    dom.modalOverlay.classList.add('show');
    
    const firstInput = dom.modalBody.querySelector('input, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal() {
    if (!dom.modalOverlay) {
        return;
    }
    dom.modalOverlay.classList.remove('show');
}

function promptForPlaylistName(defaultValue = "") {
    return new Promise((resolve) => {
        const suggestedName = defaultValue || `播放列表 ${Array.isArray(state.playlists) ? state.playlists.length + 1 : 1}`;
        
        const bodyHtml = `
            <div>
                <label class="modal-label" for="playlistNameInput">播放列表名称</label>
                <input 
                    type="text" 
                    id="playlistNameInput" 
                    class="modal-input" 
                    placeholder="请输入播放列表名称" 
                    value="${escapeHtml(suggestedName)}"
                    maxlength="${MAX_PLAYLIST_NAME_LENGTH}"
                />
            </div>
        `;
        
        const buttons = [
            {
                text: '取消',
                className: 'modal-btn-secondary',
                onClick: () => resolve(null)
            },
            {
                text: '创建',
                className: 'modal-btn-primary',
                onClick: () => {
                    const input = document.getElementById('playlistNameInput');
                    const value = input ? input.value : suggestedName;
                    resolve(sanitizePlaylistName(value, suggestedName));
                }
            }
        ];
        
        openModal('新建播放列表', bodyHtml, buttons);
        
        setTimeout(() => {
            const input = document.getElementById('playlistNameInput');
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = input.value;
                        closeModal();
                        resolve(sanitizePlaylistName(value, suggestedName));
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        closeModal();
                        resolve(null);
                    }
                });
            }
        }, 100);
    });
}

function confirmDeletePlaylist(playlistName) {
    return new Promise((resolve) => {
        const bodyHtml = `
            <div class="modal-message">
                确定删除播放列表 <strong>「${escapeHtml(playlistName)}」</strong> 吗？<br><br>
                此操作不可恢复。
            </div>
        `;
        
        const buttons = [
            {
                text: '取消',
                className: 'modal-btn-secondary',
                onClick: () => resolve(false)
            },
            {
                text: '删除',
                className: 'modal-btn-danger',
                onClick: () => resolve(true)
            }
        ];
        
        openModal('删除播放列表', bodyHtml, buttons);
    });
}

async function handleCreatePlaylist() {
    const suggestedName = `播放列表 ${Array.isArray(state.playlists) ? state.playlists.length + 1 : 1}`;
    const name = await promptForPlaylistName(suggestedName);
    if (name === null) {
        return;
    }
    const playlist = createPlaylist(name, []);
    if (!Array.isArray(state.playlists)) {
        state.playlists = [];
    }
    state.playlists.push(playlist);
    state.currentPlaylistId = playlist.id;
    state.playlistSongs = playlist.songs;
    state.currentPlaylist = "playlist";
    state.currentTrackIndex = -1;
    renderPlaylist();
    updateMobileClearPlaylistVisibility();
    closePlaylistDropdown();
    showNotification(`已创建播放列表：${playlist.name}`, "success");
}

async function handleDeletePlaylist() {
    const playlist = getCurrentPlaylist();
    if (!playlist) {
        return;
    }
    if (!Array.isArray(state.playlists) || state.playlists.length <= 1) {
        showNotification("至少需要保留一个播放列表", "error");
        return;
    }
    const confirmed = await confirmDeletePlaylist(playlist.name);
    if (!confirmed) {
        return;
    }
    const playlistIndex = state.playlists.findIndex(item => item.id === playlist.id);
    if (playlistIndex === -1) {
        return;
    }
    const wasPlayingFromPlaylist = state.currentPlaylist === "playlist" && findSongIndex(playlist.songs, state.currentSong) !== -1;
    state.playlists.splice(playlistIndex, 1);
    if (state.playlists.length === 0) {
        const fallback = createPlaylist(DEFAULT_PLAYLIST_NAME, []);
        state.playlists.push(fallback);
    }
    const nextPlaylist = state.playlists[playlistIndex] || state.playlists[playlistIndex - 1] || state.playlists[0];
    state.currentPlaylistId = nextPlaylist.id;
    state.playlistSongs = nextPlaylist.songs;
    state.currentPlaylist = "playlist";
    if (wasPlayingFromPlaylist) {
        dom.audioPlayer.pause();
        dom.audioPlayer.src = "";
        state.currentSong = null;
        state.currentAudioUrl = null;
        state.currentTrackIndex = -1;
        state.currentPlaybackTime = 0;
        state.lastSavedPlaybackTime = 0;
        dom.progressBar.value = 0;
        dom.progressBar.max = 0;
        dom.currentTimeDisplay.textContent = "00:00";
        dom.durationDisplay.textContent = "00:00";
        updateProgressBarBackground(0, 1);
        dom.currentSongTitle.textContent = "选择一首歌曲开始播放";
        updateMobileToolbarTitle();
        dom.currentSongArtist.textContent = "未知艺术家";
        showAlbumCoverPlaceholder();
        clearLyricsContent();
        if (dom.lyrics) {
            dom.lyrics.dataset.placeholder = "default";
            dom.lyrics.classList.add("empty");
        }
        updatePlayPauseButton();
    } else {
        clampCurrentTrackIndexWithinPlaylist();
    }
    renderPlaylist();
    updateMobileClearPlaylistVisibility();
    closePlaylistDropdown();
    showNotification(`已删除播放列表：${playlist.name}`, "success");
}

function runWithoutTransition(element, callback) {
    if (!element || typeof callback !== "function") return;
    const previousTransition = element.style.transition;
    element.style.transition = "none";
    callback();
    void element.offsetHeight;
    if (previousTransition) {
        element.style.transition = previousTransition;
    } else {
        element.style.removeProperty("transition");
    }
}

function cancelSourceMenuPositionUpdate() {
    if (sourceMenuPositionFrame !== null) {
        window.cancelAnimationFrame(sourceMenuPositionFrame);
        sourceMenuPositionFrame = null;
    }
}

function scheduleSourceMenuPositionUpdate() {
    if (!state.sourceMenuOpen) {
        cancelSourceMenuPositionUpdate();
        return;
    }
    if (sourceMenuPositionFrame !== null) {
        return;
    }
    sourceMenuPositionFrame = window.requestAnimationFrame(() => {
        sourceMenuPositionFrame = null;
        updateSourceMenuPosition();
    });
}

function cancelPlayerQualityMenuPositionUpdate() {
    if (qualityMenuPositionFrame !== null) {
        window.cancelAnimationFrame(qualityMenuPositionFrame);
        qualityMenuPositionFrame = null;
    }
}

function schedulePlayerQualityMenuPositionUpdate() {
    if (!state.qualityMenuOpen) {
        cancelPlayerQualityMenuPositionUpdate();
        return;
    }
    if (qualityMenuPositionFrame !== null) {
        return;
    }
    qualityMenuPositionFrame = window.requestAnimationFrame(() => {
        qualityMenuPositionFrame = null;
        updatePlayerQualityMenuPosition();
    });
}

function handleFloatingMenuResize() {
    if (state.sourceMenuOpen) {
        scheduleSourceMenuPositionUpdate();
    }
    if (state.qualityMenuOpen) {
        schedulePlayerQualityMenuPositionUpdate();
    }
}

function handleFloatingMenuScroll() {
    if (state.sourceMenuOpen) {
        scheduleSourceMenuPositionUpdate();
    }
    if (state.qualityMenuOpen) {
        schedulePlayerQualityMenuPositionUpdate();
    }
}

function ensureFloatingMenuListeners() {
    if (floatingMenuListenersAttached) {
        return;
    }
    window.addEventListener("resize", handleFloatingMenuResize);
    window.addEventListener("scroll", handleFloatingMenuScroll, { passive: true, capture: true });
    floatingMenuListenersAttached = true;
}

function releaseFloatingMenuListenersIfIdle() {
    if (state.sourceMenuOpen || state.qualityMenuOpen) {
        return;
    }
    if (!floatingMenuListenersAttached) {
        return;
    }
    window.removeEventListener("resize", handleFloatingMenuResize);
    window.removeEventListener("scroll", handleFloatingMenuScroll, true);
    floatingMenuListenersAttached = false;
}

state.currentGradient = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-gradient")
    .trim();

function setGlobalThemeProperty(name, value) {
    if (typeof name !== "string") {
        return;
    }
    document.documentElement.style.setProperty(name, value);
    if (document.body) {
        document.body.style.setProperty(name, value);
    }
}

function removeGlobalThemeProperty(name) {
    if (typeof name !== "string") {
        return;
    }
    document.documentElement.style.removeProperty(name);
    if (document.body) {
        document.body.style.removeProperty(name);
    }
}

if (state.currentGradient) {
    setGlobalThemeProperty("--bg-gradient-next", state.currentGradient);
}

function captureThemeDefaults() {
    if (state.themeDefaultsCaptured) {
        return;
    }

    const initialIsDark = document.body.classList.contains("dark-mode");
    document.body.classList.remove("dark-mode");
    const lightStyles = getComputedStyle(document.body);
    themeDefaults.light.gradient = lightStyles.getPropertyValue("--bg-gradient").trim();
    themeDefaults.light.primaryColor = lightStyles.getPropertyValue("--primary-color").trim();
    themeDefaults.light.primaryColorDark = lightStyles.getPropertyValue("--primary-color-dark").trim();

    document.body.classList.add("dark-mode");
    const darkStyles = getComputedStyle(document.body);
    themeDefaults.dark.gradient = darkStyles.getPropertyValue("--bg-gradient").trim();
    themeDefaults.dark.primaryColor = darkStyles.getPropertyValue("--primary-color").trim();
    themeDefaults.dark.primaryColorDark = darkStyles.getPropertyValue("--primary-color-dark").trim();

    if (!initialIsDark) {
        document.body.classList.remove("dark-mode");
    }

    state.themeDefaultsCaptured = true;
}

function applyThemeTokens(tokens) {
    if (!tokens) return;
    if (tokens.primaryColor) {
        setGlobalThemeProperty("--primary-color", tokens.primaryColor);
    }
    if (tokens.primaryColorDark) {
        setGlobalThemeProperty("--primary-color-dark", tokens.primaryColorDark);
    }
}

function setDocumentGradient(gradient, { immediate = false } = {}) {
    const normalized = (gradient || "").trim();
    const current = (state.currentGradient || "").trim();
    const shouldSkipTransition = immediate || normalized === current;

    if (!dom.backgroundTransitionLayer || !dom.backgroundBaseLayer) {
        if (normalized) {
            setGlobalThemeProperty("--bg-gradient", normalized);
            setGlobalThemeProperty("--bg-gradient-next", normalized);
        } else {
            removeGlobalThemeProperty("--bg-gradient");
            removeGlobalThemeProperty("--bg-gradient-next");
        }
        state.currentGradient = normalized;
        return;
    }

    window.clearTimeout(backgroundTransitionTimer);

    if (shouldSkipTransition) {
        if (normalized) {
            setGlobalThemeProperty("--bg-gradient", normalized);
            setGlobalThemeProperty("--bg-gradient-next", normalized);
        } else {
            removeGlobalThemeProperty("--bg-gradient");
            removeGlobalThemeProperty("--bg-gradient-next");
        }
        document.body.classList.remove("background-transitioning");
        state.currentGradient = normalized;
        return;
    }

    if (normalized) {
        setGlobalThemeProperty("--bg-gradient-next", normalized);
    } else {
        removeGlobalThemeProperty("--bg-gradient-next");
    }

    requestAnimationFrame(() => {
        document.body.classList.add("background-transitioning");
        backgroundTransitionTimer = window.setTimeout(() => {
            if (normalized) {
                setGlobalThemeProperty("--bg-gradient", normalized);
                setGlobalThemeProperty("--bg-gradient-next", normalized);
            } else {
                removeGlobalThemeProperty("--bg-gradient");
                removeGlobalThemeProperty("--bg-gradient-next");
            }
            document.body.classList.remove("background-transitioning");
            state.currentGradient = normalized;
        }, BACKGROUND_TRANSITION_DURATION);
    });
}

function applyDynamicGradient(options = {}) {
    if (!state.themeDefaultsCaptured) {
        captureThemeDefaults();
    }
    const isDark = document.body.classList.contains("dark-mode");
    const mode = isDark ? "dark" : "light";
    const defaults = themeDefaults[mode];

    let targetGradient = defaults.gradient || "";
    applyThemeTokens(defaults);

    const palette = state.dynamicPalette;
    if (palette && palette.gradients) {
        const gradients = palette.gradients;
        let gradientMode = mode;
        let gradientInfo = gradients[gradientMode] || null;

        if (!gradientInfo) {
            const fallbackModes = gradientMode === "dark" ? ["light"] : ["dark"];
            for (const candidate of fallbackModes) {
                if (gradients[candidate]) {
                    gradientMode = candidate;
                    gradientInfo = gradients[candidate];
                    break;
                }
            }
            if (!gradientInfo) {
                const availableModes = Object.keys(gradients);
                if (availableModes.length) {
                    const candidate = availableModes[0];
                    gradientMode = candidate;
                    gradientInfo = gradients[candidate];
                }
            }
        }

        if (gradientInfo && gradientInfo.gradient) {
            targetGradient = gradientInfo.gradient;
        }

        if (palette.tokens) {
            const tokens = palette.tokens[gradientMode] || palette.tokens[mode];
            if (tokens) {
                applyThemeTokens(tokens);
            }
        }
    }

    setDocumentGradient(targetGradient, options);
}

function queueDefaultPalette(options = {}) {
    window.clearTimeout(pendingPaletteTimer);
    pendingPaletteTimer = null;
    cancelDeferredPaletteUpdate();
    state.pendingPaletteData = null;
    state.pendingPaletteImage = null;
    state.pendingPaletteImmediate = Boolean(options.immediate);
    state.pendingPaletteReady = true;
    attemptPaletteApplication();
}

function resetDynamicBackground(options = {}) {
    paletteRequestId += 1;
    cancelDeferredPaletteUpdate();
    if (paletteAbortController) {
        paletteAbortController.abort();
        paletteAbortController = null;
    }
    state.dynamicPalette = null;
    state.currentPaletteImage = null;
    queueDefaultPalette(options);
}

function queuePaletteApplication(palette, imageUrl, options = {}) {
    window.clearTimeout(pendingPaletteTimer);
    pendingPaletteTimer = null;
    state.pendingPaletteData = palette || null;
    state.pendingPaletteImage = imageUrl || null;
    state.pendingPaletteImmediate = Boolean(options.immediate);
    state.pendingPaletteReady = true;
    attemptPaletteApplication();
}

function cancelDeferredPaletteUpdate() {
    if (deferredPaletteHandle === null) {
        return;
    }
    if (deferredPaletteType === "idle" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(deferredPaletteHandle);
    } else {
        window.clearTimeout(deferredPaletteHandle);
    }
    deferredPaletteHandle = null;
    deferredPaletteType = "";
    deferredPaletteUrl = null;
}

function scheduleDeferredPaletteUpdate(imageUrl, options = {}) {
    const immediate = Boolean(options.immediate);
    if (!imageUrl) {
        cancelDeferredPaletteUpdate();
        if (immediate) {
            resetDynamicBackground();
        }
        return;
    }

    if (immediate) {
        cancelDeferredPaletteUpdate();
        updateDynamicBackground(imageUrl);
        return;
    }

    if (deferredPaletteHandle !== null) {
        if (deferredPaletteType === "idle" && typeof window.cancelIdleCallback === "function") {
            window.cancelIdleCallback(deferredPaletteHandle);
        } else {
            window.clearTimeout(deferredPaletteHandle);
        }
    }

    deferredPaletteUrl = imageUrl;
    const runner = () => {
        deferredPaletteHandle = null;
        deferredPaletteType = "";
        const targetUrl = deferredPaletteUrl;
        deferredPaletteUrl = null;
        if (targetUrl) {
            updateDynamicBackground(targetUrl);
        }
    };

    if (typeof window.requestIdleCallback === "function") {
        deferredPaletteType = "idle";
        deferredPaletteHandle = window.requestIdleCallback(runner, { timeout: 800 });
    } else {
        deferredPaletteType = "timeout";
        deferredPaletteHandle = window.setTimeout(runner, 120);
    }
}

function attemptPaletteApplication() {
    if (!state.pendingPaletteReady || !state.audioReadyForPalette) {
        return;
    }

    const palette = state.pendingPaletteData || null;
    const imageUrl = state.pendingPaletteImage || null;
    const immediate = state.pendingPaletteImmediate;

    state.pendingPaletteData = null;
    state.pendingPaletteImage = null;
    state.pendingPaletteImmediate = false;
    state.pendingPaletteReady = false;

    const apply = () => {
        pendingPaletteTimer = null;
        state.dynamicPalette = palette;
        state.currentPaletteImage = imageUrl;
        applyDynamicGradient({ immediate: false });
    };

    if (immediate) {
        pendingPaletteTimer = null;
        state.dynamicPalette = palette;
        state.currentPaletteImage = imageUrl;
        applyDynamicGradient({ immediate: true });
        return;
    }

    pendingPaletteTimer = window.setTimeout(apply, PALETTE_APPLY_DELAY);
}

function showAlbumCoverPlaceholder() {
    dom.albumCover.innerHTML = PLACEHOLDER_HTML;
    dom.albumCover.classList.remove("loading");
    queueDefaultPalette();
}

function setAlbumCoverImage(url) {
    dom.albumCover.innerHTML = `<img src="${url}" alt="专辑封面">`;
    dom.albumCover.classList.remove("loading");
}

loadStoredPalettes();

async function fetchPaletteData(imageUrl, signal) {
    if (paletteCache.has(imageUrl)) {
        const cached = paletteCache.get(imageUrl);
        paletteCache.delete(imageUrl);
        paletteCache.set(imageUrl, cached);
        return cached;
    }

    const response = await fetch(`/palette?image=${encodeURIComponent(imageUrl)}`, { signal });
    const raw = await response.text();
    let payload = null;
    try {
        payload = raw ? JSON.parse(raw) : null;
    } catch (parseError) {
        console.warn("解析调色板响应失败:", parseError);
    }

    if (!response.ok) {
        const detail = payload && payload.error ? ` (${payload.error})` : "";
        throw new Error(`Palette request failed: ${response.status}${detail}`);
    }

    if (payload === null) {
        throw new Error("Palette response missing body");
    }

    const data = payload;
    if (paletteCache.has(imageUrl)) {
        paletteCache.delete(imageUrl);
    }
    paletteCache.set(imageUrl, data);
    persistPaletteCache();
    return data;
}

async function updateDynamicBackground(imageUrl) {
    paletteRequestId += 1;
    const requestId = paletteRequestId;

    if (!imageUrl) {
        resetDynamicBackground();
        return;
    }

    if (paletteAbortController) {
        paletteAbortController.abort();
        paletteAbortController = null;
    }

    if (paletteCache.has(imageUrl)) {
        const cached = paletteCache.get(imageUrl);
        paletteCache.delete(imageUrl);
        paletteCache.set(imageUrl, cached);
        queuePaletteApplication(cached, imageUrl);
        return;
    }

    if (state.currentPaletteImage === imageUrl && state.dynamicPalette) {
        queuePaletteApplication(state.dynamicPalette, imageUrl);
        return;
    }

    let controller = null;
    try {
        if (paletteAbortController) {
            paletteAbortController.abort();
        }

        controller = new AbortController();
        paletteAbortController = controller;

        const palette = await fetchPaletteData(imageUrl, controller.signal);
        if (requestId !== paletteRequestId) {
            return;
        }
        queuePaletteApplication(palette, imageUrl);
    } catch (error) {
        if (error?.name === "AbortError") {
            return;
        }
        console.warn("获取动态背景失败:", error);
        if (requestId === paletteRequestId) {
            resetDynamicBackground();
        }
    } finally {
        if (controller && paletteAbortController === controller) {
            paletteAbortController = null;
        }
    }
}

function savePlayerState() {
    safeSetLocalStorage("playlistSongs", JSON.stringify(state.playlistSongs));
    safeSetLocalStorage("currentTrackIndex", String(state.currentTrackIndex));
    safeSetLocalStorage("playMode", state.playMode);
    safeSetLocalStorage("playbackQuality", state.playbackQuality);
    safeSetLocalStorage("playerVolume", String(state.volume));
    safeSetLocalStorage("currentPlaylist", state.currentPlaylist);
    if (state.currentSong) {
        safeSetLocalStorage("currentSong", JSON.stringify(state.currentSong));
    } else {
        safeSetLocalStorage("currentSong", "");
    }
    safeSetLocalStorage("currentPlaybackTime", String(state.currentPlaybackTime || 0));
    persistPlaylistsState();

    const snapshot = computePlaylistSyncSnapshot();
    if (isRestoringPlaylistFromRemote) {
        playlistSync.lastSyncedSnapshot = snapshot;
        persistPlaylistSyncMeta();
        updatePlaylistSyncUI();
        return;
    }
    handlePlaylistSyncChange(snapshot);
    updatePlaylistSyncUI();
}

// 调试日志函数
function debugLog(message) {
    console.log(`[DEBUG] ${message}`);
    if (state.debugMode) {
        const debugInfo = dom.debugInfo;
        debugInfo.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
        debugInfo.classList.add("show");
        debugInfo.scrollTop = debugInfo.scrollHeight;
    }
}

// 启用调试模式（按Ctrl+D）
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        state.debugMode = !state.debugMode;
        if (state.debugMode) {
            dom.debugInfo.classList.add("show");
            debugLog("调试模式已启用");
        } else {
            dom.debugInfo.classList.remove("show");
        }
    }
});

// 新增：切换搜索模式
function toggleSearchMode(enable) {
    state.isSearchMode = enable;
    if (enable) {
        dom.container.classList.add("search-mode");
        debugLog("进入搜索模式");
    } else {
        dom.container.classList.remove("search-mode");
        debugLog("退出搜索模式");
    }
}

// 新增：显示搜索结果
function showSearchResults() {
    toggleSearchMode(true);
    if (state.sourceMenuOpen) {
        scheduleSourceMenuPositionUpdate();
    }
    if (state.qualityMenuOpen) {
        schedulePlayerQualityMenuPositionUpdate();
    }
}

// 新增：隐藏搜索结果 - 优化立即收起
function hideSearchResults() {
    toggleSearchMode(false);
    if (state.sourceMenuOpen) {
        scheduleSourceMenuPositionUpdate();
    }
    if (state.qualityMenuOpen) {
        schedulePlayerQualityMenuPositionUpdate();
    }
    // 立即清空搜索结果内容
    dom.searchResults.innerHTML = "";
    state.renderedSearchCount = 0;
}

const playModeTexts = {
    "list": "列表循环",
    "single": "单曲循环",
    "random": "随机播放"
};

const playModeIcons = {
    "list": "fa-repeat",
    "single": "fa-redo",
    "random": "fa-shuffle"
};

function updatePlayModeUI() {
    const mode = state.playMode;
    dom.playModeBtn.innerHTML = `<i class="fas ${playModeIcons[mode] || playModeIcons.list}"></i>`;
    dom.playModeBtn.title = `播放模式: ${playModeTexts[mode] || playModeTexts.list}`;
}

// 新增：播放模式切换
function togglePlayMode() {
    const modes = ["list", "single", "random"];
    const currentIndex = modes.indexOf(state.playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    state.playMode = modes[nextIndex];

    updatePlayModeUI();
    savePlayerState();

    const modeText = playModeTexts[state.playMode] || playModeTexts.list;
    showNotification(`播放模式: ${modeText}`);
    debugLog(`播放模式切换为: ${state.playMode}`);
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updatePlayPauseButton() {
    if (!dom.playPauseBtn) return;
    const isPlaying = !dom.audioPlayer.paused && !dom.audioPlayer.ended;
    dom.playPauseBtn.innerHTML = `<i class="fas ${isPlaying ? "fa-pause" : "fa-play"}"></i>`;
    dom.playPauseBtn.title = isPlaying ? "暂停" : "播放";
    if (document.body) {
        document.body.classList.toggle("is-playing", isPlaying);
    }
}

function updateProgressBarBackground(value = Number(dom.progressBar.value), max = Number(dom.progressBar.max)) {
    const duration = Number.isFinite(max) && max > 0 ? max : 0;
    const progressValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
    const percent = duration > 0 ? Math.min(progressValue / duration, 1) * 100 : 0;
    dom.progressBar.style.setProperty("--progress", `${percent}%`);
}

function updateVolumeSliderBackground(volume = dom.audioPlayer.volume) {
    const clamped = Math.min(Math.max(Number.isFinite(volume) ? volume : 0, 0), 1);
    dom.volumeSlider.style.setProperty("--volume-progress", `${clamped * 100}%`);
}

function updateVolumeIcon(volume) {
    if (!dom.volumeIcon) return;
    const clamped = Math.min(Math.max(Number.isFinite(volume) ? volume : 0, 0), 1);
    let icon = "fa-volume-high";
    if (clamped === 0) {
        icon = "fa-volume-xmark";
    } else if (clamped < 0.4) {
        icon = "fa-volume-low";
    }
    dom.volumeIcon.className = `fas ${icon}`;
}

function onAudioVolumeChange() {
    const volume = dom.audioPlayer.volume;
    state.volume = volume;
    dom.volumeSlider.value = volume;
    updateVolumeSliderBackground(volume);
    updateVolumeIcon(volume);
    savePlayerState();
}

function handleVolumeChange(event) {
    const volume = Number.parseFloat(event.target.value);
    const clamped = Number.isFinite(volume) ? Math.min(Math.max(volume, 0), 1) : dom.audioPlayer.volume;
    dom.audioPlayer.volume = clamped;
    state.volume = clamped;
    updateVolumeSliderBackground(clamped);
    updateVolumeIcon(clamped);
    safeSetLocalStorage("playerVolume", String(clamped));
}

function handleTimeUpdate() {
    const currentTime = dom.audioPlayer.currentTime || 0;
    if (!state.isSeeking) {
        dom.progressBar.value = currentTime;
        dom.currentTimeDisplay.textContent = formatTime(currentTime);
        updateProgressBarBackground(currentTime, Number(dom.progressBar.max));
    }

    syncLyrics();

    state.currentPlaybackTime = currentTime;
    if (Math.abs(currentTime - state.lastSavedPlaybackTime) >= 2) {
        state.lastSavedPlaybackTime = currentTime;
        safeSetLocalStorage("currentPlaybackTime", currentTime.toFixed(1));
    }
}

function handleLoadedMetadata() {
    const duration = dom.audioPlayer.duration || 0;
    dom.progressBar.max = duration;
    dom.durationDisplay.textContent = formatTime(duration);
    updateProgressBarBackground(dom.audioPlayer.currentTime || 0, duration);

    if (state.pendingSeekTime != null) {
        setAudioCurrentTime(state.pendingSeekTime);
        state.pendingSeekTime = null;
    }
}

function setAudioCurrentTime(time) {
    if (!Number.isFinite(time)) return;
    const duration = dom.audioPlayer.duration || Number(dom.progressBar.max) || 0;
    const clamped = duration > 0 ? Math.min(Math.max(time, 0), duration) : Math.max(time, 0);
    try {
        dom.audioPlayer.currentTime = clamped;
    } catch (error) {
        console.warn("设置播放进度失败", error);
    }
    dom.progressBar.value = clamped;
    dom.currentTimeDisplay.textContent = formatTime(clamped);
    updateProgressBarBackground(clamped, duration);
    state.currentPlaybackTime = clamped;
}

function handleProgressInput() {
    state.isSeeking = true;
    const value = Number(dom.progressBar.value);
    dom.currentTimeDisplay.textContent = formatTime(value);
    updateProgressBarBackground(value, Number(dom.progressBar.max));
}

function handleProgressChange() {
    const value = Number(dom.progressBar.value);
    state.isSeeking = false;
    seekAudio(value);
}

function seekAudio(value) {
    if (!Number.isFinite(value)) return;
    setAudioCurrentTime(value);
    state.lastSavedPlaybackTime = state.currentPlaybackTime;
    safeSetLocalStorage("currentPlaybackTime", state.currentPlaybackTime.toFixed(1));
}

async function togglePlayPause() {
    if (!state.currentSong) {
        if (state.playlistSongs.length > 0) {
            const targetIndex = state.currentTrackIndex >= 0 && state.currentTrackIndex < state.playlistSongs.length
                ? state.currentTrackIndex
                : 0;
            await playPlaylistSong(targetIndex);
        } else {
            showNotification("播放列表为空，请先添加歌曲", "error");
        }
        return;
    }

    if (!dom.audioPlayer.src) {
        try {
            await playSong(state.currentSong, {
                autoplay: true,
                startTime: state.currentPlaybackTime,
                preserveProgress: true,
            });
        } catch (error) {
            console.error("恢复播放失败:", error);
            showNotification("播放失败，请稍后重试", "error");
        }
        return;
    }

    if (dom.audioPlayer.paused) {
        const playPromise = dom.audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("播放失败:", error);
                showNotification("播放失败，请检查网络连接", "error");
            });
        }
    } else {
        dom.audioPlayer.pause();
    }
}

function buildSourceMenu() {
    if (!dom.sourceMenu) return;
    const optionsHtml = SOURCE_OPTIONS.map(option => {
        const isActive = option.value === state.searchSource;
        return `
            <div class="source-option${isActive ? " active" : ""}" data-source="${option.value}" role="option" aria-selected="${isActive}">
                <span>${option.label}</span>
                ${isActive ? '<i class="fas fa-check" aria-hidden="true"></i>' : ""}
            </div>
        `;
    }).join("");
    dom.sourceMenu.innerHTML = optionsHtml;
    if (state.sourceMenuOpen) {
        scheduleSourceMenuPositionUpdate();
    }
}

function updateSourceLabel() {
    const option = SOURCE_OPTIONS.find(item => item.value === state.searchSource) || SOURCE_OPTIONS[0];
    if (!option || !dom.sourceSelectLabel || !dom.sourceSelectButton) return;
    dom.sourceSelectLabel.textContent = option.label;
    dom.sourceSelectButton.dataset.source = option.value;
    dom.sourceSelectButton.setAttribute("aria-expanded", state.sourceMenuOpen ? "true" : "false");
    dom.sourceSelectButton.setAttribute("aria-label", `当前音源：${option.label}，点击切换音源`);
    dom.sourceSelectButton.setAttribute("title", `音源：${option.label}`);
}

function updateSourceMenuPosition() {
    if (!state.sourceMenuOpen || !dom.sourceMenu || !dom.sourceSelectButton) return;

    const menu = dom.sourceMenu;
    const button = dom.sourceSelectButton;
    const spacing = 10;
    const buttonWidth = Math.ceil(button.getBoundingClientRect().width);
    const effectiveWidth = Math.max(buttonWidth, 140);

    menu.style.left = "0px";
    menu.style.width = `${effectiveWidth}px`;
    menu.style.minWidth = `${effectiveWidth}px`;
    menu.style.maxWidth = `${effectiveWidth}px`;

    const menuHeight = Math.max(menu.scrollHeight, 0);
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const spaceBelow = Math.max(viewportHeight - buttonRect.bottom - spacing, 0);
    const canOpenUpwards = buttonRect.top - spacing - menuHeight >= 0;
    const shouldOpenUpwards = menuHeight > spaceBelow && canOpenUpwards;

    if (shouldOpenUpwards) {
        menu.classList.add("open-upwards");
        menu.classList.remove("open-downwards");
        menu.style.top = "";
        menu.style.bottom = `${button.offsetHeight + spacing}px`;
    } else {
        menu.classList.add("open-downwards");
        menu.classList.remove("open-upwards");
        menu.style.bottom = "";
        menu.style.top = `${button.offsetHeight + spacing}px`;
    }
}

function resetSourceMenuPosition() {
    if (!dom.sourceMenu) return;
    dom.sourceMenu.classList.remove("open-upwards", "open-downwards");
    dom.sourceMenu.style.top = "";
    dom.sourceMenu.style.left = "";
    dom.sourceMenu.style.bottom = "";
    dom.sourceMenu.style.minWidth = "";
    dom.sourceMenu.style.maxWidth = "";
    dom.sourceMenu.style.width = "";
}

function openSourceMenu() {
    if (!dom.sourceMenu || !dom.sourceSelectButton) return;
    state.sourceMenuOpen = true;
    ensureFloatingMenuListeners();
    buildSourceMenu();
    dom.sourceMenu.classList.add("show");
    dom.sourceSelectButton.classList.add("active");
    dom.sourceSelectButton.setAttribute("aria-expanded", "true");
    updateSourceMenuPosition();
    scheduleSourceMenuPositionUpdate();
}

function closeSourceMenu() {
    if (!dom.sourceMenu) return;
    dom.sourceMenu.classList.remove("show");
    dom.sourceSelectButton.classList.remove("active");
    dom.sourceSelectButton.setAttribute("aria-expanded", "false");
    state.sourceMenuOpen = false;
    cancelSourceMenuPositionUpdate();
    resetSourceMenuPosition();
    releaseFloatingMenuListenersIfIdle();
}

function toggleSourceMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (state.sourceMenuOpen) {
        closeSourceMenu();
    } else {
        openSourceMenu();
    }
}

function handleSourceSelection(event) {
    const option = event.target.closest(".source-option");
    if (!option) return;
    event.preventDefault();
    event.stopPropagation();
    const { source } = option.dataset;
    if (source) {
        selectSearchSource(source);
    }
}

function selectSearchSource(source) {
    const normalized = normalizeSource(source);
    if (normalized === state.searchSource) {
        closeSourceMenu();
        return;
    }
    state.searchSource = normalized;
    safeSetLocalStorage("searchSource", normalized);
    updateSourceLabel();
    buildSourceMenu();
    closeSourceMenu();
}

function buildQualityMenu() {
    if (!dom.playerQualityMenu) return;
    const optionsHtml = QUALITY_OPTIONS.map(option => {
        const isActive = option.value === state.playbackQuality;
        return `
            <div class="player-quality-option${isActive ? " active" : ""}" data-quality="${option.value}">
                <span>${option.label}</span>
                <small>${option.description}</small>
            </div>
        `;
    }).join("");
    dom.playerQualityMenu.innerHTML = optionsHtml;
    if (state.qualityMenuOpen) {
        schedulePlayerQualityMenuPositionUpdate();
    }
}

function isElementNode(value) {
    return Boolean(value) && typeof value === "object" && value.nodeType === 1;
}

function resolveQualityAnchor(anchor) {
    if (isElementNode(anchor)) {
        return anchor;
    }
    if (isElementNode(dom.qualityToggle)) {
        return dom.qualityToggle;
    }
    if (isElementNode(dom.mobileQualityToggle)) {
        return dom.mobileQualityToggle;
    }
    return null;
}

function setQualityAnchorState(anchor, expanded) {
    if (!isElementNode(anchor)) {
        return;
    }
    anchor.classList.toggle("active", Boolean(expanded));
    if (typeof anchor.setAttribute === "function") {
        anchor.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
}

function getQualityMenuAnchor() {
    if (isElementNode(qualityMenuAnchor) && (!document.body || document.body.contains(qualityMenuAnchor))) {
        return qualityMenuAnchor;
    }
    const fallback = resolveQualityAnchor();
    qualityMenuAnchor = fallback;
    return fallback;
}

function updateQualityLabel() {
    const option = QUALITY_OPTIONS.find(item => item.value === state.playbackQuality) || QUALITY_OPTIONS[0];
    if (!option) return;
    dom.qualityLabel.textContent = option.label;
    dom.qualityToggle.title = `音质: ${option.label} (${option.description})`;
    if (dom.mobileQualityLabel) {
        dom.mobileQualityLabel.textContent = option.label;
    }
    if (dom.mobileQualityToggle) {
        dom.mobileQualityToggle.title = `音质: ${option.label} (${option.description})`;
    }
}

function togglePlayerQualityMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const anchor = resolveQualityAnchor(event && event.currentTarget ? event.currentTarget : qualityMenuAnchor);
    if (!anchor) {
        return;
    }
    if (state.qualityMenuOpen && qualityMenuAnchor === anchor) {
        closePlayerQualityMenu();
    } else {
        openPlayerQualityMenu(anchor);
    }
}

function updatePlayerQualityMenuPosition() {
    if (!state.qualityMenuOpen || !dom.playerQualityMenu) return;

    const anchor = getQualityMenuAnchor();
    if (!isElementNode(anchor)) {
        return;
    }
    const menu = dom.playerQualityMenu;
    const toggleRect = anchor.getBoundingClientRect();
    const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const spacing = 10;

    menu.classList.add("floating");

    const targetWidth = Math.max(Math.round(toggleRect.width), 180);
    menu.style.minWidth = `${targetWidth}px`;
    menu.style.maxWidth = `${targetWidth}px`;
    menu.style.width = `${targetWidth}px`;
    menu.style.right = "auto";

    const menuRect = menu.getBoundingClientRect();
    const menuHeight = Math.round(menuRect.height);
    const menuWidth = Math.round(menuRect.width) || targetWidth;

    let top = Math.round(toggleRect.bottom + spacing);
    let openUpwards = false;
    if (top + menuHeight > viewportHeight - spacing) {
        const upwardTop = Math.round(toggleRect.top - spacing - menuHeight);
        if (upwardTop >= spacing) {
            top = upwardTop;
            openUpwards = true;
        } else {
            top = Math.max(spacing, viewportHeight - spacing - menuHeight);
        }
    }

    const isPortraitOrientation = (() => {
        if (typeof window.matchMedia === "function") {
            const portraitQuery = window.matchMedia("(orientation: portrait)");
            if (typeof portraitQuery.matches === "boolean") {
                return portraitQuery.matches;
            }
        }
        return viewportHeight >= viewportWidth;
    })();

    let left;
    if (isMobileView && isPortraitOrientation) {
        left = Math.round(toggleRect.left + (toggleRect.width - menuWidth) / 2);
    } else {
        left = Math.round(toggleRect.right - menuWidth);
    }

    const minLeft = spacing;
    const maxLeft = Math.max(minLeft, viewportWidth - spacing - menuWidth);
    left = Math.min(Math.max(left, minLeft), maxLeft);

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.classList.toggle("open-upwards", openUpwards);
    menu.classList.toggle("open-downwards", !openUpwards);
}

function resetPlayerQualityMenuPosition() {
    if (!dom.playerQualityMenu) return;
    dom.playerQualityMenu.classList.remove("floating", "open-upwards", "open-downwards");
    dom.playerQualityMenu.style.top = "";
    dom.playerQualityMenu.style.left = "";
    dom.playerQualityMenu.style.right = "";
    dom.playerQualityMenu.style.minWidth = "";
    dom.playerQualityMenu.style.maxWidth = "";
    dom.playerQualityMenu.style.width = "";
}

function openPlayerQualityMenu(anchor) {
    if (!dom.playerQualityMenu) return;
    const targetAnchor = resolveQualityAnchor(anchor);
    if (!targetAnchor) {
        return;
    }
    if (qualityMenuAnchor && qualityMenuAnchor !== targetAnchor) {
        setQualityAnchorState(qualityMenuAnchor, false);
    }
    qualityMenuAnchor = targetAnchor;
    state.qualityMenuOpen = true;
    ensureFloatingMenuListeners();
    const menu = dom.playerQualityMenu;
    setQualityAnchorState(qualityMenuAnchor, true);
    menu.classList.add("floating");
    menu.classList.remove("show");

    runWithoutTransition(menu, () => {
        updatePlayerQualityMenuPosition();
    });

    requestAnimationFrame(() => {
        if (!state.qualityMenuOpen) return;
        menu.classList.add("show");
    });

    schedulePlayerQualityMenuPositionUpdate();
}

function closePlayerQualityMenu() {
    if (!dom.playerQualityMenu) return;
    const menu = dom.playerQualityMenu;
    const wasOpen = state.qualityMenuOpen || menu.classList.contains("show");

    if (!wasOpen) {
        resetPlayerQualityMenuPosition();
        setQualityAnchorState(qualityMenuAnchor, false);
        qualityMenuAnchor = null;
        releaseFloatingMenuListenersIfIdle();
        return;
    }

    const finalizeClose = () => {
        if (finalizeClose._timeout) {
            window.clearTimeout(finalizeClose._timeout);
            finalizeClose._timeout = null;
        }
        menu.removeEventListener("transitionend", handleTransitionEnd);
        if (state.qualityMenuOpen || menu.classList.contains("show")) {
            return;
        }
        resetPlayerQualityMenuPosition();
        releaseFloatingMenuListenersIfIdle();
    };

    const handleTransitionEnd = (event) => {
        if (event.target !== menu) {
            return;
        }
        if (event.propertyName && !["opacity", "transform"].includes(event.propertyName)) {
            return;
        }
        finalizeClose();
    };

    menu.addEventListener("transitionend", handleTransitionEnd);
    finalizeClose._timeout = window.setTimeout(finalizeClose, 250);

    menu.classList.remove("show");
    state.qualityMenuOpen = false;
    cancelPlayerQualityMenuPositionUpdate();
    setQualityAnchorState(qualityMenuAnchor, false);
    qualityMenuAnchor = null;
}

function handlePlayerQualitySelection(event) {
    const option = event.target.closest(".player-quality-option");
    if (!option) return;
    event.preventDefault();
    event.stopPropagation();
    const { quality } = option.dataset;
    if (quality) {
        selectPlaybackQuality(quality);
    }
}

async function selectPlaybackQuality(quality) {
    const normalized = normalizeQuality(quality);
    if (normalized === state.playbackQuality) {
        closePlayerQualityMenu();
        return;
    }

    state.playbackQuality = normalized;
    updateQualityLabel();
    buildQualityMenu();
    savePlayerState();
    closePlayerQualityMenu();

    const option = QUALITY_OPTIONS.find(item => item.value === normalized);
    if (option) {
        showNotification(`音质已切换为 ${option.label} (${option.description})`);
    }

    if (state.currentSong) {
        const success = await reloadCurrentSong();
        if (!success) {
            showNotification("切换音质失败，请稍后重试", "error");
        }
    }
}

async function reloadCurrentSong() {
    if (!state.currentSong) return true;
    const wasPlaying = !dom.audioPlayer.paused;
    const targetTime = dom.audioPlayer.currentTime || state.currentPlaybackTime || 0;
    try {
        await playSong(state.currentSong, {
            autoplay: wasPlaying,
            startTime: targetTime,
            preserveProgress: true,
        });
        if (!wasPlaying) {
            dom.audioPlayer.pause();
            updatePlayPauseButton();
        }
        return true;
    } catch (error) {
        console.error("切换音质失败:", error);
        return false;
    }
}

async function restoreCurrentSongState() {
    if (!state.currentSong) return;
    try {
        await playSong(state.currentSong, {
            autoplay: false,
            startTime: state.currentPlaybackTime,
            preserveProgress: true,
        });
        dom.audioPlayer.pause();
        updatePlayPauseButton();
    } catch (error) {
        console.warn("恢复音频失败:", error);
    }
}

window.addEventListener("load", () => {
    setupInteractions().catch(error => {
        console.error("初始化界面失败:", error);
        showNotification("初始化失败，请刷新页面重试", "error");
    });
});
dom.audioPlayer.addEventListener("ended", autoPlayNext);

async function setupInteractions() {
    function ensureQualityMenuPortal() {
        if (!dom.playerQualityMenu || !document.body || !isMobileView) {
            return;
        }
        const currentParent = dom.playerQualityMenu.parentElement;
        if (!currentParent || currentParent === document.body) {
            return;
        }
        currentParent.removeChild(dom.playerQualityMenu);
        document.body.appendChild(dom.playerQualityMenu);
    }

    function initializePlaylistEventHandlers() {
        if (!dom.playlistItems) {
            return;
        }

        const activatePlaylistItem = (index) => {
            if (typeof index !== "number" || Number.isNaN(index)) {
                return;
            }
            playPlaylistSong(index);
        };

        const handlePlaylistAction = (event, actionButton) => {
            const index = Number(actionButton.dataset.index);
            if (Number.isNaN(index)) {
                return;
            }

            const action = actionButton.dataset.playlistAction;
            if (action === "remove") {
                event.preventDefault();
                event.stopPropagation();
                removeFromPlaylist(index);
            } else if (action === "download") {
                event.preventDefault();
                event.stopPropagation();
                showQualityMenu(event, index, "playlist");
            }
        };

        const handleClick = (event) => {
            const actionButton = event.target.closest("[data-playlist-action]");
            if (actionButton) {
                handlePlaylistAction(event, actionButton);
                return;
            }
            const item = event.target.closest(".playlist-item");
            if (!item || !dom.playlistItems.contains(item)) {
                return;
            }

            const index = Number(item.dataset.index);
            if (Number.isNaN(index)) {
                return;
            }

            activatePlaylistItem(index);
        };

        const handleKeydown = (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            if (event.target.closest("[data-playlist-action]")) {
                return;
            }
            const item = event.target.closest(".playlist-item");
            if (!item || !dom.playlistItems.contains(item)) {
                return;
            }
            const index = Number(item.dataset.index);
            if (Number.isNaN(index)) {
                return;
            }
            event.preventDefault();
            activatePlaylistItem(index);
        };

        dom.playlistItems.addEventListener("click", handleClick);
        dom.playlistItems.addEventListener("keydown", handleKeydown);
    }

    function applyTheme(isDark) {
        if (!state.themeDefaultsCaptured) {
            captureThemeDefaults();
        }
        document.body.classList.toggle("dark-mode", isDark);
        dom.themeToggleButton.classList.toggle("is-dark", isDark);
        const label = isDark ? "切换为浅色模式" : "切换为深色模式";
        dom.themeToggleButton.setAttribute("aria-label", label);
        dom.themeToggleButton.setAttribute("title", label);
        applyDynamicGradient();
    }

    captureThemeDefaults();
    const savedTheme = safeGetLocalStorage("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialIsDark = savedTheme ? savedTheme === "dark" : prefersDark;
    applyTheme(initialIsDark);

    dom.themeToggleButton.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark-mode");
        applyTheme(isDark);
        safeSetLocalStorage("theme", isDark ? "dark" : "light");
    });

    dom.audioPlayer.volume = state.volume;
    dom.volumeSlider.value = state.volume;
    updateVolumeSliderBackground(state.volume);
    updateVolumeIcon(state.volume);

    buildSourceMenu();
    updateSourceLabel();
    buildQualityMenu();
    ensureQualityMenuPortal();
    initializePlaylistEventHandlers();
    updatePlaylistSelectorUI();
    if (dom.playlistDropdownToggle) {
        dom.playlistDropdownToggle.addEventListener("click", togglePlaylistDropdown);
    }
    if (dom.playlistDropdownMenu) {
        dom.playlistDropdownMenu.addEventListener("click", handlePlaylistDropdownSelection);
    }
    if (dom.createPlaylistBtn) {
        dom.createPlaylistBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleCreatePlaylist();
        });
    }
    if (dom.deletePlaylistBtn) {
        dom.deletePlaylistBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleDeletePlaylist();
        });
    }
    if (dom.modalClose) {
        dom.modalClose.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeModal();
        });
    }
    if (dom.modalOverlay) {
        dom.modalOverlay.addEventListener("click", (event) => {
            if (event.target === dom.modalOverlay) {
                closeModal();
            }
        });
    }
    updateQualityLabel();
    updatePlayPauseButton();
    dom.currentTimeDisplay.textContent = formatTime(state.currentPlaybackTime);
    updateProgressBarBackground(0, Number(dom.progressBar.max));

    dom.playPauseBtn.addEventListener("click", togglePlayPause);
    dom.audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    dom.audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
    dom.audioPlayer.addEventListener("play", updatePlayPauseButton);
    dom.audioPlayer.addEventListener("pause", updatePlayPauseButton);
    dom.audioPlayer.addEventListener("volumechange", onAudioVolumeChange);

    dom.progressBar.addEventListener("input", handleProgressInput);
    dom.progressBar.addEventListener("change", handleProgressChange);
    dom.progressBar.addEventListener("pointerup", handleProgressChange);

    dom.volumeSlider.addEventListener("input", handleVolumeChange);

    if (dom.sourceSelectButton && dom.sourceMenu) {
        dom.sourceSelectButton.addEventListener("click", toggleSourceMenu);
        dom.sourceMenu.addEventListener("click", handleSourceSelection);
    }
    dom.qualityToggle.addEventListener("click", togglePlayerQualityMenu);
    if (dom.mobileQualityToggle) {
        dom.mobileQualityToggle.addEventListener("click", togglePlayerQualityMenu);
    }
    setQualityAnchorState(dom.qualityToggle, false);
    if (dom.mobileQualityToggle) {
        setQualityAnchorState(dom.mobileQualityToggle, false);
    }
    dom.playerQualityMenu.addEventListener("click", handlePlayerQualitySelection);

    if (dom.playlistSyncBtn) {
        dom.playlistSyncBtn.addEventListener("click", copyPlaylistSyncLink);
    }

    if (isMobileView && dom.albumCover) {
        dom.albumCover.addEventListener("click", () => {
            toggleMobileInlineLyrics();
        });
    }

    if (isMobileView && dom.mobileInlineLyrics) {
        dom.mobileInlineLyrics.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!state.isMobileInlineLyricsOpen) {
                return;
            }
            closeMobileInlineLyrics();
        });
    }

    if (dom.showPlaylistBtn) {
        dom.showPlaylistBtn.addEventListener("click", () => {
            if (isMobileView) {
                openMobilePanel("playlist");
            } else {
                switchMobileView("playlist");
            }
        });
    }
    if (dom.showLyricsBtn) {
        dom.showLyricsBtn.addEventListener("click", () => {
            if (isMobileView) {
                openMobilePanel("lyrics");
            } else {
                switchMobileView("lyrics");
            }
        });
    }

    // 播放模式按钮事件
    updatePlayModeUI();
    dom.playModeBtn.addEventListener("click", togglePlayMode);

    // 搜索相关事件 - 修复搜索下拉框显示问题
    dom.searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        debugLog("搜索按钮被点击");
        performSearch();
    });

    dom.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            debugLog("搜索输入框回车键被按下");
            performSearch();
        }
    });

    // 修复：点击搜索区域外部时隐藏搜索结果
    document.addEventListener("click", (e) => {
        const searchArea = document.querySelector(".search-area");
        if (searchArea && !searchArea.contains(e.target) && state.isSearchMode) {
            debugLog("点击搜索区域外部，隐藏搜索结果");
            hideSearchResults();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && dom.modalOverlay && dom.modalOverlay.classList.contains("show")) {
            closeModal();
            return;
        }
        if (e.key === "Escape" && state.sourceMenuOpen) {
            closeSourceMenu();
        }
        if (e.key === "Escape" && playlistDropdownOpen) {
            closePlaylistDropdown();
        }
        if (isMobileView && e.key === "Escape") {
            closeAllMobileOverlays();
        }
    });

    // 搜索结果相关事件处理 - 修复加载更多按钮点击问题
    document.addEventListener("click", (e) => {
        const qualityMenus = document.querySelectorAll(".quality-menu");
        qualityMenus.forEach(menu => {
            if (!menu.contains(e.target) &&
                !e.target.closest(".playlist-item-download")) {
                menu.classList.remove("show");
                const parentItem = menu.closest(".search-result-item");
                if (parentItem) parentItem.classList.remove("menu-active");
            }
        });

        if (state.qualityMenuOpen &&
            dom.playerQualityMenu &&
            !dom.playerQualityMenu.contains(e.target)) {
            const anchor = isElementNode(qualityMenuAnchor) ? qualityMenuAnchor : resolveQualityAnchor();
            if (anchor && anchor.contains(e.target)) {
                return;
            }
            closePlayerQualityMenu();
        }

        if (state.sourceMenuOpen &&
            dom.sourceMenu &&
            dom.sourceSelectButton &&
            !dom.sourceMenu.contains(e.target) &&
            !dom.sourceSelectButton.contains(e.target)) {
            closeSourceMenu();
        }
    });

    // 修复：使用更强健的事件委托处理加载更多按钮点击
    dom.searchResults.addEventListener("click", (e) => {
        debugLog(`点击事件触发: ${e.target.tagName} ${e.target.className} ${e.target.id}`);

        // 检查多种可能的目标元素
        const loadMoreBtn = e.target.closest(".load-more-btn") || 
                           e.target.closest("#loadMoreBtn") ||
                           (e.target.id === "loadMoreBtn" ? e.target : null) ||
                           (e.target.classList.contains("load-more-btn") ? e.target : null);

        if (loadMoreBtn) {
            debugLog("检测到加载更多按钮点击");
            e.preventDefault();
            e.stopPropagation();
            loadMoreResults();
        }
    });

    // 额外的直接事件监听器作为备用
    document.addEventListener("click", (e) => {
        if (e.target.id === "loadMoreBtn" || e.target.closest("#loadMoreBtn")) {
            debugLog("备用事件监听器触发");
            e.preventDefault();
            e.stopPropagation();
            loadMoreResults();
        }
    });

    // 新增：歌词滚动监听
    const attachLyricScrollHandler = (scrollElement, getCurrentElement) => {
        if (!scrollElement) {
            return;
        }
        scrollElement.addEventListener("scroll", () => {
            state.userScrolledLyrics = true;
            clearTimeout(state.lyricsScrollTimeout);
            state.lyricsScrollTimeout = setTimeout(() => {
                state.userScrolledLyrics = false;
                const currentLyricElement = typeof getCurrentElement === "function"
                    ? getCurrentElement()
                    : dom.lyricsContent?.querySelector(".current");
                if (currentLyricElement) {
                    scrollToCurrentLyric(currentLyricElement, scrollElement);
                }
            }, 3000);
        }, { passive: true });
    };

    attachLyricScrollHandler(dom.lyricsScroll, () => dom.lyricsContent?.querySelector(".current"));
    attachLyricScrollHandler(dom.mobileInlineLyricsScroll, () => dom.mobileInlineLyricsContent?.querySelector(".current"));

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            flushPlaylistSyncQueue();
        }
    });

    window.addEventListener("pagehide", () => {
        flushPlaylistSyncQueue();
    });

    await initializePlaylistSync();
    updatePlaylistSyncUI();
    updatePlayModeUI();
    updateQualityLabel();

    if (state.playlistSongs.length > 0) {
        let restoredIndex = state.currentTrackIndex;
        if (restoredIndex < 0 || restoredIndex >= state.playlistSongs.length) {
            restoredIndex = 0;
        }

        state.currentTrackIndex = restoredIndex;
        state.currentPlaylist = "playlist";
        renderPlaylist();

        const restoredSong = state.playlistSongs[restoredIndex];
        if (restoredSong) {
            state.currentSong = restoredSong;
            updatePlaylistHighlight();
            updateCurrentSongInfo(restoredSong).catch(error => {
                console.error("恢复歌曲信息失败:", error);
            });
        }

        savePlayerState();
    } else {
        dom.playlist.classList.add("empty");
        if (dom.playlistItems) {
            dom.playlistItems.innerHTML = "";
        }
        updateMobileClearPlaylistVisibility();
    }

    if (state.currentSong) {
        restoreCurrentSongState();
    }

    if (isMobileView) {
        initializeMobileUI();
        updateMobileClearPlaylistVisibility();
    }
}

// 修复：更新当前歌曲信息和封面
function updateCurrentSongInfo(song, options = {}) {
    const { loadArtwork = true } = options;
    state.currentSong = song;
    dom.currentSongTitle.textContent = song.name;
    updateMobileToolbarTitle();

    // 修复艺人名称显示问题 - 使用正确的字段名
    const artistText = Array.isArray(song.artist) ? song.artist.join(', ') : (song.artist || '未知艺术家');
    dom.currentSongArtist.textContent = artistText;

    cancelDeferredPaletteUpdate();

    if (!loadArtwork) {
        dom.albumCover.classList.add("loading");
        dom.albumCover.innerHTML = PLACEHOLDER_HTML;
        return Promise.resolve();
    }

    // 加载封面
    if (song.pic_id) {
        cancelDeferredPaletteUpdate();
        dom.albumCover.classList.add("loading");
        const picUrl = API.getPicUrl(song);

        API.fetchJson(picUrl)
            .then(data => {
                if (!data || !data.url) {
                    throw new Error("封面地址缺失");
                }

                const img = new Image();
                const imageUrl = preferHttpsUrl(data.url);
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    if (state.currentSong !== song) {
                        return;
                    }
                    setAlbumCoverImage(imageUrl);
                    const shouldApplyImmediately = paletteCache.has(imageUrl) ||
                        (state.currentPaletteImage === imageUrl && state.dynamicPalette);
                    scheduleDeferredPaletteUpdate(imageUrl, { immediate: shouldApplyImmediately });
                };
                img.onerror = () => {
                    if (state.currentSong !== song) {
                        return;
                    }
                    cancelDeferredPaletteUpdate();
                    showAlbumCoverPlaceholder();
                };
                img.src = imageUrl;
            })
            .catch(error => {
                console.error("加载封面失败:", error);
                if (state.currentSong === song) {
                    cancelDeferredPaletteUpdate();
                    showAlbumCoverPlaceholder();
                }
            });
    } else {
        cancelDeferredPaletteUpdate();
        showAlbumCoverPlaceholder();
    }

    return Promise.resolve();
}

// 搜索功能 - 修复搜索下拉框显示问题
async function performSearch(isLiveSearch = false) {
    const query = dom.searchInput.value.trim();
    if (!query) {
        showNotification("请输入搜索关键词", "error");
        return;
    }

    if (state.sourceMenuOpen) {
        closeSourceMenu();
    }

    const source = normalizeSource(state.searchSource);
    state.searchSource = source;
    safeSetLocalStorage("searchSource", source);
    updateSourceLabel();
    buildSourceMenu();

    // 重置搜索状态
    if (!isLiveSearch) {
        state.searchPage = 1;
        state.searchKeyword = query;
        state.searchSource = source;
        state.searchResults = [];
        state.hasMoreResults = true;
        state.renderedSearchCount = 0;
        debugLog(`开始新搜索: ${query}, 来源: ${source}`);
    } else {
        state.searchKeyword = query;
        state.searchSource = source;
    }

    try {
        // 禁用搜索按钮并显示加载状态
        dom.searchBtn.disabled = true;
        dom.searchBtn.innerHTML = '<span class="loader"></span><span>搜索中...</span>';

        // 立即显示搜索模式
        showSearchResults();
        debugLog("已切换到搜索模式");

        // 执行搜索
        const results = await API.search(query, source, 20, state.searchPage);
        debugLog(`API返回结果数量: ${results.length}`);

        if (state.searchPage === 1) {
            state.searchResults = results;
        } else {
            state.searchResults = [...state.searchResults, ...results];
        }

        state.hasMoreResults = results.length === 20;

        // 显示搜索结果
        displaySearchResults(results, {
            reset: state.searchPage === 1,
            totalCount: state.searchResults.length,
        });
        debugLog(`搜索完成: 总共显示 ${state.searchResults.length} 个结果`);

        // 如果没有结果，显示提示
        if (state.searchResults.length === 0) {
            showNotification("未找到相关歌曲", "error");
        }

    } catch (error) {
        console.error("搜索失败:", error);
        showNotification("搜索失败，请稍后重试", "error");
        hideSearchResults();
        debugLog(`搜索失败: ${error.message}`);
    } finally {
        // 恢复搜索按钮状态
        dom.searchBtn.disabled = false;
        dom.searchBtn.innerHTML = '<i class="fas fa-search"></i><span>搜索</span>';
    }
}

// 加载更多搜索结果
async function loadMoreResults() {
    if (!state.hasMoreResults || !state.searchKeyword) {
        debugLog("没有更多结果或搜索关键词为空");
        return;
    }

    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (!loadMoreBtn) {
        debugLog("找不到加载更多按钮");
        return;
    }

    try {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<span class="loader"></span><span>加载中...</span>';

        state.searchPage++;
        debugLog(`加载第 ${state.searchPage} 页结果`);

        const source = normalizeSource(state.searchSource);
        state.searchSource = source;
        safeSetLocalStorage("searchSource", source);
        const results = await API.search(state.searchKeyword, source, 20, state.searchPage);

        if (results.length > 0) {
            state.searchResults = [...state.searchResults, ...results];
            state.hasMoreResults = results.length === 20;
            displaySearchResults(results, {
                totalCount: state.searchResults.length,
            });
            debugLog(`加载完成: 新增 ${results.length} 个结果`);
        } else {
            state.hasMoreResults = false;
            showNotification("没有更多结果了");
            debugLog("没有更多结果");
        }
    } catch (error) {
        console.error("加载更多失败:", error);
        showNotification("加载失败，请稍后重试", "error");
        state.searchPage--; // 回退页码
    } finally {
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = "<i class=\"fas fa-plus\"></i><span>加载更多</span>";
        }
    }
}

function createSearchResultItem(song, index) {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.dataset.index = String(index);

    const info = document.createElement("div");
    info.className = "search-result-info";

    const title = document.createElement("div");
    title.className = "search-result-title";
    title.textContent = song.name || "未知歌曲";

    const artist = document.createElement("div");
    artist.className = "search-result-artist";
    const artistName = Array.isArray(song.artist)
        ? song.artist.join(', ')
        : (song.artist || "未知艺术家");
    const albumText = song.album ? ` - ${song.album}` : "";
    artist.textContent = `${artistName}${albumText}`;

    info.appendChild(title);
    info.appendChild(artist);

    const actions = document.createElement("div");
    actions.className = "search-result-actions";

    const playButton = document.createElement("button");
    playButton.className = "action-btn play";
    playButton.type = "button";
    playButton.title = "播放";
    playButton.innerHTML = '<i class="fas fa-play"></i> 播放';
    playButton.addEventListener("click", () => playSearchResult(index));

    const downloadButton = document.createElement("button");
    downloadButton.className = "action-btn download";
    downloadButton.type = "button";
    downloadButton.title = "下载";
    downloadButton.innerHTML = '<i class="fas fa-download"></i>';
    downloadButton.addEventListener("click", (event) => {
        showQualityMenu(event, index, "search");
    });

    const qualityMenu = document.createElement("div");
    qualityMenu.className = "quality-menu";

    const qualityOptions = [
        { label: "标准音质", suffix: " (128k)", quality: "128" },
        { label: "高音质", suffix: " (192k)", quality: "192" },
        { label: "超高音质", suffix: " (320k)", quality: "320" },
        { label: "无损音质", suffix: "", quality: "999" },
    ];

    qualityOptions.forEach(option => {
        const qualityItem = document.createElement("div");
        qualityItem.className = "quality-option";
        qualityItem.textContent = `${option.label}${option.suffix}`;
        qualityItem.addEventListener("click", (event) => {
            downloadWithQuality(event, index, "search", option.quality);
        });
        qualityMenu.appendChild(qualityItem);
    });

    downloadButton.appendChild(qualityMenu);

    actions.appendChild(playButton);
    actions.appendChild(downloadButton);

    item.appendChild(info);
    item.appendChild(actions);

    return item;
}

function createLoadMoreButton() {
    const button = document.createElement("button");
    button.id = "loadMoreBtn";
    button.className = "load-more-btn";
    button.type = "button";
    button.innerHTML = '<i class="fas fa-plus"></i><span>加载更多</span>';
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        loadMoreResults();
    });
    return button;
}

function displaySearchResults(newItems, options = {}) {
    dom.playlist.classList.remove("empty");
    const container = dom.searchResults;
    if (!container) {
        return;
    }

    const { reset = false, totalCount = state.searchResults.length } = options;

    if (reset) {
        container.innerHTML = "";
        state.renderedSearchCount = 0;
    }

    const existingLoadMore = container.querySelector("#loadMoreBtn");
    if (existingLoadMore) {
        existingLoadMore.remove();
    }

    const itemsToAppend = Array.isArray(newItems) ? newItems : [];

    if (itemsToAppend.length === 0 && state.renderedSearchCount === 0 && totalCount === 0) {
        container.innerHTML = "<div style=\"text-align: center; color: var(--text-secondary-color); padding: 20px;\">未找到相关歌曲</div>";
        state.renderedSearchCount = 0;
        debugLog("显示搜索结果: 0 个结果, 无可用数据");
        return;
    }

    if (itemsToAppend.length > 0) {
        const fragment = document.createDocumentFragment();
        const startIndex = state.renderedSearchCount;
        itemsToAppend.forEach((song, offset) => {
            fragment.appendChild(createSearchResultItem(song, startIndex + offset));
        });
        container.appendChild(fragment);
        state.renderedSearchCount += itemsToAppend.length;
    }

    if (state.hasMoreResults) {
        container.appendChild(createLoadMoreButton());
    }

    const appendedCount = itemsToAppend.length;
    const totalRendered = state.renderedSearchCount;
    debugLog(`显示搜索结果: 新增 ${appendedCount} 个结果, 总计 ${totalRendered} 个, 加载更多按钮: ${state.hasMoreResults ? "显示" : "隐藏"}`);
}

// 显示质量选择菜单
function showQualityMenu(event, index, type) {
    event.stopPropagation();

    // 移除现有的质量菜单
    const existingMenu = document.querySelector(".dynamic-quality-menu");
    if (existingMenu) {
        existingMenu.remove();
    }

    // 创建新的质量菜单
    const menu = document.createElement("div");
    menu.className = "dynamic-quality-menu";
    menu.innerHTML = `
        <div class="quality-option" onclick="downloadWithQuality(event, ${index}, '${type}', '128')">标准音质 (128k)</div>
        <div class="quality-option" onclick="downloadWithQuality(event, ${index}, '${type}', '192')">高音质 (192k)</div>
        <div class="quality-option" onclick="downloadWithQuality(event, ${index}, '${type}', '320')">超高音质 (320k)</div>
        <div class="quality-option" onclick="downloadWithQuality(event, ${index}, '${type}', '999')">无损音质</div>
    `;

    // 设置菜单位置
    const button = event.target.closest("button");
    const rect = button.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = (rect.bottom + 5) + "px";
    menu.style.left = (rect.left - 50) + "px";
    menu.style.zIndex = "10000";

    // 添加到body
    document.body.appendChild(menu);

    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeMenu);
            }
        });
    }, 0);
}

// 根据质量下载 - 支持播放列表模式
async function downloadWithQuality(event, index, type, quality) {
    event.stopPropagation();
    let song;

    if (type === "search") {
        song = state.searchResults[index];
    } else if (type === "playlist") {
        song = state.playlistSongs[index];
    }

    if (!song) return;

    // 关闭菜单并移除 menu-active 类
    document.querySelectorAll(".quality-menu").forEach(menu => {
        menu.classList.remove("show");
        const parentItem = menu.closest(".search-result-item");
        if (parentItem) parentItem.classList.remove("menu-active");
    });

    // 关闭动态质量菜单
    const dynamicMenu = document.querySelector(".dynamic-quality-menu");
    if (dynamicMenu) {
        dynamicMenu.remove();
    }

    try {
        await downloadSong(song, quality);
    } catch (error) {
        console.error("下载失败:", error);
        showNotification("下载失败，请稍后重试", "error");
    }
}

// 修复：播放搜索结果 - 添加到播放列表而不是清空
async function playSearchResult(index) {
    const song = state.searchResults[index];
    if (!song) return;

    try {
        // 立即隐藏搜索结果，显示播放界面
        hideSearchResults();
        dom.searchInput.value = "";
        if (isMobileView) {
            closeMobileSearch();
        }

        // 检查歌曲是否已在播放列表中
        const existingIndex = state.playlistSongs.findIndex(s => s.id === song.id && s.source === song.source);

        if (existingIndex !== -1) {
            // 如果歌曲已存在，直接播放
            state.currentTrackIndex = existingIndex;
            state.currentPlaylist = "playlist";
        } else {
            // 如果歌曲不存在，添加到播放列表
            state.playlistSongs.push(song);
            state.currentTrackIndex = state.playlistSongs.length - 1;
            state.currentPlaylist = "playlist";
        }

        // 更新播放列表显示
        renderPlaylist();

        // 播放歌曲
        await playSong(song);

        showNotification(`正在播放: ${song.name}`);

    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

// 新增：渲染统一播放列表
function renderPlaylist() {
    if (!dom.playlistItems || !dom.playlist) {
        return;
    }

    ensureCurrentPlaylistReference();
    const songs = Array.isArray(state.playlistSongs) ? state.playlistSongs : [];
    updatePlaylistSelectorUI();

    if (songs.length === 0) {
        dom.playlist.classList.add("empty");
        dom.playlistItems.innerHTML = "";
        savePlayerState();
        updatePlaylistHighlight();
        updateMobileClearPlaylistVisibility();
        return;
    }

    dom.playlist.classList.remove("empty");
    const playlistHtml = songs.map((song, index) => {
        const songTitle = escapeHtml(song?.name || "未知歌曲");
        const artistLabel = Array.isArray(song?.artist)
            ? escapeHtml(song.artist.join(", "))
            : escapeHtml(song?.artist || "未知艺术家");
        return `
            <div class="playlist-item" data-index="${index}" role="button" tabindex="0" aria-label="播放 ${songTitle}">
                <div class="playlist-item__info">
                    <span class="playlist-item__title">${songTitle}</span>
                    <span class="playlist-item__artist">${artistLabel}</span>
                </div>
                <div class="playlist-item__actions">
                    <button class="playlist-item-download" type="button" data-playlist-action="download" data-index="${index}" title="下载">
                        <i class="fas fa-download" aria-hidden="true"></i>
                    </button>
                    <button class="playlist-item-remove" type="button" data-playlist-action="remove" data-index="${index}" title="从播放列表移除">
                        <i class="fas fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    dom.playlistItems.innerHTML = playlistHtml;
    savePlayerState();
    updatePlaylistHighlight();
    updateMobileClearPlaylistVisibility();
}

// 新增：从播放列表移除歌曲
function removeFromPlaylist(index) {
    if (index < 0 || index >= state.playlistSongs.length) return;

    const removingCurrent = state.currentPlaylist === "playlist" && state.currentTrackIndex === index;

    if (removingCurrent) {
        if (state.playlistSongs.length === 1) {
            dom.audioPlayer.pause();
            dom.audioPlayer.src = "";
            state.currentTrackIndex = -1;
            state.currentSong = null;
            state.currentAudioUrl = null;
            state.currentPlaybackTime = 0;
            state.lastSavedPlaybackTime = 0;
            dom.progressBar.value = 0;
            dom.progressBar.max = 0;
            dom.currentTimeDisplay.textContent = "00:00";
            dom.durationDisplay.textContent = "00:00";
            updateProgressBarBackground(0, 1);
            dom.currentSongTitle.textContent = "选择一首歌曲开始播放";
            updateMobileToolbarTitle();
            dom.currentSongArtist.textContent = "未知艺术家";
            showAlbumCoverPlaceholder();
            clearLyricsContent();
            if (dom.lyrics) {
                dom.lyrics.dataset.placeholder = "default";
            }
            dom.lyrics.classList.add("empty");
            updatePlayPauseButton();
        } else if (index === state.playlistSongs.length - 1) {
            state.currentTrackIndex = index - 1;
        }
    } else if (state.currentPlaylist === "playlist" && state.currentTrackIndex > index) {
        state.currentTrackIndex--;
    }

    state.playlistSongs.splice(index, 1);
    if (state.currentPlaylist === "playlist" && state.currentTrackIndex < 0) {
        state.currentTrackIndex = state.playlistSongs.length > 0 ? 0 : -1;
    }

    if (state.playlistSongs.length === 0) {
        state.currentPlaylist = "playlist";
    }

    renderPlaylist();

    if (removingCurrent && state.currentPlaylist === "playlist" && state.playlistSongs.length > 0) {
        const targetIndex = Math.min(Math.max(state.currentTrackIndex, 0), state.playlistSongs.length - 1);
        state.currentTrackIndex = targetIndex;
        playPlaylistSong(targetIndex);
    } else {
        updatePlaylistHighlight();
    }

    showNotification("已从播放列表移除", "success");
}

// 新增：清空播放列表
function clearPlaylist() {
    const playlist = ensureCurrentPlaylistReference();
    if (!playlist || playlist.songs.length === 0) {
        return;
    }

    if (state.currentPlaylist === "playlist") {
        dom.audioPlayer.pause();
        dom.audioPlayer.src = "";
        state.currentTrackIndex = -1;
        state.currentSong = null;
        state.currentAudioUrl = null;
        state.currentPlaybackTime = 0;
        state.lastSavedPlaybackTime = 0;
        dom.progressBar.value = 0;
        dom.progressBar.max = 0;
        dom.currentTimeDisplay.textContent = "00:00";
        dom.durationDisplay.textContent = "00:00";
        updateProgressBarBackground(0, 1);
        dom.currentSongTitle.textContent = "选择一首歌曲开始播放";
        updateMobileToolbarTitle();
        dom.currentSongArtist.textContent = "未知艺术家";
        showAlbumCoverPlaceholder();
        clearLyricsContent();
        if (dom.lyrics) {
            dom.lyrics.dataset.placeholder = "default";
        }
        dom.lyrics.classList.add("empty");
        updatePlayPauseButton();
    }

    playlist.songs.length = 0;
    state.playlistSongs = playlist.songs;
    state.currentPlaylist = "playlist";

    renderPlaylist();
    updateMobileClearPlaylistVisibility();
    showNotification("播放列表已清空", "success");
}

// 新增：播放播放列表中的歌曲
async function playPlaylistSong(index) {
    if (index < 0 || index >= state.playlistSongs.length) return;

    const song = state.playlistSongs[index];
    state.currentTrackIndex = index;
    state.currentPlaylist = "playlist";

    try {
        await playSong(song);
        updatePlaylistHighlight();
        if (isMobileView) {
            closeMobilePanel();
        }
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

// 新增：更新播放列表高亮
function updatePlaylistHighlight() {
    if (!dom.playlistItems) return;
    const playlistItems = dom.playlistItems.querySelectorAll(".playlist-item");
    playlistItems.forEach((item, index) => {
        const isCurrent = state.currentPlaylist === "playlist" && index === state.currentTrackIndex;
        item.classList.toggle("current", isCurrent);
        item.setAttribute("aria-current", isCurrent ? "true" : "false");
        item.setAttribute("aria-pressed", isCurrent ? "true" : "false");
    });
}

// 修复：播放歌曲函数 - 支持统一播放列表
function waitForAudioReady(player) {
    if (!player) return Promise.resolve();
    if (player.readyState >= 1) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            player.removeEventListener('loadedmetadata', onLoaded);
            player.removeEventListener('error', onError);
        };
        const onLoaded = () => {
            cleanup();
            resolve();
        };
        const onError = () => {
            cleanup();
            reject(new Error('音频加载失败'));
        };
        player.addEventListener('loadedmetadata', onLoaded, { once: true });
        player.addEventListener('error', onError, { once: true });
    });
}

async function playSong(song, options = {}) {
    const { autoplay = true, startTime = 0, preserveProgress = false } = options;

    window.clearTimeout(pendingPaletteTimer);
    state.audioReadyForPalette = false;
    state.pendingPaletteData = null;
    state.pendingPaletteImage = null;
    state.pendingPaletteImmediate = false;
    state.pendingPaletteReady = false;

    try {
        updateCurrentSongInfo(song, { loadArtwork: false });

        const quality = state.playbackQuality || '320';
        const audioUrl = API.getSongUrl(song, quality);
        debugLog(`获取音频URL: ${audioUrl}`);

        const audioData = await API.fetchJson(audioUrl);

        if (!audioData || !audioData.url) {
            throw new Error('无法获取音频播放地址');
        }

        const originalAudioUrl = audioData.url;
        const proxiedAudioUrl = buildAudioProxyUrl(originalAudioUrl);
        const preferredAudioUrl = preferHttpsUrl(originalAudioUrl);
        const candidateAudioUrls = Array.from(
            new Set([proxiedAudioUrl, preferredAudioUrl, originalAudioUrl].filter(Boolean))
        );

        const primaryAudioUrl = candidateAudioUrls[0] || originalAudioUrl;

        if (proxiedAudioUrl && proxiedAudioUrl !== originalAudioUrl) {
            debugLog(`音频地址已通过代理转换为 HTTPS: ${proxiedAudioUrl}`);
        } else if (preferredAudioUrl && preferredAudioUrl !== originalAudioUrl) {
            debugLog(`音频地址由 HTTP 升级为 HTTPS: ${preferredAudioUrl}`);
        }

        state.currentSong = song;
        state.currentAudioUrl = null;

        dom.audioPlayer.pause();

        if (!preserveProgress) {
            state.currentPlaybackTime = 0;
            state.lastSavedPlaybackTime = 0;
            safeSetLocalStorage('currentPlaybackTime', '0');
        } else if (startTime > 0) {
            state.currentPlaybackTime = startTime;
            state.lastSavedPlaybackTime = startTime;
        }

        state.pendingSeekTime = startTime > 0 ? startTime : null;

        let selectedAudioUrl = null;
        let lastAudioError = null;
        let usedFallbackAudio = false;

        for (const candidateUrl of candidateAudioUrls) {
            dom.audioPlayer.src = candidateUrl;
            dom.audioPlayer.load();

            try {
                await waitForAudioReady(dom.audioPlayer);
                selectedAudioUrl = candidateUrl;
                usedFallbackAudio = candidateUrl !== primaryAudioUrl && candidateAudioUrls.length > 1;
                break;
            } catch (error) {
                lastAudioError = error;
                console.warn('音频元数据加载异常', error);

                if (candidateUrl === primaryAudioUrl && candidateAudioUrls.length > 1) {
                    debugLog('主音频地址加载失败，尝试使用备用地址');
                }
            }
        }

        if (!selectedAudioUrl) {
            throw lastAudioError || new Error('音频加载失败');
        }

        if (usedFallbackAudio) {
            debugLog(`已回退至备用音频地址: ${selectedAudioUrl}`);
            showNotification('主音频加载失败，已切换到备用音源', 'warning');
        }

        state.currentAudioUrl = selectedAudioUrl;

        if (state.pendingSeekTime != null) {
            setAudioCurrentTime(state.pendingSeekTime);
            state.pendingSeekTime = null;
        } else {
            setAudioCurrentTime(dom.audioPlayer.currentTime || 0);
        }

        state.lastSavedPlaybackTime = state.currentPlaybackTime;

        let playPromise = null;

        if (autoplay) {
            playPromise = dom.audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('播放失败:', error);
                    showNotification('播放失败，请检查网络连接', 'error');
                });
            } else {
                playPromise = null;
            }
        } else {
            dom.audioPlayer.pause();
            updatePlayPauseButton();
        }

        scheduleDeferredSongAssets(song, playPromise);

        debugLog(`开始播放: ${song.name} @${quality}`);
    } catch (error) {
        console.error('播放歌曲失败:', error);
        throw error;
    } finally {
        savePlayerState();
    }
}

function scheduleDeferredSongAssets(song, playPromise) {
    const run = () => {
        if (state.currentSong !== song) {
            return;
        }

        updateCurrentSongInfo(song, { loadArtwork: true });
        loadLyrics(song);
        state.audioReadyForPalette = true;
        attemptPaletteApplication();
    };

    const kickoff = () => {
        if (state.currentSong !== song) {
            return;
        }

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(() => {
                if (state.currentSong !== song) {
                    return;
                }

                if (typeof window.requestIdleCallback === "function") {
                    window.requestIdleCallback(() => {
                        if (state.currentSong !== song) {
                            return;
                        }
                        run();
                    }, { timeout: 600 });
                } else {
                    run();
                }
            });
        } else {
            window.setTimeout(run, 0);
        }
    };

    if (playPromise && typeof playPromise.finally === "function") {
        playPromise.finally(kickoff);
    } else {
        kickoff();
    }
}

// 修复：自动播放下一首 - 支持播放模式
function autoPlayNext() {
    if (state.playMode === "single") {
        // 单曲循环
        dom.audioPlayer.currentTime = 0;
        dom.audioPlayer.play();
        return;
    }

    playNext();
    updatePlayPauseButton();
}

// 修复：播放下一首 - 支持播放模式和统一播放列表
function playNext() {
    let nextIndex = -1;
    let playlist = [];

    if (state.currentPlaylist === "playlist") {
        playlist = state.playlistSongs;
    } else if (state.currentPlaylist === "search") {
        playlist = state.searchResults;
    }

    if (playlist.length === 0) return;

    if (state.playMode === "random") {
        // 随机播放
        nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
        // 列表循环
        nextIndex = (state.currentTrackIndex + 1) % playlist.length;
    }

    state.currentTrackIndex = nextIndex;

    if (state.currentPlaylist === "playlist") {
        playPlaylistSong(nextIndex);
    } else if (state.currentPlaylist === "search") {
        playSearchResult(nextIndex);
    }
}

// 修复：播放上一首 - 支持播放模式和统一播放列表
function playPrevious() {
    let prevIndex = -1;
    let playlist = [];

    if (state.currentPlaylist === "playlist") {
        playlist = state.playlistSongs;
    } else if (state.currentPlaylist === "search") {
        playlist = state.searchResults;
    }

    if (playlist.length === 0) return;

    if (state.playMode === "random") {
        // 随机播放
        prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
        // 列表循环
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
    }

    state.currentTrackIndex = prevIndex;

    if (state.currentPlaylist === "playlist") {
        playPlaylistSong(prevIndex);
    } else if (state.currentPlaylist === "search") {
        playSearchResult(prevIndex);
    }
}

// 修复：加载歌词
async function loadLyrics(song) {
    try {
        const lyricUrl = API.getLyric(song);
        debugLog(`获取歌词URL: ${lyricUrl}`);

        const lyricData = await API.fetchJson(lyricUrl);

        if (lyricData && lyricData.lyric) {
            parseLyrics(lyricData.lyric);
            dom.lyrics.classList.remove("empty");
            dom.lyrics.dataset.placeholder = "default";
        } else {
            setLyricsContentHtml("<div>暂无歌词</div>");
            dom.lyrics.classList.add("empty");
            dom.lyrics.dataset.placeholder = "message";
            state.lyricsData = [];
            state.currentLyricLine = -1;
        }
    } catch (error) {
        console.error("加载歌词失败:", error);
        setLyricsContentHtml("<div>歌词加载失败</div>");
        dom.lyrics.classList.add("empty");
        dom.lyrics.dataset.placeholder = "message";
        state.lyricsData = [];
        state.currentLyricLine = -1;
    }
}

// 修复：解析歌词
function parseLyrics(lyricText) {
    const lines = lyricText.split('\n');
    const lyrics = [];

    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();

            if (text) {
                lyrics.push({ time, text });
            }
        }
    });

    state.lyricsData = lyrics.sort((a, b) => a.time - b.time);
    displayLyrics();
}

function setLyricsContentHtml(html) {
    if (dom.lyricsContent) {
        dom.lyricsContent.innerHTML = html;
    }
    if (dom.mobileInlineLyricsContent) {
        dom.mobileInlineLyricsContent.innerHTML = html;
    }
}

function clearLyricsContent() {
    setLyricsContentHtml("");
    state.lyricsData = [];
    state.currentLyricLine = -1;
    if (isMobileView) {
        closeMobileInlineLyrics({ force: true });
    }
}

// 修复：显示歌词
function displayLyrics() {
    const lyricsHtml = state.lyricsData.map((lyric, index) =>
        `<div data-time="${lyric.time}" data-index="${index}">${lyric.text}</div>`
    ).join("");
    setLyricsContentHtml(lyricsHtml);
    if (dom.lyrics) {
        dom.lyrics.dataset.placeholder = "default";
    }
    if (state.isMobileInlineLyricsOpen) {
        syncLyrics();
    }
}

// 修复：同步歌词
function syncLyrics() {
    if (state.lyricsData.length === 0) return;

    const currentTime = dom.audioPlayer.currentTime;
    let currentIndex = -1;

    for (let i = 0; i < state.lyricsData.length; i++) {
        if (currentTime >= state.lyricsData[i].time) {
            currentIndex = i;
        } else {
            break;
        }
    }

    if (currentIndex !== state.currentLyricLine) {
        state.currentLyricLine = currentIndex;

        const lyricTargets = [];
        if (dom.lyricsContent) {
            lyricTargets.push({
                elements: dom.lyricsContent.querySelectorAll("div[data-index]"),
                container: dom.lyricsScroll || dom.lyrics,
            });
        }
        if (dom.mobileInlineLyricsContent) {
            lyricTargets.push({
                elements: dom.mobileInlineLyricsContent.querySelectorAll("div[data-index]"),
                container: dom.mobileInlineLyricsScroll || dom.mobileInlineLyrics,
                inline: true,
            });
        }

        lyricTargets.forEach(({ elements, container, inline }) => {
            elements.forEach((element, index) => {
                if (index === currentIndex) {
                    element.classList.add("current");
                    const shouldScroll = !state.userScrolledLyrics && (!inline || state.isMobileInlineLyricsOpen);
                    if (shouldScroll) {
                        scrollToCurrentLyric(element, container);
                    }
                } else {
                    element.classList.remove("current");
                }
            });
        });
    }
}

// 新增：滚动到当前歌词 - 修复居中显示问题
function scrollToCurrentLyric(element, containerOverride) {
    const container = containerOverride || dom.lyricsScroll || dom.lyrics;
    if (!container || !element) {
        return;
    }
    const containerHeight = container.clientHeight;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 计算元素在容器内部的可视位置，避免受到 offsetParent 影响
    const elementOffsetTop = elementRect.top - containerRect.top + container.scrollTop;
    const elementHeight = elementRect.height;

    // 目标滚动位置：让当前歌词的中心与容器中心对齐
    const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);

    const maxScrollTop = container.scrollHeight - containerHeight;
    const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    if (Math.abs(container.scrollTop - finalScrollTop) > 1) {
        if (typeof container.scrollTo === "function") {
            container.scrollTo({
                top: finalScrollTop,
                behavior: 'smooth'
            });
        } else {
            container.scrollTop = finalScrollTop;
        }
    }

    debugLog(`歌词滚动: 元素在容器内偏移=${elementOffsetTop}, 容器高度=${containerHeight}, 目标滚动=${finalScrollTop}`);
}

// 修复：下载歌曲
async function downloadSong(song, quality = "320") {
    try {
        showNotification("正在准备下载...");

        const audioUrl = API.getSongUrl(song, quality);
        const audioData = await API.fetchJson(audioUrl);

        if (audioData && audioData.url) {
            const proxiedAudioUrl = buildAudioProxyUrl(audioData.url);
            const preferredAudioUrl = preferHttpsUrl(audioData.url);

            if (proxiedAudioUrl !== audioData.url) {
                debugLog(`下载链接已通过代理转换为 HTTPS: ${proxiedAudioUrl}`);
            } else if (preferredAudioUrl !== audioData.url) {
                debugLog(`下载链接由 HTTP 升级为 HTTPS: ${preferredAudioUrl}`);
            }

            const downloadUrl = proxiedAudioUrl || preferredAudioUrl || audioData.url;

            const link = document.createElement("a");
            link.href = downloadUrl;
            const preferredExtension =
                quality === "999" ? "flac" : quality === "740" ? "ape" : "mp3";
            const fileExtension = (() => {
                try {
                    const url = new URL(audioData.url);
                    const pathname = url.pathname || "";
                    const match = pathname.match(/\.([a-z0-9]+)$/i);
                    if (match) {
                        return match[1];
                    }
                } catch (error) {
                    console.warn("无法从下载链接中解析扩展名:", error);
                }
                return preferredExtension;
            })();
            link.download = `${song.name} - ${Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}.${fileExtension}`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification("下载已开始", "success");
        } else {
            throw new Error("无法获取下载地址");
        }
    } catch (error) {
        console.error("下载失败:", error);
        showNotification("下载失败，请稍后重试", "error");
    }
}

// 修复：移动端视图切换
function switchMobileView(view) {
    if (view === "playlist") {
        if (dom.showPlaylistBtn) {
            dom.showPlaylistBtn.classList.add("active");
        }
        if (dom.showLyricsBtn) {
            dom.showLyricsBtn.classList.remove("active");
        }
        dom.playlist.classList.add("active");
        dom.lyrics.classList.remove("active");
    } else if (view === "lyrics") {
        if (dom.showLyricsBtn) {
            dom.showLyricsBtn.classList.add("active");
        }
        if (dom.showPlaylistBtn) {
            dom.showPlaylistBtn.classList.remove("active");
        }
        dom.lyrics.classList.add("active");
        dom.playlist.classList.remove("active");
    }
    if (isMobileView && document.body) {
        document.body.setAttribute("data-mobile-panel-view", view);
        if (dom.mobilePanelTitle) {
            dom.mobilePanelTitle.textContent = view === "lyrics" ? "歌词" : "播放列表";
        }
        updateMobileClearPlaylistVisibility();
    }
}

// 修复：显示通知
function showNotification(message, type = "success") {
    const notification = dom.notification;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
