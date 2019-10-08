chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // console.log(msg);

  switch (msg.command) {
    case "getSiteInformation":
      sendResponse({
        name: document.title,
        url: document.URL
      });
      break;
    case "countNumbers":
      const occurrences = countNumbers();
      // console.log(occurrences);
      sendResponse(occurrences);
      break;
  }
});

const countNumbers = () => {
  // console.log(document.body.innerText);
  const srcText = document.body.innerText;

  const numberArray = [...Array(10).keys()];
  const occurrences = _.map(numberArray, n => {
    return (srcText.match(new RegExp(n, "g")) || []).length;
  });

  return occurrences;
};

window.onload = () => {};
