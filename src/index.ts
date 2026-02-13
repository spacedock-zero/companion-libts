
export { CompanionClient } from './client';
export * from './core';
export * from './modules/tts';
export * from './modules/stt';
export * from './modules/memory';
export * from './modules/input';
export * from './modules/media';
export * from './modules/soundboard';

import { CompanionClient } from './client';

if (typeof window !== 'undefined') {
	(window as any).CompanionClient = CompanionClient;
}