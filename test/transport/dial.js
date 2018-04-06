/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multiaddr = require('multiaddr')
const series = require('async/series')
const pull = require('pull-stream')
const Buffer = require('safe-buffer').Buffer

module.exports = (create) => {
  describe('dial', () => {
    let ws1
    let ws2
    let ma1
    let ma2

    const maHSDNS = '/dns/star-signal.cloud.ipfs.team'
    const maHSIP = '/ip4/188.166.203.82/tcp/20000'

    const maLS = '/ip4/127.0.0.1/tcp/15555'
    const maGen = (base, id) => multiaddr(`${base}/wss/p2p-webrtc-star/ipfs/${id}`) // https
    // const maGen = (base, id) => multiaddr(`${base}/ws/p2p-webrtc-star/ipfs/${id}`)

    if (process.env.WEBRTC_STAR_REMOTE_SIGNAL_DNS) {
      // test with deployed signalling server using DNS
      console.log('Using DNS:', maHSDNS)
      ma1 = maGen(maHSDNS, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
      ma2 = maGen(maHSDNS, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2b')
    } else if (process.env.WEBRTC_STAR_REMOTE_SIGNAL_IP) {
      // test with deployed signalling server using IP
      console.log('Using IP:', maHSIP)
      ma1 = maGen(maHSIP, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
      ma2 = maGen(maHSIP, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2b')
    } else {
      ma1 = maGen(maLS, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
      ma2 = maGen(maLS, 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2b')
    }

    before((done) => {
      series([first, second], done)

      function first (next) {
        ws1 = create()
        const listener = ws1.createListener((conn) => pull(conn, conn))
        listener.listen(ma1, next)
      }

      function second (next) {
        ws2 = create()
        const listener = ws2.createListener((conn) => pull(conn, conn))
        listener.listen(ma2, next)
      }
    })

    it('dial on IPv4, check callback', function (done) {
      this.timeout(20 * 1000)

      ws1.dial(ma2, (err, conn) => {
        expect(err).to.not.exist()

        const data = Buffer.from('some data')

        pull(
          pull.values([data]),
          conn,
          pull.collect((err, values) => {
            expect(err).to.not.exist()
            expect(values).to.be.eql([data])
            done()
          })
        )
      })
    })

    it('dial offline / non-exist()ent node on IPv4, check callback', function (done) {
      this.timeout(20 * 1000)
      let maOffline = multiaddr('ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/ipfs/ABCD')
      ws1.dial(maOffline, (err, conn) => {
        expect(err).to.exist()
        done()
      })
    })

    it.skip('dial on IPv6', (done) => {
      // TODO IPv6 not supported yet
    })
  })
}
