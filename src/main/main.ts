import { app, BrowserWindow, Tray, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import fixPath from 'fix-path';

fixPath();

let win: BrowserWindow | null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload))).catch(console.log);
};

const createWindow = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await installExtensions();
  }

  win = new BrowserWindow({ width: 1024, height: 768, title: 'Ktl' });

  if (process.env.NODE_ENV !== 'production') {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    win.loadURL(`http://localhost:2003?win=main`);
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        query: {
          win: 'main',
        },
      }),
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
    win.webContents.once('dom-ready', () => {
      win!.webContents.openDevTools();
    });
  }

  win.on('closed', () => {
    win = null;
  });

  createMenu(win);
};

function createMenu(win: BrowserWindow) {
  const tray = new Tray(path.join(__dirname, 'static', 'ktl-tray.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle DevTool',
      accelerator: 'CmdOrCtrl+Alt+I',
      click() {
        win.webContents.toggleDevTools();
      },
    },
    { type: 'separator' },
    { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
    { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
  tray.setToolTip('ktl - GUI for kubectl');
  tray.setContextMenu(contextMenu);

  contextMenu.on('menu-will-show', () => {
    tray.setImage(path.join(__dirname, 'static', 'ktl-tray-active.png'));
  });

  contextMenu.on('menu-will-close', () => {
    tray.setImage(path.join(__dirname, 'static', 'ktl-tray.png'));
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
