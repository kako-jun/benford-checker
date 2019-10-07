const filterOccurrences = occurrences => {
  const filterd = _.filter(occurrences, (o, i) => {
    return i >= 1;
  }).compact();

  return filterd;
};

const showCount = occurrences => {
  const sum = _.sum(occurrences);
  let data = _.map(occurrences, (o, i) => {
    return {
      i,
      count: o,
      ratio: o / sum
    };
  });

  const padding = (src, length) => {
    const temp = (Array(length).join(" ") + src).slice(-length);
    return temp.replace(" ", "&nbsp");
  };

  const maxCountObject = _.max(data, d => {
    return String(d.count).length;
  });
  const maxCountLength = String(maxCountObject.count).length;

  const maxRatioObject = _.max(data, d => {
    return String(d.ratio).length;
  });
  const maxRatioLength = String(maxRatioObject.ratio).length;

  data = _.map(data, d => {
    console.log(padding(d.count, maxCountLength));
    console.log(padding(d.ratio, maxRatioLength));
    return {
      i: d.i,
      count: padding(d.count, maxCountLength),
      ratio: padding(d.ratio, maxRatioLength)
    };
  });

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = [
    '<div class="benford-popup">',
    "  <h2>result</h2>",
    "  <ul>",
    _.map(data, d => {
      return "<li>" + d.i + ": " + d.count + " (" + d.ratio + ")</li>";
    }).join(""),
    "  </ul>",
    "</div>"
  ].join("");
};

const drawChart = occurrences => {
  const chartElement = document.getElementById("chart");
  const ctx = chartElement.getContext("2d");

  let labels = _.map(occurrences, (o, i) => {
    return i;
  });

  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "number of occurrences",
          data: data,
          backgroundColor: "rgba(0, 0, 255, 0.2)",
          borderColor: "rgba(0, 0, 255, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
};

document.getElementById("count-numbers").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    console.log(tabs);
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        command: "countNumbers"
      },
      res => {
        console.log(res);
        res = filterOccurrences(res);
        showCount(res);
        drawChart(res);
      }
    );
  });
};

window.onload = () => {
  const i18n = key => {
    const message = chrome.i18n.getMessage(key);
    return message ? message : key;
  };

  document.getElementById("appName").innerText = i18n("appName");
  document.getElementById("appDescription").innerText = i18n("appDescription");
  document.getElementById("reCheck").innerText = i18n("reCheck");

  chrome.browserAction.setBadgeText({
    text: ""
  });

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    console.log(tabs);
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        command: "countNumbers"
      },
      res => {
        console.log(res);
        showCount(res);
        drawChart(res);
      }
    );
  });
};
