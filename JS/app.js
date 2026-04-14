const pageButtons = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const productGrid = document.getElementById('productGrid');
const productList = document.getElementById('productList');
const mitraList = document.getElementById('mitraList');
const accountSection = document.getElementById('accountSection');
const searchInput = document.getElementById('searchInput');
const categoryList = document.getElementById('categoryList');
const filterCategory = document.getElementById('filterCategory');
const toggleView = document.getElementById('toggleView');
const detailModal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

let products = [];
let mitras = [];
let activeCategory = 'all';
let isListView = false;
let user = {
  email: localStorage.getItem('tb_user_email') || '',
  name: localStorage.getItem('tb_user_name') || '',
};

const pagesMap = {
  home: document.querySelector('.page-home'),
  mitra: document.querySelector('.page-mitra'),
  produk: document.querySelector('.page-produk'),
  akun: document.querySelector('.page-akun'),
};

const loadData = async () => {
  const [productRes, mitraRes] = await Promise.all([
    fetch('DATA/tabel produk_rows.json'),
    fetch('DATA/tabel_mitra_rows.json'),
  ]);

  products = await productRes.json();
  mitras = await mitraRes.json();
  renderCategories();
  renderHome();
  renderMitra();
  renderProduk();
  renderAccount();
};

const setPage = (target) => {
  pageButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === target);
  });
  pages.forEach((page) => {
    page.classList.toggle('active', page.dataset.page === target);
  });
  if (target === 'akun' && !user.email) {
    renderLoginForm();
  }
};

const getFilteredProducts = () => {
  const query = searchInput.value.toLowerCase().trim();
  return products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.produk_category === activeCategory;
    const matchesQuery = [product.produk_name, product.produk_category, product.sekolah]
      .join(' ')
      .toLowerCase()
      .includes(query);
    return matchesCategory && matchesQuery;
  });
};

const renderCategories = () => {
  const categories = Array.from(new Set(products.map((item) => item.produk_category)));
  categoryList.innerHTML = '';
  filterCategory.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((category) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'category-pill';
    pill.textContent = category;
    pill.onclick = () => {
      activeCategory = category;
      updateCategoryActive();
      renderHome();
      renderProduk();
    };
    categoryList.appendChild(pill);

    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterCategory.appendChild(option);
  });
  updateCategoryActive();
};

const updateCategoryActive = () => {
  document.querySelectorAll('.category-pill').forEach((pill) => {
    pill.classList.toggle('active', pill.textContent === activeCategory);
  });
  filterCategory.value = activeCategory;
};

const renderHome = () => {
  const items = getFilteredProducts().slice(0, 8);
  productGrid.innerHTML = items.map((item) => renderProductCard(item)).join('');
};

const renderProductCard = (item) => {
  return `
    <article class="product-card" data-id="${item.produk_id}">
      <img src="${item.produk_image}" alt="${item.produk_name}" onerror="this.src='https://via.placeholder.com/400x260?text=Produk'" />
      <div class="product-info">
        <h3 class="product-name">${item.produk_name}</h3>
        <div class="product-meta">
          <span>Rp ${item.produk_price}</span>
          <span>${item.produk_category}</span>
        </div>
      </div>
    </article>
  `;
};

const renderMitra = () => {
  mitraList.innerHTML = mitras.map((mitra) => {
    return `
      <article class="mitra-card" data-id="${mitra.mitra_id}">
        <h3>${mitra.mitra_name}</h3>
        <p>${mitra.kategori}</p>
        <p>${mitra.sekolah}</p>
      </article>
    `;
  }).join('');
};

const renderProduk = () => {
  const items = getFilteredProducts();
  toggleView.textContent = isListView ? 'Grid' : 'List';
  if (items.length === 0) {
    productList.innerHTML = '<p class="muted">Tidak ada produk sesuai pencarian.</p>';
    return;
  }
  productList.innerHTML = items.map((item) => {
    if (isListView) {
      return `
        <article class="product-row" data-id="${item.produk_id}">
          <img src="${item.produk_image}" alt="${item.produk_name}" onerror="this.src='https://via.placeholder.com/120?text=Gambar'" />
          <div class="product-row-info">
            <h3>${item.produk_name}</h3>
            <small>${item.produk_category} • ${item.sekolah}</small>
            <small>Stok ${item.produk_stock} • Rp ${item.produk_price}</small>
          </div>
        </article>
      `;
    }
    return `
      <article class="product-card" data-id="${item.produk_id}">
        <img src="${item.produk_image}" alt="${item.produk_name}" onerror="this.src='https://via.placeholder.com/400x260?text=Produk'" />
        <div class="product-info">
          <h3 class="product-name">${item.produk_name}</h3>
          <div class="product-meta">
            <span>Rp ${item.produk_price}</span>
            <span>${item.produk_category}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
};

const renderAccount = () => {
  if (user.email) {
    accountSection.innerHTML = `
      <div class="account-details">
        <div><strong>Nama</strong><span>${user.name}</span></div>
        <div><strong>Email</strong><span>${user.email}</span></div>
        <div><strong>Status</strong><span>Masuk</span></div>
      </div>
      <button id="logoutBtn">Keluar</button>
    `;
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.removeItem('tb_user_email');
      localStorage.removeItem('tb_user_name');
      user = { email: '', name: '' };
      renderAccount();
    };
    return;
  }
  renderLoginForm();
};

const renderLoginForm = () => {
  accountSection.innerHTML = `
    <div class="account-row">
      <label>Nama</label>
      <input id="inputName" type="text" placeholder="Masukkan nama" />
      <label>Email</label>
      <input id="inputEmail" type="email" placeholder="Masukkan email" />
      <button id="loginBtn">Login / Register</button>
    </div>
  `;
  document.getElementById('loginBtn').onclick = () => {
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    if (!name || !email) {
      alert('Lengkapi nama dan email untuk lanjut.');
      return;
    }
    user = { name, email };
    localStorage.setItem('tb_user_name', name);
    localStorage.setItem('tb_user_email', email);
    renderAccount();
  };
};

const openProductDetail = (productId) => {
  const product = products.find((item) => item.produk_id === productId);
  if (!product) return;
  modalContent.innerHTML = `
    <h3>${product.produk_name}</h3>
    <img src="${product.produk_image}" alt="${product.produk_name}" onerror="this.src='https://via.placeholder.com/720x420?text=Produk'" />
    <div class="modal-meta">
      <div><strong>Harga</strong><span>Rp ${product.produk_price}</span></div>
      <div><strong>Stok</strong><span>${product.produk_stock}</span></div>
      <div><strong>Kategori</strong><span>${product.produk_category}</span></div>
      <div><strong>Mitra</strong><span>${product.sekolah}</span></div>
    </div>
    <button id="buyBtn">Lihat Detail Produk</button>
  `;
  document.getElementById('buyBtn').onclick = () => {
    alert('Detail produk: ' + product.produk_name);
  };
  detailModal.classList.remove('hidden');
};

const openMitraDetail = (mitraId) => {
  const mitra = mitras.find((item) => item.mitra_id === mitraId);
  if (!mitra) return;
  modalContent.innerHTML = `
    <h3>${mitra.mitra_name}</h3>
    <div class="modal-meta">
      <div><strong>Owner</strong><span>${mitra.owner_name}</span></div>
      <div><strong>Email</strong><span>${mitra.email_owner}</span></div>
      <div><strong>Alamat</strong><span>${mitra.address_owner}</span></div>
      <div><strong>Kategori</strong><span>${mitra.kategori}</span></div>
      <div><strong>Sekolah</strong><span>${mitra.sekolah}</span></div>
    </div>
  `;
  detailModal.classList.remove('hidden');
};

pageButtons.forEach((button) => {
  button.addEventListener('click', () => setPage(button.dataset.target));
});

searchInput.addEventListener('input', () => {
  renderHome();
  renderProduk();
});

filterCategory.addEventListener('change', (event) => {
  activeCategory = event.target.value;
  updateCategoryActive();
  renderHome();
  renderProduk();
});

toggleView.addEventListener('click', () => {
  isListView = !isListView;
  renderProduk();
});

document.body.addEventListener('click', (event) => {
  const productCard = event.target.closest('[data-id]');
  if (!productCard) return;
  const id = productCard.dataset.id;
  const isProduct = products.some((item) => item.produk_id === id);
  const isMitra = mitras.some((item) => item.mitra_id === id);
  if (isProduct) openProductDetail(id);
  if (isMitra) openMitraDetail(id);
});

closeModal.addEventListener('click', () => detailModal.classList.add('hidden'));

detailModal.addEventListener('click', (event) => {
  if (event.target === detailModal) {
    detailModal.classList.add('hidden');
  }
});

loadData();
