const MAX_SONG_COUNT = 200;
const MAX_SERIALIZED_LENGTH = 220_000; // ~215 KB
const PLAY_MODE_VALUES = new Set(["list", "single", "random"]);
const PLAYLIST_SCOPE_VALUES = new Set(["playlist", "online", "search"]);
const DEFAULT_PLAYBACK_QUALITY = "320";
const PLAYLIST_KV_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface PlaylistPayload {
  songs: unknown[];
  currentTrackIndex: number;
  playMode: string;
  playbackQuality: string;
  currentPlaylist: string;
  currentSong: Record<string, unknown> | null;
  currentPlaybackTime: number;
  volume?: number;
}

interface StoredPlaylistRecord {
  playlist: PlaylistPayload;
  updatedAt: string;
  version: number;
}

interface PlaylistResponseBody {
  id: string;
  updatedAt: string;
  playlist: PlaylistPayload;
  version: number;
}

interface PlaylistEnv {
  PLAYLIST_KV?: KVNamespace;
}

function createCorsHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  return headers;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: createCorsHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    }),
  });
}

function textResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: createCorsHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    }),
  });
}

function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders({
      "Access-Control-Max-Age": "86400",
    }),
  });
}

function generatePlaylistId(): string {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return uuid.slice(0, 16);
}

function buildStorageKey(id: string): string {
  return `playlist:${id}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeSongs(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }
  if (value.length <= MAX_SONG_COUNT) {
    return value;
  }
  return value.slice(0, MAX_SONG_COUNT);
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizePlaylistPayload(value: unknown): PlaylistPayload {
  const data = isPlainObject(value) ? value : {};
  const songs = sanitizeSongs(data.songs);
  const hasSongs = songs.length > 0;
  let currentTrackIndex = Number.isInteger(data.currentTrackIndex) ? Number(data.currentTrackIndex) : (hasSongs ? 0 : -1);
  if (hasSongs) {
    if (currentTrackIndex < 0) {
      currentTrackIndex = 0;
    } else if (currentTrackIndex >= songs.length) {
      currentTrackIndex = songs.length - 1;
    }
  } else {
    currentTrackIndex = -1;
  }

  const playMode = typeof data.playMode === "string" && PLAY_MODE_VALUES.has(data.playMode)
    ? data.playMode
    : "list";

  const playbackQuality = typeof data.playbackQuality === "string" && data.playbackQuality.trim().length > 0
    ? data.playbackQuality
    : DEFAULT_PLAYBACK_QUALITY;

  const currentPlaylist = typeof data.currentPlaylist === "string" && PLAYLIST_SCOPE_VALUES.has(data.currentPlaylist)
    ? data.currentPlaylist
    : "playlist";

  const currentSong = isPlainObject(data.currentSong) ? data.currentSong : null;

  const currentPlaybackTime = typeof data.currentPlaybackTime === "number" && Number.isFinite(data.currentPlaybackTime) && data.currentPlaybackTime >= 0
    ? data.currentPlaybackTime
    : 0;

  const volume = typeof data.volume === "number" && Number.isFinite(data.volume)
    ? clampNumber(data.volume, 0, 1)
    : undefined;

  const payload: PlaylistPayload = {
    songs,
    currentTrackIndex,
    playMode,
    playbackQuality,
    currentPlaylist,
    currentSong,
    currentPlaybackTime,
  };

  if (volume !== undefined) {
    payload.volume = volume;
  }

  return payload;
}

async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    if (!text) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function buildRecord(payload: PlaylistPayload): StoredPlaylistRecord {
  return {
    playlist: payload,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

function ensureSizeConstraints(record: StoredPlaylistRecord): string | Response {
  const serialized = JSON.stringify(record);
  if (serialized.length > MAX_SERIALIZED_LENGTH) {
    return jsonResponse({ error: "Playlist payload too large" }, 413);
  }
  return serialized;
}

async function handleCreate(request: Request, env: PlaylistEnv): Promise<Response> {
  const rawPayload = await parseJsonBody<unknown>(request);
  const playlist = normalizePlaylistPayload(rawPayload ?? {});
  const record = buildRecord(playlist);
  const serialized = ensureSizeConstraints(record);
  if (serialized instanceof Response) {
    return serialized;
  }

  const id = generatePlaylistId();
  await env.PLAYLIST_KV!.put(buildStorageKey(id), serialized, {
    expirationTtl: PLAYLIST_KV_EXPIRATION_SECONDS,
  });

  const body: PlaylistResponseBody = {
    id,
    updatedAt: record.updatedAt,
    playlist: record.playlist,
    version: record.version,
  };

  return jsonResponse(body, 201);
}

async function handleGet(id: string, env: PlaylistEnv): Promise<Response> {
  const stored = await env.PLAYLIST_KV!.get(buildStorageKey(id));
  if (!stored) {
    return jsonResponse({ error: "Playlist not found" }, 404);
  }

  try {
    const record = JSON.parse(stored) as StoredPlaylistRecord;
    if (!record || !record.playlist || !record.updatedAt) {
      throw new Error("Invalid record");
    }
    const body: PlaylistResponseBody = {
      id,
      updatedAt: record.updatedAt,
      playlist: normalizePlaylistPayload(record.playlist),
      version: record.version ?? 1,
    };
    return jsonResponse(body);
  } catch {
    return jsonResponse({ error: "Invalid playlist data" }, 500);
  }
}

async function handleUpdate(id: string, request: Request, env: PlaylistEnv): Promise<Response> {
  const rawPayload = await parseJsonBody<unknown>(request);
  const playlist = normalizePlaylistPayload(rawPayload ?? {});
  const record = buildRecord(playlist);
  const serialized = ensureSizeConstraints(record);
  if (serialized instanceof Response) {
    return serialized;
  }

  await env.PLAYLIST_KV!.put(buildStorageKey(id), serialized, {
    expirationTtl: PLAYLIST_KV_EXPIRATION_SECONDS,
  });

  const body: PlaylistResponseBody = {
    id,
    updatedAt: record.updatedAt,
    playlist: record.playlist,
    version: record.version,
  };

  return jsonResponse(body);
}

export async function onRequest(context: { request: Request; env: PlaylistEnv }): Promise<Response> {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  if (!env.PLAYLIST_KV) {
    return jsonResponse({ error: "Playlist sync storage not configured" }, 501);
  }

  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (method === "POST") {
    return handleCreate(request, env);
  }

  if (method === "GET" || method === "PUT") {
    const id = url.searchParams.get("id")?.trim();
    if (!id) {
      return jsonResponse({ error: "Missing playlist id" }, 400);
    }

    if (method === "GET") {
      return handleGet(id, env);
    }

    return handleUpdate(id, request, env);
  }

  return textResponse("Method not allowed", 405);
}
