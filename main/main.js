const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  powerSaveBlocker,
  protocol,
} = require("electron");

let is_dev = process.env.NODE_ENV == "development";

// ==== configuration app ====
// set auto start
!is_dev && app.setLoginItemSettings({ openAtLogin: true });
// hide menu bar
!is_dev && Menu.setApplicationMenu(null);
// prevent display sleep
!is_dev && powerSaveBlocker.start("prevent-display-sleep");

const DEFAULT_HEIGHT = 800;
const DEFAULT_WIDTH = 600;

function createWindow() {
  const mainWindow = new BrowserWindow({
    minWidth: DEFAULT_WIDTH,
    width: DEFAULT_WIDTH,
    minHeight: DEFAULT_HEIGHT,
    fullscreen: true,
    height: DEFAULT_HEIGHT,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: require("path").join(__dirname, "preload.js"),
      webSecurity: false,
      devTools: is_dev,
    },
  });

  // check page is load success, if not prompt error message.
  initCheckLoad(mainWindow);

  // clear all listeners before close window.
  ipcMain.on("closeWindow", () => {
    ipcMain.removeAllListeners("closeWindow");
    mainWindow.close();
  });
}

app.on("ready", () => {
  protocol.interceptFileProtocol(
    "file",
    (req, callback) => {
      const url = req.url.substr(8);
      callback(decodeURI(url));
    },
    (error) => {
      if (error) {
        console.error("Failed to register protocol");
      }
    }
  );

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.whenReady().then(() => {});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

function initCheckLoad(mainWindow) {
  const LIMIT = 12;
  const INTERVAL = 5000;
  let times = 0;

  async function checkLoad() {
    times++;
    try {
      if (is_dev) {
        await mainWindow.loadURL("http://localhost:8080");
      } else {
        await mainWindow.loadURL("https://api.lcwmkj.cn/Lxzzb/lxxf");
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
