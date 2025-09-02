const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartCounter = document.getElementById('cart-count');
const addressInput = document.getElementById('address');
const notesInput = document.getElementById('notes');
const addressWarn = document.getElementById('address-warn');
const spanItem = document.getElementById('date-span');
const delivery = document.getElementById('delivery');
const pickup = document.getElementById('pickup');
const addressSection = document.getElementById('address-section');
const pickupInfo = document.getElementById('pickup-info');

let cart = [];

// Abre modal do carrinho
cartBtn.addEventListener('click', () => {
  updateCartModal();
  cartModal.style.display = 'flex';
});

// Fecha modal do carrinho
cartModal.addEventListener('click', (event) => {
  if (event.target === cartModal || event.target === closeModalBtn) {
    cartModal.style.display = 'none';
  }
});

let isDelivery = false; // padrão é delivery

// Abre o campo endereco caso de delivery
delivery.addEventListener('click', () => {
  isDelivery = true; // ativa taxa
  addressSection.classList.remove('hidden');
  pickupInfo.classList.add('hidden');
  updateCartModal(); // já recalcula
});

// fecha o campo endereco caso de retirada
pickup.addEventListener('click', () => {
  isDelivery = false; // remove taxa
  addressSection.classList.add('hidden');
  pickupInfo.classList.remove('hidden');
  updateCartModal(); // já recalcula
});

// Adiciona produto ao carrinho
menu.addEventListener('click', (event) => {
  let parentButton = event.target.closest('.add-to-cart-btn');
  if (parentButton) {
    const name = parentButton.getAttribute('data-name');
    const price = parseFloat(parentButton.getAttribute('data-price'));
    const description = parentButton.getAttribute('data-description') || "";
    addToCart(name, price, description);
  }
});

// Função adicionar item
function addToCart(name, price, description) {
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`+1 ${name} adicionado ao carrinho.`, "success");
  } else {
    cart.push({ name, price, description, quantity: 1 });
    showToast(`${name} adicionado ao carrinho.`, "success");
  }

  updateCartModal();
}

// Toastify helper
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
    style: {
      background: colors[type] || colors.success,
    },
  }).showToast();
}

// Atualizar carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement('div');
    cartItemElement.classList.add('flex', 'justify-between', 'mb-3', 'flex-col');

    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between bg-white shadow-md rounded-xl p-4 mb-3">
        <div class="flex flex-col">
          <p class="font-semibold text-lg text-gray-800">${item.name}</p>
          ${item.description ? `<p class="text-sm text-gray-500">${item.description}</p>` : ""}
          <p class="text-sm text-gray-500">Preço unitário: <span class="font-medium text-gray-700">R$ ${item.price.toFixed(2)}</span></p>
          <p class="text-sm text-gray-500">Subtotal: <span class="font-bold text-green-600">R$ ${(item.price * item.quantity).toFixed(2)}</span></p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="remove-from-cart-btn bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg font-bold text-lg" data-name="${item.name}">-</button>
          <p class="font-medium text-gray-800">${item.quantity}</p>
          <button class="add-from-cart-btn bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded-lg font-bold text-lg" data-name="${item.name}">+</button>
        </div>
      </div>
    `;
    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  // aplica taxa só se for delivery
  const deliveryFee = isDelivery ? 6.00 : 0;
  const subtotal = total + deliveryFee;

  cartTotal.textContent = subtotal.toLocaleString("pt-BR", {
    style: 'currency',
    currency: 'BRL'
  });

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (totalQuantity > 0) {
    cartCounter.classList.remove('hidden');
    cartCounter.textContent = totalQuantity;
  } else {
    cartCounter.classList.add('hidden');
  }
}


// Remover item
cartItemsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-from-cart-btn')) {
    const name = event.target.getAttribute('data-name');
    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name);

  if (index !== -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    updateCartModal();
  }
}

// Aumentar item
cartItemsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('add-from-cart-btn')) {
    const name = event.target.getAttribute('data-name');
    addItemCart(name);
  }
});

function addItemCart(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index !== -1) {
    cart[index].quantity += 1;
    updateCartModal();
  }
}

// Endereço input
addressInput.addEventListener("input", (event) => {
  if (event.target.value !== '') {
    addressInput.classList.remove('border-red-500');
    addressWarn.classList.add('hidden');
  }
});

// Finalizar pedido
checkoutBtn.addEventListener('click', () => {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    showToast("O HOTDOG DA LEIDE está fechado no momento", "error");
    return;
  }
  if (cart.length === 0) return;

  if (isDelivery && addressInput.value === '') {
    showToast("Informe seu endereço completo!", "error");
    addressInput.classList.add('border-red-500');
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "Não informado";

  const cartItems = cart
    .map(item => `• ${item.name} (R$ ${item.price.toFixed(2)}) x ${item.quantity}`)
    .join('\n');

  const cartTotalValue = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = isDelivery ? 6.00 : 0;
  const total = cartTotalValue + deliveryFee;

  const address = isDelivery ? addressInput.value : "Retirada no local";
  const observations = notesInput.value;
  const totalFormatted = total.toLocaleString("pt-BR", {
    style: 'currency',
    currency: 'BRL'
  });

  const message = encodeURIComponent(
    `✨ *Novo Pedido!* ✨\n\n` +
    `📦 *Itens do pedido:*\n${cartItems}\n\n` +
    `💰 *Total:* ${totalFormatted}${isDelivery ? " (com taxa de entrega)" : ""}\n` +
    `💲 *Pagamento:* ${paymentMethod}\n` +
    `📍 *Endereço:* ${address}\n\n` +
    `📝 *Observações:* ${observations || "_-_" }\n\n` +
    `✅ ${isDelivery ? "🚚 _Aguardando confirmação de entrega!_" : "⏰_Aguardando tempo para retirada do pedido_"}\n`
  );

  const phone = '5534988406995';
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

  cart = [];
  updateCartModal();
});


// Checa funcionamento
function checkRestaurantOpen() {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();
  return (currentDay >= 0 && currentDay <= 6 && currentHour >= 18 && currentHour < 23);
}

const isOpen = checkRestaurantOpen();
if (isOpen) {
  spanItem.classList.remove('bg-red-600');
  spanItem.classList.add('bg-green-600');
} else {
  spanItem.classList.remove('bg-green-600');
  spanItem.classList.add('bg-red-600');
}

// ======================
// Função para carregar menus
// ======================
function loadMenu(containerId, jsonFile, key) {
  const menuContainer = document.getElementById(containerId);
  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const closeModal = document.getElementById("close-image-modal");

  fetch(`./menus/${jsonFile}`)
    .then(response => response.json())
    .then(data => {
      const produtos = data[key];

      produtos.forEach(produto => {
        const card = document.createElement("div");
        card.classList = "flex gap-6 items-center bg-white shadow-lg rounded-lg p-4";

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
              <p class="font-bold text-lg">R$ ${produto.price.toFixed(2)}</p>
              <button
                class="bg-green-600 hover:bg-green-700 px-5 rounded add-to-cart-btn"
                data-name="${produto.title}"
                data-price="${produto.price}"
                data-description="${produto.description || ""}"
              >
                <i class="fa fa-cart-plus text-lg text-white"></i>
              </button>
            </div>
          </div>
        `;

        card.querySelector(".product-image").addEventListener("click", (e) => {
          modalImage.src = e.target.src;
          imageModal.classList.remove("hidden");
          imageModal.classList.add("flex");
        });

        menuContainer.appendChild(card);
      });
    })
    .catch(error => console.error("Erro ao carregar o JSON:", error));

  closeModal.addEventListener("click", () => {
    imageModal.classList.add("hidden");
    imageModal.classList.remove("flex");
  });

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.classList.add("hidden");
      imageModal.classList.remove("flex");
    }
  });
}

// Inicializar menus
document.addEventListener("DOMContentLoaded", () => {
  loadMenu("hotdog-menu", "hotdog.json", "hotdog");
  loadMenu("broth-menu", "broths.json", "broth");
  loadMenu("drink-menu", "drink.json", "drink");
});
