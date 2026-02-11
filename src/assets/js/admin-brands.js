/**
 * Admin Brands Page JavaScript
 * Handles brand management for SuperAdmins
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin brands page loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isSuperAdmin()) {
        UIManager.showError('Access denied. This page is for SuperAdmins only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    loadBrands();
    initializeEventListeners();
});

// Global variables
let allBrands = [];
let selectedBrand = null;
let isEditMode = false;

/**
 * Load brands from API
 */
async function loadBrands() {
    try {
        showLoading(true);
        
        const response = await ApiService.getBrands();
        
        if (response.success) {
            allBrands = response.brands || [];
            renderBrands();
        } else {
            UIManager.showError('Failed to load brands');
        }
        
    } catch (error) {
        console.error('Error loading brands:', error);
        UIManager.showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Render brands list
 */
function renderBrands() {
    const brandsList = document.querySelector('.brands-list');
    const emptyState = document.getElementById('noBrands');
    
    if (allBrands.length === 0) {
        brandsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    brandsList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    brandsList.innerHTML = allBrands.map(brand => `
        <div class="brand-card" data-id="${brand.id}">
            <div class="brand-logo">
                <img src="${brand.logo || '/assets/images/default-brand.png'}" alt="${brand.name}">
            </div>
            <div class="brand-info">
                <h3>${brand.name}</h3>
                <p class="brand-description">${brand.description || 'No description available'}</p>
                <div class="brand-meta">
                    <span class="brand-stat">🏪 ${brand.restaurantCount || 0} Restaurants</span>
                    <span class="brand-stat">📅 ${brand.bookingCount || 0} Bookings</span>
                </div>
            </div>
            <div class="brand-actions">
                button.btn-primary.btn-sm(data-id="${brand.id}" onclick="viewBrandDetails('${brand.id}')") View Details
                button.btn-secondary.btn-sm(data-id="${brand.id}" onclick="editBrand('${brand.id}')") Edit
                button.btn-danger.btn-sm(data-id="${brand.id}" onclick="deleteBrand('${brand.id}')") Delete
            </div>
        </div>
    `).join('');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Add brand buttons
    document.getElementById('addBrandBtn').addEventListener('click', showAddBrandModal);
    document.getElementById('addFirstBrandBtn').addEventListener('click', showAddBrandModal);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('brandSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeBrandModal);
    document.getElementById('closeDetailsModalBtn').addEventListener('click', closeDetailsModal);
    
    // Brand form
    document.getElementById('saveBrandBtn').addEventListener('click', saveBrand);
    document.getElementById('cancelBrandBtn').addEventListener('click', closeBrandModal);
    
    // Brand details actions
    document.getElementById('editBrandBtn').addEventListener('click', () => {
        closeDetailsModal();
        editBrand(selectedBrand.id);
    });
    
    document.getElementById('manageRestaurantsBtn').addEventListener('click', () => {
        window.location.href = `/views/pages/admin-restaurants.html?brand=${selectedBrand.id}`;
    });
    
    document.getElementById('deleteBrandBtn').addEventListener('click', () => {
        deleteBrand(selectedBrand.id);
    });
    
    // File uploads
    document.getElementById('brandLogo').addEventListener('change', handleLogoUpload);
    document.getElementById('brandGallery').addEventListener('change', handleGalleryUpload);
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Export brands
    document.getElementById('exportBrandsBtn').addEventListener('click', exportBrands);
}

/**
 * Show add brand modal
 */
function showAddBrandModal() {
    isEditMode = false;
    selectedBrand = null;
    
    document.getElementById('modalTitle').textContent = 'Add New Brand';
    document.getElementById('brandModal').style.display = 'block';
    resetBrandForm();
}

/**
 * View brand details
 */
async function viewBrandDetails(brandId) {
    try {
        const response = await ApiService.getBrandDetails(brandId);
        
        if (response.success) {
            selectedBrand = response.brand;
            populateDetailsModal(selectedBrand);
            document.getElementById('brandDetailsModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load brand details');
        }
        
    } catch (error) {
        console.error('Error loading brand details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Edit brand
 */
async function editBrand(brandId) {
    try {
        const response = await ApiService.getBrandDetails(brandId);
        
        if (response.success) {
            isEditMode = true;
            selectedBrand = response.brand;
            
            document.getElementById('modalTitle').textContent = 'Edit Brand';
            populateBrandForm(selectedBrand);
            document.getElementById('brandModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load brand details');
        }
        
    } catch (error) {
        console.error('Error loading brand details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Populate brand form for editing
 */
function populateBrandForm(brand) {
    document.getElementById('brandName').value = brand.name || '';
    document.getElementById('brandWebsite').value = brand.website || '';
    document.getElementById('brandDescription').value = brand.description || '';
    
    if (brand.logo) {
        document.getElementById('logoFileName').textContent = brand.logo.split('/').pop();
    }
}

/**
 * Save brand
 */
async function saveBrand() {
    const brandData = {
        name: document.getElementById('brandName').value.trim(),
        website: document.getElementById('brandWebsite').value.trim(),
        description: document.getElementById('brandDescription').value.trim()
    };
    
    // Validation
    if (!brandData.name) {
        UIManager.showFormMessage('Brand name is required', 'error', '.brand-form');
        return;
    }
    
    if (brandData.name.length < 2 || brandData.name.length > 255) {
        UIManager.showFormMessage('Brand name must be between 2 and 255 characters', 'error', '.brand-form');
        return;
    }
    
    if (brandData.website && !isValidUrl(brandData.website)) {
        UIManager.showFormMessage('Please enter a valid website URL', 'error', '.brand-form');
        return;
    }
    
    UIManager.setButtonLoading('#saveBrandBtn', isEditMode ? 'Updating...' : 'Creating...');
    
    try {
        let response;
        
        if (isEditMode) {
            response = await ApiService.updateBrand(selectedBrand.id, brandData);
        } else {
            response = await ApiService.createBrand(brandData);
        }
        
        if (response.success) {
            UIManager.showSuccess(isEditMode ? 'Brand updated successfully' : 'Brand created successfully');
            closeBrandModal();
            loadBrands(); // Reload brands list
        } else {
            UIManager.showFormMessage(response.message || 'Failed to save brand', 'error', '.brand-form');
        }
        
    } catch (error) {
        console.error('Error saving brand:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#saveBrandBtn');
}

/**
 * Delete brand
 */
async function deleteBrand(brandId) {
    const brand = allBrands.find(b => b.id === brandId);
    
    if (!confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone and will also delete all associated restaurants and data.`)) {
        return;
    }
    
    try {
        const response = await ApiService.deleteBrand(brandId);
        
        if (response.success) {
            UIManager.showSuccess('Brand deleted successfully');
            loadBrands(); // Reload brands list
        } else {
            UIManager.showError(response.message || 'Failed to delete brand');
        }
        
    } catch (error) {
        console.error('Error deleting brand:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Handle search
 */
function handleSearch() {
    const searchTerm = document.getElementById('brandSearch').value.toLowerCase().trim();
    
    if (searchTerm) {
        const filteredBrands = allBrands.filter(brand => 
            brand.name.toLowerCase().includes(searchTerm) ||
            brand.description.toLowerCase().includes(searchTerm) ||
            (brand.website && brand.website.toLowerCase().includes(searchTerm))
        );
        renderFilteredBrands(filteredBrands);
    } else {
        renderBrands();
    }
}

/**
 * Render filtered brands
 */
function renderFilteredBrands(brands) {
    const brandsList = document.querySelector('.brands-list');
    const emptyState = document.getElementById('noBrands');
    
    if (brands.length === 0) {
        brandsList.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('h3').textContent = 'No Brands Found';
        emptyState.querySelector('p').textContent = 'Try adjusting your search terms.';
        return;
    }
    
    brandsList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Use the same render logic as renderBrands but with filtered data
    const originalBrands = allBrands;
    allBrands = brands;
    renderBrands();
    allBrands = originalBrands;
}

/**
 * Populate details modal
 */
function populateDetailsModal(brand) {
    document.getElementById('detailBrandName').textContent = brand.name;
    document.getElementById('detailBrandWebsite').textContent = brand.website || 'Not provided';
    document.getElementById('detailBrandDescription').textContent = brand.description || 'No description';
    document.getElementById('detailBrandCreated').textContent = Utils.formatDate(brand.createdAt);
    document.getElementById('detailRestaurantCount').textContent = brand.restaurantCount || 0;
    document.getElementById('detailBookingCount').textContent = brand.bookingCount || 0;
    document.getElementById('detailStaffCount').textContent = brand.staffCount || 0;
    
    // Load gallery images
    const gallery = document.getElementById('brandGalleryImages');
    if (brand.gallery && brand.gallery.length > 0) {
        gallery.innerHTML = brand.gallery.map(img => `
            <img src="${img}" alt="Brand gallery" class="gallery-image">
        `).join('');
    } else {
        gallery.innerHTML = '<p>No gallery images available</p>';
    }
}

/**
 * Handle logo upload
 */
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('logoFileName').textContent = file.name;
    }
}

/**
 * Handle gallery upload
 */
function handleGalleryUpload(e) {
    const files = e.target.files;
    if (files.length > 0) {
        document.getElementById('galleryFileName').textContent = `${files.length} file(s) selected`;
    }
}

/**
 * Export brands
 */
async function exportBrands() {
    try {
        const response = await ApiService.exportBrands();
        
        if (response.success) {
            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `brands-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            UIManager.showSuccess('Brands exported successfully');
        } else {
            UIManager.showError('Failed to export brands');
        }
        
    } catch (error) {
        console.error('Error exporting brands:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Close modals
 */
function closeBrandModal() {
    document.getElementById('brandModal').style.display = 'none';
    resetBrandForm();
}

function closeDetailsModal() {
    document.getElementById('brandDetailsModal').style.display = 'none';
    selectedBrand = null;
}

/**
 * Reset brand form
 */
function resetBrandForm() {
    document.getElementById('brandName').value = '';
    document.getElementById('brandWebsite').value = '';
    document.getElementById('brandDescription').value = '';
    document.getElementById('logoFileName').textContent = 'No file chosen';
    document.getElementById('galleryFileName').textContent = 'No files chosen';
    document.getElementById('brandLogo').value = '';
    document.getElementById('brandGallery').value = '';
}

/**
 * Validate URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('brandsLoading');
    const brandsList = document.querySelector('.brands-list');
    
    if (show) {
        loading.style.display = 'block';
        brandsList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        brandsList.style.display = 'grid';
    }
}
