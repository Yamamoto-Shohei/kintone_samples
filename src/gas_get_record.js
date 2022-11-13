const KINTONE_URL = 'https://xxxxxxxx.cybozu.com'

const APP_ID = 0
const APP_API_TOKEN = 'xxxxxxxx'

const getKintoneRecord = (app, appApiToken, id) => {
  const apiResponse =  UrlFetchApp.fetch(`${KINTONE_URL}/k/v1/record.json?app=${app}&id=${id}`, {
    method: 'get',
    headers: {
      'X-Cybozu-API-Token': appApiToken
    }
  })
  return apiResponse.getContentText()
}

const createKintoneRecord = (app, appApiToken, record) => {
  const apiResponse =  UrlFetchApp.fetch(`${KINTONE_URL}/k/v1/record.json`, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Cybozu-API-Token': appApiToken
    },
    payload: JSON.stringify({app, record})
  })
  return apiResponse.getContentText()
}

const updateKintoneRecord = (app, appApiToken, id, record) => {
  const apiResponse =  UrlFetchApp.fetch(`${KINTONE_URL}/k/v1/record.json`, {
    method: 'put',
    contentType: 'application/json',
    headers: {
      'X-Cybozu-API-Token': appApiToken
    },
    payload: JSON.stringify({app, id, record})
  })
  return apiResponse.getContentText()
}

const callRestAPI = () => {
  const createRecord = createKintoneRecord(APP_ID, APP_API_TOKEN, {
    address1: {
      value: '大阪府岸和田市'
    },
  })
  console.log(createRecord)
  const id = JSON.parse(createRecord).id
  console.log(updateKintoneRecord(APP_ID, APP_API_TOKEN, id, {
    address1: {
      value: '兵庫県佐用郡三日月'
    },
  }))
  console.log(getKintoneRecord(APP_ID, APP_API_TOKEN, id))
}
