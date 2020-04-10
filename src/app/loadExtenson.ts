import { app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const userData = path.dirname(app.getPath('userData'));

const extensionDirPath = path.join(userData, 'extension');

export const loadExtension = (): void => {
    const extensions = fs.readdirSync(extensionDirPath);

    for (const extension of extensions) {
        BrowserWindow.addExtension(path.join(extensionDirPath, extension));
    }
};
