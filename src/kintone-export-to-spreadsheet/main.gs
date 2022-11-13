const doGet = (param) => {
  const template = HtmlService.createTemplateFromFile('index')
  template.url = ScriptApp.getService().getUrl()
  return template.evaluate()
}

const getKintoneAppInfo = (hostname, app, appApiToken) => {
  const getApiResponse = UrlFetchApp.fetch(`https://${hostname}/k/v1/app.json?id=${app}`, {
    method:  'get',
    headers: {
      'X-Cybozu-API-Token': appApiToken,
    },
  })
  return JSON.parse(getApiResponse.getContentText())
}

const getKintoneFields = (hostname, app, appApiToken) => {
  const getApiResponse = UrlFetchApp.fetch(`https://${hostname}/k/v1/app/form/fields.json?app=${app}`, {
    method:  'get',
    headers: {
      'X-Cybozu-API-Token': appApiToken,
    },
  })
  return JSON.parse(getApiResponse.getContentText())
}

const getKintoneRecords = (hostname, app, appApiToken, query, fields, size) => {
  const postApiResponse =  UrlFetchApp.fetch(`https://${hostname}/k/v1/records/cursor.json`, {
    method:  'post',
    contentType: 'application/json',
    headers: {
      'X-Cybozu-API-Token': appApiToken,
    },
    payload: JSON.stringify({app, fields, query, size})
  })
  const cursor = JSON.parse(postApiResponse.getContentText())
  if (!parseInt(cursor.totalCount)) return
  const getApiResponse =  UrlFetchApp.fetch(`https://${hostname}/k/v1/records/cursor.json?id=${cursor.id}`, {
    method:  'get',
    headers: {
      'X-Cybozu-API-Token': appApiToken,
    },
  })
  return JSON.parse(getApiResponse.getContentText())
}

const outputSpreadSheet = (header, record, fileName) => {
  const spreadsheet = SpreadsheetApp.create(fileName, record.length + 1, header.length)
  const sheet = spreadsheet.getSheets()[0]
  sheet.getRange(1, 1, 1, header.length).setValues([header])
  sheet.getRange(2, 1, record.length, header.length).setValues(record)
  return spreadsheet.getUrl()
}

const exportKintoneAppData = ({hostname, app_id, api_token, get_count}) => {
  const appInfo = getKintoneAppInfo(hostname, app_id, api_token)
  const filename = `export-${Utilities.formatDate(new Date(), 'JST', 'yyyyMMddHHmmss')}-${appInfo.name}`
  const allFields = getKintoneFields(hostname, app_id, api_token)
  const header = Object.values(allFields.properties).map((propertie) => propertie.label)
  const fields = Object.values(allFields.properties).map((propertie) => propertie.code)
  const records = getKintoneRecords(hostname, app_id, api_token, null, fields, get_count)
  const url = outputSpreadSheet(header, records.records.map((record) => fields.map(key => {
    if (!record[key]) return ''
    if (record[key].value instanceof Object) return JSON.stringify(record[key].value)
    if (record[key].value instanceof String) return record[key].value
    return record[key].value + ''
  })), filename)
  return {url, filename}
}
