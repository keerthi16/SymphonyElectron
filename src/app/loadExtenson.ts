import { app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const userData = app.getPath('userData');

const extensionDirPath = path.join(userData, 'extension');

export const loadExtension = (): void => {
    if (fs.existsSync(extensionDirPath)) {
        const extensions = fs.readdirSync(extensionDirPath);
        if (extensions.length) {
            for (const extension of extensions) {
                if (fs.existsSync(path.join(extensionDirPath, extension))) {
                    BrowserWindow.addExtension(path.join(extensionDirPath, extension));
                }
            }
        }
    }
};
