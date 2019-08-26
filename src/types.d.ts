/**
 * @module js-libp2p-webrtc-star
 */
declare module "js-libp2p-webrtc-star" {
    /**
     *
     * @param {*} options
     */
    class WebRTCStar {
        constructor(options: any);
        /**
         *
         * @param {*} ma
         * @param {object} options
         * @param {function} callback
         */
        dial(ma: any, options: any, callback: (...params: any[]) => any): void;
        /**
         *
         * @param {object} options
         * @param {function} handler
         */
        createListener(options: any, handler: (...params: any[]) => any): void;
        /**
         *
         * @param {*} multiaddrs
         */
        filter(multiaddrs: any): void;
        /**
         *
         * @param {*} maStr
         */
        _peerDiscovered(maStr: any): void;
    }
}

/**
 * @module js-libp2p-webrtc-star/utils
 */
declare module "js-libp2p-webrtc-star/utils" {
    /**
     * @param {*} ma
     */
    function cleanUrlSIO(ma: any): void;
    /**
     * @param {*} maStr
     */
    function cleanMultiaddr(maStr: any): void;
}

