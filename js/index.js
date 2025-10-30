const dom = {
    container: document.getElementById("mainContainer"),
    backgroundStage: document.getElementById("backgroundStage"),
    backgroundBaseLayer: document.getElementById("backgroundBaseLayer"),
    backgroundTransitionLayer: document.getElementById("backgroundTransitionLayer"),
    playlist: document.getElementById("playlist"),
    playlistItems: document.getElementById("playlistItems"),
    playlistSelectorButton: document.getElementById("playlistSelectorButton"),
    playlistSelectorLabel: document.getElementById("playlistSelectorLabel"),
    playlistMenu: document.getElementById("playlistMenu"),
    createPlaylistBtn: document.getElementById("createPlaylistBtn"),
    importPlaylistBtn: document.getElementById("importPlaylistBtn"),
    deletePlaylistBtn: document.getElementById("deletePlaylistBtn"),
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
const BACKGROUND_TRANSITION_DURATION = 600;
let backgroundTransitionTimer = null;
const PALETTE_APPLY_DELAY = 80;
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

function generateLocalPlaylistId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePlaylistName(name) {
    const base = typeof name === "string" ? name.trim() : "";
    if (!base) {
        return DEFAULT_PLAYLIST_NAME;
    }
    if (base.length > MAX_PLAYLIST_NAME_LENGTH) {
        return base.slice(0, MAX_PLAYLIST_NAME_LENGTH);
    }
    return base;
}

function normalizePlaylistEntry(entry) {
    const data = entry && typeof entry === "object" ? entry : {};
    let id = typeof data.id === "string" && data.id.trim() ? data.id.trim() : generateLocalPlaylistId();
    const normalized = {
        id,
        name: normalizePlaylistName(data.name),
        songs: Array.isArray(data.songs)
            ? data.songs.filter(song => song && typeof song === "object")
            : [],
    };
    if (!normalized.id) {
        normalized.id = generateLocalPlaylistId();
    }
    return normalized;
}

function clonePlaylistSongs(songs) {
    return Array.isArray(songs)
        ? songs.filter(song => song && typeof song === "object")
        : [];
}

function extractNeteasePlaylistId(rawInput) {
    if (rawInput == null) {
        return "";
    }
    const trimmed = String(rawInput).trim();
    if (!trimmed) {
        return "";
    }
    if (/^\d+$/.test(trimmed)) {
        return trimmed;
    }
    const directMatch = trimmed.match(/id=(\d+)/);
    if (directMatch) {
        return directMatch[1];
    }
    try {
        const normalized = /^https?:\/\//i.test(trimmed)
            ? trimmed
            : `https://${trimmed.replace(/^\/+/, "")}`;
        const url = new URL(normalized);
        const searchId = url.searchParams.get("id");
        if (searchId && /^\d+$/.test(searchId)) {
            return searchId;
        }
        if (url.hash) {
            const hashMatch = url.hash.match(/id=(\d+)/);
            if (hashMatch) {
                return hashMatch[1];
            }
            const hashPath = url.hash.replace(/^#/, "");
            if (hashPath) {
                try {
                    const hashUrl = new URL(`${url.origin}/${hashPath.startsWith("/") ? hashPath.slice(1) : hashPath}`);
                    const hashId = hashUrl.searchParams.get("id");
                    if (hashId && /^\d+$/.test(hashId)) {
                        return hashId;
                    }
                } catch {
                    // ignore secondary hash parsing errors
                }
            }
        }
        const pathMatch = url.pathname.match(/playlist[\/-](\d+)/i);
        if (pathMatch) {
            return pathMatch[1];
        }
    } catch {
        // ignore URL parsing errors
    }
    return "";
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
const PLAYLIST_SYNC_SCOPES = ["playlist", "online", "search"];
const PLAYLIST_COLLECTION_STORAGE_KEY = "playlists.v1";
const ACTIVE_PLAYLIST_ID_STORAGE_KEY = "activePlaylistId.v1";
const DEFAULT_PLAYLIST_NAME = "默认歌单";
const MAX_PLAYLIST_NAME_LENGTH = 40;
const MAX_NETEASE_IMPORT_TRACKS = 500;

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
        setActivePlaylistSongs(normalized.songs);
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
    return match ? match.value : "192";
}

const savedPlaylistSongs = (() => {
    const stored = safeGetLocalStorage("playlistSongs");
    const playlist = parseJSON(stored, []);
    return Array.isArray(playlist) ? playlist : [];
})();

const savedPlaylistCollection = (() => {
    const stored = safeGetLocalStorage(PLAYLIST_COLLECTION_STORAGE_KEY);
    const parsed = parseJSON(stored, null);
    if (!Array.isArray(parsed)) {
        return null;
    }
    const normalized = [];
    const seenIds = new Set();
    for (const entry of parsed) {
        const playlist = normalizePlaylistEntry(entry);
        let id = playlist.id;
        while (seenIds.has(id)) {
            id = generateLocalPlaylistId();
        }
        playlist.id = id;
        seenIds.add(id);
        normalized.push(playlist);
    }
    return normalized;
})();

const savedActivePlaylistId = (() => {
    const stored = safeGetLocalStorage(ACTIVE_PLAYLIST_ID_STORAGE_KEY);
    return typeof stored === "string" && stored.trim() ? stored.trim() : null;
})();

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
    const playlists = ["playlist", "online", "search"];
    return playlists.includes(stored) ? stored : "playlist";
})();

const initialPlaylists = (() => {
    const collection = savedPlaylistCollection && savedPlaylistCollection.length ? savedPlaylistCollection : null;
    if (collection && collection.length) {
        return collection.map(playlist => ({
            id: playlist.id,
            name: normalizePlaylistName(playlist.name),
            songs: clonePlaylistSongs(playlist.songs),
        }));
    }
    const fallbackSongs = clonePlaylistSongs(savedPlaylistSongs);
    const defaultPlaylist = normalizePlaylistEntry({
        id: generateLocalPlaylistId(),
        name: DEFAULT_PLAYLIST_NAME,
        songs: fallbackSongs,
    });
    return [defaultPlaylist];
})();

const initialActivePlaylistId = (() => {
    if (!initialPlaylists.length) {
        return null;
    }
    if (savedActivePlaylistId && initialPlaylists.some(playlist => playlist.id === savedActivePlaylistId)) {
        return savedActivePlaylistId;
    }
    return initialPlaylists[0].id;
})();

const initialActivePlaylist = (() => {
    if (!initialPlaylists.length) {
        return null;
    }
    const matched = initialPlaylists.find(playlist => playlist.id === initialActivePlaylistId);
    return matched || initialPlaylists[0];
})();

const initialPlaylistSongs = initialActivePlaylist ? initialActivePlaylist.songs : [];

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

    getRadarPlaylist: async (playlistId = "3778678", options = {}) => {
        const signature = API.generateSignature();

        let limit = 50;
        let offset = 0;

        if (typeof options === "number") {
            limit = options;
        } else if (options && typeof options === "object") {
            if (Number.isFinite(options.limit)) {
                limit = options.limit;
            } else if (Number.isFinite(options.count)) {
                limit = options.count;
            }
            if (Number.isFinite(options.offset)) {
                offset = options.offset;
            }
        }

        limit = Math.max(1, Math.min(200, Math.trunc(limit)) || 50);
        offset = Math.max(0, Math.trunc(offset) || 0);

        const params = new URLSearchParams({
            types: "playlist",
            id: playlistId,
            limit: String(limit),
            offset: String(offset),
            s: signature,
        });
        const url = `${API.baseUrl}?${params.toString()}`;

        try {
            const data = await API.fetchJson(url);
            const tracks = data && data.playlist && Array.isArray(data.playlist.tracks)
                ? data.playlist.tracks.slice(0, limit)
                : [];

            if (tracks.length === 0) throw new Error("No tracks found");

            return tracks.map(track => ({
                id: track.id,
                name: track.name,
                artist: Array.isArray(track.ar) ? track.ar.map(artist => artist.name).join(" / ") : "",
                source: "netease",
                lyric_id: track.id,
                pic_id: track.al?.pic_str || track.al?.pic || track.al?.picUrl || "",
            }));
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    },

    getNeteasePlaylistDetail: async (playlistId, options = {}) => {
        if (!playlistId) {
            throw new Error("缺少歌单ID");
        }

        const rawLimit = Number.isFinite(options.limit) ? Math.trunc(options.limit) : null;
        const rawMaxTracks = Number.isFinite(options.maxTracks) ? Math.trunc(options.maxTracks) : null;
        const rawOffset = Number.isFinite(options.offset) ? Math.trunc(options.offset) : null;

        const chunkLimit = Math.max(1, Math.min(200, rawLimit ?? 200));
        const maxTracks = Math.max(chunkLimit, Math.min(MAX_NETEASE_IMPORT_TRACKS, rawMaxTracks ?? MAX_NETEASE_IMPORT_TRACKS));
        let offset = Math.max(0, rawOffset ?? 0);

        const aggregated = [];
        const seen = new Set();
        let playlistMeta = null;
        let totalCount = null;
        let attempts = 0;

        while (aggregated.length < maxTracks) {
            const params = new URLSearchParams({
                types: "playlist",
                id: playlistId,
                limit: String(chunkLimit),
                offset: String(offset),
                s: API.generateSignature(),
            });
            const url = `${API.baseUrl}?${params.toString()}`;

            const data = await API.fetchJson(url);
            const playlist = data && data.playlist ? data.playlist : null;
            if (!playlist) {
                break;
            }

            if (!playlistMeta) {
                playlistMeta = {
                    id: playlist.id ?? playlistId,
                    name: playlist.name ?? "",
                    trackCount: typeof playlist.trackCount === "number" ? playlist.trackCount : null,
                    coverImgUrl: playlist.coverImgUrl || playlist.cover?.imgUrl || "",
                };
            }

            if (totalCount == null && typeof playlist.trackCount === "number") {
                totalCount = playlist.trackCount;
            }

            const rawTracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
            const beforeCount = aggregated.length;

            for (const track of rawTracks) {
                if (!track || typeof track !== "object") {
                    continue;
                }
                const songId = track.id ?? track.trackId ?? track.song?.id;
                if (songId == null) {
                    continue;
                }
                const normalizedId = String(songId);
                if (seen.has(normalizedId)) {
                    continue;
                }
                seen.add(normalizedId);

                const artistNames = Array.isArray(track.ar)
                    ? track.ar.map(artist => (artist && artist.name) ? artist.name : null).filter(Boolean)
                    : Array.isArray(track.artists)
                        ? track.artists.map(artist => {
                            if (!artist) return null;
                            if (typeof artist === "string") return artist;
                            if (Array.isArray(artist.alias) && artist.alias.length) {
                                return artist.alias[0];
                            }
                            return artist.name || null;
                        }).filter(Boolean)
                        : [];
                const artist = artistNames.length
                    ? artistNames.join(" / ")
                    : (typeof track.artist === "string" && track.artist.trim())
                        ? track.artist
                        : "未知艺术家";

                const albumName = track.al?.name || track.album?.name || track.album || "";
                const picId = track.al?.pic_str
                    || track.al?.pic
                    || track.al?.picUrl
                    || track.album?.picUrl
                    || track.al?.coverImgId_str
                    || track.al?.coverImgId
                    || track.al?.picId
                    || "";

                aggregated.push({
                    id: normalizedId,
                    name: track.name || track.song?.name || `未命名歌曲 ${normalizedId}`,
                    artist,
                    album: albumName,
                    source: "netease",
                    lyric_id: track.id || track.lyricId || normalizedId,
                    pic_id: picId,
                    url_id: normalizedId,
                });

                if (aggregated.length >= maxTracks) {
                    break;
                }
            }

            if (aggregated.length >= maxTracks) {
                break;
            }

            if (rawTracks.length < chunkLimit) {
                break;
            }

            if (aggregated.length === beforeCount) {
                break;
            }

            offset += rawTracks.length;
            attempts += 1;
            if (attempts >= 5) {
                break;
            }
            if (totalCount != null && offset >= totalCount) {
                break;
            }
        }

        const expectedTotal = totalCount ?? playlistMeta?.trackCount ?? null;
        const truncatedByLimit = aggregated.length >= maxTracks;
        const truncated = truncatedByLimit || (expectedTotal != null && expectedTotal > aggregated.length);

        return {
            playlist: playlistMeta || { id: playlistId, name: "", trackCount: aggregated.length, coverImgUrl: "" },
            songs: aggregated.slice(0, maxTracks),
            truncated,
            truncatedByLimit,
        };
    },

    getSongUrl: (song, quality = "192") => {
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

const state = {
    onlineSongs: [],
    searchResults: [],
    renderedSearchCount: 0,
    playlists: initialPlaylists,
    activePlaylistId: initialActivePlaylistId,
    currentTrackIndex: savedCurrentTrackIndex,
    currentAudioUrl: null,
    lyricsData: [],
    currentLyricLine: -1,
    currentPlaylist: savedCurrentPlaylist, // 'online', 'search', or 'playlist'
    searchPage: 1,
    searchKeyword: "", // 确保这里有初始值
    searchSource: savedSearchSource,
    hasMoreResults: true,
    currentSong: savedCurrentSong,
    debugMode: false,
    isSearchMode: false, // 新增：搜索模式状态
    playlistSongs: initialPlaylistSongs, // 当前激活歌单的歌曲
    playMode: savedPlayMode, // 新增：播放模式 'list', 'single', 'random'
    playbackQuality: savedPlaybackQuality,
    volume: savedVolume,
    currentPlaybackTime: savedPlaybackTime,
    lastSavedPlaybackTime: savedPlaybackTime,
    pendingSeekTime: null,
    isSeeking: false,
    qualityMenuOpen: false,
    sourceMenuOpen: false,
    playlistMenuOpen: false,
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
    defaultDocumentTitle: document.title,
    tabTitleBase: document.title,
    currentLyricForTitle: "",
    bilingualLyrics: true,
};

let playlistPickerElement = null;

function getPlaylistById(id) {
    if (!id) {
        return null;
    }
    return state.playlists.find(playlist => playlist.id === id) || null;
}

function ensureActivePlaylist() {
    if (!state.playlists.length) {
        const fallback = normalizePlaylistEntry({
            id: generateLocalPlaylistId(),
            name: DEFAULT_PLAYLIST_NAME,
            songs: [],
        });
        state.playlists.push(fallback);
        state.activePlaylistId = fallback.id;
        state.playlistSongs = fallback.songs;
        return fallback;
    }
    let playlist = getPlaylistById(state.activePlaylistId);
    if (!playlist) {
        playlist = state.playlists[0];
        state.activePlaylistId = playlist.id;
        state.playlistSongs = playlist.songs;
    }
    return playlist;
}

function getActivePlaylist() {
    return ensureActivePlaylist();
}

function setActivePlaylistSongs(nextSongs) {
    const playlist = ensureActivePlaylist();
    playlist.songs = Array.isArray(nextSongs) ? clonePlaylistSongs(nextSongs) : [];
    state.playlistSongs = playlist.songs;
    return playlist;
}

function getSongIdentityKey(song) {
    if (!song || typeof song !== "object") {
        return "";
    }
    const id = song.id != null ? String(song.id) : JSON.stringify(song);
    const source = song.source != null ? String(song.source) : "";
    return `${id}::${source}`;
}

function addSongToPlaylist(song, playlistId = state.activePlaylistId) {
    const playlist = getPlaylistById(playlistId);
    if (!playlist || !song || typeof song !== "object") {
        return { added: false, index: -1, playlist: playlist || null, duplicate: false };
    }
    playlist.songs = Array.isArray(playlist.songs) ? playlist.songs : [];
    const songs = playlist.songs;
    const key = getSongIdentityKey(song);
    const existingIndex = songs.findIndex(item => getSongIdentityKey(item) === key);
    if (existingIndex !== -1) {
        return { added: false, index: existingIndex, playlist, duplicate: true };
    }
    songs.push(song);
    if (playlistId === state.activePlaylistId) {
        state.playlistSongs = songs;
    }
    return { added: true, index: songs.length - 1, playlist, duplicate: false };
}

function addSongsToPlaylist(songs, playlistId = state.activePlaylistId) {
    const playlist = getPlaylistById(playlistId);
    if (!playlist || !Array.isArray(songs) || !songs.length) {
        return { added: 0, duplicates: 0, playlist };
    }
    playlist.songs = Array.isArray(playlist.songs) ? playlist.songs : [];
    const existing = new Set(playlist.songs.map(getSongIdentityKey));
    let added = 0;
    let duplicates = 0;
    for (const song of songs) {
        if (!song || typeof song !== "object") {
            continue;
        }
        const key = getSongIdentityKey(song);
        if (existing.has(key)) {
            duplicates += 1;
            continue;
        }
        existing.add(key);
        playlist.songs.push(song);
        added += 1;
    }
    if (playlistId === state.activePlaylistId) {
        state.playlistSongs = playlist.songs;
    }
    return { added, duplicates, playlist };
}

function updatePlaylistSelectorLabel() {
    if (!dom.playlistSelectorLabel || !dom.playlistSelectorButton) {
        return;
    }
    const playlist = getActivePlaylist();
    const name = playlist ? playlist.name : DEFAULT_PLAYLIST_NAME;
    dom.playlistSelectorLabel.textContent = name;
    dom.playlistSelectorButton.setAttribute("aria-expanded", state.playlistMenuOpen ? "true" : "false");
    if (playlist) {
        dom.playlistSelectorButton.dataset.playlistId = playlist.id;
        dom.playlistSelectorButton.title = `当前歌单：${name}`;
    } else {
        dom.playlistSelectorButton.dataset.playlistId = "";
        dom.playlistSelectorButton.title = "选择歌单";
    }
    if (dom.deletePlaylistBtn) {
        const disableDelete = state.playlists.length <= 1;
        dom.deletePlaylistBtn.disabled = disableDelete;
        dom.deletePlaylistBtn.setAttribute("aria-disabled", disableDelete ? "true" : "false");
        dom.deletePlaylistBtn.title = disableDelete ? "至少保留一个歌单" : "删除当前歌单";
    }
}

function buildPlaylistMenu() {
    if (!dom.playlistMenu) {
        return;
    }
    dom.playlistMenu.innerHTML = "";
    if (!state.playlists.length) {
        const empty = document.createElement("div");
        empty.className = "playlist-selector__empty";
        empty.textContent = "暂无歌单";
        dom.playlistMenu.appendChild(empty);
        return;
    }
    state.playlists.forEach(playlist => {
        const isActive = playlist.id === state.activePlaylistId;
        const item = document.createElement("div");
        item.className = "playlist-selector__item" + (isActive ? " active" : "");
        item.dataset.playlistId = playlist.id;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", isActive ? "true" : "false");
        const nameSpan = document.createElement("span");
        nameSpan.className = "playlist-selector__item-name";
        nameSpan.textContent = playlist.name;
        const countSpan = document.createElement("span");
        countSpan.className = "playlist-selector__item-count";
        countSpan.textContent = String(Array.isArray(playlist.songs) ? playlist.songs.length : 0);
        item.appendChild(nameSpan);
        item.appendChild(countSpan);
        dom.playlistMenu.appendChild(item);
    });
}

function openPlaylistMenu() {
    if (!dom.playlistMenu || !dom.playlistSelectorButton) {
        return;
    }
    if (state.playlistMenuOpen) {
        return;
    }
    closePlaylistPicker();
    buildPlaylistMenu();
    dom.playlistMenu.classList.add("show");
    dom.playlistSelectorButton.setAttribute("aria-expanded", "true");
    state.playlistMenuOpen = true;
}

function closePlaylistMenu() {
    if (!dom.playlistMenu || !dom.playlistSelectorButton) {
        state.playlistMenuOpen = false;
        return;
    }
    dom.playlistMenu.classList.remove("show");
    dom.playlistSelectorButton.setAttribute("aria-expanded", "false");
    state.playlistMenuOpen = false;
}

function togglePlaylistMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (state.playlistMenuOpen) {
        closePlaylistMenu();
    } else {
        openPlaylistMenu();
    }
}

function handlePlaylistMenuSelection(event) {
    const option = event.target.closest(".playlist-selector__item");
    if (!option) {
        return;
    }
    const playlistId = option.dataset.playlistId;
    closePlaylistMenu();
    if (playlistId) {
        switchActivePlaylist(playlistId);
    }
}

function switchActivePlaylist(playlistId) {
    const playlist = getPlaylistById(playlistId);
    if (!playlist || playlist.id === state.activePlaylistId) {
        updatePlaylistSelectorLabel();
        return;
    }
    closePlaylistPicker();
    closePlaylistMenu();
    state.activePlaylistId = playlist.id;
    state.playlistSongs = playlist.songs;
    state.currentPlaylist = "playlist";
    if (state.currentPlaylist === "playlist") {
        state.currentTrackIndex = -1;
    }
    renderPlaylist();
}

function promptForPlaylistName(defaultName = "") {
    const suggestion = normalizePlaylistName(defaultName || `新歌单${state.playlists.length + 1}`);
    const result = window.prompt("输入歌单名称", suggestion);
    if (result === null) {
        return null;
    }
    const normalized = normalizePlaylistName(result);
    return normalized || suggestion;
}

function createPlaylistWithName(name, { activate = true, songs = [] } = {}) {
    const playlist = normalizePlaylistEntry({
        id: generateLocalPlaylistId(),
        name,
        songs,
    });
    state.playlists.push(playlist);
    if (activate) {
        state.activePlaylistId = playlist.id;
        state.playlistSongs = playlist.songs;
        state.currentTrackIndex = -1;
    }
    buildPlaylistMenu();
    updatePlaylistSelectorLabel();
    if (!activate) {
        savePlayerState();
    }
    return playlist;
}

function handleCreatePlaylist() {
    closePlaylistPicker();
    closePlaylistMenu();
    const name = promptForPlaylistName();
    if (name === null) {
        return;
    }
    const playlist = createPlaylistWithName(name, { activate: true });
    state.currentPlaylist = "playlist";
    renderPlaylist();
    showNotification(`已创建歌单「${playlist.name}」`, "success");
}

function deleteActivePlaylist() {
    if (state.playlists.length <= 1) {
        showNotification("至少保留一个歌单", "warning");
        return;
    }
    closePlaylistPicker();
    closePlaylistMenu();
    const playlist = getActivePlaylist();
    if (!playlist) {
        return;
    }
    const message = playlist.songs.length
        ? `确定删除歌单「${playlist.name}」？这将移除其中的 ${playlist.songs.length} 首歌曲`
        : `确定删除歌单「${playlist.name}」？`;
    if (!window.confirm(message)) {
        return;
    }
    const index = state.playlists.findIndex(item => item.id === playlist.id);
    if (index === -1) {
        return;
    }
    const wasCurrentPlaylist = state.currentPlaylist === "playlist" && state.activePlaylistId === playlist.id;
    if (wasCurrentPlaylist) {
        clearPlaylist({ silent: true });
    }
    state.playlists.splice(index, 1);
    const next = state.playlists[index] || state.playlists[index - 1] || state.playlists[0] || null;
    if (next) {
        state.activePlaylistId = next.id;
        state.playlistSongs = next.songs;
    } else {
        const fallback = createPlaylistWithName(DEFAULT_PLAYLIST_NAME, { activate: true });
        state.activePlaylistId = fallback.id;
        state.playlistSongs = fallback.songs;
    }
    state.currentPlaylist = "playlist";
    renderPlaylist();
    showNotification(`已删除歌单「${playlist.name}」`, "success");
}

async function handleImportNeteasePlaylist() {
    closePlaylistPicker();
    closePlaylistMenu();

    const userInput = window.prompt("输入网易云歌单链接或ID", "");
    if (userInput === null) {
        return;
    }

    const playlistId = extractNeteasePlaylistId(userInput);
    if (!playlistId) {
        showNotification("请输入有效的网易云歌单链接或ID", "error");
        return;
    }

    const button = dom.importPlaylistBtn;
    let originalButtonHtml = null;
    if (button) {
        originalButtonHtml = button.innerHTML;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        const { playlist, songs, truncated, truncatedByLimit } = await API.getNeteasePlaylistDetail(playlistId, {
            limit: 200,
            maxTracks: MAX_NETEASE_IMPORT_TRACKS,
            offset: 0,
        });

        if (!songs.length) {
            showNotification("未能从该歌单导入歌曲，请检查链接是否正确", "error");
            return;
        }

        const activePlaylist = getActivePlaylist();
        const activeName = activePlaylist ? activePlaylist.name : DEFAULT_PLAYLIST_NAME;
        const remoteName = playlist && playlist.name ? playlist.name : "网易云歌单";

        const shouldCreateNew = playlist && playlist.name
            ? window.confirm(`导入歌单「${playlist.name}」，是否创建新的本地歌单保存？\n选择“确定”创建新歌单，选择“取消”将歌曲添加到当前歌单「${activeName}」。`)
            : false;

        if (shouldCreateNew) {
            const desiredName = promptForPlaylistName(remoteName);
            if (desiredName === null) {
                showNotification("已取消导入", "warning");
                return;
            }
            const created = createPlaylistWithName(desiredName, { activate: true, songs });
            state.currentPlaylist = "playlist";
            state.currentTrackIndex = -1;
            renderPlaylist();
            showNotification(`已导入 ${songs.length} 首歌曲到新歌单「${created.name}」`, "success");
            if (truncated) {
                const truncatedMessage = truncatedByLimit
                    ? `部分歌曲未导入，已达到导入上限（最多 ${MAX_NETEASE_IMPORT_TRACKS} 首）`
                    : "部分歌曲未导入，网易云接口未返回全部歌曲";
                showNotification(truncatedMessage, "warning");
            }
            return;
        }

        const targetPlaylistId = activePlaylist ? activePlaylist.id : state.activePlaylistId;
        const result = addSongsToPlaylist(songs, targetPlaylistId);
        const target = getPlaylistById(targetPlaylistId);

        if (result.added > 0) {
            if (target && target.id === state.activePlaylistId) {
                renderPlaylist();
            } else {
                buildPlaylistMenu();
                updatePlaylistSelectorLabel();
                savePlayerState();
            }
            let message = `已导入 ${result.added} 首歌曲到「${target ? target.name : DEFAULT_PLAYLIST_NAME}」`;
            if (result.duplicates > 0) {
                message += `，跳过 ${result.duplicates} 首已存在的歌曲`;
            }
            showNotification(message, "success");
            if (truncated) {
                const truncatedMessage = truncatedByLimit
                    ? `部分歌曲未导入，已达到导入上限（最多 ${MAX_NETEASE_IMPORT_TRACKS} 首）`
                    : "部分歌曲未导入，网易云接口未返回全部歌曲";
                showNotification(truncatedMessage, "warning");
            }
        } else {
            showNotification("导入的歌曲已全部存在当前歌单", "warning");
        }
    } catch (error) {
        console.error("导入网易云歌单失败:", error);
        const message = error && error.message ? error.message : "导入失败";
        showNotification(`导入失败：${message}`, "error");
    } finally {
        if (button) {
            button.disabled = false;
            button.setAttribute("aria-busy", "false");
            if (originalButtonHtml != null) {
                button.innerHTML = originalButtonHtml;
            }
        }
    }
}

function closePlaylistPicker() {
    if (playlistPickerElement && playlistPickerElement.parentNode) {
        playlistPickerElement.parentNode.removeChild(playlistPickerElement);
    }
    playlistPickerElement = null;
}

function openPlaylistPickerForSearchResult(anchor, index) {
    const song = state.searchResults[index];
    if (!song || !anchor) {
        return;
    }
    closePlaylistMenu();
    closePlaylistPicker();
    const menu = document.createElement("div");
    menu.className = "playlist-picker";
    if (!state.playlists.length) {
        const empty = document.createElement("div");
        empty.className = "playlist-picker__empty";
        empty.textContent = "暂无歌单，请先创建一个";
        menu.appendChild(empty);
    } else {
        state.playlists.forEach(playlist => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "playlist-picker__item" + (playlist.id === state.activePlaylistId ? " playlist-picker__item--active" : "");
            item.dataset.playlistId = playlist.id;
            const nameSpan = document.createElement("span");
            nameSpan.className = "playlist-picker__item-name";
            nameSpan.textContent = playlist.name;
            const countSpan = document.createElement("span");
            countSpan.className = "playlist-picker__item-count";
            countSpan.textContent = String(Array.isArray(playlist.songs) ? playlist.songs.length : 0);
            item.appendChild(nameSpan);
            item.appendChild(countSpan);
            item.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const result = addSongToPlaylist(song, playlist.id);
                if (playlist.id === state.activePlaylistId) {
                    renderPlaylist();
                } else if (result.added) {
                    buildPlaylistMenu();
                    savePlayerState();
                }
                closePlaylistPicker();
                if (result.added) {
                    showNotification(`已添加到「${playlist.name}」`, "success");
                } else if (result.duplicate) {
                    showNotification("歌曲已在歌单中", "warning");
                }
            });
            menu.appendChild(item);
        });
    }
    const createButton = document.createElement("button");
    createButton.type = "button";
    createButton.className = "playlist-picker__item playlist-picker__item--create";
    const createLabel = document.createElement("span");
    createLabel.className = "playlist-picker__item-name";
    const icon = document.createElement("i");
    icon.className = "fas fa-plus playlist-picker__item-icon";
    icon.setAttribute("aria-hidden", "true");
    createLabel.appendChild(icon);
    createLabel.appendChild(document.createTextNode("新建歌单"));
    createButton.appendChild(createLabel);
    createButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closePlaylistPicker();
        const name = promptForPlaylistName();
        if (name === null) {
            return;
        }
        const playlist = createPlaylistWithName(name, { activate: true });
        const result = addSongToPlaylist(song, playlist.id);
        renderPlaylist();
        if (result.added) {
            showNotification(`已创建歌单并添加到「${playlist.name}」`, "success");
        } else if (result.duplicate) {
            showNotification("歌曲已在歌单中", "warning");
        }
    });
    menu.appendChild(createButton);
    menu.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    document.body.appendChild(menu);
    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    let left = anchorRect.left;
    let top = anchorRect.bottom + 8;
    if (left + menuRect.width > viewportWidth - 16) {
        left = Math.max(16, viewportWidth - menuRect.width - 16);
    }
    if (top + menuRect.height > viewportHeight - 16) {
        top = Math.max(16, anchorRect.top - menuRect.height - 8);
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    playlistPickerElement = menu;
}

function applyDocumentTitle() {
    const fallbackTitle = state.defaultDocumentTitle || document.title || "";
    const lyricText = (state.currentLyricForTitle || "").trim();
    const baseTitle = (state.tabTitleBase || fallbackTitle).trim();
    const parts = [];
    if (lyricText) {
        parts.push(lyricText);
    }
    if (baseTitle && baseTitle !== lyricText) {
        parts.push(baseTitle);
    }
    const nextTitle = parts.join(" · ") || fallbackTitle;
    if (document.title !== nextTitle) {
        document.title = nextTitle;
    }
}

function setTabTitleBase(base) {
    const fallbackTitle = state.defaultDocumentTitle || document.title || "";
    const normalized = typeof base === "string" ? base.trim() : "";
    const nextBase = normalized || fallbackTitle;
    if (state.tabTitleBase !== nextBase) {
        state.tabTitleBase = nextBase;
    }
    applyDocumentTitle();
}

function setTabTitleLyric(lyric) {
    const normalized = typeof lyric === "string" ? lyric.trim() : "";
    if (state.currentLyricForTitle !== normalized) {
        state.currentLyricForTitle = normalized;
    }
    applyDocumentTitle();
}

let sourceMenuPositionFrame = null;
let qualityMenuPositionFrame = null;
let floatingMenuListenersAttached = false;
let qualityMenuAnchor = null;

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
    void imageUrl;

    cancelDeferredPaletteUpdate();

    if (paletteAbortController) {
        paletteAbortController.abort();
        paletteAbortController = null;
    }

    state.currentPaletteImage = null;

    queueDefaultPalette({ immediate });
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
        state.dynamicPalette = cached;
        state.currentPaletteImage = imageUrl;
        applyDynamicGradient({ immediate: false });
        return;
    }

    if (state.currentPaletteImage === imageUrl && state.dynamicPalette) {
        applyDynamicGradient({ immediate: false });
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
        state.dynamicPalette = palette;
        state.currentPaletteImage = imageUrl;
        applyDynamicGradient({ immediate: false });
    } catch (error) {
        if (error?.name === "AbortError") {
            return;
        }
        console.warn("获取动态背景失败:", error);
    } finally {
        if (controller && paletteAbortController === controller) {
            paletteAbortController = null;
        }
    }
}

function savePlayerState() {
    safeSetLocalStorage("playlistSongs", JSON.stringify(state.playlistSongs));
    safeSetLocalStorage(PLAYLIST_COLLECTION_STORAGE_KEY, JSON.stringify(state.playlists));
    if (state.activePlaylistId) {
        safeSetLocalStorage(ACTIVE_PLAYLIST_ID_STORAGE_KEY, state.activePlaylistId);
    } else {
        safeRemoveLocalStorage(ACTIVE_PLAYLIST_ID_STORAGE_KEY);
    }
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
    buildPlaylistMenu();
    updatePlaylistSelectorLabel();
    ensureQualityMenuPortal();
    initializePlaylistEventHandlers();
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
    if (dom.playlistSelectorButton && dom.playlistMenu) {
        dom.playlistSelectorButton.addEventListener("click", togglePlaylistMenu);
        dom.playlistMenu.addEventListener("click", handlePlaylistMenuSelection);
    }
    if (dom.createPlaylistBtn) {
        dom.createPlaylistBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleCreatePlaylist();
        });
    }
    if (dom.importPlaylistBtn) {
        dom.importPlaylistBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleImportNeteasePlaylist();
        });
    }
    if (dom.deletePlaylistBtn) {
        dom.deletePlaylistBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            deleteActivePlaylist();
        });
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
        if (e.key === "Escape") {
            if (state.sourceMenuOpen) {
                closeSourceMenu();
            }
            if (state.qualityMenuOpen) {
                closePlayerQualityMenu();
            }
            if (state.playlistMenuOpen) {
                closePlaylistMenu();
            }
            if (playlistPickerElement) {
                closePlaylistPicker();
            }
            if (isMobileView) {
                closeAllMobileOverlays();
            }
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

        if (state.playlistMenuOpen &&
            dom.playlistMenu &&
            dom.playlistSelectorButton &&
            !dom.playlistMenu.contains(e.target) &&
            !dom.playlistSelectorButton.contains(e.target)) {
            closePlaylistMenu();
        }

        if (playlistPickerElement && !playlistPickerElement.contains(e.target)) {
            closePlaylistPicker();
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

    if (dom.lyricsContent) {
        dom.lyricsContent.addEventListener("click", handleLyricLineClick);
    }
    if (dom.mobileInlineLyricsContent) {
        dom.mobileInlineLyricsContent.addEventListener("click", handleLyricLineClick);
    }

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

    renderPlaylist();

    if (state.playlistSongs.length > 0) {
        let restoredIndex = state.currentTrackIndex;
        if (restoredIndex < 0 || restoredIndex >= state.playlistSongs.length) {
            restoredIndex = 0;
        }

        state.currentTrackIndex = restoredIndex;
        state.currentPlaylist = "playlist";

        const restoredSong = state.playlistSongs[restoredIndex];
        if (restoredSong) {
            state.currentSong = restoredSong;
            updatePlaylistHighlight();
            updateCurrentSongInfo(restoredSong).catch(error => {
                console.error("恢复歌曲信息失败:", error);
            });
        }
    } else {
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

    const songTitleForTab = typeof song.name === "string" ? song.name.trim() : "";
    const artistTitleForTab = typeof artistText === "string" ? artistText.trim() : "";
    const titleParts = [];
    if (songTitleForTab) {
        titleParts.push(songTitleForTab);
    }
    if (artistTitleForTab) {
        titleParts.push(artistTitleForTab);
    }
    setTabTitleBase(titleParts.join(" - "));
    setTabTitleLyric("");

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
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `${song.name || "未知歌曲"} - 播放`);

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

    const addButton = document.createElement("button");
    addButton.className = "action-btn add";
    addButton.type = "button";
    addButton.title = "添加到播放列表";
    addButton.setAttribute("aria-label", "添加到播放列表");
    addButton.innerHTML = '<i class="fas fa-plus"></i>';
    addButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.playlists.length <= 1) {
            addSearchResultToPlaylist(index, state.activePlaylistId);
            closePlaylistPicker();
            return;
        }
        openPlaylistPickerForSearchResult(addButton, index);
    });

    actions.appendChild(addButton);

    item.appendChild(info);
    item.appendChild(actions);

    item.addEventListener("click", () => playSearchResult(index));
    item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            playSearchResult(index);
        }
    });

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
        closePlaylistPicker();
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
    } else if (type === "online") {
        song = state.onlineSongs[index];
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

// 新增：将搜索结果添加到播放列表
function addSearchResultToPlaylist(index, playlistId = state.activePlaylistId, options = {}) {
    const song = state.searchResults[index];
    if (!song) {
        return;
    }
    const normalizedOptions = options && typeof options === "object" ? options : {};
    const showMessage = normalizedOptions.showMessage !== false;

    const result = addSongToPlaylist(song, playlistId);
    if (!result.playlist) {
        if (showMessage) {
            showNotification("目标歌单不存在", "error");
        }
        return;
    }

    if (playlistId === state.activePlaylistId) {
        if (result.added) {
            renderPlaylist();
        } else {
            updatePlaylistHighlight();
        }
    } else if (result.added) {
        buildPlaylistMenu();
        updatePlaylistSelectorLabel();
        savePlayerState();
    }

    if (!result.added) {
        if (showMessage && result.duplicate) {
            showNotification("歌曲已在歌单中", "warning");
        }
        return;
    }

    if (showMessage) {
        showNotification(`已添加到「${result.playlist.name}」`, "success");
    }
}

// 更新：播放搜索结果时保持在搜索界面
async function playSearchResult(index) {
    const song = state.searchResults[index];
    if (!song) return;

    try {
        const playlistId = state.activePlaylistId;
        const result = addSongToPlaylist(song, playlistId);
        state.currentPlaylist = "playlist";
        if (result.added) {
            state.currentTrackIndex = result.index;
            if (playlistId === state.activePlaylistId) {
                renderPlaylist();
            } else {
                buildPlaylistMenu();
                updatePlaylistSelectorLabel();
                savePlayerState();
            }
        } else if (result.duplicate) {
            state.currentTrackIndex = result.index;
            updatePlaylistHighlight();
        }

        await playSong(song);

        showNotification(`正在播放: ${song.name}`);

    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

// 新增：渲染统一播放列表
function renderPlaylist() {
    const playlist = getActivePlaylist();
    const songs = playlist && Array.isArray(playlist.songs) ? playlist.songs : [];
    state.playlistSongs = songs;
    updatePlaylistSelectorLabel();
    buildPlaylistMenu();

    if (!dom.playlistItems) {
        savePlayerState();
        updateMobileClearPlaylistVisibility();
        return;
    }

    if (!songs.length) {
        if (dom.playlist) {
            dom.playlist.classList.add("empty");
        }
        dom.playlistItems.innerHTML = "";
        savePlayerState();
        updatePlaylistHighlight();
        updateMobileClearPlaylistVisibility();
        return;
    }

    if (dom.playlist) {
        dom.playlist.classList.remove("empty");
    }

    const playlistHtml = songs.map((song, index) =>
        `<div class="playlist-item" data-index="${index}" role="button" tabindex="0" aria-label="播放 ${song.name}">
            ${song.name} - ${Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}
            <button class="playlist-item-remove" type="button" data-playlist-action="remove" data-index="${index}" title="从播放列表移除">
                <i class="fas fa-times"></i>
            </button>
            <button class="playlist-item-download" type="button" data-playlist-action="download" data-index="${index}" title="下载">
                <i class="fas fa-download"></i>
            </button>
        </div>`
    ).join("");

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
            setTabTitleBase("");
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

    if (state.playlistSongs.length === 0) {
        dom.playlist.classList.add("empty");
        if (dom.playlistItems) {
            dom.playlistItems.innerHTML = "";
        }
        state.currentPlaylist = "playlist";
        updateMobileClearPlaylistVisibility();
    } else {
        if (state.currentPlaylist === "playlist" && state.currentTrackIndex < 0) {
            state.currentTrackIndex = 0;
        }

        renderPlaylist();

        if (removingCurrent && state.currentPlaylist === "playlist" && state.currentTrackIndex >= 0) {
            const targetIndex = Math.min(state.currentTrackIndex, state.playlistSongs.length - 1);
            state.currentTrackIndex = targetIndex;
            playPlaylistSong(targetIndex);
        } else {
            updatePlaylistHighlight();
        }
    }

    buildPlaylistMenu();
    updatePlaylistSelectorLabel();
    savePlayerState();
    showNotification("已从播放列表移除", "success");
}

// 新增：清空播放列表
function clearPlaylist(arg) {
    let options = arg;
    if (options && typeof options === "object" && typeof options.preventDefault === "function") {
        options.preventDefault();
        if (typeof options.stopPropagation === "function") {
            options.stopPropagation();
        }
        options = {};
    }
    const normalizedOptions = options && typeof options === "object" ? options : {};
    const silent = Boolean(normalizedOptions.silent);

    if (state.playlistSongs.length === 0) {
        if (!silent) {
            showNotification("播放列表已为空", "warning");
        }
        return;
    }

    if (state.currentPlaylist === "playlist") {
        dom.audioPlayer.pause();
        dom.audioPlayer.src = "";
        state.currentTrackIndex = -1;
        state.currentSong = null;
        setTabTitleBase("");
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

    setActivePlaylistSongs([]);
    state.currentPlaylist = "playlist";
    state.currentTrackIndex = -1;
    closePlaylistPicker();
    closePlaylistMenu();
    renderPlaylist();

    if (!silent) {
        showNotification("播放列表已清空", "success");
    }
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

function getSongArtistText(song) {
    if (!song || typeof song !== "object") {
        return "";
    }
    if (Array.isArray(song.artist)) {
        return song.artist.join(" ");
    }
    if (typeof song.artist === "string") {
        return song.artist;
    }
    return "";
}

async function playSong(song, options = {}) {
    const normalizedOptions = options && typeof options === "object" ? options : {};
    const { autoplay = true, startTime = 0, preserveProgress = false } = normalizedOptions;

    // 保留之前的调色板状态，避免视觉跳跃
    const previousPalette = state.dynamicPalette;
    const previousImage = state.currentPaletteImage;

    // 立即更新歌曲信息（但不清除封面）
    state.currentSong = song;
    dom.currentSongTitle.textContent = song.name;
    updateMobileToolbarTitle();
    const artistText = Array.isArray(song.artist) ? song.artist.join(', ') : (song.artist || '未知艺术家');
    dom.currentSongArtist.textContent = artistText;

    const songTitleForTab = typeof song.name === "string" ? song.name.trim() : "";
    const artistTitleForTab = typeof artistText === "string" ? artistText.trim() : "";
    const titleParts = [];
    if (songTitleForTab) {
        titleParts.push(songTitleForTab);
    }
    if (artistTitleForTab) {
        titleParts.push(artistTitleForTab);
    }
    setTabTitleBase(titleParts.join(" - "));

    try {
        const quality = state.playbackQuality || '192';
        
        // 优先加载封面和歌词（不阻塞太久）
        const artworkPromise = new Promise((resolve) => {
            if (song.pic_id) {
                const picUrl = API.getPicUrl(song);
                API.fetchJson(picUrl)
                    .then(data => {
                        if (!data || !data.url || state.currentSong !== song) {
                            resolve();
                            return;
                        }
                        const img = new Image();
                        const imageUrl = preferHttpsUrl(data.url);
                        img.crossOrigin = "anonymous";
                        img.onload = () => {
                            if (state.currentSong !== song) {
                                resolve();
                                return;
                            }
                            setAlbumCoverImage(imageUrl);
                            
                            // 检查是否有缓存的调色板，如果有则立即应用
                            const shouldApplyImmediately = paletteCache.has(imageUrl);
                            if (shouldApplyImmediately) {
                                const cached = paletteCache.get(imageUrl);
                                paletteCache.delete(imageUrl);
                                paletteCache.set(imageUrl, cached);
                                state.dynamicPalette = cached;
                                state.currentPaletteImage = imageUrl;
                                applyDynamicGradient({ immediate: false });
                            } else {
                                // 异步获取调色板，不阻塞
                                updateDynamicBackground(imageUrl);
                            }
                            resolve();
                        };
                        img.onerror = () => {
                            if (state.currentSong === song && !previousImage) {
                                showAlbumCoverPlaceholder();
                            }
                            resolve();
                        };
                        img.src = imageUrl;
                    })
                    .catch(error => {
                        console.error("加载封面失败:", error);
                        if (state.currentSong === song && !previousImage) {
                            showAlbumCoverPlaceholder();
                        }
                        resolve();
                    });
            } else {
                if (!previousImage) {
                    showAlbumCoverPlaceholder();
                }
                resolve();
            }
        });
        
        // 优先加载歌词
        const lyricsPromise = new Promise((resolve) => {
            const lyricUrl = API.getLyric(song);
            debugLog(`获取歌词URL: ${lyricUrl}`);
            
            API.fetchJson(lyricUrl)
                .then(lyricData => {
                    if (state.currentSong !== song) {
                        resolve();
                        return;
                    }
                    if (lyricData && lyricData.lyric) {
                        const translatedLyric = lyricData.tlyric || null;
                        parseLyrics(lyricData.lyric, translatedLyric);
                        dom.lyrics.classList.remove("empty");
                        dom.lyrics.dataset.placeholder = "default";
                    } else {
                        setLyricsContentHtml("<div>暂无歌词</div>");
                        dom.lyrics.classList.add("empty");
                        dom.lyrics.dataset.placeholder = "message";
                        state.lyricsData = [];
                        state.currentLyricLine = -1;
                        setTabTitleLyric("");
                    }
                    resolve();
                })
                .catch(error => {
                    console.error("加载歌词失败:", error);
                    if (state.currentSong === song) {
                        setLyricsContentHtml("<div>歌词加载失败</div>");
                        dom.lyrics.classList.add("empty");
                        dom.lyrics.dataset.placeholder = "message";
                        state.lyricsData = [];
                        state.currentLyricLine = -1;
                        setTabTitleLyric("");
                    }
                    resolve();
                });
        });
        
        // 等待封面和歌词加载完成（设置超时避免阻塞太久）
        await Promise.race([
            Promise.all([artworkPromise, lyricsPromise]),
            new Promise(resolve => setTimeout(resolve, 800))
        ]);
        
        // 开始获取和加载音频
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

        // 使用流式加载，不等待完全加载完成
        for (const candidateUrl of candidateAudioUrls) {
            dom.audioPlayer.src = candidateUrl;
            dom.audioPlayer.load();

            try {
                // 使用 canplay 事件而不是 loadedmetadata，允许更早开始播放
                await new Promise((resolve, reject) => {
                    let resolved = false;
                    
                    const onCanPlay = () => {
                        if (resolved) return;
                        resolved = true;
                        cleanup();
                        resolve();
                    };
                    
                    const onLoadedMetadata = () => {
                        if (resolved) return;
                        resolved = true;
                        cleanup();
                        resolve();
                    };
                    
                    const onError = (e) => {
                        if (resolved) return;
                        resolved = true;
                        cleanup();
                        reject(new Error('音频加载失败'));
                    };
                    
                    const cleanup = () => {
                        dom.audioPlayer.removeEventListener('canplay', onCanPlay);
                        dom.audioPlayer.removeEventListener('loadedmetadata', onLoadedMetadata);
                        dom.audioPlayer.removeEventListener('error', onError);
                    };
                    
                    // 监听 canplay 和 loadedmetadata，哪个先触发就用哪个
                    dom.audioPlayer.addEventListener('canplay', onCanPlay, { once: true });
                    dom.audioPlayer.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
                    dom.audioPlayer.addEventListener('error', onError, { once: true });
                    
                    // 设置超时，避免无限等待
                    setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            cleanup();
                            reject(new Error('音频加载超时'));
                        }
                    }, 10000);
                });
                
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

        debugLog(`开始播放: ${song.name} @${quality}`);
    } catch (error) {
        console.error('播放歌曲失败:', error);
        throw error;
    } finally {
        savePlayerState();
    }
}

function scheduleDeferredLyrics(song, playPromise) {
    const run = () => {
        if (state.currentSong !== song) {
            return;
        }

        loadLyrics(song);
    };

    const kickoff = () => {
        if (state.currentSong !== song) {
            return;
        }

        if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(() => {
                if (state.currentSong !== song) {
                    return;
                }
                run();
            }, { timeout: 300 });
        } else {
            setTimeout(run, 50);
        }
    };

    if (playPromise && typeof playPromise.finally === "function") {
        playPromise.finally(kickoff);
    } else {
        kickoff();
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
    } else if (state.currentPlaylist === "online") {
        playlist = state.onlineSongs;
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
    } else if (state.currentPlaylist === "online") {
        playOnlineSong(nextIndex);
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
    } else if (state.currentPlaylist === "online") {
        playlist = state.onlineSongs;
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
    } else if (state.currentPlaylist === "online") {
        playOnlineSong(prevIndex);
    } else if (state.currentPlaylist === "search") {
        playSearchResult(prevIndex);
    }
}

// 修复：在线音乐播放函数
async function playOnlineSong(index) {
    const song = state.onlineSongs[index];
    if (!song) return;

    state.currentTrackIndex = index;
    state.currentPlaylist = "online";

    try {
        await playSong(song);
        updateOnlineHighlight();
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

// 修复：更新在线音乐高亮
function updateOnlineHighlight() {
    if (!dom.playlistItems) return;
    const playlistItems = dom.playlistItems.querySelectorAll(".playlist-item");
    playlistItems.forEach((item, index) => {
        if (state.currentPlaylist === "online" && index === state.currentTrackIndex) {
            item.classList.add("current");
        } else {
            item.classList.remove("current");
        }
    });
}

// 修复：加载歌词（带重试机制）
async function loadLyrics(song) {
    const maxRetries = 3;
    const retryDelays = [0, 500, 1000];
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (state.currentSong !== song) {
            return;
        }
        
        try {
            if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
            }
            
            if (state.currentSong !== song) {
                return;
            }
            
            const lyricUrl = API.getLyric(song);
            debugLog(`获取歌词URL (尝试 ${attempt + 1}/${maxRetries}): ${lyricUrl}`);

            const lyricData = await API.fetchJson(lyricUrl);

            if (lyricData && lyricData.lyric) {
                const translatedLyric = lyricData.tlyric || null;
                parseLyrics(lyricData.lyric, translatedLyric);
                dom.lyrics.classList.remove("empty");
                dom.lyrics.dataset.placeholder = "default";
                return;
            }
            
            if (attempt < maxRetries - 1) {
                debugLog(`第 ${attempt + 1} 次尝试未获取到歌词，准备重试...`);
            }
        } catch (error) {
            console.error(`加载歌词失败 (尝试 ${attempt + 1}/${maxRetries}):`, error);
            if (attempt === maxRetries - 1) {
                setLyricsContentHtml("<div>歌词加载失败</div>");
                dom.lyrics.classList.add("empty");
                dom.lyrics.dataset.placeholder = "message";
                state.lyricsData = [];
                state.currentLyricLine = -1;
                setTabTitleLyric("");
                return;
            }
        }
    }
    
    setLyricsContentHtml("<div>暂无歌词</div>");
    dom.lyrics.classList.add("empty");
    dom.lyrics.dataset.placeholder = "message";
    state.lyricsData = [];
    state.currentLyricLine = -1;
    setTabTitleLyric("");
}

// 修复：解析歌词
function parseLyrics(lyricText, translatedLyricText = null) {
    const parseLrcLines = (text) => {
        if (!text) return [];
        const lines = text.split('\n');
        const result = [];

        lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3].padEnd(3, '0'));
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = match[4].trim();

                if (text) {
                    result.push({ time, text });
                }
            }
        });

        return result;
    };

    const originalLyrics = parseLrcLines(lyricText);
    const translatedLyrics = translatedLyricText ? parseLrcLines(translatedLyricText) : [];

    const lyrics = [];
    const translationMap = new Map();

    translatedLyrics.forEach(tl => {
        translationMap.set(tl.time, tl.text);
    });

    originalLyrics.forEach(lyric => {
        const translated = translationMap.get(lyric.time) || "";
        lyrics.push({
            time: lyric.time,
            text: lyric.text,
            translation: translated
        });
    });

    state.currentLyricLine = -1;
    state.lyricsData = lyrics.sort((a, b) => a.time - b.time);
    setTabTitleLyric("");
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
    setTabTitleLyric("");
    if (isMobileView) {
        closeMobileInlineLyrics({ force: true });
    }
}

// 检测文本是否包含中文字符
function containsChinese(text) {
    if (!text || typeof text !== "string") {
        return false;
    }
    return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

// 为标签页标题选择首选歌词（优先中文）
function getPreferredLyricForTitle(lyric) {
    if (!lyric) {
        return "";
    }
    const hasText = lyric.text && typeof lyric.text === "string";
    const hasTranslation = lyric.translation && typeof lyric.translation === "string";
    if (!hasText && !hasTranslation) {
        return "";
    }
    if (!hasTranslation) {
        return lyric.text;
    }
    if (!hasText) {
        return lyric.translation;
    }
    const textIsChinese = containsChinese(lyric.text);
    const translationIsChinese = containsChinese(lyric.translation);
    if (textIsChinese && !translationIsChinese) {
        return lyric.text;
    }
    if (!textIsChinese && translationIsChinese) {
        return lyric.translation;
    }
    return lyric.text;
}

// 修复：显示歌词
function displayLyrics() {
    const lyricsHtml = state.lyricsData.map((lyric, index) => {
        const hasTranslation = state.bilingualLyrics && lyric.translation;
        if (hasTranslation) {
            return `<div data-time="${lyric.time}" data-index="${index}" class="lyric-line">
                <div class="lyric-original">${lyric.text}</div>
                <div class="lyric-translation">${lyric.translation}</div>
            </div>`;
        } else {
            return `<div data-time="${lyric.time}" data-index="${index}" class="lyric-line">${lyric.text}</div>`;
        }
    }).join("");
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

        const activeLyric = currentIndex >= 0 && currentIndex < state.lyricsData.length
            ? state.lyricsData[currentIndex]
            : null;
        setTabTitleLyric(activeLyric ? getPreferredLyricForTitle(activeLyric) : "");

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

function handleLyricLineClick(event) {
    if (!event || !event.target || typeof event.target.closest !== "function") {
        return;
    }
    const lyricElement = event.target.closest("div[data-time]");
    if (!lyricElement) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const time = Number.parseFloat(lyricElement.dataset.time);
    if (!Number.isFinite(time)) {
        return;
    }
    clearTimeout(state.lyricsScrollTimeout);
    state.lyricsScrollTimeout = null;
    state.userScrolledLyrics = false;
    seekAudio(time);
    syncLyrics();
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
