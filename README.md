# Vizualizacija predsjedničkih izbora u Hrvatskoj 2019.

## Opis projekta

Ovaj projekt predstavlja jednostavnu web aplikaciju za vizualizaciju rezultata predsjedničkih izbora u Republici Hrvatskoj 2019. godine po županijama.

Cilj projekta bio je na pregledan način prikazati izborne rezultate i olakšati njihovu usporedbu među županijama. Projekt je zamišljen kao kratka vizualizacija odabrane teme, a ne kao potpuno razvijena web aplikacija prilagođena svim uređajima.

## Korištene tehnologije

- **HTML** – struktura web stranica
- **CSS** – oblikovanje izgleda aplikacije
- **JavaScript** – logika aplikacije i prikaz podataka
- **CSV** – podaci o rezultatima izbora
- **GeoJSON / JSON** – geografski podaci za prikaz županija

## Struktura projekta

```text
Vizualizacija_finalno/
├── background.png
├── cro_regv3.json
├── index.css
├── index.html
├── index.js
├── pocetna.css
├── pocetna.html
├── rezultati_1_krug.csv
└── rezultati_2_krug.csv
```

Najvažnije datoteke:

- `pocetna.html` – početna stranica
- `index.html` – stranica s vizualizacijom
- `index.js` – JavaScript kod aplikacije
- `cro_regv3.json` – geografski podaci o hrvatskim županijama
- `rezultati_1_krug.csv` – rezultati prvog kruga izbora
- `rezultati_2_krug.csv` – rezultati drugog kruga izbora

## Pokretanje projekta

Projekt se pokreće lokalno. Za jednostavno posluživanje datoteka može se koristiti Pythonov ugrađeni HTTP server.

1. Preuzmite repozitorij i otvorite mapu projekta u terminalu.

2. Pokrenite naredbu:

   ```bash
   python -m http.server 8000
   ```

   Na nekim Windows računalima umjesto `python` potrebno je upisati `py`.

3. Ostavite terminal otvoren i u pregledniku posjetite:

   http://localhost:8000/pocetna.html

   Za izravan pristup vizualizaciji otvorite:

   http://localhost:8000/index.html

**Važno:** Nakon pokretanja servera terminal ostaje aktivan i čeka zahtjeve preglednika. To je očekivano ponašanje, a ne znak da se naredba zaglavila. Server se zaustavlja pritiskom na **Ctrl + C**.

Ako je port 8000 zauzet, možete upotrijebiti drugi, primjerice:

```bash
python -m http.server 5500
```

U tom slučaju stranica je dostupna na:

http://localhost:5500/pocetna.html

**Alternativa:** U Visual Studio Codeu možete koristiti ekstenziju **Live Server** i opciju **Open with Live Server** na datoteci `pocetna.html`.

Preporučuje se pokretanje preko lokalnog servera umjesto izravnog otvaranja HTML datoteke, kako bi preglednik mogao učitavati povezane CSV i JSON datoteke.

## Napomena o prikazu aplikacije

Za ispravan i pregledan prikaz preporučuje se korištenje aplikacije na računalu, s internetskim preglednikom otvorenim **preko cijelog zaslona (fullscreen)**. U većini preglednika prikaz preko cijelog zaslona uključuje se tipkom **F11**.

Stranica **nije prilagođena manjim zaslonima ni mobilnim uređajima**. Responzivni dizajn nije bio dio ciljeva projekta jer je naglasak bio na izradi kratke vizualizacije odabrane teme i prikazu rezultata predsjedničkih izbora po županijama.

## Svrha projekta

Projekt je izrađen radi praktične primjene web tehnologija i vizualizacije podataka. Naglasak je na predstavljanju izbornih rezultata u geografskom kontekstu i njihovoj usporedbi među hrvatskim županijama.