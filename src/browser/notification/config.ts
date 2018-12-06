import * as path from 'path';
import { isNodeEnv } from '../../common/env';

const sandboxed = false;

export const notifyConfig = {
    // corner to put notifications
    // upper-right, upper-left, lower-right, lower-left
    startCorner: 'upper-right',
    width: 380,
    height: 100,
    borderRadius: 5,
    displayTime: 5000,
    animationSteps: 5,
    animationStepMs: 5,
    animateInParallel: true,
    pathToModule: '',
    logging: true,
    defaultStyleContainer: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        position: 'relative',
        lineHeight: '15px',
        boxSizing: 'border-box'
    },
    defaultStyleHeader: {
        width: 245,
        minWidth: 230,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    defaultStyleImageContainer: {
        alignItems: 'center',
        display: 'flex',
    },
    defaultStyleImage: {
        height: 43,
        borderRadius: 4,
        width: 43
    },
    defaultStyleClose: {
        width: 16,
        height: 80,
        display: 'flex',
        margin: 'auto',
        opacity: 0.54,
        fontSize: 12,
        color: '#CCC'
    },
    defaultStyleTitle: {
        fontFamily: 'sans-serif',
        fontSize: 14,
        fontWeight: 700,
        color: '#4a4a4a',
        overflow: 'hidden',
        display: '-webkit-box',
        webkitLineClamp: 1,
        webkitBoxOrient: 'vertical',
    },
    defaultStyleCompany: {
        fontFamily: 'sans-serif',
        fontSize: 11,
        color: '#adadad',
        overflow: 'hidden',
        filter: 'brightness(70%)',
        display: '-webkit-box',
        webkitLineClamp: 1,
        webkitBoxOrient: 'vertical',
    },
    defaultStyleText: {
        fontFamily: 'sans-serif',
        fontSize: 12,
        color: '#4a4a4a',
        marginTop: 5,
        overflow: 'hidden',
        display: '-webkit-box',
        webkitLineClamp: 3,
        webkitBoxOrient: 'vertical',
        cursor: 'default',
        textOverflow: 'ellipsis',
    },
    defaultStyleLogoContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    defaultStyleLogo: {
        marginLeft: '5px',
        opacity: 0.6,
        width: '43px',
    },
    defaultWindow: {
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        frame: false,
        transparent: true,
        acceptFirstMouse: true,
        webPreferences: {
            preload: path.join(__dirname, 'electron-notify-preload.js'),
            sandbox: sandboxed,
            nodeIntegration: isNodeEnv,
            devTools: false
        }
    },
    templatePath: '',
};
