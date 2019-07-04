import WalletConnect from "../packages/browser/src/index";
import {copy} from "./utils";

declare global {
  interface Window {
    example: Example;
  }
}
class Example {
  constructor() {
    // ------------init walletConnector
    this._logEle = $(".log_broad ol");
    this._walletStatusEle = $("#wallet_connection_status");
    this._socketStatusEle = $("#socket_connection_status");
    this.intervalHandler = setInterval(() => {
      this.setStatus();
    }, 500);
    //----------------

    $(".create_connection").click(() => this.createSession());
    $(".kill_connection").click(() => {
      if (!this.walletConnector) {
        this.error(`walletConnector hasn't been created now`);
        return;
      }
      this.walletConnector.killSession();
    });
    $(".clear_session").click(()=>localStorage.clear())
    $(".send_event").click(e => {
      try {
        const eventName = String($("#event_name").val());
        const content = String(
          $(e.target)
            .parent()
            .children("textarea")
            .val()
        );
        this.info('send:'+JSON.stringify({ method: eventName, params: [content] }))
        this.walletConnector
          .sendCustomRequest({ method: eventName, params: [content] })
          .then(res => this.info(`received ${JSON.stringify(res)}`))
          .catch(e => this.error(e));
      } catch (e) {
        this.error(e);
      }
    });
  }
  intervalHandler: NodeJS.Timeout;
  setStatus() {
    const walletStatus = this.wallectConnectStatus
      ? "wallet_connecting"
      : "wallet_unConnected";
    const socketStatus = this.socketConnectStatus
      ? "socket_connecting"
      : "socket_unConnected";
    const getClassName = function(s) {
      return s ? "is-success" : "is-danger";
    };

    this._walletStatusEle
      .removeClass(["is-danger", "is-success"])
      .addClass(getClassName(this.wallectConnectStatus))
      .text(walletStatus);
    this._socketStatusEle
      .removeClass(["is-danger", "is-success"])
      .addClass(getClassName(this.socketConnectStatus))
      .text(socketStatus);
  }
  get wallectConnectStatus() {
    return this.walletConnector && this.walletConnector.connected;
  }
  get socketConnectStatus() {
    return (
      this.walletConnector &&
      this.walletConnector._socket &&
      this.walletConnector._socket._socket &&
      this.walletConnector._socket._socket.readyState === 1
    );
  }
  private _logEle: JQuery<HTMLElement>;
  private _walletStatusEle: JQuery<HTMLElement>;
  private _socketStatusEle: JQuery<HTMLElement>;
  private walletConnector: WalletConnect;

  log(msg: string, level: "info" | "warning" | "danger" = "info") {
    const time = new Date();
    const logItem = $(
      `<li class="has-text-${level}"><span class="has-text-light">${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</span>${msg}</li>`
    );
    this._logEle.append(logItem);
  }
  warn(...args) {
    let msg = ``;
    args.forEach(v => {
      typeof v === "string" ? (msg += v) : (msg += JSON.stringify(v));
    });
    this.log(msg, "warning");
  }
  info(...args) {
    let msg = ``;
    args.forEach(v => {
      typeof v === "string" ? (msg += v) : (msg += JSON.stringify(v));
    });
    this.log(msg, "info");
  }
  error(...args) {
    let msg = ``;
    args.forEach(v => {
        if(v instanceof Error){
            msg+=v.message;
            return;
        }
      typeof v === "string" ? (msg += v) : (msg += JSON.stringify(v));
    });
    this.log(msg, "danger");
  }
  createSession() {
    const bridge = String($("#bridge_addr").val())||"ws://hurrytospring.com:5001";
    if (!bridge) {
      this.error("lack brdige");
      return;
    }
    this.walletConnector = new WalletConnect({
      bridge // Required
      // uri:`wc:ff02e2fc-4709-452d-9eb2-0ef74e6ce91d@1?bridge=http%3A%2F%2F192.168.31.82%3A5001&key=c4c59bea010710f35b9abc77456e3bc085d4ee0a0dc69d6c39358e0078396028`
    });

    this.walletConnector.on("connect", (error, payload) => {
      this.setStatus();
      if (error) {
        this.error(error);
        throw error;
      }
      // Close QR Code Modal

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.info("connected", accounts, chainId);
    });
    this.walletConnector.on("session_update", (error, payload) => {
      if (error) {
        this.error(error);
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.info("session_update");
    });

    this.walletConnector.on("disconnect", (error, payload) => {
      this.setStatus();
      if (error) {
        this.error(error);
        throw error;
      }
      this.info("disconnected");

      // Delete walletConnector
    });
    // this.walletConnector._connected=true;
    if (!this.walletConnector.connected) {
      // create new session

      this.walletConnector.createSession().then(() => {
        // get uri for QR Code modal
        const uri = this.walletConnector.uri;
        // display QR Code modal
        copy(uri)
        this.log(`uri getted:${uri}`);

      });
    }
  }
}
// Create a walletConnector
$.ready.then(function() {
  const example = new Example();
  window.example = example;
});
// Subscribe to connection events
