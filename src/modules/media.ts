import type { ICompanionClient } from "../core";

export class MediaModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	/**
	 * Listen for song details (recognition)
	 * @param cb - Callback function
	 */
	onDetails(cb: Function) {
		this.client.on('songreco_details', cb);
	}

	/**
	 * Listen for song details (recognition)
	 * @param cb - Callback function
	 */
	onLyricCompound(cb: Function) {
		this.client.on('songreco_lyric_compound', cb);
	}

	/**
	 * Listen for song lyrics (full)
	 * @param cb - Callback function
	 */
	onLyrics(cb: Function) {
		this.client.on('songreco_lyrics', cb);
	}

	/**
	 * Listen for a single lyric line
	 * @param cb - Callback function
	 */
	onLyric(cb: Function) {
		this.client.on('songreco_lyric', cb);
	}
}
