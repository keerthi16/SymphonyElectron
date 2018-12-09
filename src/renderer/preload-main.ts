import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import WindowsTitleBar from '../renderer/windows-title-bar';
import DownloadManager from './download-manager';
import SnackBar from './snack-bar';
import { SSFApi } from './ssf-api';

interface ISSFWindow extends Window {
    ssf?: SSFApi;
}

const ssfWindow: ISSFWindow = window;

/**
 * creates API exposed from electron.
 */
const createAPI = () => {
    // iframes (and any other non-top level frames) get no api access
    // http://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t/326076
    if (window.self !== window.top) {
        return;
    }

    // note: window.open from main window (if in the same domain) will get
    // api access.  window.open in another domain will be opened in the default
    // browser (see: handler for event 'new-window' in windowMgr.js)

    //
    // API exposed to renderer process.
    //
    // @ts-ignore
    ssfWindow.ssf = new SSFApi();
    Object.freeze(ssfWindow.ssf);
};

createAPI();

// When the window is completely loaded
ipcRenderer.on('page-load', () => {
    // injects custom window title bar
    const titleBar = React.createElement(WindowsTitleBar);
    ReactDOM.render(titleBar, document.body.appendChild(document.createElement( 'div' )));

    // injects snack bar
    const snackBar = React.createElement(SnackBar);
    ReactDOM.render(snackBar, document.body.appendChild(document.createElement( 'div' )));

    const downloadManager = React.createElement(DownloadManager);
    const footerSFE = document.getElementById('footer');
    if (footerSFE) {
        ReactDOM.render(downloadManager, footerSFE);
    }
});

// Creates a custom tile bar for Windows
ipcRenderer.on('initiate-custom-title-bar', () => {
    const element = React.createElement(WindowsTitleBar);
    ReactDOM.render(element, document.body);
});