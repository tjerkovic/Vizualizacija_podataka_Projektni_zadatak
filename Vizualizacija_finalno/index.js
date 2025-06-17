const width = 600;
const height = 600;
const boje = {
  "ZORAN MILANOVIĆ": "#e41a1c",
  "KOLINDA GRABAR-KITAROVIĆ": "#4169E1",
  "MIROSLAV ŠKORO": "#4daf4a",
  "IVAN PERNAR": "#984ea3",
  "DARIO JURIČAN": "#ff7f00",
  "KATARINA PEOVIĆ": "#ffff33",
  "DALIJA OREŠKOVIĆ": "#a65628",
  "NEDJELJKO BABIĆ": "#f781bf",
  "DEJAN KOVAČ": "#999999",
  "ANTO ĐAPIĆ": "#66c2a5",
  "MLADEN SCHWARTZ": "#e7298a",
  "MISLAV KOLAKUŠIĆ": "#ADD8E6",
};

const zupanijaMap = {
  "Osjecko-Baranjska": "OSJEČKO-BARANJSKA ŽUPANIJA",
  "Viroviticko-Podravska": "VIROVITIČKO-PODRAVSKA ŽUPANIJA",
  "Grad Zagreb": "GRAD ZAGREB",
  Zagrebacka: "ZAGREBAČKA ŽUPANIJA",
  "Bjelovarska-Bilogorska": "BJELOVARSKO-BILOGORSKA ŽUPANIJA",
  "Koprivnicko-Krizevacka": "KOPRIVNIČKO-KRIŽEVAČKA ŽUPANIJA",
  Karlovacka: "KARLOVAČKA ŽUPANIJA",
  "Vukovarsko-Srijemska": "VUKOVARSKO-SRIJEMSKA ŽUPANIJA",
  "Brodsko-Posavska": "BRODSKO-POSAVSKA ŽUPANIJA",
  "Pozesko-Slavonska": "POŽEŠKO-SLAVONSKA ŽUPANIJA",
  "Sisacko-Moslavacka": "SISAČKO-MOSLAVAČKA ŽUPANIJA",
  "Licko-Senjska": "LIČKO-SENJSKA ŽUPANIJA",
  "Primorsko-Goranska": "PRIMORSKO-GORANSKA ŽUPANIJA",
  Istarska: "ISTARSKA ŽUPANIJA",
  Zadarska: "ZADARSKA ŽUPANIJA",
  "Sibensko-kninska": "ŠIBENSKO-KNINSKA ŽUPANIJA",
  "Splitsko-Dalmatinska": "SPLITSKO-DALMATINSKA ŽUPANIJA",
  "Dubrovacko-Neretvanska": "DUBROVAČKO-NERETVANSKA ŽUPANIJA",
  "Krapinsko-Zagorska": "KRAPINSKO-ZAGORSKA ŽUPANIJA",
  Varazdinska: "VARAŽDINSKA ŽUPANIJA",
  Medimurska: "MEĐIMURSKA ŽUPANIJA",
};

let geoData,
  podaci1,
  podaci2,
  trenutniKrug = "1";

Promise.all([
  d3.json("cro_regv3.json"),
  d3.csv("rezultati_1_krug.csv"),
  d3.csv("rezultati_2_krug.csv"),
]).then(([mapa, csv1, csv2]) => {
  const objektIme = Object.keys(mapa.objects)[0];
  geoData = topojson.feature(mapa, mapa.objects[objektIme]);
  podaci1 = csv1;
  podaci2 = csv2;
  nacrtajMapu();
  prikaziUkupneRezultate();
});

d3.select("#krug").on("change", function () {
  trenutniKrug = this.value;
  nacrtajMapu();
  prikaziUkupneRezultate();
});

d3.select("#reset").on("click", prikaziUkupneRezultate);

function dohvatiPodatke() {
  return trenutniKrug === "1" ? podaci1 : podaci2;
}

function nacrtajMapu() {
  d3.select("#mapa").selectAll("svg").remove();
  const svg = d3
    .select("#mapa")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);
  const data = dohvatiPodatke();

  svg
    .selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const nazivCsv = zupanijaMap[d.properties.name] || d.properties.name;
      const zupanija = data.find((z) => z["Županija"] === nazivCsv);
      if (!zupanija) return "#ccc";
      let pobjednik = "";
      let maxPostotak = -Infinity;
      const ukupno = parseInt(zupanija["Važeći listići"]) || 1;
      Object.keys(zupanija).forEach((k) => {
        if (boje[k]) {
          const glasova = parseInt(zupanija[k]) || 0;
          const postotak = glasova / ukupno;
          if (postotak > maxPostotak) {
            maxPostotak = postotak;
            pobjednik = k;
          }
        }
      });
      return boje[pobjednik] || "#999";
    })
    .attr("stroke", "#fff")
    .on("click", function (event, d) {
      const naziv = d.properties?.name || "Nepoznata županija";
      const nazivCsv = zupanijaMap[naziv] || naziv;
      const data = dohvatiPodatke();
      const pod = data.find((z) => z["Županija"] === nazivCsv);
      if (pod) prikaziGrafove(pod);
      else alert("Nema podataka za: " + naziv);
    });
}

function prikaziGrafove(pod) {
  const kandidati = Object.keys(pod).filter((k) => boje[k]);
  const ukupnoGlasova = kandidati.reduce((sum, k) => sum + (+pod[k] || 0), 0);

  const svi = kandidati.map((k) => ({
    ime: k,
    glasova: +pod[k],
    boja: boje[k],
    postotak: (+pod[k] / ukupnoGlasova) * 100,
  }));

  const iznad3 = svi.filter((k) => k.postotak >= 3);
  const ispod3 = svi.filter((k) => k.postotak < 3);

  const glasoviOstalih = ispod3.reduce((sum, k) => sum + k.glasova, 0);
  const postotakOstalih = (glasoviOstalih / ukupnoGlasova) * 100;

  const piePodaci = [...iznad3];
  if (ispod3.length > 0) {
    piePodaci.push({
      ime: "Ostali",
      glasova: glasoviOstalih,
      boja: "#cccccc",
      postotak: postotakOstalih,
    });
  }

  piePodaci.sort((a, b) => b.glasova - a.glasova);

  Plotly.newPlot(
    "kruzni",
    [
      {
        values: piePodaci.map((d) => d.glasova),
        labels: piePodaci.map((d) => d.ime),
        type: "pie",
        marker: { colors: piePodaci.map((d) => d.boja) },
        textinfo: "text",
        hoverinfo: "label+percent",
        text: piePodaci.map(() => "0%"),
        showlegend: true,
      },
    ],
    {
      title: `Rezultati za ${pod["Županija"]}`,
      legend: {
        orientation: "v",
        x: 1.05,
        y: 1,
      },
    }
  );

  const maxSteps = 40;
  let step = 0;
  const targetTexts = piePodaci.map((d) => d.postotak);

  const intervalPie = setInterval(() => {
    step++;
    const texts = targetTexts.map(
      (p) => Math.min(Math.round(p * (step / maxSteps)), Math.round(p)) + "%"
    );
    Plotly.update("kruzni", { text: [texts] }, {}, [0]);
    if (step >= maxSteps) clearInterval(intervalPie);
  }, 30);

  svi.sort((a, b) => b.glasova - a.glasova);
  const labels = svi.map((d) => d.ime);
  const colors = svi.map((d) => d.boja);
  const yTarget = svi.map((d) => d.glasova);
  let yCurrent = yTarget.map(() => 0);
  let barStep = 0;

  Plotly.newPlot(
    "histogram",
    [
      {
        x: labels,
        y: yCurrent,
        type: "bar",
        marker: { color: colors },
      },
    ],
    {
      title: "Broj glasova po kandidatu",
      yaxis: { rangemode: "tozero" },
    }
  );

  const intervalBar = setInterval(() => {
    barStep++;
    const factor = barStep / maxSteps;
    yCurrent = yTarget.map((v) => Math.round(v * factor));
    Plotly.update("histogram", { y: [yCurrent] });
    if (barStep >= maxSteps) clearInterval(intervalBar);
  }, 30);
}

function prikaziUkupneRezultate() {
  const data = dohvatiPodatke();
  const zbir = {};
  data.forEach((red) => {
    Object.keys(red).forEach((k) => {
      if (boje[k]) {
        zbir[k] = (zbir[k] || 0) + (+red[k] || 0);
      }
    });
  });

  const svi = Object.entries(zbir).map(([ime, glasova]) => ({
    ime,
    glasova,
    boja: boje[ime],
  }));

  const ukupno = svi.reduce((sum, k) => sum + k.glasova, 0);
  svi.forEach((k) => (k.postotak = (k.glasova / ukupno) * 100));

  const iznad3 = svi.filter((k) => k.postotak >= 3);
  const ispod3 = svi.filter((k) => k.postotak < 3);

  const glasoviOstalih = ispod3.reduce((sum, k) => sum + k.glasova, 0);
  const postotakOstalih = (glasoviOstalih / ukupno) * 100;

  const piePodaci = [...iznad3];
  if (ispod3.length > 0) {
    piePodaci.push({
      ime: "Ostali",
      glasova: glasoviOstalih,
      boja: "#cccccc",
      postotak: postotakOstalih,
    });
  }

  piePodaci.sort((a, b) => b.glasova - a.glasova);

  Plotly.newPlot(
    "kruzni",
    [
      {
        values: piePodaci.map((d) => d.glasova),
        labels: piePodaci.map((d) => d.ime),
        type: "pie",
        marker: { colors: piePodaci.map((d) => d.boja) },
        textinfo: "text",
        hoverinfo: "label+percent",
        text: piePodaci.map(() => "0%"),
        showlegend: true,
      },
    ],
    {
      title: "Ukupni rezultati za Hrvatsku",
      legend: {
        orientation: "v",
        x: 1.05,
        y: 1,
      },
    }
  );

  const maxSteps = 40;
  let step = 0;
  const targetTexts = piePodaci.map((d) => d.postotak);

  const intervalPie = setInterval(() => {
    step++;
    const texts = targetTexts.map(
      (p) => Math.min(Math.round(p * (step / maxSteps)), Math.round(p)) + "%"
    );
    Plotly.update("kruzni", { text: [texts] }, {}, [0]);
    if (step >= maxSteps) clearInterval(intervalPie);
  }, 30);

  svi.sort((a, b) => b.glasova - a.glasova);
  const labels = svi.map((d) => d.ime);
  const colors = svi.map((d) => d.boja);
  const yTarget = svi.map((d) => d.glasova);
  let yCurrent = yTarget.map(() => 0);
  let barStep = 0;

  Plotly.newPlot(
    "histogram",
    [
      {
        x: labels,
        y: yCurrent,
        type: "bar",
        marker: { color: colors },
      },
    ],
    {
      title: "Ukupni broj glasova po kandidatu",
      yaxis: { rangemode: "tozero" },
    }
  );

  const intervalBar = setInterval(() => {
    barStep++;
    const factor = barStep / maxSteps;
    yCurrent = yTarget.map((v) => Math.round(v * factor));
    Plotly.update("histogram", { y: [yCurrent] });
    if (barStep >= maxSteps) clearInterval(intervalBar);
  }, 30);

  const podaci = {
    1: {
      zupanije: [
        "BJELOVARSKO-BILOGORSKA ŽUPANIJA",
        "BRODSKO-POSAVSKA ŽUPANIJA",
        "DUBROVAČKO-NERETVANSKA ŽUPANIJA",
        "GRAD ZAGREB",
        "ISTARSKA ŽUPANIJA",
        "KARLOVAČKA ŽUPANIJA",
        "KOPRIVNIČKO-KRIŽEVAČKA ŽUPANIJA",
        "KRAPINSKO-ZAGORSKA ŽUPANIJA",
        "LIČKO-SENJSKA ŽUPANIJA",
        "MEĐIMURSKA ŽUPANIJA",
        "OSJEČKO-BARANJSKA ŽUPANIJA",
        "POŽEŠKO-SLAVONSKA ŽUPANIJA",
        "PRIMORSKO-GORANSKA ŽUPANIJA",
        "SISAČKO-MOSLAVAČKA ŽUPANIJA",
        "SPLITSKO-DALMATINSKA ŽUPANIJA",
        "VARAŽDINSKA ŽUPANIJA",
        "VIROVITIČKO-PODRAVSKA ŽUPANIJA",
        "VUKOVARSKO-SRIJEMSKA ŽUPANIJA",
        "ZADARSKA ŽUPANIJA",
        "ZAGREBAČKA ŽUPANIJA",
        "ŠIBENSKO-KNINSKA ŽUPANIJA",
      ],
      izasli: [
        49490, 60251, 71255, 418916, 123343, 51980, 55246, 63914, 20049, 58892,
        146803, 35599, 149779, 66993, 330493, 81166, 38179, 80767, 83625,
        149267, 53076,
      ],
      neizasli: [
        38013, 51867, 44259, 198806, 113909, 40784, 37751, 46857, 20869, 46583,
        114608, 28906, 95318, 55165, 196603, 65325, 34265, 67941, 63849, 121444,
        42058,
      ],
      linija: [
        43497.263411, 52943.409742, 61981.295512, 351781.88208, 113688.27938,
        47082.183356, 49097.45127, 57285.99458, 19232.34264, 51984.92208,
        129283.40974, 31876.05894, 126745.89431, 61110.44179, 278458.27938,
        72990.66667, 35922.27938, 72514.80645, 74721.13978, 134279.98925,
        48092.75146,
      ],
    },
    2: {
      zupanije: [
        "BJELOVARSKO-BILOGORSKA ŽUPANIJA",
        "BRODSKO-POSAVSKA ŽUPANIJA",
        "DUBROVAČKO-NERETVANSKA ŽUPANIJA",
        "GRAD ZAGREB",
        "ISTARSKA ŽUPANIJA",
        "KARLOVAČKA ŽUPANIJA",
        "KOPRIVNIČKO-KRIŽEVAČKA ŽUPANIJA",
        "KRAPINSKO-ZAGORSKA ŽUPANIJA",
        "LIČKO-SENJSKA ŽUPANIJA",
        "MEĐIMURSKA ŽUPANIJA",
        "OSJEČKO-BARANJSKA ŽUPANIJA",
        "POŽEŠKO-SLAVONSKA ŽUPANIJA",
        "PRIMORSKO-GORANSKA ŽUPANIJA",
        "SISAČKO-MOSLAVAČKA ŽUPANIJA",
        "SPLITSKO-DALMATINSKA ŽUPANIJA",
        "VARAŽDINSKA ŽUPANIJA",
        "VIROVITIČKO-PODRAVSKA ŽUPANIJA",
        "VUKOVARSKO-SRIJEMSKA ŽUPANIJA",
        "ZADARSKA ŽUPANIJA",
        "ZAGREBAČKA ŽUPANIJA",
        "ŠIBENSKO-KNINSKA ŽUPANIJA",
      ],
      izasli: [
        55341, 68847, 77917, 459683, 138022, 59477, 62189, 72200, 21999, 66185,
        164737, 39433, 167898, 74747, 372131, 90955, 42121, 89381, 90280,
        168094, 59244,
      ],
      neizasli: [
        32162, 43271, 37597, 161904, 99194, 33287, 30808, 38571, 18919, 39290,
        96874, 25072, 77013, 47411, 154965, 55536, 30262, 59327, 57194, 102617,
        35890,
      ],
      linija: [
        48566.800806, 58507.725806, 66125.146532, 391738.483871, 127155.0871,
        53100.967742, 55669.193548, 64683.870968, 20302.403226, 60291.064516,
        145107.193548, 34283.516129, 142647.741935, 67460.645161, 315805.935484,
        83289.193548, 36165.870968, 80830.870968, 80883.225806, 152778.322581,
        54067.741935,
      ],
    },
  };

  function nacrtajGraf(krug) {
    const data = podaci[krug];
    const steps = 20;
    const frames = [];

    for (let i = 1; i <= steps; i++) {
      const ratio = i / steps;
      frames.push({
        data: [
          { y: data.izasli.map((v) => v * ratio) },
          { y: data.neizasli.map((v) => v * ratio) },
          { y: data.linija.map((v) => v * ratio) },
        ],
        name: `${i}`,
      });
    }

    const trace1 = {
      x: data.zupanije,
      y: Array(data.izasli.length).fill(0),
      name: "Izašli",
      type: "bar",
      marker: { color: "green" },
    };
    const trace2 = {
      x: data.zupanije,
      y: Array(data.neizasli.length).fill(0),
      name: "Nisu izašli",
      type: "bar",
      marker: { color: "red" },
    };
    const trace3 = {
      x: data.zupanije,
      y: Array(data.linija.length).fill(0),
      name: "Prosječna izlaznost",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "blue", dash: "dash" },
    };

    const layout = {
      title: `Izlaznost po županijama - ${krug}. krug`,
      barmode: "group",
      xaxis: { tickangle: -45 },
      yaxis: { title: "Broj birača" },
      updatemenus: [
        {
          type: "buttons",
          showactive: false,
          buttons: [
            {
              label: "Pokreni animaciju",
              method: "animate",
              args: [
                null,
                {
                  frame: { duration: 100, redraw: true },
                  fromcurrent: true,
                },
              ],
            },
          ],
        },
      ],
    };

    Plotly.newPlot("animacija", [trace1, trace2, trace3], layout).then(() => {
      Plotly.addFrames("animacija", frames);
    });
  }

  document.getElementById("krug").addEventListener("change", (e) => {
    nacrtajGraf(e.target.value);
  });

  nacrtajGraf("1");
}
