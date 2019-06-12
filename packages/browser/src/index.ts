import Connector from '@walletconnect/core/src/index'
import { IWalletConnectOptions } from '@walletconnect/types'
import * as cryptoLib from './webCrypto'
import WebStorage from './webStorage'

class WalletConnect extends Connector {
  constructor (opts: IWalletConnectOptions) {
    super(cryptoLib, opts, WebStorage)
  }
}

export default WalletConnect
