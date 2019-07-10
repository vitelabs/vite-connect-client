import Connector from '@/core'
import { IWalletConnectOptions } from '@/types'
import * as cryptoLib from './webCrypto'
import {IClientMeta} from '@/types';

class WalletConnect extends Connector {
  constructor (opts: IWalletConnectOptions,meta?:IClientMeta) {
    super(cryptoLib, opts)
  }
}

export default WalletConnect
