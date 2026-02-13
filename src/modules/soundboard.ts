import type { ICompanionClient } from "../core";

export class SoundboardModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	/**
	 * Play a sound file
	 * @param name - The sound name to play
	 */
	play(name: string) {
		this.client.send('soundboard_play', { name });
	}

	/** Stop all playing sounds */
	stop() {
		this.client.send('soundboard_stop', null);
	}

	/**
	 * Set the soundboard volume
	 * @param volume - Volume (0.0 to 1.0)
	 */
	setVolume(volume: number) {
		this.client.send('soundboard_volume', volume);
	}
}
