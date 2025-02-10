const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const productIdInput = document.getElementById('productId');
const apiUrl = 'https://perfume.free.beeceptor.com/products';

// Load products on page load for the seller page
if (productForm) {
  document.addEventListener('DOMContentLoaded', loadProducts);
}

// Add or update a product
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value;
    const name = document.getElementById('name').value;
    const brand = document.getElementById('brand').value;
    const price = document.getElementById('price').value;
    const label = document.getElementById('label').value;
    const imageInput = document.getElementById('image');

    // Convert the image to Base64
    const reader = new FileReader();
    reader.onload = async function (event) {
      const image = event.target.result;
      const product = { name, brand, price, label, image };

      let products = JSON.parse(localStorage.getItem('products')) || [];

      try {
        if (id) {
          // Update existing product via Beeceptor
          await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          products[id] = product;
        } else {
          // Create new product via Beeceptor
          await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          products.push(product);
        }
      } catch (error) {
        console.error('Beeceptor API error:', error);
        // If Beeceptor fails, fall back to localStorage
        if (id) {
          products[id] = product;
        } else {
          products.push(product);
        }
      }

      localStorage.setItem('products', JSON.stringify(products));
      productForm.reset();
      productIdInput.value = '';
      loadProducts();
    };

    if (imageInput.files[0]) {
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      alert('Please select an image to upload.');
    }
  });
}

// Load products for the seller page
async function loadProducts() {
  productList.innerHTML = '';
  let products = [];

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Beeceptor API not available');
    products = await response.json();
  } catch (error) {
    console.error('Beeceptor API error:', error);
    // Fallback to localStorage if Beeceptor API fails
    products = JSON.parse(localStorage.getItem('products')) || [];
  }

  products.forEach((product, index) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      ${product.label ? `<span class="label">${product.label}</span>` : ''}
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p><strong>Brand:</strong> ${product.brand}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <button onclick="editProduct(${index})">Edit</button>
      <button onclick="deleteProduct(${index})">Delete</button>
    `;
    productList.appendChild(productCard);
  });
}

// Edit a product
function editProduct(index) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products[index];

  productIdInput.value = index;
  document.getElementById('name').value = product.name;
  document.getElementById('brand').value = product.brand;
  document.getElementById('price').value = product.price;
  document.getElementById('label').value = product.label;
}

// Delete a product
async function deleteProduct(index) {
  let products = JSON.parse(localStorage.getItem('products')) || [];

  try {
    await fetch(`${apiUrl}/${index}`, {
      method: 'DELETE',
    });
    products.splice(index, 1);
  } catch (error) {
    console.error('Beeceptor API error:', error);
    // Fallback to localStorage if Beeceptor API fails
    products.splice(index, 1);
  }

  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
}

// Load products for homepage and buyer page
async function loadProductsForHomePage() {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';
  let products = [];

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Beeceptor API not available');
    products = await response.json();
  } catch (error) {
    console.error('Beeceptor API error:', error);
    products = JSON.parse(localStorage.getItem('products')) || [];
  }

  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      ${product.label ? `<div class="label">${product.label}</div>` : ''}
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p><strong>Brand:</strong> ${product.brand}</p>
      <p><strong>Price:</strong> $${product.price}</p>
    `;
    productList.appendChild(productCard);
  });
}
