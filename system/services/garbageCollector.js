
const substruct = require('@internalfx/substruct')
const moment = require('moment')

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango

  const run = async function () {
    try {
      console.log('GC BEGIN ====================================')
      const res = await arango.qAll(aql`
        FOR op IN operations
          FILTER op.runDate < ${moment().subtract(14, 'days').toDate()}
          let opKey = op._key
          let opNumber = op.number
          REMOVE op IN operations
          let res = (FOR entry IN entries
            FILTER entry.operationKey == opKey
            REMOVE entry IN entries
            RETURN entry)
          RETURN opNumber
      `)
      console.log(`Operations removed ${res}`)
      console.log('GC COMPLETE =================================')
    } catch (err) {
      console.log(err)
    }

    setTimeout(run, 1000 * 60 * 10)
  }

  run()

  return {}
}
