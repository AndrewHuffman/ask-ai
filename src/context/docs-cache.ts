/**
 * File-based cache for command documentation (man pages, tldr).
 * Uses size-based LRU eviction to keep cache under 100MB.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export type DocSource = 'man' | 'tldr';

interface CacheFileInfo {
  path: string;
  size: number;
  mtimeMs: number;
}

export class CommandDocsCache {
  private cacheDir: string;
  private maxSizeBytes: number;

  constructor(cacheDir?: string, maxSizeMB: number = 100) {
    this.cacheDir = cacheDir || path.join(os.homedir(), '.cache', 'hey-ai', 'docs');
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
  }

  private getCachePath(command: string): string {
    // Sanitize command name for use as filename
    const sanitized = command.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.cacheDir, `${sanitized}.txt`);
  }

  /**
   * Get cached documentation for a command.
   * Returns null if not cached.
   */
  get(command: string): string | null {
    const cachePath = this.getCachePath(command);
    
    try {
      if (!fs.existsSync(cachePath)) {
        return null;
      }
      
      const content = fs.readFileSync(cachePath, 'utf8');
      
      // Parse the cache file format
      const match = content.match(/^---\nsource: (man|tldr)\n---\n([\s\S]*)$/);
      if (!match) {
        // Invalid format, delete and return null
        fs.unlinkSync(cachePath);
        return null;
      }
      
      // Update mtime to mark as recently used
      const now = new Date();
      fs.utimesSync(cachePath, now, now);
      
      return match[2];
    } catch {
      return null;
    }
  }

  /**
   * Cache documentation for a command.
   * Triggers LRU eviction if cache exceeds max size.
   */
  async set(command: string, content: string, source: DocSource): Promise<void> {
    const cachePath = this.getCachePath(command);
    
    // Ensure cache directory exists
    await fsp.mkdir(this.cacheDir, { recursive: true });
    
    // Write cache file with metadata header
    const cacheContent = `---\nsource: ${source}\n---\n${content}`;
    await fsp.writeFile(cachePath, cacheContent, 'utf8');
    
    // Enforce max size (async, don't block return)
    this.enforceMaxSize().catch(() => {
      // Ignore eviction errors
    });
  }

  /**
   * Delete oldest cache files until total size is under limit.
   */
  private async enforceMaxSize(): Promise<void> {
    try {
      const files = await fsp.readdir(this.cacheDir);
      
      // Get file info for all cache files
      const fileInfos: CacheFileInfo[] = [];
      let totalSize = 0;
      
      for (const file of files) {
        if (!file.endsWith('.txt')) continue;
        
        const filePath = path.join(this.cacheDir, file);
        try {
          const stat = await fsp.stat(filePath);
          fileInfos.push({
            path: filePath,
            size: stat.size,
            mtimeMs: stat.mtimeMs
          });
          totalSize += stat.size;
        } catch {
          // File may have been deleted, skip
        }
      }
      
      // If under limit, nothing to do
      if (totalSize <= this.maxSizeBytes) {
        return;
      }
      
      // Sort by mtime ascending (oldest first)
      fileInfos.sort((a, b) => a.mtimeMs - b.mtimeMs);
      
      // Delete oldest files until under limit
      for (const fileInfo of fileInfos) {
        if (totalSize <= this.maxSizeBytes) {
          break;
        }
        
        try {
          await fsp.unlink(fileInfo.path);
          totalSize -= fileInfo.size;
        } catch {
          // File may have been deleted, skip
        }
      }
    } catch {
      // Cache dir may not exist yet, ignore
    }
  }
}

