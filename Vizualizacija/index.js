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
}
