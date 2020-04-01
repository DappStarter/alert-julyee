'use strict';
import Blockchain from './blockchain';
import BN from 'bn.js'; // Required for injected code
import dappConfig from '../dapp-config.json';
import SvgIcons from './components/widgets/svg-icons';
import ClipboardJS from 'clipboard';



export default class DappLib {

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FILE STORAGE: SIA  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static async addSiaDocument(data) {

        let folder = data.mode === 'folder'; 
        let config = DappLib.getConfig();

        // Push files to SIA
        let siaResult = await DappLib.siaUpload(config, data.files, folder);
        let results = [];
        for(let f=0; f<siaResult.length; f++) {
            let file = siaResult[f];
            let result = await Blockchain.post({
                    config: config,
                    contract: DappLib.DAPP_STATE_CONTRACT,
                    params: {
                        from: null,
                        gas: 2000000
                    }
                },
                'addSiaDocument',
                file.docId,
                DappLib.fromAscii(data.label || '', 32)
            );
            results.push({
                transactionHash: DappLib.getTransactionHash(result.callData),
                docId: file.docId
            });
        }

        return {
            type: DappLib.DAPP_RESULT_SIA_HASH_ARRAY,
            result: results
        }
    }

    static async getSiaDocument(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'getSiaDocument',
            data.id
        );
        if (result.callData) {
            result.callData.docId = result.callData.docId;
            result.callData.docUrl = DappLib.formatSiaHash(result.callData.docId);
            result.callData.label = DappLib.toAscii(result.callData.label);
        }
        return {
            type: DappLib.DAPP_RESULT_OBJECT,
            label: 'Document Information',
            result: result.callData
        }
    }

    static async getSiaDocumentsByOwner(data) {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_STATE_CONTRACT,
                params: {
                    from: null
                }
            },
            'getSiaDocumentsByOwner',
            data.account
        );

        return {
            type: DappLib.DAPP_RESULT_ARRAY,
            label: 'Documents',
            result: result.callData,
            formatter: ['Text-20-5']
        }
    }


    static async onAddSiaDocument(callback) {
        let params = {};
        DappLib.addEventHandler(DappLib.DAPP_STATE_CONTRACT_WS, 'AddSiaDocument', params, callback);
    }

    static async siaUpload(config, files, wrapWithDirectory) {

        // wrapWithDirectory is not supported

        let result = [];
        let apiUrl = `${config.sia.protocol}://${config.sia.host}/skynet/skyfile`;
        for(let f=0; f<files.length; f++) {
            
            let formData = new FormData();
            formData.append('file', files[f]);

            let response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                },
                body: formData
            });

            let data = await response.json();
            result.push({
                docId: data.skylink
            });
        };
        return result;
    }

    static formatSiaHash(a) {
        let config = DappLib.getConfig();
        let url = `${config.sia.protocol}://${config.sia.host}/${a}`;
        return `<strong class="teal lighten-5 p-1 black-text number copy-target" title="${url}"><a href="${url}" target="_new">${a.substr(0,6)}...${a.substr(a.length-4, 4)}</a></strong>${ DappLib.addClippy(a)}`;
    }


/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EXAMPLES  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    // These example functions demonstrate cross-contract calling

    static async getStateContractOwner() {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'getStateContractOwner',
        ); 
        let owner = result.callData;
        return {
            type: DappLib.DAPP_RESULT_ACCOUNT,
            label: 'Contract Owner',
            result: owner,
            unitResult: null,
            hint: null
        }
    }

    static async getStateCounter() {

        let result = await Blockchain.get({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'getStateCounter',
        );         
        return result;
    }

    static async incrementStateCounter(data) {

        let result = await Blockchain.post({
                config: DappLib.getConfig(),
                contract: DappLib.DAPP_CONTRACT,
                params: {
                }
            },
            'incrementStateCounter',
            data.increment
        );
        return {
            type: DappLib.DAPP_RESULT_TX_HASH,
            label: 'Transaction Hash',
            result: DappLib.getTransactionHash(result.callData),
            hint: ''
        }
    }



/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> DAPP LIBRARY  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

    static get DAPP_STATE_CONTRACT() {
        return 'dappStateContract'
    }
    static get DAPP_CONTRACT() {
        return 'dappContract'
    }

    static get DAPP_STATE_CONTRACT_WS() {
        return 'dappStateContractWs'
    }
    static get DAPP_CONTRACT_WS() {
        return 'dappContractWs'
    }

    static get DAPP_RESULT_BIG_NUMBER() {
        return 'big-number'
    }

    static get DAPP_RESULT_ACCOUNT() {
        return 'account'
    }

    static get DAPP_RESULT_TX_HASH() {
        return 'tx-hash'
    }

    static get DAPP_RESULT_IPFS_HASH_ARRAY() {
        return 'ipfs-hash-array'
    }

    static get DAPP_RESULT_SIA_HASH_ARRAY() {
        return 'sia-hash-array'
    }

    static get DAPP_RESULT_ARRAY() {
        return 'array'
    }

    static get DAPP_RESULT_OBJECT() {
        return 'object'
    }

    static get DAPP_RESULT_ERROR() {
        return 'error'
    }

    static async addEventHandler(contract, event, params, callback) {
            Blockchain.handleEvent({
                config: DappLib.getConfig(),
                contract: contract,
                params: params || {}
            }, 
            event, 
            (error, result) => {
                                if (error) {
                                    callback({
                                        event: event,
                                        type: DappLib.DAPP_RESULT_ERROR,
                                        label: 'Error Message',
                                        result: error
                                    });    
                                } else {
                                    callback({
                                        event: event,
                                        type: DappLib.DAPP_RESULT_OBJECT,
                                        label: 'Event ' + event,
                                        result: DappLib.getObjectNamedProperties(result)
                                    });    
                                }
                            }
            );
    }

    static getTransactionHash(t) {
        if (!t) { return ''; }
        let value = '';
        if (typeof t === 'string') {                
            value = t;
        } else if (typeof t === 'object') {    
            if (t.hasOwnProperty('transactionHash')) {
                    value = t.transactionHash;       // Ethereum                
            } else if (t.hasOwnProperty('transaction')) {
                if (t.transaction.id) {
                    value = t.transaction.id;       // Harmony
                }
            } else {
                value = JSON.stringify(t);
            }
        }
        return value;
    }

    static formatHint(hint) {
        if (hint) {
            return `<p class="mt-3 grey-text"><strong>Hint:</strong> ${hint}</p>`;
        } else {
            return '';
        }
    }

    static formatNumber(n) {
        var parts = n.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `<strong class="p-1 blue-grey-text number copy-target" style="font-size:1.1rem;" title="${n}">${parts.join(".")}</strong>`;
    }

    static formatAccount(a) {
        return `<strong class="green accent-1 p-1 blue-grey-text number copy-target" title="${a}">${DappLib.toCondensed(a, 6, 4)}</strong>${ DappLib.addClippy(a)}`;
    }

    static formatTxHash(a) {
        let value = DappLib.getTransactionHash(a);
        return `<strong class="teal lighten-5 p-1 blue-grey-text number copy-target" title="${value}">${DappLib.toCondensed(value, 6, 4)}</strong>${ DappLib.addClippy(value)}`;
    }

    static formatBoolean(a) {
        return (a ? 'YES' : 'NO');
    }

    static formatText(a, copyText) {
        if (!a) { return; }
        if (a.startsWith('<')) {
            return a;
        }
        return `<span title="${copyText ? copyText : a}">${a}</span>${DappLib.addClippy(copyText ? copyText : a)}`;
    }

    static formatStrong(a) {
        return `<strong>${a}</strong>`;
    }

    static formatPlain(a) {
        return a;
    }

    static formatObject(a) {
        let data = [];
        let labels = [ 'Item', 'Value' ];
        let keys = [ 'item', 'value' ];
        let formatters = [ 'Strong', 'Text-20-5' ];
        let reg = new RegExp('^\\d+$'); // only digits
        for(let key in a) {
            if (!reg.test(key)) {
                data.push({
                    item: key.substr(0,1).toUpperCase() + key.substr(1),
                    value: a[key]
                });
            }
        }
        return DappLib.formatArray(data, formatters, labels, keys);
    }

    static formatArray(h, dataFormatters, dataLabels, dataKeys) {

        let output = '<table class="table table-striped">';

        if (dataLabels) {
            output += '<thead><tr>';
            for(let d=0; d<dataLabels.length; d++) {
                output += `<th scope="col">${dataLabels[d]}</th>`;
            }    
            output += '</tr></thead>';
        }
        output += '<tbody>';
        h.map((item) => {
            output += '<tr>';
            for(let d=0; d<dataFormatters.length; d++) {
                let text = String(dataKeys && dataKeys[d] ? item[dataKeys[d]] : item);
                let copyText =  dataKeys && dataKeys[d] ? item[dataKeys[d]] : item;
                if (text.startsWith('<')) {
                    output += (d == 0 ? '<th scope="row">' : '<td>') + text + (d == 0 ? '</th>' : '</td>');
                } else {
                    let formatter = 'format' + dataFormatters[d];
                    if (formatter.startsWith('formatText')) {
                        let formatterFrags = formatter.split('-');
                        if (formatterFrags.length === 3) {
                            text = DappLib.toCondensed(text, Number(formatterFrags[1]), Number(formatterFrags[2]));
                        } else if (formatterFrags.length === 2) {
                            text = DappLib.toCondensed(text, Number(formatterFrags[1]));
                        }
                        formatter = formatterFrags[0];    
                    }
                    output += (d == 0 ? '<th scope="row">' : '<td>') + DappLib[formatter](text, copyText) + (d == 0 ? '</th>' : '</td>');                        
                }
            }    
            output += '</tr>';
        })
        output += '</tbody></table>';
        return output;
    }

    static getFormattedResultNode(retVal, key) {

        let returnKey = 'result';
        if (key && (key !== null) && (key !== 'null') && (typeof(key) === 'string')) {
            returnKey = key;
        }
        let formatted = '';
        switch (retVal.type) {
            case DappLib.DAPP_RESULT_BIG_NUMBER:
                formatted = DappLib.formatNumber(retVal[returnKey].toString(10));
                break;
            case DappLib.DAPP_RESULT_TX_HASH:
                formatted = DappLib.formatTxHash(retVal[returnKey]);
                break;
            case DappLib.DAPP_RESULT_ACCOUNT:
                formatted = DappLib.formatAccount(retVal[returnKey]);
                break;
            case DappLib.DAPP_RESULT_BOOLEAN:
                formatted = DappLib.formatBoolean(retVal[returnKey]);
                break;
            case DappLib.DAPP_RESULT_IPFS_HASH_ARRAY:
                formatted = DappLib.formatArray(
                    retVal[returnKey],
                    ['TxHash', 'IpfsHash', 'Text-10-5'],
                    ['Transaction', 'IPFS URL', 'Doc Id'],
                    ['transactionHash', 'ipfsHash', 'docId']
                );
                break;
            case DappLib.DAPP_RESULT_SIA_HASH_ARRAY:
                formatted = DappLib.formatArray(
                    retVal[returnKey],
                    ['TxHash', 'SiaHash', 'Text-10-5'],
                    ['Transaction', 'Sia URL', 'Doc Id'],
                    ['transactionHash', 'docId', 'docId']
                );
                break;
            case DappLib.DAPP_RESULT_ARRAY:
                formatted = DappLib.formatArray(
                    retVal[returnKey],
                    retVal.formatter ? retVal.formatter : ['Text'],
                    null,
                    null
                );
                break;
            case DappLib.DAPP_RESULT_OBJECT:
                formatted = DappLib.formatObject(retVal[returnKey]);
                break;
            default:
                formatted = retVal[returnKey];
                break;
        }

        let resultNode = document.createElement('div');
        resultNode.className = `note note-${retVal.type === DappLib.DAPP_RESULT_ERROR ? 'danger' : 'success'} m-3`; 
        let closeMarkup = '<div onclick="this.parentNode.parentNode.removeChild(this.parentNode)" title="Dismiss" class="text-right mb-1 mr-2" style="cursor:pointer;">X</div>';    
        resultNode.innerHTML = closeMarkup + `${retVal.type === DappLib.DAPP_RESULT_ERROR ? '😖' : '👍🏼'} ` + (Array.isArray(retVal[returnKey]) ? 'Result' : retVal.label) + ': ' + formatted + DappLib.formatHint(retVal.hint);

        // Wire-up clipboard copy
        new ClipboardJS('.copy-target', {
            text: function (trigger) {
                return trigger.getAttribute('data-copy');
            }
        });

        return resultNode;
    }

    static getObjectNamedProperties(a) {
        let reg = new RegExp('^\\d+$'); // only digits
        let newObj = {};
        for(let key in a) {
            if (!reg.test(key)) {
                newObj[key] = a[key];
            }
        }
        return newObj;
    }
    
    static addClippy(data) {
        let icon = SvgIcons.clippy;
        return icon.replace('<svg ', `<svg data-copy="${data}" `)
    }

    static fromAscii(str, padding) {

        if (str.startsWith('0x') || !padding) {
            return str;
        }

        if (str.length > padding) {
            str = str.substr(0, padding);
        }

        var hex = '0x';
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            var n = code.toString(16);
            hex += n.length < 2 ? '0' + n : n;
        }
        return hex + '0'.repeat(padding*2 - hex.length + 2);
    };
    
    static toAscii(hex) {
        var str = '',
            i = 0,
            l = hex.length;
        if (hex.substring(0, 2) === '0x') {
            i = 2;
        }
        for (; i < l; i+=2) {
            var code = parseInt(hex.substr(i, 2), 16);
            if (code === 0) continue; // this is added
            str += String.fromCharCode(code);
        }
        return str;
    };

    static toCondensed(s, begin, end) {
        if (!s) { return; }
        if (s.length && s.length <= begin + end) {
            return s;
        } else {
            if (end) {
                return `${s.substr(0, begin)}...${s.substr(s.length-end, end)}`;
            } else {
                return `${s.substr(0, begin)}...`;
            }
        }
    }

    static getConfig() {
        return dappConfig;
    }

    // Return value of this function is used to dynamically re-define getConfig()
    // for use during testing. With this approach, even though getConfig() is static
    // it returns the correct contract addresses as its definition is re-written
    // before each test run. Look for the following line in test scripts to see it done:
    //  DappLib.getConfig = Function(`return ${ JSON.stringify(DappLib.getTestConfig(testDappStateContract, testDappContract, testAccounts))}`);
    static getTestConfig(testDappStateContract, testDappContract, testAccounts) {

        return Object.assign(
            {}, 
            dappConfig,
            {
                dappStateContractAddress: testDappStateContract.address,
                dappContractAddress: testDappContract.address,
                accounts: testAccounts,
                owner: testAccounts[0],
                admins: [
                    testAccounts[1],
                    testAccounts[2],
                    testAccounts[3]
                ],
                users: [
                    testAccounts[4],
                    testAccounts[5],
                    testAccounts[6],
                    testAccounts[7],
                    testAccounts[8]
                ],
                testAddresses: [
                    // These test addresses are useful when you need to add random accounts in test scripts
                    "0xb1ac66b49fdc369879123332f2cdd98caad5f75a",
                    "0x0d27a7c9850f71d7ef71ffbe0155122e83d9455d",
                    "0x88477a8dc34d60c40b160e9e3b1721341b63c453",
                    "0x2880e2c501a70f7db1691a0e2722cf6a8a9c9009",
                    "0x0226df61d33e41b90be3b5fd830bae303fcb66f5",
                    "0x60a4dff3d25f4e5a5480fb91d550b0efc0e9dbb3",
                    "0xa2f52a2060841cc4eb4892c0234d2c6b6dcf1ea9",
                    "0x71b9b9bd7b6f72d7c0841f38fa7cdb840282267d",
                    "0x7f54a3318b2a728738cce36fc7bb1b927281c24e",
                    "0x81b7E08F65Bdf5648606c89998A9CC8164397647"
                ]
                ,siaTestFiles: [
                    "bAAxym_7nhgJ2ik4bigtaAijSE6MPlcxxaPi3Am6860izw",
                    "TABXJcGMxah8uHvHc0EbjPPZs6PprUZoQYdTw8y7cRpywg",
                    "TADiaX-_OmVbuXGr7P1qO4eZtbaIH9U10yRAFBDz8ByEQQ",
                    "nABE5aTWpvRIHRMjWQ-FfPm8oRYwk1K9Fe34SYdXL62qGQ",
                    "VAAEYFNbyjwMBb2u7CAHUhhB0s9mzHtVj-r5GeS0Wyb_Ng",
                    "nAA6F_yfhc8l1cyPziOM0_v8ID810lejD41uJGIs2-wK7g",
                    "XADuEUu7x2LZhMQAMcujCw4b8h9EbzaykKZjtWX9uQnRmQ",
                    "ZAAWYFA9MJn4F7kcczddEfe7i4h_o4-J6SPKJAPkjzXbRA",
                    "ZABYXqcExzRdbkhF4dLP8RZk4HdGcxfCSnteUGs_6H6uYQ",
                    "rABpV_5o0NVE1bweOL0M-ne2TZe60lXIRLQyhn-Hc9FX5g"
                ]

            }
        );
    }

}