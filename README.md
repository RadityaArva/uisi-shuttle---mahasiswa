# UISI Shuttle

Aplikasi web untuk memesan shuttle kampus Universitas Internasional Semen Indonesia (UISI). Mahasiswa bisa melihat posisi shuttle di peta, memilih titik jemput, dan melihat riwayat perjalanan dari satu tempat.

Tampilannya dibuat mobile-first karena sebagian besar penggunanya akan membuka lewat HP.

## Tampilan


<p>  
  <img width="939" height="684" alt="Screen Shot 2026-10-13 at 10 27 27" src="https://github.com/user-attachments/assets/67cb0d73-c9de-42c0-94ee-6f17a96cb050" /> <br>
  <img width="449" height="684" alt="Screen Shot 2026-10-13 at 10 27 57" src="https://github.com/user-attachments/assets/999d5283-02c2-4c74-9bf7-6faa80a9fab9" /> <br>
  <img width="442" height="685" alt="Screen Shot 2026-10-13 at 10 28 38" src="https://github.com/user-attachments/assets/41004630-2b24-4445-a05c-806ff865fde0" /> <br>
  <img width="442" height="680" alt="Screen Shot 2026-10-13 at 10 29 02" src="https://github.com/user-attachments/assets/97a3d9c4-1630-40fc-b21f-4820567267fd" /> <br>
  <img width="438" height="677" alt="Screen Shot 2026-10-13 at 10 29 16" src="https://github.com/user-attachments/assets/5dbd9fe5-c4df-493d-bcce-ee36468f43b3" />

</p> 

## Fitur

- Login memakai email mahasiswa (`@student.uisi.ac.id`)
- Peta rute shuttle antar pos dan gedung, lengkap dengan posisi armada (contoh: UISI-01)
- Info waktu berhenti dan keberangkatan berikutnya
- Pilih titik jemput, dengan jarak, estimasi jalan kaki, dan sisa kursi
- Riwayat perjalanan dengan filter semua, selesai, dan dibatalkan
- Chat dengan sopir, misalnya untuk barang yang tertinggal
- Profil mahasiswa dan pengaturan halte favorit sebagai rekomendasi awal saat memesan

## Titik Jemput

| Halte | Kampus |
|---|---|
| Pos Induk Kampus A | A |
| Gedung Kampus A | A |
| Pos Kampus B | B |
| Gedung Kampus B | B |

## Menjalankan Lokal

```bash
git clone https://github.com/<username>/uisi-shuttle.git
cd uisi-shuttle
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

> Sesuaikan perintah dan port di atas dengan stack yang kamu pakai.

## Teknologi

- Frontend: _isi di sini_
- Backend: _isi di sini_
- Peta: _isi di sini_

## Struktur Folder

```
.
├── docs/
│   └── screenshots/
├── src/
└── README.md
```

## Catatan

Proyek ini dibuat untuk keperluan belajar dan portofolio, bukan aplikasi resmi UISI. Data pada tampilan (nama, NIM, nomor telepon) hanyalah data contoh.

## Pembuat

Raditya Arva Messi Jagaddhita, Informatika UISI.![Uploading Screen Shot 2026-10-13 at 10.27.27.png…]()
