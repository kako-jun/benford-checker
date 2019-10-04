chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg);

  if (msg.command === "countNumbers") {
    const occurrences = countNumbers();
    console.log(occurrences);
    sendResponse(occurrences);
  }
});

const countNumbers = () => {
  console.log(document.body.innerText);
  const srcText = document.body.innerText;

  const numberArray = [...Array(10).keys()];
  const occurrences = _.map(numberArray, n => {
    return (srcText.match(new RegExp(n, "g")) || []).length;
  });

  return occurrences;
};

window.onload = () => {};
