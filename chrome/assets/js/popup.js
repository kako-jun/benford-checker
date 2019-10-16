const i18n = key => {
  const message = chrome.i18n.getMessage(key);
  return message ? message : key;
};

document.getElementById("appName").onclick = () => {
  window.open("https://github.com/kako-jun/benford-checker");
};

const filterOccurrences = countArray => {
  const occurrences = _.map(countArray, (c, i) => {
    return {
      i,
      count: c
    };
  });

  return _.filter(occurrences, o => {
    return o.i >= 1;
  });
};

const showCount = occurrences => {
  let sum = _.sumBy(occurrences, "count");
  if (sum === 0) {
    sum = 1;
  }

  let data = _.map(occurrences, o => {
    let ratio = (o.count * 100) / sum;
    ratio = _.round(ratio, 2);

    const integer = _.split(String(ratio), ".")[0];
    let decimal = _.split(String(ratio), ".")[1] || "";
    if (decimal.length < 2) {
      decimal = _.padEnd(decimal, 2, "0");
    }

    return {
      i: o.i,
      count: o.count,
      ratio: integer + "." + decimal
    };
  });

  const padding = (src, length) => {
    const temp = (Array(length).join(" ") + src).slice(-length);
    return temp.replace(" ", "&nbsp");
  };

  const maxCountObject = _.maxBy(data, d => {
    return String(d.count).length;
  });
  const maxCountLength = String(maxCountObject.count).length;

  const maxRatioObject = _.maxBy(data, d => {
    return d.ratio.length;
  });
  const maxRatioLength = String(maxRatioObject.ratio).length;

  data = _.map(data, d => {
    // console.log(padding(d.count, maxCountLength));
    // console.log(padding(d.ratio, maxRatioLength));
    return {
      i: d.i,
      count: padding(d.count, maxCountLength),
      ratio: padding(d.ratio, maxRatioLength)
    };
  });

  const resultElement = document.getElementById("count");
  resultElement.innerHTML = [
    "<ul>",
    _.map(data, d => {
      return "<li><i>" + d.i + "</i>: " + d.count + " (" + d.ratio + " %)</li>";
    }).join(""),
    "</ul>"
  ].join("");
};

const drawChart = occurrences => {
  const chartElement = document.getElementById("chart");
  const ctx = chartElement.getContext("2d");
  ctx.canvas.height = 140;

  const labels = _.map(occurrences, "i");
  const data = _.map(occurrences, "count");

  let min = data[0];
  const colors = _.map(data, d => {
    if (d <= min) {
      min = d;
      return {
        background: "rgba(0, 0, 255, 0.2)",
        border: "rgba(0, 0, 255, 1)"
      };
    }

    return {
      background: "rgba(255, 0, 0, 0.2)",
      border: "rgba(255, 0, 0, 1)"
    };
  });

  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "number of occurrences",
          data: data,
          backgroundColor: _.map(colors, "background"),
          borderColor: _.map(colors, "border"),
          borderWidth: 1
        }
      ]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      },
      maintainAspectRatio: false
    }
  });
};

const check = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length > 0) {
      const targetTab = tabs[0];
      console.log(targetTab);
      if (targetTab.url.match(/https?:\/\//) || targetTab.url.match(/file:\/\//)) {
        chrome.tabs.sendMessage(
          targetTab.id,
          {
            command: "getSiteInformation"
          },
          res => {
            // console.log(res);
            if (res) {
              document.getElementById("site-name").innerText = res.name;
              document.getElementById("site-url").innerHTML = "&nbsp&nbsp";
              document.getElementById("site-url").innerText += res.url;
            }
          }
        );

        chrome.tabs.sendMessage(
          targetTab.id,
          {
            command: "countNumbers"
          },
          res => {
            // console.log(res);
            if (res) {
              const occurrences = filterOccurrences(res);
              showCount(occurrences);
              drawChart(occurrences);
            }
          }
        );
      }
    }
  });
};

document.getElementById("reCheck").onclick = () => {
  check();
};

const downloadImage = data => {
  document.getElementById("download-link").href = data;
  document.getElementById("download-link").download = "benford-checker.png";
  document.getElementById("download-link").click();
};

const screenshot = () => {
  html2canvas(document.getElementById("capture-target")).then(canvas => {
    downloadImage(canvas.toDataURL());
  });
};

document.getElementById("download").onclick = () => {
  screenshot();
};

const share = () => {
  let text = "";
  text += i18n("checked");
  text += encodeURIComponent("\n");
  text += encodeURIComponent(document.getElementById("site-name").innerText);
  text += encodeURIComponent("\n");
  text += document.getElementById("site-url").innerText;
  text += encodeURIComponent("\n\n");
  text += i18n("result");
  text += encodeURIComponent("\n");
  text += encodeURIComponent(document.getElementById("count").innerText);

  const url = "https://twitter.com/share?text=" + text;
  window.open(url);
};

document.getElementById("share").onclick = () => {
  share();
};

window.onload = () => {
  document.getElementById("appName").innerHTML = i18n("appName") + document.getElementById("appName").innerHTML;
  document.getElementById("appDescription").innerText = i18n("appDescription");
  document.getElementById("result").innerText = i18n("result");
  document.getElementById("reCheck").innerText = i18n("reCheck");
  document.getElementById("download").innerText = i18n("download");
  document.getElementById("share").innerText = i18n("share");

  // chrome.browserAction.setBadgeText({
  //   text: ""
  // });

  check();
};
