// ======= Seletores =======
const menu = document.getElementById('menu');

const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

const productModal = document.getElementById('product-modal');
const productModalContent = document.getElementById('product-modal-content');

const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeImageModal = document.getElementById('close-image-modal');

const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const cartCounter = document.getElementById('cart-count');

const addressInput = document.getElementById('address');
const notesInput = document.getElementById('notes');
const addressWarn = document.getElementById('address-warn');

const spanItem = document.getElementById('date-span');
const delivery = document.getElementById('delivery');
const pickup = document.getElementById('pickup');
const addressSection = document.getElementById('address-section');
const pickupInfo = document.getElementById('pickup-info');

// ======= Estado =======
let cart = [];
let isDelivery = false;

let globalAdditionals = []; // carregará todos os adicionais do JSON

// ======= Helpers =======
function showToast(text, type = "success") {
  const colors = {
    success: "linear-gradient(to right, #15803D, #15803D)",
    error: "linear-gradient(to right, #ef4444, #580f0f)"
  };
  Toastify({
    text,
    duration: 1500,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: colors[type] || colors.success },
  }).showToast();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function additionalsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const norm = arr => arr.map(x => `${x.name}::${Number(x.price).toFixed(2)}`).sort();
  const na = norm(a), nb = norm(b);
  for (let i = 0; i < na.length; i++) if (na[i] !== nb[i]) return false;
  return true;
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });
}

function checkRestaurantOpen() {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();
  return (currentDay >= 0 && currentDay <= 6 && currentHour >= 10 && currentHour < 23);
}

// ======= Atualiza badge de status =======
(function updateOpenBadge() {
  const isOpen = checkRestaurantOpen();
  if (isOpen) {
    spanItem.classList.remove('bg-red-600');
    spanItem.classList.add('bg-green-600');
  } else {
    spanItem.classList.remove('bg-green-600');
    spanItem.classList.add('bg-red-600');
  }
})();

// ======= Eventos Delivery / Pickup =======
delivery.addEventListener('click', () => {
  isDelivery = true;
  addressSection.classList.remove('hidden');
  pickupInfo.classList.add('hidden');
  renderCart();
});
pickup.addEventListener('click', () => {
  isDelivery = false;
  addressSection.classList.add('hidden');
  pickupInfo.classList.remove('hidden');
  renderCart();
});

addressInput.addEventListener('input', (event) => {
  if (event.target.value !== '') {
    addressInput.classList.remove('border-red-500');
    addressWarn.classList.add('hidden');
  }
});

// ======= Abrir / Fechar Modal Carrinho =======
cartBtn.addEventListener('click', () => {
  renderCart();
  cartModal.style.display = 'flex';
});
cartModal.addEventListener('click', (event) => {
  if (event.target === cartModal || event.target === closeModalBtn) {
    cartModal.style.display = 'none';
  }
});

// ======= Carregar adicionais globais =======
function loadAdditionals() {
  return fetch('./menus/additionals.json')
    .then(res => res.json())
    .then(data => globalAdditionals = data.additional || [])
    .catch(err => console.error("Erro ao carregar adicionais:", err));
}

// ======= Carregar menus =======
function loadMenu(containerId, jsonFile, key) {
  const menuContainer = document.getElementById(containerId);
  fetch(`./menus/${jsonFile}`)
    .then(res => res.json())
    .then(data => {
      const produtos = data[key] || [];
      produtos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "flex gap-6 items-center bg-white shadow-lg rounded-lg p-4";

        const priceNum = Number(produto.price || 0);
        // atribui adicionais de acordo com "for" do produto
        const additionals = globalAdditionals.filter(a => a.for === key);

        card.innerHTML = `
          <img
            src="${produto.image}"
            alt="${produto.title}"
            class="w-28 h-28 object-cover rounded-lg hover:scale-110 hover:rotate-2 duration-200 cursor-pointer product-image"
          />
          <div class="w-full">
            <p class="font-bold">${produto.title}</p>
            <p class="text-sm">${produto.description || ""}</p>
            <div class="flex items-center justify-between mt-5">
              <p class="font-bold text-lg">${formatBRL(priceNum)}</p>
              <div class="flex items-center gap-2">
                <button
                  class="open-product-btn bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                  data-name="${produto.title}"
                  data-price="${priceNum}"
                  data-description="${(produto.description || "").replace(/"/g, "&quot;")}"
                  data-image="${produto.image}"
                  data-additionals='${JSON.stringify(additionals)}'
                >
                  <i class="fa fa-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        `;

        card.querySelector(".product-image").addEventListener("click", e => {
          modalImage.src = e.target.src;
          imageModal.classList.remove("hidden");
          imageModal.classList.add("flex");
        });

        menuContainer.appendChild(card);
      });
    })
    .catch(err => console.error("Erro ao carregar JSON:", err));

  // Fechar modal de imagem
  closeImageModal.addEventListener("click", () => {
    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
  });
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.add('hidden');
      imageModal.classList.remove('flex');
    }
  });
}

// ======= Inicializar menus após carregar adicionais =======
document.addEventListener('DOMContentLoaded', async () => {
  await loadAdditionals();
  loadMenu("hotdog-menu", "hotdog.json", "hotdog");
  loadMenu("broth-menu", "broths.json", "broth");
  loadMenu("juice-menu", "juice.json", "juice");
  loadMenu("drink-menu", "drink.json", "drink");
});

// ======= Abrir Modal Produto =======
menu.addEventListener('click', (event) => {
  const openBtn = event.target.closest('.open-product-btn');
  if (!openBtn) return;

  const name = openBtn.dataset.name;
  const price = parseFloat(openBtn.dataset.price) || 0;
  const description = openBtn.dataset.description || "";
  const image = openBtn.dataset.image || "";
  let additionals = [];
  try { additionals = JSON.parse(openBtn.dataset.additionals || "[]"); } catch { additionals = []; }

  openProductModal({ name, price, description, image, additionals });
});

// ======= Modal Produto =======
function openProductModal({ name, price, description, image, additionals = [] }) {
  let quantity = 1;
  let selectedAdditionals = [];

  function updateSubtotal() {
    const additionsTotal = selectedAdditionals.reduce((acc, a) => acc + Number(a.price || 0), 0);
    const subtotal = (Number(price || 0) * quantity) + additionsTotal;
    document.getElementById('product-total').textContent = formatBRL(subtotal);
    document.getElementById('add-to-cart-final').textContent = `Adicionar ao Carrinho • ${formatBRL(subtotal)}`;
  }

  function render() {
    const additionsListHtml = additionals.length > 0
      ? additionals.map((add, i) => {
          return `
            <label class="flex items-center gap-2">
              <input type="checkbox" data-index="${i}" class="additional-checkbox">
              <span>${add.title} (+ ${formatBRL(Number(add.price) || 0)})</span>
            </label>
          `;
        }).join('')
      : `<p class="text-sm text-gray-500">Sem adicionais</p>`;

    const subtotal = Number(price || 0) * quantity;

    productModalContent.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl w-full p-6 relative overflow-auto">
        <button id="close-product-modal" class="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-2xl font-bold">&times;</button>
        <div class="flex gap-4 mb-4">
          <img src="${image}" alt="${name}" class="w-28 h-28 object-cover rounded-lg"/>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">${name}</h2>
            <p class="text-sm text-gray-600 mt-1">${description}</p>
            <p class="mt-3 font-semibold text-green-600">${formatBRL(Number(price || 0))}</p>
          </div>
        </div>
        <div class="mb-4">
          <label class="font-semibold">Quantidade</label>
          <div class="flex items-center gap-3 mt-2">
            <button id="decrease-qty" class="px-3 py-1 bg-red-100 rounded-lg">-</button>
            <span id="qty" class="font-bold text-lg">${quantity}</span>
            <button id="increase-qty" class="px-3 py-1 bg-green-100 rounded-lg">+</button>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="font-semibold mb-2">Adicionais</h3>
          <div class="flex flex-col gap-2">${additionsListHtml}</div>
        </div>
        <div class="flex justify-between items-center font-bold text-lg mb-4">
          <span>Total parcial:</span>
          <span id="product-total" class="text-green-600">${formatBRL(subtotal)}</span>
        </div>
        <button id="add-to-cart-final" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold w-full">
          Adicionar ao Carrinho • ${formatBRL(subtotal)}
        </button>
      </div>
    `;

    // Eventos
    document.getElementById('close-product-modal')?.addEventListener('click', () => {
      productModal.classList.add('hidden');
      productModal.classList.remove('flex');
    });
    document.getElementById('decrease-qty')?.addEventListener('click', () => { if (quantity > 1) { quantity--; updateSubtotal(); document.getElementById('qty').textContent = quantity; } });
    document.getElementById('increase-qty')?.addEventListener('click', () => { quantity++; updateSubtotal(); document.getElementById('qty').textContent = quantity; });

    document.querySelectorAll('.additional-checkbox').forEach((cb, i) => {
      cb.addEventListener('change', (e) => {
        const add = additionals[i];
        if (!add) return;
        if (cb.checked) {
          if (!selectedAdditionals.some(s => s.name === add.title)) selectedAdditionals.push({ name: add.title, price: Number(add.price) });
        } else {
          selectedAdditionals = selectedAdditionals.filter(s => s.name !== add.title);
        }
        updateSubtotal();
      });
    });

    document.getElementById('add-to-cart-final')?.addEventListener('click', () => {
      addToCart(name, Number(price), description, quantity, selectedAdditionals, image);
      productModal.classList.add('hidden');
      productModal.classList.remove('flex');
      showToast(`${quantity}x ${name} adicionado ao carrinho.`, 'success');
    });
  }

  render();
  productModal.classList.remove('hidden');
  productModal.classList.add('flex');

  productModal.addEventListener('click', function closeOnOutside(e) {
    if (e.target === productModal) {
      productModal.classList.add('hidden');
      productModal.classList.remove('flex');
      productModal.removeEventListener('click', closeOnOutside);
    }
  });
}


// ======= Carrinho =======
function addToCart(name, price, description = "", quantity = 1, additionals = [], image = "") {
  additionals = (additionals || []).map(a => ({ name: a.name, price: Number(a.price || 0) }));
  const index = cart.findIndex(ci => ci.name === name && additionalsEqual(ci.additionals || [], additionals || []));
  if (index !== -1) cart[index].quantity += quantity;
  else cart.push({ id: generateId(), name, price, description, quantity, additionals, image });
  renderCart();
}

function renderCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const additionsSum = (item.additionals || []).reduce((acc, a) => acc + Number(a.price || 0), 0);
    const itemTotal = (Number(item.price) + additionsSum) * Number(item.quantity);
    total += itemTotal;

    const addsList = (item.additionals && item.additionals.length)
      ? `<p class="text-sm text-gray-500">Adicionais: ${item.additionals.map(a => `${a.name} (${formatBRL(a.price)})`).join(', ')}</p>`
      : '';

    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'flex justify-between mb-3 flex-col';
    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between bg-white shadow-md rounded-xl p-4 mb-3">
        <div class="flex flex-col">
          <p class="font-semibold text-lg text-gray-800">${item.name}</p>
          ${item.description ? `<p class="text-sm text-gray-500">${item.description}</p>` : ''}
          ${addsList}
          <p class="text-sm text-gray-500">Preço unitário: <span class="font-medium text-gray-700">${formatBRL(item.price)}</span></p>
          <p class="text-sm text-gray-500">Subtotal: <span class="font-bold text-green-600">${formatBRL(itemTotal)}</span></p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="remove-from-cart-btn bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg font-bold text-lg" data-id="${item.id}">-</button>
          <p class="font-medium text-gray-800">${item.quantity}</p>
          <button class="add-from-cart-btn bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded-lg font-bold text-lg" data-id="${item.id}">+</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItemElement);
  });

  const deliveryFee = isDelivery ? 6.00 : 0;
  const subtotal = total + deliveryFee;
  cartTotal.textContent = formatBRL(subtotal);

  const totalQuantity = cart.reduce((acc, item) => acc + Number(item.quantity), 0);
  if (totalQuantity > 0) {
    cartCounter.classList.remove('hidden');
    cartCounter.textContent = totalQuantity;
  } else {
    cartCounter.classList.add('hidden');
    cartCounter.textContent = '';
  }
}

cartItemsContainer.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('.remove-from-cart-btn');
  const addBtn = event.target.closest('.add-from-cart-btn');
  if (removeBtn) removeItemCartById(removeBtn.dataset.id);
  if (addBtn) increaseItemCartById(addBtn.dataset.id);
});

function removeItemCartById(id) {
  const index = cart.findIndex(i => i.id === id);
  if (index === -1) return;
  if (cart[index].quantity > 1) cart[index].quantity--;
  else cart.splice(index, 1);
  renderCart();
}

function increaseItemCartById(id) {
  const index = cart.findIndex(i => i.id === id);
  if (index === -1) return;
  cart[index].quantity++;
  renderCart();
}

// ======= Checkout =======
checkoutBtn.addEventListener('click', () => {
  if (!checkRestaurantOpen()) { showToast("O HOTDOG DA LEIDE está fechado no momento", "error"); return; }
  if (cart.length === 0) { showToast("Carrinho vazio!", "error"); return; }
  if (isDelivery && addressInput.value.trim() === '') { 
    showToast("Informe seu endereço completo!", "error");
    addressInput.classList.add('border-red-500');
    addressWarn.classList.remove('hidden');
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "Não informado";
  let message = `✨ *Novo Pedido!* ✨\n\n`;
  let total = 0;

  cart.forEach(item => {
    const additionsSum = (item.additionals || []).reduce((acc, a) => acc + Number(a.price || 0), 0);
    const itemTotal = (Number(item.price) + additionsSum) * Number(item.quantity);
    total += itemTotal;
    message += `• ${item.quantity} unidade(s) ${item.name} - R$ ${Number(item.price).toFixed(2)}\n`;
    if (item.additionals?.length) message += `   ➕ Adicionais: ${item.additionals.map(a => `${a.name} (R$ ${Number(a.price).toFixed(2)})`).join(', ')}\n`;
    //if (item.description) message += `   📝 ${item.description}\n`;
    message += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
  });

  const deliveryFee = isDelivery ? 6.00 : 0;
  const finalTotal = total + deliveryFee;
  const address = isDelivery ? addressInput.value.trim() : "Retirada no local";
  const observations = notesInput.value.trim() || "_-_";

  message += `💲 *Pagamento:* ${paymentMethod}\n`;
  message += `📍 *Endereço:* ${address}\n`;
  message += `📦 Entrega: ${isDelivery ? `Sim (+R$ ${deliveryFee.toFixed(2)})` : "Não"}\n`;
  message += `📝 Observações: ${observations}\n\n`;
  message += `💰 *Total:* R$ ${finalTotal.toFixed(2)}\n\n`;
  message += `✅ ${isDelivery ? "🚚 _Aguardando confirmação de entrega!_" : "⏰ _Aguardando tempo para retirada!_"}\n`;

  const encoded = encodeURIComponent(message);
  const phone = '5534988406995';
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');

  cart = [];
  renderCart();
  cartModal.style.display = 'none';
});

// ======= Fechar modais com ESC =======
document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    [productModal, cartModal, imageModal].forEach(modal => {
      if (!modal.classList.contains('hidden') || modal.style.display === 'flex') {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.style.display = 'none';
      }
    });
  }
});
