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

let cart = [];

// Abre o modal do carrinho
cartBtn.addEventListener('click', function() {
    updateCartModal();
    cartModal.style.display = 'flex'
})

// Fecha o modal do carrinho
cartModal.addEventListener('click', function(event) {
    if (event.target === cartModal || event.target === closeModalBtn) {
        cartModal.style.display = 'none';
    }
})

// Adiciona o produto ao carrinho
menu.addEventListener('click', function(event) {
    let parentButton = event.target.closest('.add-to-cart-btn')
    if (parentButton) {
        const name = parentButton.getAttribute('data-name')
        const price = parseFloat(parentButton.getAttribute('data-price'))
        const description = parseFloat(parentButton.getAttribute('data-price'))
        addToCart(name, price, description, parentButton);
    }
})

// Função para adicionar item ao carrinho
function addToCart(name, price, description) {
    const existingItem = cart.find(item => item.name === name)
    
    if (existingItem) {
        existingItem.quantity += 1;
        
        Toastify({
        text: `+1 ${name} adicionado ao carrinho.`,
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #E6C30E, #E6A90E)",
        },
        }).showToast();
        updateCartModal()
        return;
    } else{
        cart.push({ name, price, description, quantity: 1 });
        
        Toastify({
        text: `${name} adicionado ao carrinho.`,
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #E6C30E, #E6A90E)",
        },
        }).showToast();

    }
    updateCartModal()
}

// Atualiza o carrinho
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
            <p class="text-sm text-gray-500">Preço unitário: <span class="font-medium text-gray-700">${item.price.toFixed(2)}</span></p>
            <p class="text-sm text-gray-500">Subtotal: <span class="font-bold text-green-600">R$ ${(item.price * item.quantity).toFixed(2)}</span></p>
            </div>
            
            <div class="flex items-center space-x-2">
            <button class="remove-from-cart-btn bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg font-bold text-lg" data-name="${item.name}">-</button>
            <p class="font-medium text-gray-800"> ${item.quantity} </p>
            <button class="add-from-cart-btn bg-green-100 hover:bg-green-200 text-green-600 px-3 py-1 rounded-lg font-bold text-lg" data-name="${item.name}">+</button>
            </div>
        </div>
        `

        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement)

    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: 'currency',
        currency: 'BRL'
    });

    // if (cart.length > 0) {
    //     cartCounter.classList.remove('hidden');
    //     cartCounter.textContent = cart.length;
    // } else {
    //     cartCounter.classList.add('hidden');
    // }

    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (totalQuantity > 0) {
        cartCounter.classList.remove('hidden');
        cartCounter.textContent = totalQuantity;
    } else {
        cartCounter.classList.add('hidden');
    }

}

// Evento para remover item do carrinho
cartItemsContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const name = event.target.getAttribute('data-name');
        removeItemCart(name);
    }
})

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    
    if (index !== -1) {
        const item = cart[index];
        
        if (cart[index].quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
            return;
        }
        cart.splice(index, 1);
        updateCartModal();
    }
}

// Evento para AUMENTAR item do carrinho
cartItemsContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('add-from-cart-btn')) {
        const name = event.target.getAttribute('data-name');
        addItemCart(name);
    }
})

function addItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    
    if (index !== -1) {
        cart[index].quantity += 1;
        updateCartModal();
        }
    }


// Evento para incluir o endereço
addressInput.addEventListener("input", function(event) {
    let inputValue = event.target.value;

    if (inputValue !== '') {
        addressInput.classList.remove('border-red-500');
        addressWarn.classList.add('hidden');
    }
})

// Evento para finalizar o pedido
checkoutBtn.addEventListener('click', function() {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        
        Toastify({
        text: "O HOTDOG DA LEIDE está fechado no momento",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #ef4444, #580f0f)",
        },
        }).showToast();
        return;
    }
    if(cart.length === 0) return;

    if(addressInput.value === '') {
        Toastify({
        text: "Informe seu endereço completo!",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #ef4444, #j1j15)",
        },
        }).showToast();

        addressInput.classList.add('border-red-500');
        return;
    }

    // Enviar o pedido para o whatsapp
    const cartItems = cart
    .map(item => `• ${item.name} (R$ ${item.price.toFixed(2)}) x ${item.quantity}`)
    .join('\n');

    const total = parseFloat(
    cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)
    );

    const address = addressInput.value;
    const observations = notesInput.value;

    const totalafter = total.toLocaleString("pt-BR", {
    style: 'currency',
    currency: 'BRL'
    });

    const message = encodeURIComponent(
    `✨ *Novo Pedido!* ✨\n\n` +
    `📦 *Itens do pedido:*\n${cartItems}\n\n` +
    `💰 *Total:* ${totalafter}\n` +
    `📍 *Endereço:* ${address}\n\n` +
    `📝 *Observações:* ${observations || "_Nenhuma observação_"}\n\n` +
    `✅ _Aguardando confirmação!_`
    );

    // const message = encodeURIComponent(
    //     `\u{1F31F} Olá! Gostaria de fazer um pedido:\n\n${cartItems}\n\n\u{1F9FE} Total: ${totalafter}\n\u{1F4CD} Endereço: *${address}*\n\n📝 Observações: ${observations}\n\n\u{2705} _Aguardando confirmação!_`
    // );

    const phone = '5534999749344'; // Substitua pelo número de telefone do restaurante
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

    cart = []; // Limpa o carrinho após o pedido
    updateCartModal();

})


function checkRestaurantOpen() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Horário de funcionamento: Segunda a Sexta, das 11h às 22h
    if (currentDay >= 0 && currentDay <= 6 && currentHour >= 18 && currentHour < 23) {
        return true;
    }
    return false;
}

const isOpen = checkRestaurantOpen();
if(isOpen){
    spanItem.classList.remove('bg-red-600');
    spanItem.classList.add('bg-green-600');
} else {
    spanItem.classList.remove('bg-green-600');
    spanItem.classList.add('bg-red-600');
}

document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("hotdog-menu");

    // Carregar JSON
    fetch("./menus/hotdog.json")
        .then(response => response.json())
        .then(data => {
            const produtos = data.hotdog;

            produtos.forEach(produto => {
                // Criar o card
                const card = document.createElement("div");
                card.classList = "flex gap-6 items-center bg-white shadow-lg rounded-lg p-4";

                card.innerHTML = `
                    <img
                        src="${produto.image}"
                        alt="${produto.title}"
                        class="w-28 h-28 object-cover rounded-lg hover:scale-110 hover:rotate-2 duration-200"
                    />
                    <div class="w-full">
                        <p class="font-bold">${produto.title}</p>
                        <p class="text-sm">${produto.description}</p>
                        <div class="flex items-center justify-between mt-5">
                            <p class="font-bold text-lg">R$ ${produto.price.toFixed(2)}</p>
                            <button
                                class="bg-green-600 hover:bg-green-700 px-5 rounded add-to-cart-btn"
                                data-name="${produto.title}"
                                data-price="${produto.price}"
                            >
                                <i class="fa fa-cart-plus text-lg text-white"></i>
                            </button>
                        </div>
                    </div>
                `;

                menuContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("broth-menu");

    // Carregar JSON
    fetch("./menus/broths.json")
        .then(response => response.json())
        .then(data => {
            const produtos = data.broth;

            produtos.forEach(produto => {
                // Criar o card
                const card = document.createElement("div");
                card.classList = "flex gap-6 items-center bg-white shadow-lg rounded-lg p-4";

                card.innerHTML = `
                    <img
                        src="${produto.image}"
                        alt="${produto.title}"
                        class="w-28 h-28 object-cover rounded-lg hover:scale-110 hover:rotate-2 duration-200"
                    />
                    <div class="w-full">
                        <p class="font-bold">${produto.title}</p>
                        <p class="text-sm">${produto.description}</p>
                        <div class="flex items-center justify-between mt-5">
                            <p class="font-bold text-lg">R$ ${produto.price.toFixed(2)}</p>
                            <button
                                class="bg-green-600 hover:bg-green-700 px-5 rounded add-to-cart-btn"
                                data-name="${produto.title}"
                                data-price="${produto.price}"
                            >
                                <i class="fa fa-cart-plus text-lg text-white"></i>
                            </button>
                        </div>
                    </div>
                `;

                menuContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("drink-menu");

    // Carregar JSON
    fetch("./menus/drink.json")
        .then(response => response.json())
        .then(data => {
            const bebidas = data.drink;

            bebidas.forEach(bebida => {
                // Criar o card
                const card = document.createElement("div");
                card.classList = "flex gap-6 items-center bg-white shadow-lg rounded-lg p-4";

                card.innerHTML = `
                    <img
                        src="${bebida.image}"
                        alt="${bebida.title}"
                        class="w-28 h-28 object-cover rounded-lg hover:scale-110 hover:rotate-2 duration-200"
                    />
                    <div class="w-full">
                        <p class="font-bold">${bebida.title}</p>
                        <p class="text-sm">${bebida.description}</p>
                        <div class="flex items-center justify-between mt-5">
                            <p class="font-bold text-lg">R$ ${bebida.price.toFixed(2)}</p>
                            <button
                                class="bg-green-600 hover:bg-green-700 px-5 rounded add-to-cart-btn"
                                data-name="${bebida.title}"
                                data-price="${bebida.price}"
                                data-description="${bebida.description}"
                            >
                                <i class="fa fa-cart-plus text-lg text-white"></i>
                            </button>
                        </div>
                    </div>
                `;

                menuContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
        });
});
