const parseProcVariable = () => {
  const procArgs = process.argv.slice(2)
  // todo: 处理小程序编译
  const isMpMode = procArgs.findIndex(e => String(e).match(/\-mp$/) !== null) !== -1
  const needBundleReport = procArgs.findIndex(e => String(e).match(/^report$/g) !== null) !== -1

  return { isMpMode, needBundleReport }
}
const createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') {
      return
    }

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
    })
  }
}

module.exports = { parseProcVariable, createNotifierCallback }
