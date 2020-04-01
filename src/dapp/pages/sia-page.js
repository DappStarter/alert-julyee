import CustomElement from '../../lib/components/shared/custom-element';
import './components/page-panel.js';
import './components/page-body.js';
import '../../lib/components/shared/action-card.js';
import '../../lib/components/widgets/text-widget.js';
import '../../lib/components/widgets/number-widget.js';
import '../../lib/components/widgets/account-widget.js';
import UploadWidget from '../../lib/components/widgets/upload-widget.js';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import DappLib from '../../lib/dapp-lib';

export default class SiaPage extends CustomElement {

    constructor(...args) {
        super([], ...args);
        this.mode = 'multiple'; 
        this.files = [];
        this.eventHandlerRegistered = false;
    }

    render() {
        let self = this;

        let uiHtml = {
            [CustomElement.UI_READ]: '',
            [CustomElement.UI_WRITE]: '',
            [CustomElement.UI_ADMIN]: ''

        }


            uiHtml[CustomElement.UI_READ] =
`
            <action-card 
                title="Get Document" description="Get Sia document using its ID"
                action="getSiaDocument" method="${CustomElement.METHOD_GET}" fields="id">

                <number-widget 
                    field="id" label="Doc ID" placeholder="Document ID">
                </number-widget>
            </action-card>

            <action-card 
                title="Get Documents by Owner" description="Get all Sia documents for any account"
                action="getSiaDocumentsByOwner" method="${CustomElement.METHOD_GET}" fields="account">

                    <account-widget 
                        field="account" label="Account" placeholder="Account address">
                    </account-widget>

            </action-card>
`

            uiHtml[CustomElement.UI_WRITE] =
`
            <action-card 
                title="Add Document" description="Upload document to Sia and add hash to contract"
                action="addSiaDocument" method="${CustomElement.METHOD_POST}" fields="files label mode"
                target="card-body-addSiaDocument"
                message="Waiting for Sia upload and smart contract transaction">
                    <text-widget
                        field="label" label="Label" 
                        placeholder="Description">
                    </text-widget>

                    <upload-widget data-field="files"
                        field="file" label="File${ self.mode !== 'single' ? 's' : '' }" 
                        placeholder="Select file${ self.mode !== 'single' ? 's' : '' }" 
                        multiple="${ self.mode !== 'single' ? 'true' : 'false' }">
                    </upload-widget>
                    <input type="hidden" data-field="mode" value="${self.mode}" style="display:none;"></input>
            </action-card>

`



        let content =
            `
        <page-body title="${self.title}" category="${self.category}" description="${self.description}">
            ${uiHtml[CustomElement.UI_READ]}
            ${uiHtml[CustomElement.UI_WRITE]}
            ${uiHtml[CustomElement.UI_ADMIN]}
        </page-body>
        <page-panel id="resultPanel"></page-panel>

`
        self.innerHTML = content;
        // self.querySelector('upload-widget').addEventListener(UploadWidget.EVENT_FILES_CHANGED, (e) => {
        //     //Could do something here
        //     //let files = e.detail.files;
        // });

        if (!self.eventHandlerRegistered) {
            self.eventHandlerRegistered = true;
            DappLib.onAddSiaDocument((result) => {
                let resultPanel = self.querySelector('#resultPanel');
                resultPanel.append(DappLib.getFormattedResultNode(result));
                resultPanel.open();
            });    
        }

    }

}

customElements.define('sia-page', SiaPage);

