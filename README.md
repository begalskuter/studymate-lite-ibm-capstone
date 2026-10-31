# StudyMate Lite — Student Assignment Tracker

StudyMate Lite adalah aplikasi web sederhana untuk membantu mahasiswa mengelola tugas perkuliahan, deadline, prioritas, dan status penyelesaian tugas.

Project ini dikembangkan sebagai Capstone Project IBM SkillsBuild menggunakan IBM Bob dengan pendekatan Vibe Coding dan iterative prompting.

## Features

- Add assignment
- Edit assignment
- Delete assignment
- Mark assignment as Active atau Completed
- Priority level: Low, Medium, High
- Filter berdasarkan status:
  - All
  - Active
  - Completed
- Statistik Total, Active, dan Completed
- Search berdasarkan judul tugas atau mata kuliah
- Sorting berdasarkan:
  - Nearest Deadline
  - Farthest Deadline
- Penyimpanan data menggunakan browser localStorage
- Responsive layout
- Empty state dan validasi input

## Technologies

Project ini menggunakan:

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage
- IBM Bob sebagai AI Coding Assistant

Tidak menggunakan framework frontend, backend, database eksternal, maupun external API.

## Project Structure

```text
studymate-lite-ibm-capstone/
├── index.html
├── style.css
├── script.js
└── evidence/
```

### index.html
Berisi struktur utama antarmuka StudyMate Lite.

### style.css
Berisi styling, responsive layout, badge, card, form, dan visual state aplikasi.

### script.js
Berisi logika CRUD, filter, search, sorting, statistik, status assignment, validasi, dan localStorage.

### evidence/
Berisi screenshot proses pengembangan menggunakan IBM Bob, mulai dari eksplorasi, master prompt 3-layer, targeted refinement, hingga hasil pengujian akhir.

## Prompt Architecture

Pengembangan menggunakan prompt dengan tiga layer:

1. **Layer 1 — Role & Context**  
   Menetapkan IBM Bob sebagai Senior Frontend Engineer serta memberikan konteks project, target pengguna, dan technology stack.

2. **Layer 2 — Task & Requirements**  
   Mendefinisikan fitur dan perilaku aplikasi seperti CRUD, status, filter, search, sorting, dan localStorage.

3. **Layer 3 — Constraints & Output**  
   Menentukan struktur file, standar visual, responsivitas, accessibility, dan kualitas kode.

## Iterative Development

Pengembangan dilakukan menggunakan pendekatan targeted refinement.

### Iteration 1 — Layer 3

Versi awal aplikasi sudah memiliki fungsi utama, tetapi tampilan masih terasa cukup generic dan form-heavy.

Refinement dilakukan pada Layer 3 untuk:

- membuat statistik lebih compact;
- mengurangi unnecessary spacing;
- membuat assignment card lebih ringkas;
- memperbaiki visual hierarchy;
- menata action button agar lebih compact;
- mempertahankan responsive layout dan accessibility.

### Iteration 2 — Layer 2

Setelah tampilan diperbaiki, ditemukan bahwa assignment akan semakin sulit dicari ketika jumlah data bertambah.

Refinement dilakukan pada Layer 2 dengan menambahkan:

- search berdasarkan assignment title atau course;
- sorting berdasarkan nearest dan farthest deadline;
- integrasi search dan sorting dengan filter status yang sudah ada.

## Testing

Pengujian dilakukan terhadap fungsi utama aplikasi, meliputi:

- Create assignment
- Edit assignment
- Delete assignment
- Active / Completed status
- Filter
- Search
- Deadline sorting
- Statistics update
- Input validation
- LocalStorage persistence

## How to Run

1. Clone atau download repository ini.
2. Buka folder project.
3. Jalankan `index.html` menggunakan browser.

Untuk development lokal dapat menggunakan extension Live Server pada VS Code atau IBM Bob.

## Evidence

Dokumentasi proses pengembangan tersedia pada folder:

```text
evidence/
```

Evidence mencakup master prompt 3-layer, hasil versi awal, targeted refinement Layer 3, targeted refinement Layer 2, hasil final, dan testing aplikasi.

## Capstone Project

Project ini dibuat untuk:

**IBM SkillsBuild University Education — Capstone Project IBM Bob**

Project title:

**StudyMate Lite — Student Assignment Tracker**
