/* eslint-env mocha */
/* eslint-disable no-console */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multiaddr = require('multiaddr')
const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')

module.exports = (create) => {
  describe('dial', () => {
    let ws1
    let ws2
    let ma1
    let ma2
    let listener2

    const maHSDNS = multiaddr('/dns/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star')
    const maHSIP = multiaddr('/ip4/188.166.203.82/tcp/20000/wss/p2p-webrtc-star')
    const maLS = multiaddr('/ip4/127.0.0.1/tcp/15555/wss/p2p-webrtc-star')

    if (process.env.WEBRTC_STAR_REMOTE_SIGNAL_DNS) {
      // test with deployed signalling server using DNS
      console.log('Using DNS:', maHSDNS)
      ma1 = maHSDNS
      ma2 = maHSDNS
    } else if (process.env.WEBRTC_STAR_REMOTE_SIGNAL_IP) {
      // test with deployed signalling server using IP
      console.log('Using IP:', maHSIP)
      ma1 = maHSIP
      ma2 = maHSIP
    } else {
      ma1 = maLS
      ma2 = maLS
    }

    beforeEach(async () => {
      // first
      ws1 = await create()
      const listener1 = ws1.createListener((conn) => {
        expect(conn.remoteAddr).to.exist()
        pipe(conn, conn)
      })

      // second
      ws2 = await create()
      listener2 = ws2.createListener((conn) => pipe(conn, conn))

      await Promise.all([listener1.listen(ma1), listener2.listen(ma2)])
    })

    it('dial on IPv4, check promise', async function () {
      this.timeout(20 * 1000)

      const conn = await ws1.dial(ws2._signallingAddr)
      const data = Buffer.from('some data')
      const values = await pipe(
        [data],
        conn,
        collect
      )

      expect(values).to.eql([data])
    })

    it('dial offline / non-exist()ent node on IPv4, check promise rejected', async function () {
      this.timeout(20 * 1000)
      const maOffline = multiaddr('/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2f')

      try {
        await ws1.dial(maOffline)
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error)
        expect(err).to.have.property('code', 'ERR_SIGNALLING_FAILED')
        return
      }

      throw new Error('dial did not fail')
    })

    it.skip('dial on IPv6', (done) => {
      // TODO IPv6 not supported yet
    })
  })
}
