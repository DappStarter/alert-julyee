pragma solidity  >=0.5.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IDappState.sol";
import "./DappLib.sol";


/********************************************************************************************/
/* This contract is auto-generated based on your choices in DappStarter. You can make       */
/* changes, but be aware that generating a new DappStarter project will require you to      */
/* merge changes. One approach you can take is to make changes in Dapp.sol and have it      */
/* call into this one. You can maintain all your data in this contract and your app logic   */
/* in Dapp.sol. This lets you update and deploy Dapp.sol with revised code and still        */
/* continue using this one.                                                                 */
/********************************************************************************************/

contract DappState is IDappState {
    // Allow DappLib(SafeMath) functions to be called for all uint256 types
    // (similar to "prototype" in Javascript)
    using DappLib for uint256; 

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FILE STORAGE: SIA  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/


/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ S T A T E @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

    // Account used to deploy contract
    address private contractOwner;                  

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FILE STORAGE: SIA  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
    struct SiaDocument {
        string docId;    

        bytes32 label;

        // Registration timestamp                                          
        uint256 timestamp;  

        // Owner of document                                        
        address owner;    
    }

    // All added documents
    mapping(string => SiaDocument) siaDocs;                            

    uint constant SIA_DOCS_PAGE_SIZE = 50;
    uint256 public siaLastPage = 0;

    // All documents organized by page
    mapping(uint256 => string[]) public siaDocsByPage;         

    // All documents for which an account is the owner
    mapping(address => string[]) public siaDocsByOwner;              


/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ C O N S T R U C T O R @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

    constructor() public 
    {
        contractOwner = msg.sender;       

    }

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ E V E N T S @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/


/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FILE STORAGE: SIA  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
    // Event fired when doc is added
    event AddSiaDocument      
                    (
                        string indexed docId,
                        address indexed owner,
                        uint256 timestamp
                    );


/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ M O D I F I E R S @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

///+modifiers

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ F U N C T I O N S @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/


/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FILE STORAGE: SIA  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
    /**
    * @dev Adds a new SIA doc
    *
    * @param docId Unique identifier (siahash digest of doc)
    * @param label Short, descriptive label for document
    */
    function addSiaDocument
                        (
                            string calldata docId,
                            bytes32 label
                        ) 
                        external 
    {
        // Prevent empty string for docId
        bytes memory testDocId = bytes(docId);
        require(testDocId.length > 0, "Invalid docId");  

        // Prevent duplicate docIds   
        require(siaDocs[docId].timestamp == 0, "Document already exists");     

        siaDocs[docId] = SiaDocument({
                                    docId: docId,
                                    label: label,
                                    timestamp: now,
                                    owner: msg.sender
                               });

        siaDocsByOwner[msg.sender].push(docId);
        if (siaDocsByPage[siaLastPage].length == SIA_DOCS_PAGE_SIZE) {
            siaLastPage++;
        }
        siaDocsByPage[siaLastPage].push(docId);

        emit AddSiaDocument(docId, msg.sender, siaDocs[docId].timestamp);
    }

    /**
    * @dev Gets individual SIA doc by docId
    *
    * @param id DocumentId of doc
    */
    function getSiaDocument
                    (
                        string calldata id
                    )
                    external
                    view
                    returns(
                                string memory docId, 
                                bytes32 label,
                                uint256 timestamp, 
                                address owner
                    )
    {
        SiaDocument memory siaDoc = siaDocs[id];
        docId = siaDoc.docId;
        label = siaDoc.label;
        timestamp = siaDoc.timestamp;
        owner = siaDoc.owner;
    }

    /**
    * @dev Gets docs where account is/was an owner
    *
    * @param account Address of owner
    */
    function getSiaDocumentsByOwner
                            (
                                address account
                            )
                            external
                            view
                            returns(string[] memory)
    {
        require(account != address(0), "Invalid account");

        return siaDocsByOwner[account];
    }


//  Example functions that demonstrate how to call into this contract that holds state from
//  another contract. Look in ~/interfaces/IDappState.sol for the interface definitions and
//  in Dapp.sol for the actual calls into this contract.

    /**
    * @dev This is an EXAMPLE function that illustrates how functions in this contract can be
    *      called securely from another contract to READ state data. Using the Contract Access 
    *      block will enable you to make your contract more secure by restricting which external
    *      contracts can call functions in this contract.
    */
    function getContractOwner()
                                external
                                view
                                returns(address)
    {
        return contractOwner;
    }

    uint256 counter;    // This is an example variable used only to demonstrate calling
                        // a function that writes state from an external contract. It and
                        // "incrementCounter" and "getCounter" functions can (should?) be deleted.
    /**
    * @dev This is an EXAMPLE function that illustrates how functions in this contract can be
    *      called securely from another contract to WRITE state data. Using the Contract Access 
    *      block will enable you to make your contract more secure by restricting which external
    *       contracts can call functions in this contract.
    */
    function incrementCounter
                            (
                                uint256 increment
                            )
                            external
                            // Enable the modifier below if using the Contract Access feature
                            // requireContractAuthorized
    {
        // NOTE: If another contract is calling this function, then msg.sender will be the address
        //       of the calling contract and NOT the address of the user who initiated the
        //       transaction. It is possible to get the address of the user, but this is 
        //       spoofable and therefore not recommended.
        
        require(increment > 0 && increment < 10, "Invalid increment value");
        counter = counter.add(increment);   // Demonstration of using SafeMath to add to a number
                                            // While verbose, using SafeMath everywhere that you
                                            // add/sub/div/mul will ensure your contract does not
                                            // have weird overflow bugs.
    }

    /**
    * @dev This is an another EXAMPLE function that illustrates how functions in this contract can be
    *      called securely from another contract to READ state data. Using the Contract Access 
    *      block will enable you to make your contract more secure by restricting which external
    *      contracts can call functions in this contract.
    */
    function getCounter()
                                external
                                view
                                returns(uint256)
    {
        return counter;
    }

}   


