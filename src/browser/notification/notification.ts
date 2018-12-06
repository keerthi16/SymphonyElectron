import { logger } from '../../common/logger';
import * as EventEmitter from 'events';
import notify from './notify.js';

interface INotificationOptions {
    body: string;
    image: string;
    icon: string;
    flash: boolean;
    color: string;
    tag: string;
    sticky: boolean;
    data: object;
    company: string;
}

interface INotifyOptions {
    title: string;
    text: string;
    image: string;
    flash: boolean;
    color: string;
    tag: string;
    sticky: boolean;
    company: string;

    onShowFunc(this: Notification): void;

    onClickFunc(this: Notification): void;

    onCloseFunc(this: Notification): void;

    onErrorFunc(this: Notification): void;
}

interface ICustomEventEmitter {
    emit: any;
    on: (topic, fn) => void;
    _callbacks: object;
    _queue: object;
    addEventListener: (topic: string, fn: () => void) => void;
    queue: (topic: string, p: any) => void;
    eventNames: () => {
        includes(error: string): boolean;
    };
    removeAllListeners(): void;

    removeListener(event: string, cb: Function): void;
}

interface IEventArgs {
    error: string;
    event: string;
    id: string;
    closeNotification(): void;
}

/**
 * implementation for notifications interface,
 * wrapper around notify.
 */
export class Notification {
    private emitter: ICustomEventEmitter;
    public readonly _id: string;
    private _closeNotification: (e: string) => void = () => {};
    private readonly _data: object;

    /**
     * Dislays a notifications
     *
     * @param {String} title  Title of notification
     * @param {Object} options {
     *  body: {string} main text to display in notifications
     *  image: {string} url of image to show in notification
     *  icon: {string} url of image to show in notification
     *  flash: {bool} true if notification should flash (default false)
     *  color: {string} background color for notification
     *  tag: {string} non-empty string to unique identify notify, if another
     *    notification arrives with same tag then it's content will
     *    replace existing notification.
     *  sticky: {bool} if true notification will stay until user closes. default
     *     is false.
     *  data: {object} arbitrary object to be stored with notification
     *  company: {string} company name
     * }
     */
    constructor(title: string, options: INotificationOptions) {

        logger.info('creating notification text');
        const emitter = new EventEmitter();
        this.emitter = queue(emitter);

        const notifyObj: INotifyOptions = this.makePayload(title, options);
        this._id = notify(notifyObj);
        this._data = options.data || null;
    }

    /**
     * Handles on show event
     * @param arg
     */
    private onShow(arg: IEventArgs) {
        if (arg.id === this._id) {
            logger.info(`showing notification, id=${this._id}`);
            this.emitter.queue('show', {
                target: this
            });
            this._closeNotification = arg.closeNotification;
        }
    }

    /**
     * Handles on click event
     * @param arg
     */
    private onClick(arg: IEventArgs) {
        if (arg.id === this._id) {
            logger.info(`clicking notification, id=${this._id}`);
            this.emitter.queue('click', {
                target: this
            });
        }
    }

    /**
     * Handles on close event
     * @param arg
     */
    private onClose(arg: IEventArgs) {
        if (arg.id === this._id || arg.event === 'close-all') {
            logger.info(`closing notification, id=${this._id}`);
            this.emitter.queue('close', {
                target: this
            });
            this.destroy();
        }
    }

    /**
     * Handles on error event
     * @param arg
     */
    private onError(arg: IEventArgs) {
        if (arg.id === this._id) {
            // don't raise error event if handler doesn't exist, node
            // will throw an exception
            logger.error(`error for notification, id=${this._id} error=${arg && arg.error}`);
            if (this.emitter.eventNames().includes('error')) {
                this.emitter.queue('error', arg.error || 'notification error');
            }
            this.destroy();
        }
    }

    /**
     * Closes notification
     */
    public close() {
        if (typeof this._closeNotification === 'function') {
            this._closeNotification('close');
        }
        this.destroy();
    }

    /**
     * Always allow showing notifications.
     * @return {string} 'granted'
     */
    public static get permission() {
        return 'granted';
    }

    /**
     * Returns data object passed in via constructor options
     */
    public get data() {
        return this._data;
    }

    /**
     * Adds event listeners for 'click', 'close', 'show', 'error' events
     *
     * @param {String} event  event to listen for
     * @param {func}   cb     callback invoked when event occurs
     */
    public addEventListener(event, cb) {
        if (event && typeof cb === 'function') {
            this.emitter.on(event, cb);
        }
    }

    /**
     * Removes event listeners for 'click', 'close', 'show', 'error' events
     *
     * @param {String} event  event to stop listening for.
     * @param {func}   cb     callback associated with original addEventListener
     */
    public removeEventListener(event, cb) {
        if (event && typeof cb === 'function') {
            this.emitter.removeListener(event, cb);
        }
    }

    /**
     * Removes all event listeners
     */
    public removeAllEvents() {
        this.destroy();
    }

    public destroy() {
        this.emitter.removeAllListeners();
    }

    private makePayload = (title: string, opts: INotificationOptions): INotifyOptions => {
        const message = opts.body;
        return {
            text: message || '',
            title,
            image: opts.image || opts.icon,
            flash: opts.flash,
            color: opts.color,
            tag: opts.tag,
            sticky: opts.sticky || false,
            company: opts.company,
            onShowFunc: this.onShow.bind(this),
            onClickFunc: this.onClick.bind(this),
            onCloseFunc: this.onClose.bind(this),
            onErrorFunc: this.onError.bind(this),
        };
    }
}

/**
 * Allow emitter events to be queued before addEventListener called.
 * Code adapted from: https://github.com/bredele/emitter-queue
 *
 * @param {Object} emitter Instance of node emitter that will get augmented.
 * @return {Object} Modified emitter
 */
const queue = (emitter): ICustomEventEmitter => {
    /**
     * Cache emitter on.
     * @api private
     */
    const cache = emitter.on;
    const modifiedEmitter = emitter;
    /**
     * Emit event and store it if no
     * defined callbacks.
     * example:
     *
     *   .queue('message', 'hi');
     *
     * @param {String} topic
     */
    modifiedEmitter.queue = function (topic) {
        this._queue = this._queue || {};
        this._callbacks = this._callbacks || {};
        if (this._callbacks[topic]) {
            this.emit.apply(this, arguments);
        } else {
            (this._queue[topic] = this._queue[topic] || [])
                .push([].slice.call(arguments, 1));
        }
    };

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param topic: {string}
     * @param fn: {Function}
     * @return {Event}
     */
    modifiedEmitter.on = modifiedEmitter.addEventListener = function (topic, fn) {
        this._queue = this._queue || {};
        const topics = this._queue[topic];
        cache.apply(this, arguments);

        if (!this._callbacks) {
            this._callbacks = {};
        }
        this._callbacks[topic] = true;

        if (topics) {
            let i = 0;
            const l = topics.length;
            for (; i < l; i++) {
                fn.apply(this, topics[i]);
            }
            delete this._queue[topic];
        }
    };

    return modifiedEmitter;
};
