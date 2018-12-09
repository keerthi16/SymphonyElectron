import { ipcRenderer } from 'electron';
import * as React from 'react';
import { apiCmds, apiName } from '../common/api-interface';
import { i18n } from '../common/i18n';

interface IDownloadManager {
    _id: string;
    fileName: string;
    savedPath: string;
    total: number;
}

interface IManagerState {
    items: string[];
    showMainComponent: boolean;
}

interface ILocalObject {
    downloadItems: IDownloadManager[];
    ipcRenderer;
}

/**
 * Keeping global var
 */
const local: ILocalObject = {
    downloadItems: [],
    ipcRenderer,
};

const openFile = (id) => {
    const fileIndex = local.downloadItems.findIndex((item) => {
        return item._id === id;
    });

    if (fileIndex !== -1) {
        local.ipcRenderer.send(apiName.symphonyApi, {
            cmd: apiCmds.downloadManagerAction,
            path: local.downloadItems[fileIndex].savedPath,
            type: 'open',
        });
    }
};

const showInFinder = (id) => {
    const fileIndex = local.downloadItems.findIndex((item) => {
        return item._id === id;
    });

    if (fileIndex !== -1) {
        local.ipcRenderer.send(apiName.symphonyApi, {
            cmd: apiCmds.downloadManagerAction,
            path: local.downloadItems[fileIndex].savedPath,
            type: 'show',
        });
    }
};

const getFileDisplayName = (fileName) => {
    const fileList = local.downloadItems;
    let fileNameCount = 0;
    let fileDisplayName = fileName;

    /* Check if a file with the same name exists
     * (akin to the user downloading a file with the same name again)
     * in the download bar
     */
    for (const value of fileList) {
        if (fileName === value.fileName) {
            fileNameCount++;
        }
    }

    /* If it exists, add a count to the name like how Chrome does */
    if (fileNameCount) {
        const extLastIndex = fileDisplayName.lastIndexOf('.');
        const fileCount = ' (' + fileNameCount + ')';

        fileDisplayName = fileDisplayName.slice(0, extLastIndex) + fileCount + fileDisplayName.slice(extLastIndex);
    }

    return fileDisplayName;
};

export default class DownloadManager extends React.Component<{}, IManagerState> {

    constructor(props) {
        super(props);

        this.state = {
            items: [],
            showMainComponent: false,
        };

        this.setVisibility = this.setVisibility.bind(this);
    }

    public componentDidMount(): void {
        ipcRenderer.on('downloadCompleted', this.injectItem);
        ipcRenderer.on('downloadProgress', this.initialize);
    }

    public componentWillUnmount(): void {
        ipcRenderer.removeListener('downloadCompleted', this.injectItem);
        ipcRenderer.removeListener('downloadProgress', this.initialize);
    }

    /**
     * Inject items to global var
     * @param args
     */
    public injectItem(args) {
        local.downloadItems.push(args);
        const items = this.state.items;
        items.push(args._id);
        this.setState({ items });
    }

    /**
     * Show or hide main footer which comes from the client
     */
    public setVisibility() {
        this.setState({
            showMainComponent: !this.state.showMainComponent,
        });
    }

    /**
     * render main component
     */
    public mainComponent() {
        return (
            <div id='download-manager-footer'>
                <ul id='download-main'>
                    {this.renderItems()}
                </ul>
                <span
                    id='close-download-bar'
                    className='close-download-bar tempo-icon tempo-icon--close'
                    onClick={this.setVisibility} />
            </div>
        );
    }

    /**
     * Loop through the items downloaded
     * @param item
     */
    public mapItems(item) {
        const gItem: IDownloadManager = local.downloadItems[item];
        const {
            _id,
            total,
            fileName,
        } = gItem;

        const fileDisplayName = getFileDisplayName(fileName);
        return (
            <li id={_id} className='download-element'>
                <div className='download-item' id='dl-item' onClick={openFile.call(this, _id)}>
                    <div className='file'>
                        <div id='download-progress' className='download-complete flash'>
                            <span className='tempo-icon tempo-icon--download download-complete-color'>
                            </span>
                        </div>
                    </div>
                    <div className='downloaded-filename'>
                        <h1 className='text-cutoff'>
                            {fileDisplayName}
                        </h1>
                        <span id='per'>
                            {total}{i18n.t('Downloaded')()}
                        </span>
                    </div>
                </div>
                <div id='menu' className='caret tempo-icon tempo-icon--dropdown'>
                    <div id='download-action-menu' className='download-action-menu'>
                        <ul id={_id}>
                            <li id='download-open' onClick={openFile.call(this, _id)}>
                                {i18n.t('Open')()}
                            </li>
                            <li id='download-show-in-folder' onClick={showInFinder.call(this, _id)}>
                                {i18n.t('Show in Folder')()}
                            </li>
                        </ul>
                    </div>
                </div>
            </li>
        );
    }

    /**
     * Map of items
     */
    public renderItems() {
        return this.state.items.map(this.mapItems);

    }

    /**
     * Initialize main component
     */
    public initialize() {
        return this.mainComponent();
    }

    /**
     * Main react render component
     */
    public render(): React.ReactNode {
        const mainFooter = document.getElementById('footer');
        if (mainFooter) {
            this.state.showMainComponent ? mainFooter.classList.remove('hidden') : mainFooter.classList.add('hidden');
        }
        return (
            <div>
                {this.initialize()}
            </div>
        );
    }
}