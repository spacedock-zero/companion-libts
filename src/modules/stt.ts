import type { ICompanionClient } from "../core";

export class STTModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	start() {
		this.client.send('stt_start', null);
	}

	stop() {
		this.client.send('stt_stop', null);
	}

	onResult(cb: Function) {
		this.client.on('stt_result', cb);
	}

	onPartial(cb: Function) {
		this.client.on('stt_partial', cb);
	}

	onStatus(cb: Function) {
		this.client.on('stt_status', cb);
	}

	onTrigger(cb: Function) {
		this.client.on('stt_trigger', cb);
	}
}
