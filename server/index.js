const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

console.log(`\n`);

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// Create some accounts with balances.
const accounts = {
  'Alice': {
    balance: 100
  },
  'Bob': {
    balance: 50
  },
  'Satoshi': {
    balance: 75
  }
};

// Generate elliptic-curve public and private key pairs for each account.
const ec = new EC('secp256k1');

for (let user in accounts) {
  console.log(`Generating an account for ${user}...`);
  console.log(`Balance: ${accounts[user].balance} ETH`);
  const keyPair = ec.genKeyPair();
  
  accounts[user].publicKey = `0x${keyPair.getPublic().encode('hex').slice(2)}`;
  accounts[user].publicX = keyPair.getPublic().x.toString(16);
  accounts[user].publicY = keyPair.getPublic().y.toString(16);
  console.log(`Public Key: ${accounts[user].publicKey}`);
  
  // Show the private key, but don't save it anywhere.
  console.log(`Private Key: ${keyPair.getPrivate().toString(16)}`);
  console.log(`***Please save your private key. It has been deleted from the server and will not be shown again!***\n`);
}

app.get('/balance/:user', (req, res) => {
  const {user} = req.params;
  const balance = accounts.hasOwnProperty(user) ? accounts[user].balance : 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, signatureR, signatureS} = req.body;
  let error = '';

  // Only process transactions if public key information is available for the sender.
  if (accounts[sender].publicX != null && accounts[sender].publicY != null) {
    // Check if the signature matches the public key.
    const message = `{ "amount": ${amount}, "recipient": "${recipient}" }`;
    const messageHash = SHA256(message).toString();

    const publicKey = {
      x: accounts[sender].publicX,
      y: accounts[sender].publicY
    };

    const key = ec.keyFromPublic(publicKey, 'hex');

    const signature = {
      r: signatureR,
      s: signatureS
    };

    if (key.verify(messageHash, signature)) {
      accounts[sender].balance -= parseFloat(amount);

      if (accounts.hasOwnProperty(recipient)) {
        accounts[recipient].balance += parseFloat(amount);
      } else {
        accounts[recipient] = { 
          balance: parseFloat(amount),
          publicKey: null,
          publicX: null,
          publicY: null
        };
      }
    } else {
      error = "Verification Failed!";
    }
  } else {
    error = "No public key is available for this user.";
  }

  res.send({ 
    balance: accounts[sender].balance,
    error: error
   });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
