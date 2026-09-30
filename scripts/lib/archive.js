/** Deterministic ustar archives with contained paths and independent header checks. */
import path from "node:path";

function safePath(name) {
  const plain = name.replace(/\/$/, "");
  if (!plain || plain === "." || plain.includes("\\") || plain.includes("\0") ||
      plain.startsWith("/") || /^[a-z]:/i.test(plain) ||
      plain.split("/").includes("..") || path.posix.normalize(plain) !== plain)
    throw new Error("Unsafe archive path: " + name);
  return plain;
}

function writeOctal(header, offset, length, value) {
  const text = value.toString(8).padStart(length - 1, "0");
  if (text.length >= length) throw new Error("Value exceeds ustar field size");
  header.write(text + "\0", offset, length, "ascii");
}

function headerFor(entry) {
  const header = Buffer.alloc(512);
  const name = entry.type === "5" ? entry.name + "/" : entry.name;
  let leaf = name;
  let prefix = "";
  if (Buffer.byteLength(name) > 100) {
    let split = name.lastIndexOf("/", name.length - 2);
    while (split > 0) {
      if (Buffer.byteLength(name.slice(0, split)) <= 155 &&
          Buffer.byteLength(name.slice(split + 1)) <= 100) break;
      split = name.lastIndexOf("/", split - 1);
    }
    if (split < 1) throw new Error("Tar path is too long for ustar: " + name);
    prefix = name.slice(0, split);
    leaf = name.slice(split + 1);
  }
  header.write(leaf, 0, 100, "utf8");
  header.write(prefix, 345, 155, "utf8");
  writeOctal(header, 100, 8, entry.mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, entry.content.length);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header.write(entry.type, 156, 1, "ascii");
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "ascii");
  return header;
}

export function buildTar(files) {
  const entries = new Map();
  for (const file of files) {
    const name = safePath(file.name);
    if (entries.has(name)) throw new Error("Duplicate archive path: " + name);
    entries.set(name, { ...file, name, type: "0" });
  }
  for (const name of [...entries.keys()]) {
    for (let parent = path.posix.dirname(name); parent !== "."; parent = path.posix.dirname(parent)) {
      if (entries.get(parent)?.type === "0") throw new Error("Archive file/directory collision: " + parent);
      entries.set(parent, { name: parent, type: "5", mode: 0o755, content: Buffer.alloc(0) });
    }
  }
  const chunks = [];
  for (const name of [...entries.keys()].sort()) {
    const entry = entries.get(name);
    chunks.push(headerFor(entry), entry.content);
    const padding = (512 - entry.content.length % 512) % 512;
    if (padding) chunks.push(Buffer.alloc(padding));
  }
  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

const textField = (buffer, start, length) =>
  buffer.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
function octalField(buffer, start, length) {
  const text = textField(buffer, start, length).trim();
  if (!/^[0-7]+$/.test(text)) throw new Error("Invalid octal archive header field");
  return Number.parseInt(text, 8);
}

export function parseTar(buffer) {
  if (buffer.length % 512) throw new Error("Truncated archive block");
  const entries = [];
  const paths = new Map();
  for (let offset = 0; offset + 512 <= buffer.length;) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      if (buffer.length - offset < 1024 || !buffer.subarray(offset).every((byte) => byte === 0))
        throw new Error("Invalid archive terminator");
      return entries;
    }
    const checksum = header.reduce((sum, byte, index) =>
      sum + (index >= 148 && index < 156 ? 0x20 : byte), 0);
    if (checksum !== octalField(header, 148, 8)) throw new Error("Archive header checksum mismatch");
    if (textField(header, 257, 6) !== "ustar") throw new Error("Expected ustar archive");
    const prefix = textField(header, 345, 155);
    const name = (prefix ? prefix + "/" : "") + textField(header, 0, 100);
    const plain = safePath(name);
    const size = octalField(header, 124, 12);
    const mode = octalField(header, 100, 8);
    const type = textField(header, 156, 1);
    if (!["0", "5"].includes(type)) throw new Error("Unsupported archive entry type: " + name);
    if (!Number.isSafeInteger(size) || offset + 512 + Math.ceil(size / 512) * 512 > buffer.length)
      throw new Error("Invalid tar size for " + name);
    if (type === "5" && size !== 0) throw new Error("Nonempty archive directory: " + name);
    if (paths.has(plain)) throw new Error("Duplicate archive path: " + name);
    paths.set(plain, type);
    for (let parent = path.posix.dirname(plain); parent !== "."; parent = path.posix.dirname(parent))
      if (paths.get(parent) === "0") throw new Error("Archive file/directory collision: " + parent);
    if (type === "0" && [...paths.keys()].some((other) => other.startsWith(plain + "/")))
      throw new Error("Archive file/directory collision: " + name);
    entries.push({ name, type, mode, content: buffer.subarray(offset + 512, offset + 512 + size) });
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error("Missing archive terminator");
}
