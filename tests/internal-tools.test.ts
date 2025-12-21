import { jest } from '@jest/globals';
import {
  INTERNAL_TOOLS,
  INTERNAL_TOOL_NAMES,
  isInternalTool,
  getInternalToolDefs,
  executeInternalTool,
  type InternalToolContext
} from '../src/tools/internal.js';

// Mock context for testing
const createMockContext = (): InternalToolContext => ({
  session: {
    searchHybrid: jest.fn().mockResolvedValue([
      {
        id: 1,
        prompt: 'test prompt',
        response: 'test response',
        timestamp: Date.now(),
        cwd: '/test',
        score: 0.95,
        source: 'hybrid'
      }
    ]),
    getRecentEntries: jest.fn().mockReturnValue([]),
    searchFTS: jest.fn().mockReturnValue([]),
    searchSemantic: jest.fn().mockResolvedValue([]),
    search: jest.fn().mockReturnValue([]),
    addEntry: jest.fn().mockResolvedValue(1)
  } as any,
  history: {
    getLastEntries: jest.fn().mockResolvedValue([
      {
        timestamp: Math.floor(Date.now() / 1000),
        duration: 0,
        command: 'ls -la'
      },
      {
        timestamp: Math.floor(Date.now() / 1000) - 60,
        duration: 0,
        command: 'cd /test'
      }
    ])
  } as any,
  files: {
    listFiles: jest.fn().mockResolvedValue([
      'src/index.ts',
      'src/config.ts',
      'package.json'
    ]),
    getFileContent: jest.fn().mockResolvedValue('file content here'),
    getFileTree: jest.fn().mockResolvedValue('src/index.ts\nsrc/config.ts')
  } as any,
  getManPage: jest.fn().mockReturnValue('grep - search files for patterns')
});

describe('Internal Tools Module', () => {
  describe('Tool Registration', () => {
    it('should have 5 internal tools defined', () => {
      expect(INTERNAL_TOOLS).toHaveLength(5);
    });

    it('should have correct tool names', () => {
      const expectedNames = [
        'search_session_history',
        'get_recent_commands',
        'list_project_files',
        'read_file_content',
        'get_command_docs'
      ];
      const actualNames = INTERNAL_TOOLS.map(t => t.name);
      expect(actualNames).toEqual(expectedNames);
    });

    it('should have INTERNAL_TOOL_NAMES set with all tools', () => {
      expect(INTERNAL_TOOL_NAMES.size).toBe(5);
      expect(INTERNAL_TOOL_NAMES.has('search_session_history')).toBe(true);
      expect(INTERNAL_TOOL_NAMES.has('get_recent_commands')).toBe(true);
      expect(INTERNAL_TOOL_NAMES.has('list_project_files')).toBe(true);
      expect(INTERNAL_TOOL_NAMES.has('read_file_content')).toBe(true);
      expect(INTERNAL_TOOL_NAMES.has('get_command_docs')).toBe(true);
    });
  });

  describe('isInternalTool', () => {
    it('should return true for internal tool names', () => {
      expect(isInternalTool('search_session_history')).toBe(true);
      expect(isInternalTool('get_recent_commands')).toBe(true);
      expect(isInternalTool('list_project_files')).toBe(true);
      expect(isInternalTool('read_file_content')).toBe(true);
      expect(isInternalTool('get_command_docs')).toBe(true);
    });

    it('should return false for non-internal tool names', () => {
      expect(isInternalTool('some_mcp_tool')).toBe(false);
      expect(isInternalTool('random_tool')).toBe(false);
      expect(isInternalTool('')).toBe(false);
    });
  });

  describe('getInternalToolDefs', () => {
    it('should return tool definitions without execute function', () => {
      const defs = getInternalToolDefs();
      expect(defs).toHaveLength(5);

      for (const def of defs) {
        expect(def).toHaveProperty('name');
        expect(def).toHaveProperty('description');
        expect(def).toHaveProperty('parameters');
        expect(def).not.toHaveProperty('execute');
      }
    });

    it('should have valid JSON schema parameters', () => {
      const defs = getInternalToolDefs();

      for (const def of defs) {
        expect(def.parameters).toHaveProperty('type');
        expect((def.parameters as any).type).toBe('object');
      }
    });
  });

  describe('executeInternalTool', () => {
    describe('search_session_history', () => {
      it('should search session history with query', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'search_session_history',
          { query: 'test' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('Found 1 relevant past interaction');
        expect(context.session.searchHybrid).toHaveBeenCalledWith('test', 5);
      });

      it('should respect limit parameter', async () => {
        const context = createMockContext();
        await executeInternalTool(
          'search_session_history',
          { query: 'test', limit: 3 },
          context
        );

        expect(context.session.searchHybrid).toHaveBeenCalledWith('test', 3);
      });

      it('should handle empty results', async () => {
        const context = createMockContext();
        (context.session.searchHybrid as jest.Mock).mockResolvedValue([]);

        const result = await executeInternalTool(
          'search_session_history',
          { query: 'nonexistent' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toBe('No relevant past interactions found.');
      });
    });

    describe('get_recent_commands', () => {
      it('should retrieve recent terminal commands', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'get_recent_commands',
          {},
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('ls -la');
        expect(result.content).toContain('cd /test');
        expect(context.history.getLastEntries).toHaveBeenCalledWith(10);
      });

      it('should respect count parameter', async () => {
        const context = createMockContext();
        await executeInternalTool(
          'get_recent_commands',
          { count: 5 },
          context
        );

        expect(context.history.getLastEntries).toHaveBeenCalledWith(5);
      });

      it('should cap count at 50', async () => {
        const context = createMockContext();
        await executeInternalTool(
          'get_recent_commands',
          { count: 100 },
          context
        );

        expect(context.history.getLastEntries).toHaveBeenCalledWith(50);
      });
    });

    describe('list_project_files', () => {
      it('should list project files', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'list_project_files',
          {},
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('Found 3 file(s)');
        expect(result.content).toContain('index.ts');
        expect(result.content).toContain('package.json');
      });

      it('should respect limit parameter', async () => {
        const context = createMockContext();
        await executeInternalTool(
          'list_project_files',
          { limit: 10 },
          context
        );

        expect(context.files.listFiles).toHaveBeenCalledWith(10);
      });
    });

    describe('read_file_content', () => {
      it('should read file content', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'read_file_content',
          { path: 'src/index.ts' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('file content here');
        expect(context.files.getFileContent).toHaveBeenCalledWith('src/index.ts', 100);
      });

      it('should respect max_lines parameter', async () => {
        const context = createMockContext();
        await executeInternalTool(
          'read_file_content',
          { path: 'src/index.ts', max_lines: 50 },
          context
        );

        expect(context.files.getFileContent).toHaveBeenCalledWith('src/index.ts', 50);
      });

      it('should handle file read errors', async () => {
        const context = createMockContext();
        (context.files.getFileContent as jest.Mock).mockResolvedValue(
          'Error reading file nonexistent.ts: ENOENT'
        );

        const result = await executeInternalTool(
          'read_file_content',
          { path: 'nonexistent.ts' },
          context
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Error reading file');
      });
    });

    describe('get_command_docs', () => {
      it('should get command documentation', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'get_command_docs',
          { command: 'grep' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('grep - search files');
        expect(context.getManPage).toHaveBeenCalledWith('grep');
      });

      it('should handle missing documentation', async () => {
        const context = createMockContext();
        (context.getManPage as jest.Mock).mockReturnValue(null);

        const result = await executeInternalTool(
          'get_command_docs',
          { command: 'nonexistent' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.content).toContain('No documentation found');
      });
    });

    describe('Unknown tool', () => {
      it('should return error for unknown tool', async () => {
        const context = createMockContext();
        const result = await executeInternalTool(
          'unknown_tool',
          {},
          context
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Unknown internal tool');
      });
    });
  });
});
