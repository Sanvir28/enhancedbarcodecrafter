// Global variables
let currentUser = null;
let isScanning = false;
let selectedReceiptProducts = [];
let isOfflineMode = false;
let localProducts = [];
let savedReceipts = [];
let currentReceiptData = null;

// DOM elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const loginSection = document.getElementById('login-section');
const mainContent = document.getElementById('main-content');

// New auth elements
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const emailLoginBtn = document.getElementById('email-login-btn');
const emailRegisterBtn = document.getElementById('email-register-btn');
const continueOfflineBtn = document.getElementById('continue-offline-btn');

// Theme toggle element
const themeToggle = document.getElementById('theme-toggle');

// Enhanced receipt elements
const saveReceiptBtn = document.getElementById('save-receipt');
const viewSavedReceiptsBtn = document.getElementById('view-saved-receipts');
const receiptHistoryModal = document.getElementById('receipt-history-modal');
const savedReceiptsList = document.getElementById('saved-receipts-list');
const clearReceiptHistoryBtn = document.getElementById('clear-receipt-history');
const emailReceiptBtn = document.getElementById('email-receipt');

// Tab management
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Product form elements
const productForm = document.getElementById('product-form');
const scannedBarcodeInput = document.getElementById('scanned-barcode');
const clearBarcodeBtn = document.getElementById('clear-barcode');

// Scanner elements
const startCameraBtn = document.getElementById('start-camera');
const stopCameraBtn = document.getElementById('stop-camera');
const scannerDiv = document.getElementById('scanner');
const manualBarcodeInput = document.getElementById('manual-barcode');
const lookupBarcodeBtn = document.getElementById('lookup-barcode');
const scanResults = document.getElementById('scan-results');

// Products elements
const refreshProductsBtn = document.getElementById('refresh-products');
const clearAllProductsBtn = document.getElementById('clear-all-products');
const productsList = document.getElementById('products-list');

// Receipt elements
const receiptProductsList = document.getElementById('receipt-products-list');
const generateReceiptBtn = document.getElementById('generate-receipt');
const receiptPreview = document.getElementById('receipt-preview');

// Modal elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const addScannedModal = document.getElementById('add-scanned-modal');

// Toast container
const toastContainer = document.getElementById('toast-container');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load local data on startup
    loadLocalProducts();
    loadSavedReceipts();
    initializeTheme();
    
    // Set up authentication listener
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            isOfflineMode = false;
            showMainContent();
            loadProducts();
            loadReceiptProducts();
        } else {
            currentUser = null;
            if (!isOfflineMode) {
                showLoginScreen();
            }
        }
    });

    // Set up event listeners
    setupEventListeners();
    
    // Set default date for receipts
    document.getElementById('receipt-date').valueAsDate = new Date();
}

function setupEventListeners() {
    // Authentication
    loginBtn.addEventListener('click', signInWithGoogle);
    logoutBtn.addEventListener('click', signOut);
    emailLoginBtn.addEventListener('click', signInWithEmail);
    emailRegisterBtn.addEventListener('click', registerWithEmail);
    continueOfflineBtn.addEventListener('click', continueOffline);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Enhanced receipt features
    saveReceiptBtn.addEventListener('click', saveCurrentReceipt);
    viewSavedReceiptsBtn.addEventListener('click', showReceiptHistory);
    clearReceiptHistoryBtn.addEventListener('click', clearReceiptHistory);
    emailReceiptBtn.addEventListener('click', emailReceipt);
    
    // Enter key support for email auth
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            signInWithEmail();
        }
    });

    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Product form
    productForm.addEventListener('submit', handleProductSubmit);
    clearBarcodeBtn.addEventListener('click', clearBarcodeInput);

    // Scanner
    startCameraBtn.addEventListener('click', startScanning);
    stopCameraBtn.addEventListener('click', stopScanning);
    lookupBarcodeBtn.addEventListener('click', lookupManualBarcode);
    manualBarcodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupManualBarcode();
        }
    });

    // Products
    if (refreshProductsBtn) {
        refreshProductsBtn.addEventListener('click', function() {
            console.log('Refresh button clicked'); // Debug log
            loadProducts();
        });
    }
    if (clearAllProductsBtn) {
        clearAllProductsBtn.addEventListener('click', clearAllProducts);
    }

    // Receipt
    generateReceiptBtn.addEventListener('click', generateReceipt);
    document.getElementById('print-receipt').addEventListener('click', printReceipt);

    // Modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    editForm.addEventListener('submit', handleEditSubmit);
    document.getElementById('add-scanned-product').addEventListener('click', addScannedProduct);

    // Barcode actions
    document.getElementById('download-barcode').addEventListener('click', downloadBarcode);
    document.getElementById('print-barcode').addEventListener('click', printBarcode);

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// Authentication functions
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showToast('Successfully signed in!', 'success');
            syncLocalToCloud();
        })
        .catch((error) => {
            console.error('Sign in error:', error);
            showToast('Sign in failed: ' + error.message, 'error');
        });
}

function signInWithEmail() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showToast('Please enter both email and password', 'warning');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((result) => {
            showToast('Successfully signed in!', 'success');
            syncLocalToCloud();
            clearAuthInputs();
        })
        .catch((error) => {
            console.error('Email sign in error:', error);
            showToast('Sign in failed: ' + error.message, 'error');
        });
}

function registerWithEmail() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showToast('Please enter both email and password', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
            showToast('Account created and signed in!', 'success');
            syncLocalToCloud();
            clearAuthInputs();
        })
        .catch((error) => {
            console.error('Registration error:', error);
            showToast('Registration failed: ' + error.message, 'error');
        });
}

function continueOffline() {
    isOfflineMode = true;
    showMainContent();
    loadProducts();
    loadReceiptProducts();
    showToast('Using offline mode. Sign in anytime to save to cloud.', 'info');
}

function clearAuthInputs() {
    emailInput.value = '';
    passwordInput.value = '';
}

function signOut() {
    auth.signOut()
        .then(() => {
            showToast('Successfully signed out!', 'info');
        })
        .catch((error) => {
            console.error('Sign out error:', error);
            showToast('Sign out failed: ' + error.message, 'error');
        });
}

function showMainContent() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.displayName || currentUser.email;
        userInfo.style.display = 'flex';
    } else {
        document.getElementById('user-name').textContent = 'Offline Mode';
        userInfo.style.display = 'flex';
    }
    loginSection.style.display = 'none';
    mainContent.style.display = 'block';
}

function showLoginScreen() {
    userInfo.style.display = 'none';
    loginSection.style.display = 'block';
    mainContent.style.display = 'none';
}

// Tab management
function switchTab(tabId) {
    // Update tab buttons
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Stop scanning when switching away from scanner tab
    if (tabId !== 'scanner' && isScanning) {
        stopScanning();
    }
}

// Product management
async function handleProductSubmit(e) {
    e.preventDefault();
    
    console.log('Adding new product...'); // Debug log

    const formData = new FormData(e.target);
    const barcode = scannedBarcodeInput.value || generateBarcode();
    
    const productData = {
        barcode: barcode,
        name: document.getElementById('product-name').value,
        description: document.getElementById('description').value,
        serialNumber: document.getElementById('serial-number').value,
        barcodeType: document.getElementById('barcode-type').value,
        amount: parseFloat(document.getElementById('amount').value) || 0,
        shippingAddress: document.getElementById('shipping-address').value,
        shippingCompany: document.getElementById('shipping-company').value,
        createdAt: new Date().toISOString(),
        userId: currentUser ? currentUser.uid : 'local'
    };

    try {
        if (currentUser) {
            // Save to cloud
            await db.collection('products').add(productData);
            showToast('Product added successfully to cloud!', 'success');
        } else {
            // Save to local storage
            productData.id = Date.now().toString();
            localProducts.push(productData);
            saveLocalProducts();
            showToast('Product added locally!', 'success');
            showCloudSavePrompt();
        }
        
        // Generate and display barcode
        generateBarcodeDisplay(barcode, productData.barcodeType);
        
        // Reset form
        productForm.reset();
        scannedBarcodeInput.value = '';
        
        // Reload products and receipt products
        console.log('Reloading products after add...');
        await loadProducts();
        await loadReceiptProducts();
        
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Error adding product: ' + error.message, 'error');
    }
}

function generateBarcode() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateBarcodeDisplay(barcodeValue, barcodeType) {
    const canvas = document.getElementById('barcode-canvas');
    const generatedBarcodeDiv = document.getElementById('generated-barcode');
    
    try {
        JsBarcode(canvas, barcodeValue, {
            format: barcodeType,
            width: 2,
            height: 100,
            displayValue: true
        });
        generatedBarcodeDiv.style.display = 'block';
    } catch (error) {
        console.error('Error generating barcode:', error);
        showToast('Error generating barcode: ' + error.message, 'error');
    }
}

function clearBarcodeInput() {
    scannedBarcodeInput.value = '';
}

async function loadProducts() {
    const loadingDiv = document.getElementById('products-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
    
    console.log('Loading products...'); // Debug log

    try {
        let products = [];
        
        if (currentUser) {
            console.log('Loading from cloud for user:', currentUser.uid);
            // Load from cloud
            const snapshot = await db.collection('products')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            console.log('Loaded', products.length, 'products from cloud');
        } else {
            console.log('Loading from local storage');
            // Load from local storage
            products = [...localProducts].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            console.log('Loaded', products.length, 'products from local storage');
        }

        displayProducts(products);
        // Also refresh receipt products list
        loadReceiptProducts();
        
        showToast('Products refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products: ' + error.message, 'error');
        if (productsList) {
            productsList.innerHTML = '<p>Error loading products. Please try again.</p>';
        }
    } finally {
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products added yet. Add your first product to get started!</p>';
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-header">
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <div class="product-actions">
                    <button class="btn btn-secondary btn-small" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="product-details">
                <div class="product-detail">
                    <strong>Barcode:</strong>
                    <span>${escapeHtml(product.barcode)}</span>
                </div>
                ${product.serialNumber ? `
                    <div class="product-detail">
                        <strong>Serial:</strong>
                        <span>${escapeHtml(product.serialNumber)}</span>
                    </div>
                ` : ''}
                ${product.description ? `
                    <div class="product-detail">
                        <strong>Description:</strong>
                        <span>${escapeHtml(product.description)}</span>
                    </div>
                ` : ''}
                <div class="product-detail">
                    <strong>Type:</strong>
                    <span>${escapeHtml(product.barcodeType || 'CODE128')}</span>
                </div>
                ${product.amount ? `
                    <div class="product-detail">
                        <strong>Amount:</strong>
                        <span>$${product.amount.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${product.shippingCompany ? `
                    <div class="product-detail">
                        <strong>Shipping:</strong>
                        <span>${escapeHtml(product.shippingCompany)}</span>
                    </div>
                ` : ''}
                ${product.shippingAddress ? `
                    <div class="product-detail">
                        <strong>Address:</strong>
                        <span>${escapeHtml(product.shippingAddress)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="product-barcode">
                <canvas id="barcode-${product.id}"></canvas>
            </div>
        </div>
    `).join('');

    // Generate barcodes for each product
    products.forEach(product => {
        try {
            JsBarcode(`#barcode-${product.id}`, product.barcode, {
                format: product.barcodeType || 'CODE128',
                width: 1,
                height: 50,
                displayValue: true,
                fontSize: 12
            });
        } catch (error) {
            console.error('Error generating barcode for product:', product.id, error);
        }
    });
}

async function editProduct(productId) {
    try {
        let product = null;
        
        if (currentUser) {
            // Load from cloud
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
                showToast('Product not found', 'error');
                return;
            }
            product = doc.data();
        } else {
            // Load from local storage
            product = localProducts.find(p => p.id === productId);
            if (!product) {
                showToast('Product not found', 'error');
                return;
            }
        }
        
        // Fill edit form
        document.getElementById('edit-product-id').value = productId;
        document.getElementById('edit-product-name').value = product.name || '';
        document.getElementById('edit-description').value = product.description || '';
        document.getElementById('edit-serial-number').value = product.serialNumber || '';
        document.getElementById('edit-barcode-type').value = product.barcodeType || 'CODE128';
        document.getElementById('edit-amount').value = product.amount || '';
        document.getElementById('edit-shipping-address').value = product.shippingAddress || '';
        document.getElementById('edit-shipping-company').value = product.shippingCompany || '';
        
        editModal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showToast('Error loading product: ' + error.message, 'error');
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('edit-product-id').value;
    const updatedData = {
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-description').value,
        serialNumber: document.getElementById('edit-serial-number').value,
        barcodeType: document.getElementById('edit-barcode-type').value,
        amount: parseFloat(document.getElementById('edit-amount').value) || 0,
        shippingAddress: document.getElementById('edit-shipping-address').value,
        shippingCompany: document.getElementById('edit-shipping-company').value,
        updatedAt: new Date().toISOString()
    };

    try {
        if (currentUser) {
            // Update in cloud
            await db.collection('products').doc(productId).update(updatedData);
            showToast('Product updated in cloud!', 'success');
        } else {
            // Update in local storage
            const productIndex = localProducts.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                localProducts[productIndex] = { ...localProducts[productIndex], ...updatedData };
                saveLocalProducts();
                showToast('Product updated locally!', 'success');
            }
        }
        
        closeModals();
        loadProducts();
        loadReceiptProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        showToast('Error updating product: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        if (currentUser) {
            // Delete from cloud
            await db.collection('products').doc(productId).delete();
            showToast('Product deleted from cloud!', 'success');
        } else {
            // Delete from local storage
            const productIndex = localProducts.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                localProducts.splice(productIndex, 1);
                saveLocalProducts();
                showToast('Product deleted locally!', 'success');
            }
        }
        
        loadProducts();
        loadReceiptProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product: ' + error.message, 'error');
    }
}

async function clearAllProducts() {
    if (!confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
        return;
    }

    try {
        if (currentUser) {
            // Clear from cloud
            const snapshot = await db.collection('products')
                .where('userId', '==', currentUser.uid)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            showToast('All products cleared from cloud!', 'success');
        } else {
            // Clear from local storage
            localProducts = [];
            saveLocalProducts();
            showToast('All local products cleared!', 'success');
        }
        
        loadProducts();
        loadReceiptProducts();
    } catch (error) {
        console.error('Error clearing products:', error);
        showToast('Error clearing products: ' + error.message, 'error');
    }
}

// Scanner functions
function startScanning() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Camera not supported on this device', 'error');
        return;
    }

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerDiv,
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            }
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader"
            ]
        }
    }, function(err) {
        if (err) {
            console.error('Scanner initialization error:', err);
            showToast('Failed to start camera: ' + err.message, 'error');
            return;
        }
        
        Quagga.start();
        isScanning = true;
        scannerDiv.style.display = 'block';
        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'inline-flex';
        
        showToast('Camera started! Point at a barcode to scan.', 'info');
    });

    Quagga.onDetected(function(data) {
        const barcode = data.codeResult.code;
        handleScannedBarcode(barcode);
        stopScanning();
    });
}

function stopScanning() {
    if (isScanning) {
        Quagga.stop();
        isScanning = false;
        scannerDiv.style.display = 'none';
        startCameraBtn.style.display = 'inline-flex';
        stopCameraBtn.style.display = 'none';
    }
}

function lookupManualBarcode() {
    const barcode = manualBarcodeInput.value.trim();
    if (!barcode) {
        showToast('Please enter a barcode number', 'warning');
        return;
    }
    
    handleScannedBarcode(barcode);
}

async function handleScannedBarcode(barcode) {
    try {
        let product = null;
        
        if (currentUser) {
            // Search in cloud
            const snapshot = await db.collection('products')
                .where('userId', '==', currentUser.uid)
                .where('barcode', '==', barcode)
                .get();
            
            if (!snapshot.empty) {
                product = snapshot.docs[0].data();
            }
        } else {
            // Search in local storage
            product = localProducts.find(p => p.barcode === barcode);
        }

        if (product) {
            // Product found
            displayScanResult(barcode, product, true);
        } else {
            // Product not found
            displayScanResult(barcode, null, false);
            showAddScannedModal(barcode);
        }
    } catch (error) {
        console.error('Error looking up product:', error);
        showToast('Error looking up product: ' + error.message, 'error');
    }
}

function displayScanResult(barcode, product, found) {
    if (found) {
        scanResults.innerHTML = `
            <div class="scan-result-card scan-result-found">
                <h4><i class="fas fa-check-circle" style="color: #28a745;"></i> Product Found!</h4>
                <div class="product-detail">
                    <strong>Barcode:</strong>
                    <span>${escapeHtml(barcode)}</span>
                </div>
                <div class="product-detail">
                    <strong>Name:</strong>
                    <span>${escapeHtml(product.name)}</span>
                </div>
                ${product.description ? `
                    <div class="product-detail">
                        <strong>Description:</strong>
                        <span>${escapeHtml(product.description)}</span>
                    </div>
                ` : ''}
                ${product.amount ? `
                    <div class="product-detail">
                        <strong>Amount:</strong>
                        <span>$${product.amount.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${product.serialNumber ? `
                    <div class="product-detail">
                        <strong>Serial:</strong>
                        <span>${escapeHtml(product.serialNumber)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        scanResults.innerHTML = `
            <div class="scan-result-card scan-result-not-found">
                <h4><i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i> Product Not Found</h4>
                <div class="product-detail">
                    <strong>Barcode:</strong>
                    <span>${escapeHtml(barcode)}</span>
                </div>
                <p>This product is not in your inventory. You can add it using the modal that appeared.</p>
            </div>
        `;
    }
}

function showAddScannedModal(barcode) {
    document.getElementById('scanned-barcode-display').textContent = barcode;
    addScannedModal.style.display = 'flex';
}

function addScannedProduct() {
    const barcode = document.getElementById('scanned-barcode-display').textContent;
    scannedBarcodeInput.value = barcode;
    closeModals();
    switchTab('add-product');
    document.getElementById('product-name').focus();
    showToast('Barcode added to product form. Fill in the details and submit.', 'info');
}

// Local storage functions
function loadLocalProducts() {
    const stored = localStorage.getItem('barcode_manager_products');
    if (stored) {
        try {
            localProducts = JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing local products:', error);
            localProducts = [];
        }
    }
}

function saveLocalProducts() {
    localStorage.setItem('barcode_manager_products', JSON.stringify(localProducts));
}

function showCloudSavePrompt() {
    if (!document.querySelector('.cloud-prompt')) {
        const prompt = document.createElement('div');
        prompt.className = 'cloud-prompt';
        prompt.innerHTML = `
            <p><i class="fas fa-cloud-upload-alt"></i> Sign in to save your data to the cloud and access it from any device!</p>
            <div class="cloud-prompt-actions">
                <button class="btn btn-primary" onclick="scrollToLogin()">Sign In Now</button>
                <button class="btn btn-secondary" onclick="dismissCloudPrompt()">Maybe Later</button>
            </div>
        `;
        document.querySelector('.tab-content.active').prepend(prompt);
    }
}

function dismissCloudPrompt() {
    const prompt = document.querySelector('.cloud-prompt');
    if (prompt) prompt.remove();
}

function scrollToLogin() {
    switchTab('add-product');
    showLoginScreen();
}

async function syncLocalToCloud() {
    if (localProducts.length > 0 && currentUser) {
        showToast('Syncing local products to cloud...', 'info');
        
        for (const product of localProducts) {
            try {
                const cloudProduct = { ...product };
                delete cloudProduct.id;
                cloudProduct.userId = currentUser.uid;
                cloudProduct.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                
                await db.collection('products').add(cloudProduct);
            } catch (error) {
                console.error('Error syncing product:', error);
            }
        }
        
        // Clear local products after successful sync
        localProducts = [];
        saveLocalProducts();
        showToast('Local products synced to cloud!', 'success');
        loadProducts();
        loadReceiptProducts();
    }
}

// Receipt functions
async function loadReceiptProducts() {
    console.log('Loading receipt products...'); // Debug log
    
    try {
        let products = [];
        
        if (currentUser) {
            console.log('Loading receipt products from cloud');
            // Load from cloud
            const snapshot = await db.collection('products')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
        } else {
            console.log('Loading receipt products from local storage');
            // Load from local storage
            products = [...localProducts].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        console.log('Displaying', products.length, 'receipt products');
        displayReceiptProducts(products);
    } catch (error) {
        console.error('Error loading receipt products:', error);
        if (receiptProductsList) {
            receiptProductsList.innerHTML = '<p>Error loading products for receipt.</p>';
        }
    }
}

function displayReceiptProducts(products) {
    if (products.length === 0) {
        receiptProductsList.innerHTML = '<p>No products available. Add products first.</p>';
        return;
    }

    receiptProductsList.innerHTML = products.map(product => `
        <div class="receipt-product-item">
            <input type="checkbox" class="receipt-product-checkbox" 
                   data-product-id="${product.id}" 
                   data-product-name="${escapeHtml(product.name)}"
                   data-product-amount="${product.amount || 0}"
                   data-product-barcode="${escapeHtml(product.barcode)}">
            <div class="receipt-product-info">
                <div class="receipt-product-name">${escapeHtml(product.name)}</div>
                <div class="receipt-product-price">$${(product.amount || 0).toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function generateReceipt() {
    const checkboxes = document.querySelectorAll('.receipt-product-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Please select at least one product for the receipt', 'warning');
        return;
    }

    const customerName = document.getElementById('receipt-customer').value || 'Walk-in Customer';
    const receiptDate = document.getElementById('receipt-date').value || new Date().toISOString().split('T')[0];
    const businessName = document.getElementById('business-name').value || 'Your Business';
    const businessAddress = document.getElementById('business-address').value || '';
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const receiptNumber = 'RCP-' + Date.now();
    
    let subtotal = 0;
    const receiptItems = [];
    
    checkboxes.forEach(checkbox => {
        const productData = JSON.parse(checkbox.dataset.product);
        const quantityInput = checkbox.parentElement.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput?.value) || 1;
        const itemTotal = (productData.amount || 0) * quantity;
        
        receiptItems.push({
            name: productData.name,
            barcode: productData.barcode,
            amount: productData.amount || 0,
            quantity: quantity,
            total: itemTotal
        });
        subtotal += itemTotal;
    });
    
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const total = discountedSubtotal + taxAmount;
    
    currentReceiptData = {
        receiptNumber,
        date: receiptDate,
        customerName,
        businessName,
        businessAddress,
        items: receiptItems,
        subtotal,
        discountAmount,
        taxRate,
        taxAmount,
        total,
        createdAt: new Date().toISOString()
    };

    const receiptHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2>RECEIPT</h2>
            <p>Receipt #: ${receiptNumber}</p>
            <p>Date: ${receiptDate}</p>
            <p>Customer: ${customerName}</p>
        </div>
        
        <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
                <span>ITEM</span>
                <span>PRICE</span>
            </div>
            ${selectedReceiptProducts.map(product => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${product.name}</span>
                    <span>$${product.amount.toFixed(2)}</span>
                </div>
                <div style="font-size: 0.8em; color: #666; margin-bottom: 10px;">
                    Barcode: ${product.barcode}
                </div>
            `).join('')}
        </div>
        
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; margin-top: 20px;">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 0.9em;">
            <p>Thank you for your business!</p>
            <p>Generated by Enhanced Barcode Manager</p>
        </div>
    `;

    document.getElementById('receipt-content').innerHTML = receiptHTML;
    receiptPreview.style.display = 'block';
    
    showToast('Receipt generated successfully!', 'success');
}

function printReceipt() {
    window.print();
}

// Utility functions
function downloadBarcode() {
    const canvas = document.getElementById('barcode-canvas');
    const link = document.createElement('a');
    link.download = 'barcode.png';
    link.href = canvas.toDataURL();
    link.click();
}

function printBarcode() {
    const canvas = document.getElementById('barcode-canvas');
    const windowContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Print Barcode</title></head>
        <body style="text-align: center; padding: 20px;">
            <img src="${canvas.toDataURL()}" style="max-width: 100%;">
        </body>
        </html>
    `;
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.open();
    printWindow.document.write(windowContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function closeModals() {
    editModal.style.display = 'none';
    addScannedModal.style.display = 'none';
    receiptHistoryModal.style.display = 'none';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : '';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Global functions for HTML onclick handlers
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.dismissCloudPrompt = dismissCloudPrompt;
window.scrollToLogin = scrollToLogin;

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('barcode_manager_theme') || 'dark';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('barcode_manager_theme', theme);
    
    const themeIcon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// Receipt Management
function loadSavedReceipts() {
    const stored = localStorage.getItem('barcode_manager_receipts');
    if (stored) {
        try {
            savedReceipts = JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing saved receipts:', error);
            savedReceipts = [];
        }
    }
}

function saveSavedReceipts() {
    localStorage.setItem('barcode_manager_receipts', JSON.stringify(savedReceipts));
}

function saveCurrentReceipt() {
    if (!currentReceiptData) {
        showToast('No receipt to save', 'warning');
        return;
    }
    
    savedReceipts.unshift(currentReceiptData);
    saveSavedReceipts();
    showToast('Receipt saved successfully!', 'success');
}

function showReceiptHistory() {
    if (savedReceipts.length === 0) {
        savedReceiptsList.innerHTML = '<p>No saved receipts yet.</p>';
    } else {
        savedReceiptsList.innerHTML = savedReceipts.map((receipt, index) => `
            <div class="saved-receipt-item" onclick="viewSavedReceipt(${index})">
                <div class="saved-receipt-header">
                    <div class="saved-receipt-title">${escapeHtml(receipt.receiptNumber)}</div>
                    <div class="saved-receipt-date">${new Date(receipt.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="saved-receipt-details">
                    Customer: ${escapeHtml(receipt.customerName)} | Items: ${receipt.items.length}
                </div>
                <div class="saved-receipt-total">$${receipt.total.toFixed(2)}</div>
            </div>
        `).join('');
    }
    
    receiptHistoryModal.style.display = 'flex';
}

function viewSavedReceipt(index) {
    const receipt = savedReceipts[index];
    if (receipt) {
        currentReceiptData = receipt;
        const receiptHTML = generateReceiptHTML(receipt);
        document.getElementById('receipt-content').innerHTML = receiptHTML;
        receiptPreview.style.display = 'block';
        saveReceiptBtn.style.display = 'inline-flex';
        
        closeModals();
        switchTab('receipts');
        showToast('Receipt loaded successfully!', 'success');
    }
}

function clearReceiptHistory() {
    if (confirm('Are you sure you want to delete all saved receipts? This action cannot be undone.')) {
        savedReceipts = [];
        saveSavedReceipts();
        showReceiptHistory();
        showToast('Receipt history cleared!', 'success');
    }
}

function emailReceipt() {
    if (!currentReceiptData) {
        showToast('No receipt to email', 'warning');
        return;
    }
    
    const email = prompt('Enter email address:');
    if (email && email.includes('@')) {
        // In a real app, you would send this to a backend service
        showToast('Email functionality requires a backend service. Receipt data copied to clipboard instead.', 'info');
        
        const receiptText = `
Receipt #: ${currentReceiptData.receiptNumber}
Date: ${currentReceiptData.date}
Customer: ${currentReceiptData.customerName}
Business: ${currentReceiptData.businessName}

Items:
${currentReceiptData.items.map(item => `${item.name} - Qty: ${item.quantity} x $${item.amount.toFixed(2)} = $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${currentReceiptData.subtotal.toFixed(2)}
${currentReceiptData.discountAmount > 0 ? `Discount: -$${currentReceiptData.discountAmount.toFixed(2)}\n` : ''}Tax (${currentReceiptData.taxRate}%): $${currentReceiptData.taxAmount.toFixed(2)}
Total: $${currentReceiptData.total.toFixed(2)}
        `;
        
        navigator.clipboard.writeText(receiptText).then(() => {
            showToast('Receipt copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Could not copy to clipboard', 'error');
        });
    }
}

// Update global window functions
window.viewSavedReceipt = viewSavedReceipt;

function generateReceiptHTML(receiptData) {
    return `
        <div class="receipt-header">
            <h2>${escapeHtml(receiptData.businessName)}</h2>
            ${receiptData.businessAddress ? `<p>${escapeHtml(receiptData.businessAddress)}</p>` : ''}
        </div>
        
        <div class="receipt-section">
            <div class="receipt-line"><strong>Receipt #:</strong> ${receiptData.receiptNumber}</div>
            <div class="receipt-line"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleDateString()}</div>
            <div class="receipt-line"><strong>Customer:</strong> ${escapeHtml(receiptData.customerName)}</div>
        </div>
        
        <div class="receipt-section">
            <div style="border-bottom: 2px solid var(--border-color); padding: 10px 0; font-weight: bold; display: flex; justify-content: space-between;">
                <span>ITEM</span>
                <span>QTY × PRICE</span>
                <span>TOTAL</span>
            </div>
            ${receiptData.items.map(item => `
                <div style="padding: 8px 0; display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color);">
                    <div style="flex: 1;">
                        <div style="font-weight: bold;">${escapeHtml(item.name)}</div>
                        <div style="font-size: 0.8em; color: var(--text-secondary);">Barcode: ${escapeHtml(item.barcode)}</div>
                    </div>
                    <div style="margin: 0 1rem;">${item.quantity || 1} × $${(item.amount || 0).toFixed(2)}</div>
                    <div style="font-weight: bold;">$${(item.total || item.amount || 0).toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="receipt-total-breakdown">
            <div class="receipt-line"><span>Subtotal:</span> <span>$${receiptData.subtotal.toFixed(2)}</span></div>
            ${receiptData.discountAmount > 0 ? `<div class="receipt-line"><span>Discount:</span> <span>-$${receiptData.discountAmount.toFixed(2)}</span></div>` : ''}
            <div class="receipt-line"><span>Tax (${receiptData.taxRate || 0}%):</span> <span>$${(receiptData.taxAmount || 0).toFixed(2)}</span></div>
            <div class="receipt-line total"><span>TOTAL:</span> <span>$${receiptData.total.toFixed(2)}</span></div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 0.9em; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <p>Thank you for your business!</p>
            <p>Generated by Enhanced Barcode Manager</p>
        </div>
    `;
}

// Enhanced displayReceiptProducts function with quantity inputs
function displayReceiptProductsEnhanced(products) {
    if (products.length === 0) {
        receiptProductsList.innerHTML = '<p>No products available. Add products first.</p>';
        return;
    }

    receiptProductsList.innerHTML = products.map(product => `
        <div class="receipt-product-item">
            <input type="checkbox" class="receipt-product-checkbox" 
                   data-product-id="${product.id}" 
                   data-product='${JSON.stringify(product)}'>
            <div class="receipt-product-info">
                <div class="receipt-product-name">${escapeHtml(product.name)}</div>
                <div class="receipt-product-price">$${(product.amount || 0).toFixed(2)}</div>
            </div>
            <div class="quantity-container">
                <label for="qty-${product.id}">Qty:</label>
                <input type="number" class="quantity-input" id="qty-${product.id}" min="1" value="1" style="width: 60px; margin-left: 0.5rem; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-tertiary); color: var(--text-primary);">
            </div>
        </div>
    `).join('');

    // Update selected products array when checkboxes change
    document.querySelectorAll('.receipt-product-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedReceiptProducts);
    });
}

// Override the original function
displayReceiptProducts = displayReceiptProductsEnhanced;
