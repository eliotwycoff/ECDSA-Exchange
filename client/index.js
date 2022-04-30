import "./index.scss";

const server = "http://localhost:3042";

const closeTransferPanel = () => {
  clearAmount();
  clearRecipient();
  updateSignatureInstructions();
  clearSignatureR();
  clearSignatureS();
  clearError();
  document.getElementById("send").style.display = "none";
};

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    closeTransferPanel();
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    console.log(balance);
    document.getElementById("balance").innerHTML = balance;

    if (parseFloat(balance) > 0) {
      document.getElementById("send").style.display = "block";
    } else {
      closeTransferPanel();
    }
  });
});

const clearUsername = () => {
  document.getElementById("exchange-address").value = '';
  document.getElementById("send").style.display = "none";
};

const clearAmount = () => {
  document.getElementById("send-amount").value = '';
};

const clearRecipient = () => {
  document.getElementById("recipient").value = '';
};

const updateSignatureInstructions = () => {
  document.getElementById("sample-amount").innerHTML = document.getElementById("send-amount").value;
  document.getElementById("sample-recipient").innerHTML = document.getElementById("recipient").value;
}

const clearSignatureR = () => {
  document.getElementById("signature-r").value = '';
}

const clearSignatureS = () => {
  document.getElementById("signature-s").value = '';
};

const clearError = () => {
  document.getElementById("error").innerHTML = '';
};

const setError = (errorMessage) => {
  document.getElementById("error").innerHTML = errorMessage;
};

clearUsername();
clearAmount();
clearRecipient();
updateSignatureInstructions();
clearSignatureR();
clearSignatureS();

document.getElementById("send-amount").addEventListener('input', updateSignatureInstructions);
document.getElementById("recipient").addEventListener('input', updateSignatureInstructions);

document.getElementById("copy-button").addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById("code").textContent);
});

document.getElementById("refresh-r").addEventListener('click', clearSignatureR);
document.getElementById("refresh-s").addEventListener('click', clearSignatureS);

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const signatureR = document.getElementById("signature-r").value;
  const signatureS = document.getElementById("signature-s").value;

  const body = JSON.stringify({
    sender, amount, recipient, signatureR, signatureS
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance, error }) => {
    document.getElementById("balance").innerHTML = balance;
    if (error == '') {
      clearAmount();
      clearRecipient();
      updateSignatureInstructions();
      clearError();
    } else {
      setError(error);
    }
  });
});
