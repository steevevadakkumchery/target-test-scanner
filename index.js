const e = require('express')
const express = require('express')
const { JSDOM } = require('jsdom')

const PORT = process.env.PORT || 8001
// const url = 'https://www.vodafone.co.uk/mobile/phones/pay-monthly-contracts/samsung/galaxy-s21-fe'
// const url = 'https://www.vodafone.co.uk/business/business-sim-only?commitmentPeriod=24%20Months&icmp=uk~1_consumer~topnav~1_shop~1_sim_only_&_plans~1_sim_only_for_phones&linkpos=topnav~1~1~1~1'
const basePath = 'https://www.vodafone.co.uk/'
const app = express()
app.use(express.json())

app.get('/', async (req, res) => {
  console.log('Request Id:', req.query.href);
  if(!req.query.href) {
    res.status(404)
    res.write('not found')
    res.end()
    return
  } 
  const data = await getTestInfo(req.query.href)
  if(Array.isArray(data)) {
    const processedData = data.reduce((acc, curr) => {
      return [ ...acc, {testName: curr.CampaignName} ]
    }, [])
    res.status(200)
    res.json(processedData)
    res.end()
  } else {
    res.status(408)
    res.send(data)
    res.end()
  }
})

app.listen(PORT, () => {
  console.log(`listening on localhost:${PORT}`)
})

function getTestInfo(url) {

  if(!url.includes(basePath)) {
    return 'not a vodafone site'
  }

  const options = {
    runScripts: "dangerously",
    resources: "usable"
  };

  return new Promise((resolve, reject) => {
    JSDOM.fromURL(url, options).then(dom => {
      let counter = 0
      let timer = setInterval(() => {
        if(dom.window.ttMETA) {
          clearTimeout(timer)
          resolve(dom.window.ttMETA)
        } else {
          if(counter > 20) {
            clearTimeout(timer)
            reject('timed out')
          }
          counter++
        }
      }, 1000)
    })
  })
}
