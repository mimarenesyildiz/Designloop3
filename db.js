// IndexedDB Wrapper for DesignLoop

const DB_NAME = "DesignLoopDB";
const DB_VERSION = 2;

let dbInstance = null;

async function openDesignLoopDB() {
  if (dbInstance) return dbInstance;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(event.target.error);

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const ensureIndex = (store, name, keyPath, options = {}) => {
        if (!store.indexNames.contains(name)) {
          store.createIndex(name, keyPath, options);
        }
      };

      if (!db.objectStoreNames.contains("projects")) {
        const projectStore = db.createObjectStore("projects", { keyPath: "id" });
        ensureIndex(projectStore, "status", "status", { unique: false });
        ensureIndex(projectStore, "updatedAt", "updatedAt", { unique: false });
      } else {
        const projectStore = event.target.transaction.objectStore("projects");
        ensureIndex(projectStore, "status", "status", { unique: false });
        ensureIndex(projectStore, "updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("spaces")) {
        const spaceStore = db.createObjectStore("spaces", { keyPath: "id" });
        ensureIndex(spaceStore, "projectId", "projectId", { unique: false });
        ensureIndex(spaceStore, "projectId_status", ["projectId", "status"], { unique: false });
      } else {
        const spaceStore = event.target.transaction.objectStore("spaces");
        ensureIndex(spaceStore, "projectId", "projectId", { unique: false });
        ensureIndex(spaceStore, "projectId_status", ["projectId", "status"], { unique: false });
      }

      if (!db.objectStoreNames.contains("media")) {
        const mediaStore = db.createObjectStore("media", { keyPath: "id" });
        ensureIndex(mediaStore, "spaceId", "spaceId", { unique: false });
        ensureIndex(mediaStore, "spaceId_type", ["spaceId", "type"], { unique: false });
        ensureIndex(mediaStore, "projectId", "projectId", { unique: false });
      } else {
        const mediaStore = event.target.transaction.objectStore("media");
        ensureIndex(mediaStore, "spaceId", "spaceId", { unique: false });
        ensureIndex(mediaStore, "spaceId_type", ["spaceId", "type"], { unique: false });
        ensureIndex(mediaStore, "projectId", "projectId", { unique: false });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };
  });
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

async function txPromise(storeName, mode, callback) {
  const db = await openDesignLoopDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result = null;

    try {
      const request = callback(store);
      if (request) {
        request.onsuccess = (e) => (result = e.target.result);
        request.onerror = (e) => reject(e.target.error);
      }
    } catch (err) {
      reject(err);
    }

    tx.oncomplete = () => resolve(result);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// -- Projects --
async function getAllProjects() {
  const projects = await txPromise("projects", "readonly", (s) => s.getAll());
  return projects || [];
}

async function getProject(id) {
  if (!id) return null;
  return txPromise("projects", "readonly", (s) => s.get(id));
}

async function saveProject(project) {
  if (!project.id) project.id = generateId("proj");
  project.updatedAt = new Date().toISOString();
  await txPromise("projects", "readwrite", (s) => s.put(project));
  return project.id;
}

async function deleteProject(id) {
  const spaces = await getSpacesForProject(id);
  const db = await openDesignLoopDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["projects", "spaces", "media"], "readwrite");
    tx.objectStore("projects").delete(id);
    const spaceStore = tx.objectStore("spaces");
    spaces.forEach((sp) => spaceStore.delete(sp.id));

    const mediaStore = tx.objectStore("media");
    const mediaIdx = mediaStore.index("projectId");
    const req = mediaIdx.getAllKeys(id);
    req.onsuccess = (e) => {
      e.target.result.forEach((mediaId) => mediaStore.delete(mediaId));
    };
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

// -- Spaces --
async function getSpacesForProject(projectId) {
  const db = await openDesignLoopDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("spaces", "readonly");
    const idx = tx.objectStore("spaces").index("projectId");
    const req = idx.getAll(projectId);
    req.onsuccess = (e) => resolve(e.target.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function getSpace(id) {
  if (!id) return null;
  return txPromise("spaces", "readonly", (s) => s.get(id));
}

async function saveSpace(space) {
  if (!space.id) space.id = generateId("space");
  space.updatedAt = new Date().toISOString();
  await txPromise("spaces", "readwrite", (s) => s.put(space));
  return space.id;
}

async function deleteSpace(id) {
  const db = await openDesignLoopDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["spaces", "media"], "readwrite");
    tx.objectStore("spaces").delete(id);

    const mediaStore = tx.objectStore("media");
    const mediaIdx = mediaStore.index("spaceId");
    const req = mediaIdx.getAllKeys(id);
    req.onsuccess = (e) => {
      e.target.result.forEach((mediaId) => mediaStore.delete(mediaId));
    };
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

// -- Media --
async function saveMedia(media) {
  if (!media.id) media.id = generateId("media");
  media.createdAt = media.createdAt || new Date().toISOString();
  await txPromise("media", "readwrite", (s) => s.put(media));
  return media.id;
}

async function getMediaForSpace(spaceId) {
  if (!spaceId) return [];
  const db = await openDesignLoopDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("media", "readonly");
    const idx = tx.objectStore("media").index("spaceId");
    const req = idx.getAll(spaceId);
    req.onsuccess = (e) => resolve(e.target.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function getMedia(id) {
  return txPromise("media", "readonly", (s) => s.get(id));
}

async function getMediaBlob(id) {
  const media = await getMedia(id);
  return media?.blob || null;
}

async function deleteMedia(id) {
  return txPromise("media", "readwrite", (s) => s.delete(id));
}

// -- Settings --
async function getAppSettings() {
  const settings = await txPromise("settings", "readonly", (s) => s.get("app_settings"));
  return (
    settings || {
      id: "app_settings",
      apiSettings: {},
      costDatabaseOverrides: [],
      debugPanel: { enabled: true, history: [] },
      lastProjectId: null,
      lastSpaceId: null,
    }
  );
}

async function saveAppSettings(settings) {
  settings.id = "app_settings";
  await txPromise("settings", "readwrite", (s) => s.put(settings));
}

function base64ToBlob(base64, mimeType = "image/png") {
  try {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  } catch (e) {
    console.error("Base64 to blob failed", e);
    return new Blob([], { type: mimeType });
  }
}
