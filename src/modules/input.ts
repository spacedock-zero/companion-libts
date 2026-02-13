import type { ICompanionClient } from "../core";

export class InputModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	/**
	 * Listen for key press events
	 * @param cb - Callback function
	 */
	onKeyPress(cb: Function) {
		this.client.on('keypress', cb);
	}

	/**
	 * Listen for key release events
	 * @param cb - Callback function
	 */
	onKeyRelease(cb: Function) {
		this.client.on('keyrelease', cb);
	}

	/**
	 * Listen for mouse press events
	 * @param cb - Callback function
	 */
	onMousePress(cb: Function) {
		this.client.on('mousepress', cb);
	}

	/**
	 * Listen for mouse release events
	 * @param cb - Callback function
	 */
	onMouseRelease(cb: Function) {
		this.client.on('mouserelease', cb);
	}

	/**
	 * Listen for mouse move events
	 * @param cb - Callback function
	 */
	onMouseMove(cb: Function) {
		this.client.on('mousemove', cb);
	}

	/**
	 * Listen for mouse scroll events
	 * @param cb - Callback function
	 */
	onMouseScroll(cb: Function) {
		this.client.on('mousescroll', cb);
	}
}
