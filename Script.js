// =============================
// Adventure Store Script
// Backend Ready + Demo Fallback
// =============================

// API URL (future backend)
const API_URL = "http://localhost:8080/products";

let total = 0;

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");

// Try to load products from backend
fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("Backend not running");
    }
    return response.json();
  })
  .then(data => {
    displayProducts(data);
  })
  .catch(error => {
    console.log("Backend not connected. Showing demo products.");

    // Demo products if backend not available
    const demoProducts = [
      { name: "Mountain Bike", price: 15000 },
      { name: "Helmet", price: 1500 },
      { name: "Climbing Rope", price: 2000 },
      { name: "Camping Tent", price: 5000 }
    ];

    displayProducts(demoProducts);
  });

// Function to show products
function displayProducts(products) {

  productList.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button>Add to Cart</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(product);
    });

    productList.appendChild(card);
  });
}

// Add to cart
function addToCart(product) {

  const li = document.createElement("li");
  li.textContent = product.name + " - ₹" + product.price;

  cartItems.appendChild(li);

  total += product.price;
  totalDisplay.textContent = total;
}