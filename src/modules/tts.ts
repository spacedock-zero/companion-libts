import type { ICompanionClient } from "../core";

export interface TTSOptions {
	key?: string;
	voice?: string;
}

export class TTSModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	speak(text: string, options: TTSOptions = {}) {
		if (options.key) {
			this.client.send('tts_request_wkey', { text, key: options.key });
		} else if (options.voice) {
			this.client.send('tts_request_wvoice', { text, voice: options.voice });
		} else {
			this.client.send('tts_request', text);
		}
	}

	skip() {
		this.client.send('tts_skip', null);
	}

	pause() {
		this.client.send('tts_queuestop', null);
	}

	resume() {
		this.client.send('tts_queuecontinue', null);
	}

	setRate(rate: number) {
		this.client.send('tts_rate', rate);
	}

	setVolume(volume: number) {
		this.client.send('tts_volume', volume);
	}

	onStatus(cb: Function) {
		this.client.on('tts_status', cb);
	}
}
