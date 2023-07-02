// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 350,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  // Open the DevTools.
  // mainWindow.webContents.openDevTools({ activate: false })
}

function createTray() {
  let icon
  if (global.global_config.status) {
    icon = nativeImage.createFromPath(path.join(__dirname, './rocket-white.png'))
  }else{
    icon = nativeImage.createFromPath(path.join(__dirname, './rocket-black.png'))
  }
  tray = new Tray(icon)
  updateTray()
}

function updateTray() {
  const contextMenu = Menu.buildFromTemplate([
    { label: '服务', type: 'checkbox', checked: global.global_config.status, click: statusChange },
    { label: '设置', type: 'normal', click: settingClick },
    { label: '退出', type: 'normal', click: ipc.handleExit }
  ])
  tray.setContextMenu(contextMenu)
}

function settingClick() {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  else mainWindow.moveTop()
}

function statusChange() {
  global.global_config.status = !global.global_config.status
  ipc.updateConfig(null, global.global_config)
  let icon
  if (global.global_config.status) {
    icon = nativeImage.createFromPath(path.join(__dirname, './rocket-white.png'))
  }else{
    icon = nativeImage.createFromPath(path.join(__dirname, './rocket-black.png'))
  }
  tray.setImage(icon)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updateCheckboxState', global.global_config.status);
  }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  global.global_config = ipc.getConfig()
  if (global.global_config.status) {
    ipc.runNaive()
  }
  ipcMain.handle('runNaive', () => ipc.runNaive())
  ipcMain.handle('closeNaive', () => ipc.closeNaive())
  ipcMain.on('updateConfig', (event, config) => {
    ipc.updateConfig(event, config)
    updateTray()
  })
  ipcMain.handle('getConfig', () => global.global_config);

  createWindow()
  createTray()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  ipc.closeNaive
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const ipc = require('./ipc')
