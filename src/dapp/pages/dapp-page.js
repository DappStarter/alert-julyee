import DappLib from '../../lib/dapp-lib';
import CustomElement from '../../lib/components/shared/custom-element';
import DOM from '../../lib/components/shared/dom';
import '../../lib/components/shared/action-card.js';
import '../../lib/components/widgets/number-widget.js';
import ActionButton from '../../lib/components/shared/action-button';
import canvas from '../assets/img/canvas.jpg';

export default class DappPage extends CustomElement {

    constructor(...args) {
        const self = super(...args);
    }

    async render() {
        let self = this;
        let content = `

        <div class="container">
            <div class="row">
                <div class="col-md-8">
                    <h1>My Dapp</h1>
                </div>
                <div class="col-md-4 d-flex justify-content-end">
                    <button id="admin-button" class="btn btn-primary btn-lg nav-link" data-link="admin"><i class="fas fa-user-cog left"></i> Admin</button>
                </div>
            </div>
            <div class="row fadeIn mt-3">
                <div class="col-md-12">
                    <div class="jumbotron">
                        <h2 class="h2-responsive">🎉 Dappiness!</h2>

                        <h5 class="mt-3">Your Dapp is ready, and the world is waiting for you to create something amazing. Visit <a href="https://www.trycrypto.com" target="_new" rel="nofollow">TryCrypto.com</a> for more insights on dapp development.</h5>                                            
                        
                    </div>
                </div>
            </div>
            <div class="row mt-5">
                <div class="col-md-12">
                    The examples below demonstrate how to use the Dapp Library, ActionCard and ActionButton components to interact with the Dapp smart contract.
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-7">
                    <action-card 
                        id="card-contractOwner"
                        title="State Contract Owner" description="Makes a cross-contract call to get account of state contract owner"
                        action="getStateContractOwner" method="${CustomElement.METHOD_GET}" fields="">
                    </action-card>
                </div>
                <div class="col-md-5 p-3">
                    <h4>Counter value from contract: <span id="counter" class="text-primary"></span></h4>
                    <div class="mt-4" id="my-form">
                        <number-widget field="increment" label="Increment Counter:" placeholder="Enter 1 to 9">
                        </number-widget>
                        <div id="result"></div>
                        <action-button id="increment-counter" source="#my-form" action="incrementStateCounter" method="${CustomElement.METHOD_POST}" fields="increment" text="Increment Counter" class="mt-4"></action-button>
                    </div>
                </div>
            </div>
        </div>
      
`
        self.innerHTML = content;

        // Handle admin button click
        DOM.elid('admin-button').addEventListener('click', (e) => {
            DOM.el('page-navigation').handleClick(e);
        });

        // Handle increment counter click
        DOM.elid('increment-counter').addEventListener(ActionButton.EVENT_CLICK, async (e) => {

            let info = e.detail.info;
            if (info.type === DappLib.DAPP_RESULT_ERROR) {
                DOM.elid('result').innerHTML = '<span class="text-danger">' + info.result + '</span>';
            } else {
                await self.fetchAndDisplayCounter();
            }
        });


        await self.fetchAndDisplayCounter();
    }

    async fetchAndDisplayCounter() {
        let result = await DappLib['getStateCounter'].call();
        DOM.elid('counter').innerHTML = result.callData;
    }

}


customElements.define('dapp-page', DappPage);