import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {

    // introducing the Private Key we get the address and the balance of the wallet
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    //getting the addres from the getPublicKey method from the privateKey
    address = /* `0x${ */toHex(keccak256(secp.getPublicKey(privateKey).slice(1,)).slice(-20))/* }` */;
    
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Input Private Key
        <input placeholder="Type your Private Key to consult your address and balance" value={privateKey} onChange={onChange}></input>
      </label>

      <div className="balance">Address: {address}</div>
      
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
