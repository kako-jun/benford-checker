const drawChart = occurrences => {
  const chartElement = document.getElementById("chart");
  const ctx = chartElement.getContext("2d");

  let labels = _.map(occurrences, (o, i) => {
    return i;
  });
  labels = _.drop(labels, 1);

  const data = _.drop(occurrences, 1);

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

const showCount = occurrences => {
  let data = _.map(occurrences, (o, i) => {
    return {
      i,
      o
    };
  });
  data = _.drop(data, 1);
  const found = _.max(data, d => {
    return String(d.o).length;
  });
  const maxLength = String(found.o).length;
  const padding = (src, length) => {
    const temp = (Array(length).join(" ") + src).slice(-length);
    return temp.replace(" ", "&nbsp");
  };
  data = _.map(data, d => {
    console.log(padding(d.o, maxLength));
    return { i: d.i, o: padding(d.o, maxLength) };
  });

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = [
    '<div class="benford-popup">',
    "  <h2>result</h2>",
    "  <ul>",
    _.map(data, d => {
      return "<li>" + d.i + ": " + d.o + "</li>";
    }).join(""),
    "  </ul>",
    "</div>"
  ].join("");
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
        showCount(res);
        drawChart(res);
      }
    );
  });
};

window.onload = () => {
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
