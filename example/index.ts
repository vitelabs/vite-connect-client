import WalletConnect from "../packages/browser/src/index";
import WalletConnectQRCodeModal from "../packages/qrcode-modal/src/index";

declare global {
  interface Window {
    example: Example;
  }
}
class Example {
  constructor() {

    // ------------init walletConnector
    this._logEle = $(".log_broad ol");
    this._statusEle = $("connection_status");


    //----------------

    $(".create_connection").click(() => this.createSession());
    $(".kill_connection").click(() => {
    if(!this.walletConnector){this.error(`walletConnector hasn't been created now`);return ;}
      this.walletConnector.killSession();
    });
    $(".send_tx").click(e => {
      try {
        debugger;
        const content = JSON.parse(
          String(
            $(e.target)
              .parent()
              .children("textarea")
              .val()
          )
        );
        this.walletConnector.sendTransaction(content);
      } catch (e) {
        this.error(e);
      }
    });
    $(".sign_tx").click(e => {
      try {
        const content = JSON.parse(
          String(
            $(e.target)
              .parent()
              .children("textarea")
              .val()
          )
        );
        this.walletConnector.signTransaction(content);
      } catch (e) {
        this.error(e);
      }
    });
    $(".sign_bytes").click(e => {
      try {
        debugger;
        const content = String(
          $(e.target)
            .parent()
            .children("textarea")
            .val()
        );
        debugger;
        this.walletConnector.signTypedData([new Buffer(content)]);
      } catch (e) {
        this.error(e);
      }
    });
  }
  setStatus() {
    const status = this.walletConnector.connected
      ? "connecting"
      : "unConnected";
    console.log(`triggle Status Get:${status}`);
    const className = this.walletConnector.connected
      ? "is-success"
      : "is-danger";
    this._statusEle
      .removeClass(["is-danger", "is-success"])
      .addClass(className)
      .text(status);
    return status;
  }
  private _logEle: JQuery<HTMLElement>;
  private _statusEle: JQuery<HTMLElement>;
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
      typeof v === "string" ? (msg += v) : (msg += JSON.stringify(v));
    });
    this.log(msg, "danger");
  }
  createSession() {
    const bridge = String($("#bridge_addr").val());
    if(!bridge){this.error('lack brdige');return;}
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
      WalletConnectQRCodeModal.close();

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
      console.log(99999);
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

        this.log(`uri getted:${uri}`);
        WalletConnectQRCodeModal.open(uri, () => {
          this.info("QR Code Modal closed");
        });
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
