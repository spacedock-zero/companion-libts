import type { ICompanionClient, CompanionPacket } from "./core";
import { TTSModule } from "./modules/tts";
import { STTModule } from "./modules/stt";
import { MemoryModule } from "./modules/memory";
import { InputModule } from "./modules/input";
import { MediaModule } from "./modules/media";
import { SoundboardModule } from "./modules/soundboard";

/**
 * Companion Library Client
 */
export class CompanionClient implements ICompanionClient {
	ws: WebSocket | null = null;
	currentUrl: string | null = null;
	listeners: Map<string, Function[]> = new Map();
	modules: Map<string, any> = new Map();

	public readonly TTS: TTSModule;
	public readonly STT: STTModule;
	public readonly Memory: MemoryModule;
	public readonly Input: InputModule;
	public readonly Media: MediaModule;
	public readonly Soundboard: SoundboardModule;

	public readonly Core = {
		connect: this.connect.bind(this),
		on: this.on.bind(this),
		off: this.off.bind(this),
		send: this.send.bind(this),
		reactive: this.reactive.bind(this),
		renderList: this.renderList.bind(this)
	};

	constructor() {
		this.TTS = new TTSModule(this);
		this.STT = new STTModule(this);
		this.Memory = new MemoryModule(this);
		this.Input = new InputModule(this);
		this.Media = new MediaModule(this);
		this.Soundboard = new SoundboardModule(this);

		this.modules.set('TTS', this.TTS);
		this.modules.set('STT', this.STT);
		this.modules.set('Memory', this.Memory);
		this.modules.set('Input', this.Input);
		this.modules.set('Media', this.Media);
		this.modules.set('Soundboard', this.Soundboard);

		// Proxy allows direct module access on the instance for legacy compatibility
		return new Proxy(this, {
			get: (target, prop: string | symbol) => {
				if (prop in target) return (target as any)[prop];
				if (typeof prop === 'string' && target.modules.has(prop)) return target.modules.get(prop);
				return undefined;
			}
		});
	}

	/**
	 * Connect to SAMMI WebSocket
	 * @param url - The WebSocket URL to connect to
	 */
	connect(url: string) {
		if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) && this.currentUrl === url) {
			return;
		}

		if (this.ws) {
			this.ws.close();
		}

		this.currentUrl = url;
		console.log(`[Companion] Connecting to ${url}...`);

		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			this._trigger('connected', {});
		};

		this.ws.onmessage = (event) => {
			try {
				const packet = JSON.parse(event.data);

				if (packet.type) {
					this._trigger(packet.type, packet.body || packet);
				}
				this._trigger('data', packet);
			} catch (e) {
				console.warn('[Companion] Failed to parse WS message', e);
			}
		};

		this.ws.onclose = (e) => {
			if (this.ws !== e.target) return;
			this._trigger('disconnected', {});
			setTimeout(() => {
				if ((!this.ws || this.ws === e.target || this.ws.readyState === WebSocket.CLOSED) && this.currentUrl === url) {
					this.connect(url);
				}
			}, 5000);
		};

		this.ws.onerror = (event) => {
			console.error('[Companion] WebSocket Error', event);
		};
	}

	/**
	 * Register an event listener
	 * @param event - The event name
	 * @param callback - The callback function
	 */
	on(event: string, callback: Function) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	/**
	 * Remove an event listener
	 * @param event - The event name
	 * @param callback - The callback function to remove
	 */
	off(event: string, callback: Function) {
		if (!this.listeners.has(event)) return;
		const callbacks = this.listeners.get(event)!;
		const index = callbacks.indexOf(callback);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	}

	/**
	 * Internal trigger for events
	 * @param event - The event name
	 * @param data - The event data
	 */
	private _trigger(event: string, data: any) {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach(cb => {
				try { cb(data); } catch (e) { console.error(`[Companion] Error in listener for ${event}:`, e); }
			});
		}
	}

	/**
	 * Send a message via WebSocket
	 * @param type - The packet type
	 * @param body - The packet body
	 */
	send(type: string, body: any) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn('[Companion] WebSocket not connected found, cannot send message');
			return;
		}
		const packet: CompanionPacket = {
			version: 1,
			type: type,
			body: body
		};
		this.ws.send(JSON.stringify(packet));
	}

	/**
	 * Create a reactive proxy for an object
	 * @param data - The data to make reactive
	 * @returns The reactive proxy
	 */
	reactive(data: any): any {
		const listeners = new Set<Function>();
		const notify = () => {
			listeners.forEach(cb => {
				try { cb(); } catch (e) { console.error(e); }
			});
		};

		const handler: ProxyHandler<any> = {
			set(target, prop, value) {
				const result = Reflect.set(target, prop, value);
				notify();
				return result;
			},
			deleteProperty(target, prop) {
				const result = Reflect.deleteProperty(target, prop);
				notify();
				return result;
			}
		};

		const proxy = new Proxy(data, handler);

		Object.defineProperty(proxy, '_subscribe', {
			value: (callback: Function) => {
				listeners.add(callback);
				return () => listeners.delete(callback);
			},
			enumerable: false,
			writable: false,
			configurable: false
		});

		return proxy;
	}

	/**
	 * Render a list in the DOM based on a template
	 * @param elementId - The ID of the template element
	 * @param list - The list data (can be reactive)
	 */
	renderList(elementId: string, list: any) {
		if (!list || typeof list !== 'object') return;

		// Note: This relies on browser DOM content
		if (typeof document === 'undefined') return;

		let anchor = document.getElementById(`repeat:${elementId}:anchor`) as Comment | HTMLElement | null;
		let templateHtml = "";

		const templateEl = document.getElementById(elementId);
		if (templateEl) {
			const parent = templateEl.parentNode!;
			anchor = document.createComment(`repeat:${elementId}:anchor`) as unknown as HTMLElement; // Casting comment to HTMLElement to satisfy TS for anchor variable or I should use Node
			parent.replaceChild(anchor, templateEl);
			templateHtml = templateEl.outerHTML;
			(anchor as any)._templateHtml = templateHtml;
		} else if (anchor) {
			templateHtml = (anchor as any)._templateHtml;
		} else {
			if (!templateHtml) {
				const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null);
				while (walker.nextNode()) {
					if (walker.currentNode.nodeValue === `repeat:${elementId}:anchor`) {
						anchor = walker.currentNode as unknown as HTMLElement;
						templateHtml = (anchor as any)._templateHtml;
						break;
					}
				}
			}
			if (!anchor) {
				console.warn(`[Companion] renderList: Template '${elementId}' not found and no anchor exists.`);
				return;
			}
		}

		const parent = anchor.parentNode!;

		const render = () => {
			const items = Array.isArray(list) ? list : Object.values(list);
			const getNestedValue = (obj: any, path: string) => {
				return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
			};

			items.forEach((item: any, index: number) => {
				const instanceId = `${elementId}-${index}`;
				let existingEl = document.getElementById(instanceId);

				let itemHtml = templateHtml;
				itemHtml = itemHtml.replace(/\{\{([\w\.]+)\}\}/g, (match, path) => {
					let val = undefined;
					if (path === 'self') {
						val = item;
					} else {
						val = getNestedValue(item, path);
					}
					return val !== undefined ? String(val) : '';
				});

				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = itemHtml;
				const newNode = tempDiv.firstElementChild as HTMLElement;

				if (newNode) {
					newNode.id = instanceId;
					if (existingEl) {
						existingEl.replaceWith(newNode);
					} else {
						if (index === 0) {
							parent.insertBefore(newNode, anchor!.nextSibling);
						} else {
							const prevId = `${elementId}-${index - 1}`;
							const prevEl = document.getElementById(prevId);
							if (prevEl) {
								parent.insertBefore(newNode, prevEl.nextSibling);
							} else {
								parent.insertBefore(newNode, anchor!.nextSibling);
							}
						}
					}
				}
			});

			// Remove extra items
			let i = items.length;
			while (true) {
				const deadId = `${elementId}-${i}`;
				const deadEl = document.getElementById(deadId);
				if (deadEl) {
					deadEl.remove();
					i++;
				} else {
					break;
				}
			}
		};

		render();

		if (list._subscribe) {
			let debounceTimer: number;
			list._subscribe(() => {
				cancelAnimationFrame(debounceTimer);
				debounceTimer = requestAnimationFrame(render);
			});
		}
	}
}
