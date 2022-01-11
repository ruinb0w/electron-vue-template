module.exports = {
  checkLoad,
  isDev,
};

const { dialog } = require("electron");
/*
 * desc: check load from url
 * return: void
 * options:
 * - mainWindow: instance of BrowserWindow
 * - pro_url: production url
 * - dev_url: development url, default is "http://localhost:8080"
 * */
function checkLoad(options) {
  const { mainWindow, pro_url, dev_url } = options;
  const LIMIT = 12;
  const INTERVAL = 5000;
  let times = 0;

  async function checkLoad() {
    times++;
    try {
      if (isDev()) {
        await mainWindow.loadURL(dev_url || "http://localhost:8080");
      } else {
        pro_url && (await mainWindow.loadURL(url));
      }
    } catch (err) {
      console.log("err", err);
      if (times > LIMIT) {
        dialog.showErrorBox("网络错误", "网络错误请检查网络");
        mainWindow.close();
      } else {
        setTimeout(checkLoad, INTERVAL);
      }
    }
  }

  checkLoad();
}

/*
 * desc: check is in development mode
 * return: boolean
 * */
function isDev() {
  return process.env.NODE_ENV == "development";
}
