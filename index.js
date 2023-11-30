const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 4000
const screeningController = require('./screening/controller/screeningController.js')

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
app.get('/getListBranch',screeningController.getListBranch)
app.post('/getScoring',screeningController.getScoring)
app.get('/getDetailGrading/:order_id',screeningController.getDetailGradingSc1)
app.get('/getPayloadResult/:order_id',screeningController.getPayloadResult)
app.get('/getPayloadRequest/:order_id',screeningController.getPayloadReq)
app.get('/sc2/getScoring',screeningController.getScoringSc2)
app.get('/sc2/getDetailGrading/:order_id',screeningController.getDetailGradingSc2)
app.get('/sc2/getPayloadResult/:order_id',screeningController.getPayloadResultSc2)
app.get('/sc2/getPayloadRequest/:order_id',screeningController.getPayloadRequestSc2)
app.get('/sc3/getScoring',screeningController.getScoringSc3)
app.get('/sc3/getDetailGrading/:order_id',screeningController.getDetailGradingSc3)
app.get('/sc3/getPayloadResult/:order_id',screeningController.getPayloadResultSc3)
app.get('/sc3/getPayloadRequest/:order_id',screeningController.getPayloadRequestSc3)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})