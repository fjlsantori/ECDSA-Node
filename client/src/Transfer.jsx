import { useState } from "react";
import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { getRandomBytesSync } from 'ethereum-cryptography/random';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);


  //del otro github jtordgeman
  const encoder = new TextEncoder();

  async function transfer(evt) {
    evt.preventDefault();

    try {
      // creamos el mensaje con la cantidad a transferir y la cuenta a la que transferimos
      const msg = JSON.stringify({
        address,
        amount: parseInt(sendAmount),
        recipient,
        nonce: toHex(getRandomBytesSync(4)),
      });

      /* hasheamos el mensaje haciendo que "msg" sea un string 
      mediante el JSON.stringfy  */

      /* const hashMsg = encoder.encode(Jmsg);
      const [signature, bit] = await secp.sign(hashMsg, privateKey, { recovered: true }); */
      // we'll need the "bit" for the recoverPublicKey method

      const [signature, bit] = await secp.sign(keccak256(utf8ToBytes(msg)),privateKey,{recovered: true});
      
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: toHex(signature),
        bit, 
        recipient,
        amount: parseInt(sendAmount),
        /* hashMsg, */
        msg,
        sender: address,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        <div className="balance">Private Key: {privateKey}</div>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
