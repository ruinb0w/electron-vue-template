const {
  app,
  BrowserWindow,
  Menu,
  powerSaveBlocker,
  protocol,
} = require("electron");

const { checkLoad, isDev } = require("./assets/js/utils");

function createWindow() {
  const DEFAULT_HEIGHT = 800;
  const DEFAULT_WIDTH = 600;

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
      devTools: isDev(),
    },
  });

  // check page is load success, if not prompt error message.
  checkLoad({ mainWindow });

  // open devTools in dev mode
  isDev() && mainWindow.webContents.openDevTools();
}

function start() {
  // set auto start
  !isDev() && app.setLoginItemSettings({ openAtLogin: true });
  // hide menu bar
  !isDev() && Menu.setApplicationMenu(null);
  // prevent display sleep
  !isDev() && powerSaveBlocker.start("prevent-display-sleep");

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
}

start();
