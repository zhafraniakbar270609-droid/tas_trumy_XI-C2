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
let cart = JSON.parse(localStorage.getItem('tb_cart')) || [];

const getGoogleDriveImageUrl = (sharingUrl) => {
  if (!sharingUrl) return '';

  const driveIdMatch = sharingUrl.match(/\/d\/([a-zA-Z0-9-_]+)/) || sharingUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return sharingUrl;
};

const addToCart = (productId) => {
  const product = products.find(p => p.produk_id === productId);
  if (!product) return;

  const existing = cart.find(item => item.produk_id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('tb_cart', JSON.stringify(cart));
  alert(`${product.produk_name} ditambahkan ke keranjang!`);
  renderCart();
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
  renderProductTable();
  renderCart();
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
  // Coba gunakan gambar lokal jika ada
  const localImageName = item.produk_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
  const localImagePath = `DATA/IMAGES/${localImageName}`;

  return `
    <article class="product-card" data-id="${item.produk_id}">
      <img src="${localImagePath}" alt="${item.produk_name}" onerror="this.src='${getGoogleDriveImageUrl(item.produk_image)}'" />
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
        <div class="mitra-avatar">${mitra.mitra_name.charAt(0).toUpperCase()}</div>
        <div class="mitra-info">
          <h3>${mitra.mitra_name}</h3>
          <p>${mitra.kategori}</p>
          <p>${mitra.sekolah}</p>
        </div>
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
    // Coba gunakan gambar lokal jika ada
    const localImageName = item.produk_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
    const localImagePath = `DATA/IMAGES/${localImageName}`;

    if (isListView) {
      return `
        <article class="product-row" data-id="${item.produk_id}">
          <img src="${localImagePath}" alt="${item.produk_name}" onerror="this.src='${getGoogleDriveImageUrl(item.produk_image)}'" />
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
        <img src="${localImagePath}" alt="${item.produk_name}" onerror="this.src='${getGoogleDriveImageUrl(item.produk_image)}'" />
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

const renderProductTable = () => {
  const productTableBody = document.getElementById('productTableBody');
  if (!productTableBody) return;

  productTableBody.innerHTML = products.map(product => {
    // Coba gunakan gambar lokal jika ada
    const localImageName = product.produk_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
    const localImagePath = `DATA/IMAGES/${localImageName}`;

    return `
    <tr>
      <td>
        <img src="${localImagePath}" alt="${product.produk_name}" class="product-table-img" onclick="openProductDetail('${product.produk_id}')" onerror="this.src='${getGoogleDriveImageUrl(product.produk_image)}'" />
      </td>
      <td>${product.produk_name}</td>
      <td>Rp ${product.produk_price}</td>
      <td>
        <button class="btn-primary" onclick="addToCart('${product.produk_id}')">Tambah ke Keranjang</button>
      </td>
    </tr>
  `}).join('');
};

const renderCart = () => {
  const cartList = document.getElementById('cartList');
  const cartSummary = document.getElementById('cartSummary');
  const cartBadge = document.getElementById('cartBadge');

  if (!cartList || !cartSummary) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="muted">Keranjang kosong.</p>';
    cartSummary.innerHTML = '';
    if (cartBadge) cartBadge.textContent = '';
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${getGoogleDriveImageUrl(item.produk_image)}" alt="${item.produk_name}" />
      <div class="cart-item-info">
        <h4>${item.produk_name}</h4>
        <p>Rp ${item.produk_price} x ${item.quantity}</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateCartQuantity('${item.produk_id}', ${item.quantity - 1})">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateCartQuantity('${item.produk_id}', ${item.quantity + 1})">+</button>
        <button onclick="removeFromCart('${item.produk_id}')">Hapus</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (parseInt(item.produk_price.replace('.', '')) * item.quantity), 0);
  cartSummary.innerHTML = `
    <div class="cart-total">
      <strong>Total: Rp ${total.toLocaleString('id-ID')}</strong>
    </div>
    <button class="btn-primary">Checkout</button>
  `;

  if (cartBadge) cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
};

const updateCartQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = cart.find(item => item.produk_id === productId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem('tb_cart', JSON.stringify(cart));
    renderCart();
  }
};

const removeFromCart = (productId) => {
  cart = cart.filter(item => item.produk_id !== productId);
  localStorage.setItem('tb_cart', JSON.stringify(cart));
  renderCart();
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

  // Coba gunakan gambar lokal jika ada
  const localImageName = product.produk_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
  const localImagePath = `DATA/IMAGES/${localImageName}`;

  modalContent.innerHTML = `
    <h3>${product.produk_name}</h3>
    <img src="${localImagePath}" alt="${product.produk_name}" onerror="this.src='${getGoogleDriveImageUrl(product.produk_image)}'" />
    <div class="modal-meta">
      <div><strong>Harga</strong><span>Rp ${product.produk_price}</span></div>
      <div><strong>Stok</strong><span>${product.produk_stock}</span></div>
      <div><strong>Kategori</strong><span>${product.produk_category}</span></div>
      <div><strong>Mitra</strong><span>${product.sekolah}</span></div>
    </div>
    <button id="buyBtn" class="btn-primary" onclick="addToCart('${product.produk_id}')">Tambah ke Keranjang</button>
  `;
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

// Make functions global for onclick
window.openProductDetail = openProductDetail;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;

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
