require('@babel/register');
({
    ignore: /node_modules/
});
require('@babel/polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider');

let mnemonic = 'gesture glimpse frame tribe stove deny rapid coach gown light army ghost'; 
let testAccounts = [
"0xee84af0fe6409dc36f2fbec97a8931bc837b7b6c011eff2b782366cd7192ac03",
"0x8c9618afbe093096ea2ab2c77134a870c5b46c0271c94b862a5d26e3d65c03d9",
"0x860bd7d94d8417e2320e15d54fea3a1839f6e944b02956841a0877c7b8e45ff5",
"0x7b3d946c93576aa1f56f770d02b0169a7a01668a82b887af6b3dc12f8792175b",
"0x461339fa768c521f3ecd8a0fccef48f7457f4b31b43580ebb1a5a9ae8c914dc0",
"0x0ec35aa981eed874ab1dcfbd23ed647434f74a3a007e33d63b436c8032ef281c",
"0xfc382b4b3f6d52a4485eb0e18df57e2b809a973d6157adbe660ec6bfb6039dcf",
"0xde87c22187633a9342b02ac7b2602c1128c8c7a65a752bcddf070875d9020840",
"0x2b87a954610036983f04a81f7780258eb365c6161e1554bd662c4d6dade0dfb9",
"0x6b4df042c4cfc41843075f98f09e6e757b6237a83b0be85438908a12fa1f3267"
]; 
let devUri = 'http://127.0.0.1:7545/';

module.exports = {
    networks: {
        development: {
            uri: devUri,
            provider: () => new HDWalletProvider(
                mnemonic,
                devUri, // provider url
                0, // address index
                10, // number of addresses
                true, // share nonce
                `m/44'/60'/0'/0/` // wallet HD path
            ),
            network_id: '*'
        }
    },
    compilers: {
        solc: {
            version: '^0.5.11'
        }
    }
};
