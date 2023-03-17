const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  /*  privateKey:  d175e5b212cc91f762547c8f64cb0d4b0908032a0d2900105fbb50367ed049ce
      publicKey:  042ea8e8de15e3910f670efcd7fa1345733caa32154409e30efc26535e6ba1f7fee97e12d0d5b74155f1feb94f175645c9a553cc4f6d06562d6439d816a2839ba5
      address:  f612737f809a1cfcbc4bb3e1bf69c2d4ce438008 */
  "f612737f809a1cfcbc4bb3e1bf69c2d4ce438008": 100,
  /*  privateKey:  9572a642d7f98bfc1518dc0ed06861682ab3633d9139e50362ae99be30cac4ad
      publicKey:  04794bd7bb37bb27a5472430f3cdcccb482d414c55bd26b38d1abe8118a75dcf97a7533ee73741a07fea7addbde88fb6cfe275ecb592da2166c66cde8162ef1678
      address:  296d1b49418d6dae7b0adb2556419ba2c0560bbc */
  "296d1b49418d6dae7b0adb2556419ba2c0560bbc": 50,
  /*  privateKey:  4550344be88039de09acf336a6f97b43956552206173614f3887172f3f7df046
      publicKey:  0410862abfb91616e1ee79da2774b39a36c22b9f47a7c178f4e4664d1c5079e9c6eca1de28a3faeef130284512e67813ec4d1d7ef93875264b7c440af2b2eb3045
      address:  fbaa21f1c033294bc413978970ccdb6c5793f854 */
  "fbaa21f1c033294bc413978970ccdb6c5793f854": 75,
};

// from Wallet await server.get
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  // TODO: get a signature from the client-side application
  // recover the public address from the signature

  const { signature, bit, recipient, amount, hashMsg, uuid, sender} = req.body;

  // rebuild the signature
  const msg = {
    uuid,
    sender,
    amount,
    recipient,
  };

  const msgReHash = Buffer.from(JSON.stringify(msg));
  const recoveredPublicKey = secp.recoverPublicKey(msgReHash, signature, bit);

  /* Validamos la firma ECDSA, Used in BTC, ETH.*/
  const isValid = secp.verify(signature, msgReHash, recoveredPublicKey);
  if (!isValid) {
    return res.status(400).send({ message: "Invalid signature" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
