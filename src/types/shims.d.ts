// Shims for third-party modules without bundled TypeScript types
declare module 'html-to-image';
declare module '@tauri-apps/api/core' {
  export function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}
declare module '@tauri-apps/plugin-dialog';

// Additional shims can be added here as we discover missing types.
