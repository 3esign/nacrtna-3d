# Transformacija — 3D i crtež uporedo

Interaktivna stranica za učenje **transformacije** (uvođenja novih ravni projekcije) u nacrtnoj geometriji. Levo je predmet u 3D prostoru sa ravnima projekcije, desno isti predmet na crtežu. Sve se menja uporedo, korak po korak.

**Otvori:** https://3esign.github.io/nacrtna-3d/

![Zadatak sa trećom i četvrtom projekcijom](docs/zadatak.png)

## Pravilo koje stranica uči

> Udaljenost nove projekcije od nove ose jednaka je udaljenosti zamenjene projekcije od stare ose.

- **Pravac ordinale:** iz projekcije koja ostaje, upravno na novu osu.
- **Udaljenost:** iz projekcije koja se zamenjuje, merena od stare ose.
- **Strana ose:** tačke koje su bile s iste strane stare ose ostaju s iste strane nove.

Na primer, za osu 1x3 ostaje π1, a π3 zamenjuje π2. Zato se od ose 1x3 nanosi visina tačke, to jest rastojanje 1″ od ose 1x2.

## Šta ima

| Deo | Opis |
|---|---|
| Osnove | tačka, duž i piramida, sa klizačima za položaj tačke i uglove osa |
| Zadaci | pet tela (Z1–Z5) sa numerisanim temenima, lanci 1→3→4 i 2→3→4 |
| Koraci | zadato → osa → ordinale → prenesi → spoji, pa isto za četvrtu projekciju |
| Obaranje | ravni se obaraju oko svojih osa dok se 3D slika ne poklopi sa crtežom |
| Vidljivost | zaklonjene ivice su isprekidane u svim projekcijama i u 3D |
| Prenos šestarom | animacija nosi rastojanje sa stare ose na novu |
| Vežba | sam klikneš gde ide tačka; stranica kaže da li je promašena ordinala, strana ili rastojanje |

Kod duži postoje dva posebna položaja: π3 paralelno sa duži daje pravu veličinu, a π4 upravno na nju daje duž kao tačku.

![Tačka: prenos visine na osu 1x3](docs/tacka.png)

![Obaranje ravni u crtež](docs/obaranje.png)

## Upravljanje

- **Miš:** vučenje okreće 3D prikaz, točkić zumira, klik na tačku u crtežu je bira.
- **Tastatura:** ← → menja korak, ↑ ↓ menja tačku.
- **Adresa:** stanje se može zadati u linku, npr. `#obj=z1&k=9` ili `#obj=tacka&k=4&f=0.5`.

## Pokretanje

Stranica je jedan fajl, `index.html`, bez zavisnosti i bez gradnje. Otvori ga u pregledaču ili koristi link iznad.

## Provera

```
node test/provera.cjs
```

Skripta čita račun iz `index.html` i proverava tri stvari:

1. Na slučajnim položajima, za oba lanca, pravilo prenošenja daje isto što i prava 3D projekcija.
2. Kod svakog zadatka temena i ivice leže na površini tela.
3. Vidljivost ivica se računa u sve četiri projekcije.

## Ograničenja

- Mere tela u zadacima su približne, jer su očitane sa slika zadataka. Originalni listovi nisu deo repozitorijuma.
- Osa 3x4 je kod Z1, Z2 i Z3 pomerena paralelno da ne seče treću projekciju. Ugao je zadržan.
- Smer obaranja je naveden na stranici. Ako udžbenik obara na drugu stranu, crtež je ogledalski, a pravilo rastojanja ostaje isto.
- Tela sa lukovima nisu podržana.

## Autor i licenca

© 2026 **dr Poturak Semir**. Kod je pod licencom [MIT](LICENSE).

Predlog navođenja: Poturak, S. (2026). *Transformacija — 3D i crtež uporedo: interaktivno učenje nacrtne geometrije*. https://github.com/3esign/nacrtna-3d
