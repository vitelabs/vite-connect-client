# @vite/connector

## Getting Started

## For Dapps (Client SDK - browser)

### Install

```bash
yarn add @vite/connector

# OR

npm install --save @vite/connector
```

### Initiate Connection

```javascript
import Connector from '@vite/connector';

const BRIDGE = 'wss://biforst.vitewallet.com';
const vbInstance = new Connector({ bridge: BRIDGE });
vbInstance
    .createSession()
    .then(() => console.log('connect uri', vbInstance.uri));
vbInstance.on('connect', (err, payload) => {
    const { accounts } = payload.params[0];
    if (!accounts || !accounts[0]) throw new Error('address is null');
    const address = accounts[0];// 传回vite-wallet-app 当前的vite address
    console.log(address);
    vbInstance.sendCustomRequest({// 请求 vite-wallet-app 签名并发送block
        method: 'vite_signAndSendTx',
        params: {
            block:{
                accountAddress: "vite_61404d3b6361f979208c8a5c442ceb87c1f072446f58118f68"
amount: "2000000000000000000"
blockType: 2
data: "c2FkZmFzZg=="
toAddress: "vite_61404d3b6361f979208c8a5c442ceb87c1f072446f58118f68"
tokenId: "tti_5649544520544f4b454e6e40"

            },//一个json block，prevHash/height/sign可以不填
            }}).then(signedBlock=>console.log(signedBlock)).catch(e=>console.error(e))

vbInstance.on('disconnect',(err)=>{
    console.log(err)
})

            
```
