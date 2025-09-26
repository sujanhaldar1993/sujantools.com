// SujanTech Tools - Photo Editor JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SujanTech Tools loaded!');
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize Lottie Animation
    initLottieAnimation();
    
    // Mobile navigation toggle with debugging
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    console.log('Nav elements found:', { navToggle, navMenu });
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Background Remover Tool
    initBackgroundRemover();
    
    // Photo Enhancer Tool
    initPhotoEnhancer();
    
    // Image Compressor Tool
    initImageCompressor();
    
    // PDF Tools
    initPDFTools();
});

function initBackgroundRemover() {
    console.log('🎭 Initializing Background Remover...');
    
    const uploadArea = document.getElementById('bg-upload-area');
    const fileInput = document.getElementById('bg-file-input');
    const canvas = document.getElementById('bg-canvas');
    
    if (!canvas) {
        console.log('Background remover canvas not found, skipping init');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const autoRemoveBtn = document.getElementById('auto-remove-btn');
    const resetBtn = document.getElementById('bg-reset-btn');
    const downloadBtn = document.getElementById('bg-download-btn');
    const thresholdSlider = document.getElementById('threshold-slider');
    const featherSlider = document.getElementById('feather-slider');
    const thresholdValue = document.getElementById('threshold-value');
    const featherValue = document.getElementById('feather-value');
    
    let originalImage = null;
    let processedImageData = null;

    // Setup event listeners only if elements exist
    if (uploadArea && fileInput) {
        // Upload area click handler
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }

    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                displayImage(img);
                enableControls();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displayImage(img) {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
    }

    function enableControls() {
        autoRemoveBtn.disabled = false;
        resetBtn.disabled = false;
        downloadBtn.disabled = false;
    }

    // Slider updates
    thresholdSlider.addEventListener('input', (e) => {
        thresholdValue.textContent = e.target.value;
    });
    
    featherSlider.addEventListener('input', (e) => {
        featherValue.textContent = e.target.value;
    });

    // Auto remove background (simplified version)
    autoRemoveBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        const threshold = parseInt(thresholdSlider.value);
        const feather = parseInt(featherSlider.value);
        
        // Simple background removal based on color similarity
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample background color from corners
        const bgColor = sampleBackgroundColor(data, canvas.width, canvas.height);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate color difference
            const diff = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            // Make transparent if similar to background
            if (diff < threshold) {
                data[i + 3] = Math.max(0, 255 - (threshold - diff) * (255 / feather));
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        processedImageData = imageData;
    });

    function sampleBackgroundColor(data, width, height) {
        // Sample from corners and average
        const corners = [
            { x: 0, y: 0 },
            { x: width - 1, y: 0 },
            { x: 0, y: height - 1 },
            { x: width - 1, y: height - 1 }
        ];
        
        let totalR = 0, totalG = 0, totalB = 0;
        
        corners.forEach(corner => {
            const index = (corner.y * width + corner.x) * 4;
            totalR += data[index];
            totalG += data[index + 1];
            totalB += data[index + 2];
        });
        
        return {
            r: Math.round(totalR / corners.length),
            g: Math.round(totalG / corners.length),
            b: Math.round(totalB / corners.length)
        };
    }

    resetBtn.addEventListener('click', () => {
        if (originalImage) {
            displayImage(originalImage);
        }
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'background-removed.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function initPhotoEnhancer() {
    console.log('✨ Initializing Photo Enhancer...');
    
    const uploadArea = document.getElementById('enhance-upload-area');
    const fileInput = document.getElementById('enhance-file-input');
    const canvas = document.getElementById('enhance-canvas');
    
    // Debug log
    console.log('Photo Enhancer Elements:', { uploadArea, fileInput, canvas });
    
    if (!canvas) {
        console.log('Canvas not found, exiting Photo Enhancer init');
        return; // Exit if not on photo enhancer page
    }
    
    const ctx = canvas.getContext('2d');
    const autoContrastBtn = document.getElementById('auto-contrast-btn');
    const sharpenBtn = document.getElementById('sharpen-btn');
    const resetBtn = document.getElementById('enhance-reset-btn');
    const downloadBtn = document.getElementById('enhance-download-btn');
    
    // Sliders
    const sharpenSlider = document.getElementById('sharpen-slider');
    const brightnessSlider = document.getElementById('brightness-slider');
    const contrastSlider = document.getElementById('contrast-slider');
    
    // Value displays
    const sharpenValue = document.getElementById('sharpen-value');
    const brightnessValue = document.getElementById('brightness-value');
    const contrastValue = document.getElementById('contrast-value');
    
    // Preset buttons
    const presetButtons = document.querySelectorAll('.btn-preset');
    
    let originalImage = null;
    let currentImageData = null;
    let filterTemplates = [];
    let currentFilter = null;
    
    // Filter definitions (PicsArt style)
    const filters = {
        original: { name: 'Original', filter: 'none' },
        vintage: { name: 'Vintage', filter: 'sepia(0.8) contrast(1.2) brightness(1.1)' },
        classic: { name: 'Classic', filter: 'grayscale(1) contrast(1.1)' },
        warm: { name: 'Warm', filter: 'sepia(0.3) saturate(1.4) brightness(1.1)' },
        cool: { name: 'Cool', filter: 'hue-rotate(180deg) saturate(1.2) brightness(0.9)' },
        dramatic: { name: 'Dramatic', filter: 'contrast(1.5) brightness(0.9) saturate(1.3)' },
        sunset: { name: 'Sunset', filter: 'sepia(0.5) hue-rotate(320deg) saturate(1.5) brightness(1.2)' },
        ocean: { name: 'Ocean', filter: 'hue-rotate(180deg) saturate(1.8) brightness(0.9) contrast(1.1)' },
        forest: { name: 'Forest', filter: 'hue-rotate(90deg) saturate(1.5) brightness(1.1) contrast(1.2)' },
        neon: { name: 'Neon', filter: 'saturate(2) brightness(1.3) contrast(1.4) hue-rotate(270deg)' },
        retro: { name: 'Retro', filter: 'sepia(0.6) contrast(1.3) brightness(1.2) saturate(0.8)' },
        fade: { name: 'Fade', filter: 'brightness(1.1) contrast(0.85) saturate(0.7)' },
        mono: { name: 'Mono', filter: 'grayscale(1) contrast(1.3) brightness(1.1)' }
    };

    // Initialize all event listeners
    if (uploadArea && fileInput) {
        console.log('Setting up upload area event listeners...');
        
        // Upload area click handler
        uploadArea.addEventListener('click', (e) => {
            console.log('Upload area clicked');
            fileInput.click();
        });
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('drag-over');
            console.log('Drag over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
            console.log('Drag leave');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
            console.log('File dropped');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('Processing dropped file:', files[0].name);
                handleImageUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            console.log('File input changed');
            if (e.target.files.length > 0) {
                console.log('Processing selected file:', e.target.files[0].name);
                handleImageUpload(e.target.files[0]);
            }
        });
    } else {
        console.error('Upload area or file input not found!', { uploadArea, fileInput });
    }

    // Slider event listeners with real-time updates
    if (sharpenSlider && sharpenValue) {
        sharpenSlider.addEventListener('input', (e) => {
            sharpenValue.textContent = e.target.value;
            if (originalImage) applyAllEnhancements();
        });
    }
    
    if (brightnessSlider && brightnessValue) {
        brightnessSlider.addEventListener('input', (e) => {
            brightnessValue.textContent = e.target.value;
            if (originalImage) applyAllEnhancements();
        });
    }
    
    if (contrastSlider && contrastValue) {
        contrastSlider.addEventListener('input', (e) => {
            contrastValue.textContent = e.target.value;
            if (originalImage) applyAllEnhancements();
        });
    }

    // Preset buttons functionality
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyPreset(preset);
            
            // Update active preset
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Main button event listeners
    if (autoContrastBtn) {
        autoContrastBtn.addEventListener('click', () => {
            if (originalImage) autoEnhance();
        });
    }
    
    if (sharpenBtn) {
        sharpenBtn.addEventListener('click', () => {
            if (originalImage) smartSharpen();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetToOriginal();
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadEnhancedImage();
        });
    }

    function handleImageUpload(file) {
        console.log('handleImageUpload called with file:', file);
        
        if (!file || !file.type) {
            console.error('Invalid file object:', file);
            showNotification('Please select a valid file', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            console.error('File is not an image:', file.type);
            showNotification('Please select an image file', 'error');
            return;
        }
        
        console.log('File is valid, reading...');
        const reader = new FileReader();
        
        reader.onerror = (e) => {
            console.error('FileReader error:', e);
            showNotification('Error reading file', 'error');
        };
        
        reader.onload = (e) => {
            console.log('File read successfully');
            const img = new Image();
            
            img.onerror = (error) => {
                console.error('Image load error:', error);
                showNotification('Error loading image', 'error');
            };
            
            img.onload = () => {
                console.log('Image loaded successfully:', img.width, 'x', img.height);
                originalImage = img;
                showFilterPreviewsInUploadArea(img);
                enableControls();
                showNotification('Image loaded successfully! Choose a filter below.', 'success');
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    function displayImage(img) {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Store current image data
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function enableControls() {
        if (autoContrastBtn) autoContrastBtn.disabled = false;
        if (sharpenBtn) sharpenBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = false;
        if (downloadBtn) downloadBtn.disabled = false;
        
        // Enable sliders
        if (sharpenSlider) sharpenSlider.disabled = false;
        if (brightnessSlider) brightnessSlider.disabled = false;
        if (contrastSlider) contrastSlider.disabled = false;
        
        // Enable presets
        presetButtons.forEach(btn => btn.disabled = false);
    }

    function applyAllEnhancements() {
        if (!originalImage || !currentImageData) return;
        
        // Start with original image
        displayImage(originalImage);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get slider values
        const brightness = brightnessSlider ? parseInt(brightnessSlider.value) : 0;
        const contrast = contrastSlider ? parseInt(contrastSlider.value) : 0;
        const sharpen = sharpenSlider ? parseFloat(sharpenSlider.value) : 1.0;
        
        // Apply brightness and contrast
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] = Math.max(0, Math.min(255, data[i] + brightness));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
            
            // Apply contrast
            data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Apply sharpening if needed
        if (sharpen > 1.0) {
            applySharpen(sharpen - 1.0);
        }
    }

    function applySharpen(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Unsharp mask kernel
        const kernel = [
            0, -amount, 0,
            -amount, 1 + 4 * amount, -amount,
            0, -amount, 0
        ];
        
        const newData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            sum += data[pixelIdx] * kernel[kernelIdx];
                        }
                    }
                    newData[idx + c] = Math.max(0, Math.min(255, sum));
                }
            }
        }
        
        const newImageData = new ImageData(newData, width, height);
        ctx.putImageData(newImageData, 0, 0);
    }

    function autoEnhance() {
        if (!originalImage) return;
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Auto contrast enhancement
        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            minR = Math.min(minR, data[i]);
            maxR = Math.max(maxR, data[i]);
            minG = Math.min(minG, data[i + 1]);
            maxG = Math.max(maxG, data[i + 1]);
            minB = Math.min(minB, data[i + 2]);
            maxB = Math.max(maxB, data[i + 2]);
        }
        
        // Apply histogram stretching
        for (let i = 0; i < data.length; i += 4) {
            if (maxR > minR) data[i] = ((data[i] - minR) / (maxR - minR)) * 255;
            if (maxG > minG) data[i + 1] = ((data[i + 1] - minG) / (maxG - minG)) * 255;
            if (maxB > minB) data[i + 2] = ((data[i + 2] - minB) / (maxB - minB)) * 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        showNotification('Auto enhancement applied!', 'success');
    }

    function smartSharpen() {
        if (!originalImage) return;
        
        const amount = sharpenSlider ? parseFloat(sharpenSlider.value) : 1.5;
        applySharpen(amount * 0.3);
        showNotification('Smart sharpening applied!', 'success');
    }

    function applyPreset(preset) {
        if (!originalImage) return;
        
        // Preset configurations
        const presets = {
            natural: { brightness: 5, contrast: 10, sharpen: 1.1 },
            vibrant: { brightness: 10, contrast: 25, sharpen: 1.3 },
            portrait: { brightness: 8, contrast: 15, sharpen: 1.2 },
            landscape: { brightness: 12, contrast: 30, sharpen: 1.4 },
            vintage: { brightness: -5, contrast: 20, sharpen: 0.8 }
        };
        
        const config = presets[preset];
        if (!config) return;
        
        // Update sliders
        if (brightnessSlider && brightnessValue) {
            brightnessSlider.value = config.brightness;
            brightnessValue.textContent = config.brightness;
        }
        if (contrastSlider && contrastValue) {
            contrastSlider.value = config.contrast;
            contrastValue.textContent = config.contrast;
        }
        if (sharpenSlider && sharpenValue) {
            sharpenSlider.value = config.sharpen;
            sharpenValue.textContent = config.sharpen;
        }
        
        // Apply the preset
        applyAllEnhancements();
        showNotification(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`, 'success');
    }

    function resetToOriginal() {
        if (!originalImage) return;
        
        // Reset all sliders to default
        if (brightnessSlider && brightnessValue) {
            brightnessSlider.value = 0;
            brightnessValue.textContent = '0';
        }
        if (contrastSlider && contrastValue) {
            contrastSlider.value = 0;
            contrastValue.textContent = '0';
        }
        if (sharpenSlider && sharpenValue) {
            sharpenSlider.value = 1.0;
            sharpenValue.textContent = '1.0';
        }
        
        // Remove active preset
        presetButtons.forEach(btn => btn.classList.remove('active'));
        
        // Clear filters and show filter preview area again
        clearFilters();
        if (originalImage) {
            showFilterPreviewsInUploadArea(originalImage);
        }
        showNotification('Reset - Choose a filter again', 'info');
    }

    function downloadEnhancedImage() {
        if (!canvas) return;
        
        // Create a temporary canvas to capture the filtered image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Apply the same filter to temp canvas
        if (currentFilter && filters[currentFilter] && filters[currentFilter].filter !== 'none') {
            tempCtx.filter = filters[currentFilter].filter;
        }
        
        // Draw the original image with filter
        if (originalImage) {
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = originalImage;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            tempCtx.drawImage(originalImage, 0, 0, width, height);
        }
        
        const link = document.createElement('a');
        const filterSuffix = currentFilter && currentFilter !== 'original' ? `-${currentFilter}` : '';
        link.download = `enhanced-photo${filterSuffix}-${Date.now()}.jpg`;
        link.href = tempCanvas.toDataURL('image/jpeg', 0.92);
        link.click();
        
        const filterName = currentFilter ? filters[currentFilter].name : 'Enhanced';
        showNotification(`${filterName} image downloaded!`, 'success');
    }

    function showFilterPreviewsInUploadArea(img) {
        console.log('Showing filter previews in upload area...');
        
        // Hide upload area and show filter templates
        const uploadArea = document.getElementById('enhance-upload-area');
        const filterPreviewArea = document.getElementById('filter-templates-preview');
        const showOriginalBtn = document.getElementById('show-original-btn');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (filterPreviewArea) filterPreviewArea.style.display = 'block';
        
        // Generate filter previews in main area
        generateMainFilterPreviews(img);
        
        // Setup show original button
        if (showOriginalBtn) {
            showOriginalBtn.addEventListener('click', () => {
                showOriginalImage();
            });
        }
    }
    
    function generateMainFilterPreviews(img) {
        console.log('Generating filter previews in main area...');
        const filterGrid = document.getElementById('main-filter-grid');
        if (!filterGrid) return;
        
        filterGrid.innerHTML = ''; // Clear existing previews
        
        // Create a temporary canvas for generating previews
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        previewCanvas.width = 120;
        previewCanvas.height = 100;
        
        Object.keys(filters).forEach(filterKey => {
            const filter = filters[filterKey];
            
            // Create filter template element
            const filterTemplate = document.createElement('div');
            filterTemplate.className = 'filter-template';
            filterTemplate.dataset.filter = filterKey;
            
            // Generate preview image
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            // Apply CSS filter to canvas context (approximation)
            if (filter.filter !== 'none') {
                previewCtx.filter = filter.filter;
            } else {
                previewCtx.filter = 'none';
            }
            
            // Draw scaled image
            const scale = Math.min(previewCanvas.width / img.width, previewCanvas.height / img.height);
            const x = (previewCanvas.width - img.width * scale) / 2;
            const y = (previewCanvas.height - img.height * scale) / 2;
            
            previewCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
            
            // Create preview image
            const previewImg = document.createElement('img');
            previewImg.className = 'filter-preview';
            previewImg.src = previewCanvas.toDataURL('image/jpeg', 0.8);
            previewImg.alt = filter.name;
            
            // Create filter name overlay
            const filterName = document.createElement('div');
            filterName.className = 'filter-name';
            filterName.textContent = filter.name;
            
            // Add click handler
            filterTemplate.addEventListener('click', () => {
                applyFilterAndShowResult(filterKey, img);
                
                // Update active state
                document.querySelectorAll('.filter-template').forEach(ft => ft.classList.remove('active'));
                filterTemplate.classList.add('active');
            });
            
            // Assemble filter template
            filterTemplate.appendChild(previewImg);
            filterTemplate.appendChild(filterName);
            filterGrid.appendChild(filterTemplate);
        });
        
        console.log(`Generated ${Object.keys(filters).length} filter previews`);
    }
    
    function applyFilterAndShowResult(filterKey, img) {
        if (!originalImage || !filters[filterKey]) return;
        
        currentFilter = filterKey;
        const filter = filters[filterKey];
        
        console.log(`Applying filter: ${filter.name}`);
        
        // Hide filter grid and show main canvas with filter applied
        const filterPreviewArea = document.getElementById('filter-templates-preview');
        const canvas = document.getElementById('enhance-canvas');
        
        if (filterPreviewArea) filterPreviewArea.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        
        // Display image on canvas and apply filter
        displayImage(img);
        
        // Apply CSS filter to canvas
        if (filter.filter !== 'none') {
            canvas.style.filter = filter.filter;
        } else {
            canvas.style.filter = 'none';
        }
        
        showNotification(`${filter.name} filter applied! Use controls below to fine-tune.`, 'success');
    }
    
    function showOriginalImage() {
        const filterPreviewArea = document.getElementById('filter-templates-preview');
        const canvas = document.getElementById('enhance-canvas');
        
        if (filterPreviewArea) filterPreviewArea.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        
        if (originalImage) {
            displayImage(originalImage);
            canvas.style.filter = 'none';
            currentFilter = 'original';
        }
        
        showNotification('Showing original image', 'info');
    }
    
    function applyFilter(filterKey) {
        if (!originalImage || !filters[filterKey]) return;
        
        currentFilter = filterKey;
        const filter = filters[filterKey];
        
        console.log(`Applying filter: ${filter.name}`);
        
        // Apply filter to main canvas
        if (filter.filter !== 'none') {
            canvas.style.filter = filter.filter;
        } else {
            canvas.style.filter = 'none';
        }
        
        showNotification(`${filter.name} filter applied!`, 'success');
    }
    
    function clearFilters() {
        if (canvas) {
            canvas.style.filter = 'none';
            currentFilter = null;
            
            // Remove active state from filter templates
            document.querySelectorAll('.filter-template').forEach(ft => ft.classList.remove('active'));
            document.querySelector('.filter-template[data-filter="original"]')?.classList.add('active');
        }
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Image Compressor Functionality
function initImageCompressor() {
    console.log('📦 Initializing Image Compressor...');
    
    const uploadArea = document.getElementById('compress-upload-area');
    const fileInput = document.getElementById('compress-file-input');
    const compressControls = document.getElementById('compress-controls');
    const compressGallery = document.getElementById('compress-gallery');
    const compressionStats = document.getElementById('compression-stats');
    const compressionProgress = document.getElementById('compression-progress');
    
    // Control elements
    const qualitySlider = document.getElementById('quality-compress-slider');
    const maxWidthSlider = document.getElementById('max-width-slider');
    const outputFormat = document.getElementById('output-format');
    const qualityValue = document.getElementById('quality-compress-value');
    const maxWidthValue = document.getElementById('max-width-value');
    const presetButtons = document.querySelectorAll('.btn-preset');
    
    // Button elements
    const compressAllBtn = document.getElementById('compress-all-btn');
    const downloadBtn = document.getElementById('compress-download-btn');
    const downloadZipBtn = document.getElementById('compress-download-zip-btn');
    const resetBtn = document.getElementById('compress-reset-btn');
    
    // Stats elements
    const originalSizeEl = document.getElementById('original-size');
    const compressedSizeEl = document.getElementById('compressed-size');
    const sizeReductionEl = document.getElementById('size-reduction');
    
    // Progress elements
    const progressFill = document.getElementById('compress-progress-fill');
    const progressText = document.getElementById('compress-progress-text');
    
    let uploadedImages = [];
    let compressedImages = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    // Upload area click handler
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            handleMultipleImageUpload(files);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            handleMultipleImageUpload(files);
        }
    });
    
    // Slider updates
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value;
    });
    
    maxWidthSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        maxWidthValue.textContent = value === parseInt(maxWidthSlider.min) ? 'Original' : value;
    });
    
    // Preset buttons
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const quality = btn.dataset.quality;
            const width = btn.dataset.width;
            
            qualitySlider.value = quality;
            maxWidthSlider.value = width;
            qualityValue.textContent = quality;
            maxWidthValue.textContent = width === '0' ? 'Original' : width;
            
            // Update active preset
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    async function handleMultipleImageUpload(files) {
        totalOriginalSize = 0;
        uploadedImages = [];
        compressedImages = [];
        
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                continue;
            }
            
            const imageData = {
                file: file,
                originalSize: file.size,
                name: file.name,
                dataUrl: null,
                compressed: null
            };
            
            // Read file as data URL
            const dataUrl = await readFileAsDataURL(file);
            imageData.dataUrl = dataUrl;
            
            uploadedImages.push(imageData);
            totalOriginalSize += file.size;
        }
        
        displayImages();
        showControls();
        updateStats();
    }
    
    function readFileAsDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    
    function displayImages() {
        compressGallery.innerHTML = '';
        
        uploadedImages.forEach((imageData, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'compress-image-item';
            imageItem.innerHTML = `
                <div class="image-preview">
                    <img src="${imageData.dataUrl}" alt="${imageData.name}">
                    <div class="image-overlay">
                        <button class="remove-image" data-index="${index}">×</button>
                    </div>
                </div>
                <div class="image-info">
                    <h4>${imageData.name}</h4>
                    <p class="image-size">${formatFileSize(imageData.originalSize)}</p>
                    <div class="compression-result" style="display: none;">
                        <p class="compressed-size">Compressed: <span>--</span></p>
                        <p class="compression-ratio">Reduction: <span>--</span></p>
                    </div>
                </div>
            `;
            
            compressGallery.appendChild(imageItem);
        });
        
        // Add remove handlers
        document.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                removeImage(index);
            });
        });
    }
    
    function removeImage(index) {
        totalOriginalSize -= uploadedImages[index].originalSize;
        uploadedImages.splice(index, 1);
        if (compressedImages[index]) {
            totalCompressedSize -= compressedImages[index].size;
            compressedImages.splice(index, 1);
        }
        
        if (uploadedImages.length === 0) {
            hideControls();
            hideStats();
        } else {
            displayImages();
            updateStats();
        }
    }
    
    function showControls() {
        compressControls.style.display = 'block';
        compressAllBtn.classList.remove('disabled');
    }
    
    function hideControls() {
        compressControls.style.display = 'none';
        compressAllBtn.classList.add('disabled');
        downloadBtn.classList.add('disabled');
        downloadZipBtn.classList.add('disabled');
    }
    
    function showStats() {
        compressionStats.style.display = 'block';
    }
    
    function hideStats() {
        compressionStats.style.display = 'none';
    }
    
    function updateStats() {
        originalSizeEl.textContent = formatFileSize(totalOriginalSize);
        
        if (totalCompressedSize > 0) {
            compressedSizeEl.textContent = formatFileSize(totalCompressedSize);
            const reduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
            sizeReductionEl.textContent = `${reduction}%`;
            sizeReductionEl.style.color = reduction > 0 ? '#10b981' : '#ef4444';
            showStats();
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    function showProgress() {
        compressionProgress.style.display = 'block';
    }
    
    function hideProgress() {
        compressionProgress.style.display = 'none';
    }
    
    function updateProgress(percent, text) {
        progressFill.style.width = percent + '%';
        progressText.textContent = text;
    }
    
    // Compress all images
    compressAllBtn.addEventListener('click', async () => {
        if (uploadedImages.length === 0) return;
        
        showProgress();
        compressedImages = [];
        totalCompressedSize = 0;
        
        const quality = parseInt(qualitySlider.value) / 100;
        const maxWidth = parseInt(maxWidthSlider.value);
        const format = outputFormat.value;
        
        for (let i = 0; i < uploadedImages.length; i++) {
            const imageData = uploadedImages[i];
            updateProgress((i / uploadedImages.length) * 100, `Compressing ${imageData.name}...`);
            
            try {
                const compressedData = await compressImage(imageData.dataUrl, quality, maxWidth, format);
                compressedImages.push({
                    data: compressedData.dataUrl,
                    size: compressedData.size,
                    name: generateCompressedName(imageData.name, format),
                    blob: compressedData.blob
                });
                
                totalCompressedSize += compressedData.size;
                
                // Update individual image stats
                const imageItem = compressGallery.children[i];
                const resultDiv = imageItem.querySelector('.compression-result');
                const compressedSizeSpan = resultDiv.querySelector('.compressed-size span');
                const ratioSpan = resultDiv.querySelector('.compression-ratio span');
                
                compressedSizeSpan.textContent = formatFileSize(compressedData.size);
                const reduction = ((imageData.originalSize - compressedData.size) / imageData.originalSize * 100).toFixed(1);
                ratioSpan.textContent = `${reduction}%`;
                ratioSpan.style.color = reduction > 0 ? '#10b981' : '#ef4444';
                resultDiv.style.display = 'block';
                
            } catch (error) {
                console.error('Error compressing image:', imageData.name, error);
                // Add placeholder for failed compression
                compressedImages.push(null);
            }
        }
        
        updateProgress(100, 'Compression complete!');
        setTimeout(() => {
            hideProgress();
            updateStats();
            enableDownloadButtons();
        }, 500);
    });
    
    function compressImage(dataUrl, quality, maxWidth, format) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let { width, height } = img;
                
                // Resize if needed
                if (maxWidth > parseInt(maxWidthSlider.min) && width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data
                const mimeType = format === 'png' ? 'image/png' : 
                               format === 'webp' ? 'image/webp' : 'image/jpeg';
                
                const compressedDataUrl = canvas.toDataURL(mimeType, quality);
                
                // Calculate size
                canvas.toBlob((blob) => {
                    resolve({
                        dataUrl: compressedDataUrl,
                        size: blob.size,
                        blob: blob
                    });
                }, mimeType, quality);
            };
            img.src = dataUrl;
        });
    }
    
    function generateCompressedName(originalName, format) {
        const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
        const extension = format === 'jpeg' ? 'jpg' : format;
        return `${nameWithoutExt}-compressed.${extension}`;
    }
    
    function enableDownloadButtons() {
        downloadBtn.classList.remove('disabled');
        if (compressedImages.length > 1) {
            downloadZipBtn.classList.remove('disabled');
        }
    }
    
    // Download single image or first image
    downloadBtn.addEventListener('click', () => {
        if (compressedImages.length === 0) return;
        
        if (compressedImages.length === 1) {
            // Download single image
            const compressed = compressedImages[0];
            const link = document.createElement('a');
            link.download = compressed.name;
            link.href = compressed.data;
            link.click();
        } else {
            // Download all images as separate files
            compressedImages.forEach((compressed, index) => {
                if (compressed) {
                    setTimeout(() => {
                        const link = document.createElement('a');
                        link.download = compressed.name;
                        link.href = compressed.data;
                        link.click();
                    }, index * 100); // Small delay between downloads
                }
            });
        }
    });
    
    // Download as ZIP (simplified - just download all separately for now)
    downloadZipBtn.addEventListener('click', () => {
        if (compressedImages.length === 0) return;
        
        // For now, just download all images separately
        // In a real implementation, you'd use a library like JSZip
        alert('ZIP download feature coming soon! For now, downloading all images separately.');
        downloadBtn.click();
    });
    
    // Reset/Clear all
    resetBtn.addEventListener('click', () => {
        uploadedImages = [];
        compressedImages = [];
        totalOriginalSize = 0;
        totalCompressedSize = 0;
        
        compressGallery.innerHTML = '';
        fileInput.value = '';
        hideControls();
        hideStats();
        hideProgress();
        
        // Reset sliders to default
        qualitySlider.value = 80;
        maxWidthSlider.value = 1920;
        qualityValue.textContent = '80';
        maxWidthValue.textContent = '1920';
        outputFormat.value = 'jpeg';
        presetButtons.forEach(btn => btn.classList.remove('active'));
    });
}

// PDF Tools Functionality
function initPDFTools() {
    console.log('📄 Initializing PDF Tools...');
    
    // PDF Tab switching
    const pdfTabs = document.querySelectorAll('.pdf-tab');
    const pdfSections = document.querySelectorAll('.pdf-tool-section');
    
    pdfTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            pdfTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active section
            pdfSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `pdf-${tabName}`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Initialize each PDF tool
    initPDFMerger();
    initPDFSplitter();
    initPDFCompressor();
    initPhotoPDF();
}

// PDF Merger
function initPDFMerger() {
    const uploadArea = document.getElementById('pdf-merge-upload');
    const fileInput = document.getElementById('pdf-merge-input');
    const fileList = document.getElementById('pdf-merge-list');
    const mergeBtn = document.getElementById('pdf-merge-btn');
    const clearBtn = document.getElementById('pdf-merge-clear');
    
    let pdfFiles = [];
    
    // Upload area click handler
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        handlePDFFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        handlePDFFiles(files);
    });
    
    function handlePDFFiles(files) {
        files.forEach(file => {
            if (file.type === 'application/pdf') {
                pdfFiles.push(file);
                addFileToList(file);
            }
        });
        updateMergeButton();
    }
    
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'pdf-file-item';
        fileItem.innerHTML = `
            <div class="pdf-file-info">
                <div class="pdf-file-icon">📄</div>
                <div class="pdf-file-details">
                    <div class="pdf-file-name">${file.name}</div>
                    <div class="pdf-file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <div class="pdf-file-actions">
                <button class="pdf-file-remove" onclick="removeFile('${file.name}')">🗑️</button>
            </div>
        `;
        fileList.appendChild(fileItem);
    }
    
    window.removeFile = function(fileName) {
        pdfFiles = pdfFiles.filter(file => file.name !== fileName);
        renderFileList();
        updateMergeButton();
    };
    
    function renderFileList() {
        fileList.innerHTML = '';
        pdfFiles.forEach(file => addFileToList(file));
    }
    
    function updateMergeButton() {
        if (pdfFiles.length >= 2) {
            mergeBtn.classList.remove('disabled');
            mergeBtn.disabled = false;
        } else {
            mergeBtn.classList.add('disabled');
            mergeBtn.disabled = true;
        }
    }
    
    // Merge PDFs function
    mergeBtn.addEventListener('click', async () => {
        if (pdfFiles.length < 2) return;
        
        showProgress('Merging PDFs...');
        
        try {
            // Use PDF-lib for merging
            const mergedPdf = await PDFLib.PDFDocument.create();
            
            for (let i = 0; i < pdfFiles.length; i++) {
                const fileBuffer = await pdfFiles[i].arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(fileBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => mergedPdf.addPage(page));
                
                updateProgress((i + 1) / pdfFiles.length * 100);
            }
            
            const mergedPdfBytes = await mergedPdf.save();
            downloadFile(mergedPdfBytes, 'merged-document.pdf', 'application/pdf');
            
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
        } finally {
            hideProgress();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        pdfFiles = [];
        fileList.innerHTML = '';
        updateMergeButton();
        fileInput.value = '';
    });
}

// PDF Splitter
function initPDFSplitter() {
    const uploadArea = document.getElementById('pdf-split-upload');
    const fileInput = document.getElementById('pdf-split-input');
    const splitBtn = document.getElementById('pdf-split-btn');
    const clearBtn = document.getElementById('pdf-split-clear');
    const splitOptions = document.getElementById('pdf-split-options');
    const pageRangesInput = document.getElementById('page-ranges');
    
    let currentPDF = null;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handlePDFFile(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePDFFile(e.target.files[0]);
        }
    });
    
    function handlePDFFile(file) {
        if (file.type === 'application/pdf') {
            currentPDF = file;
            splitOptions.style.display = 'block';
            splitBtn.classList.remove('disabled');
            splitBtn.disabled = false;
        }
    }
    
    splitBtn.addEventListener('click', async () => {
        if (!currentPDF) return;
        
        const splitMode = document.querySelector('input[name="split-mode"]:checked').value;
        
        showProgress('Splitting PDF...');
        
        try {
            const fileBuffer = await currentPDF.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(fileBuffer);
            const totalPages = pdf.getPageCount();
            
            if (splitMode === 'each') {
                // Split every page separately
                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFLib.PDFDocument.create();
                    const [page] = await newPdf.copyPages(pdf, [i]);
                    newPdf.addPage(page);
                    
                    const pdfBytes = await newPdf.save();
                    downloadFile(pdfBytes, `page-${i + 1}.pdf`, 'application/pdf');
                    
                    updateProgress((i + 1) / totalPages * 100);
                    // Add small delay to prevent browser from blocking multiple downloads
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } else {
                // Split by page ranges
                const ranges = parsePageRanges(pageRangesInput.value, totalPages);
                
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const newPdf = await PDFLib.PDFDocument.create();
                    const pages = await newPdf.copyPages(pdf, range);
                    pages.forEach(page => newPdf.addPage(page));
                    
                    const pdfBytes = await newPdf.save();
                    const rangeStr = range.length === 1 ? `page-${range[0] + 1}` : `pages-${range[0] + 1}-${range[range.length - 1] + 1}`;
                    downloadFile(pdfBytes, `${rangeStr}.pdf`, 'application/pdf');
                    
                    updateProgress((i + 1) / ranges.length * 100);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
        } catch (error) {
            console.error('Error splitting PDF:', error);
            alert('Error splitting PDF. Please check page ranges and try again.');
        } finally {
            hideProgress();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        currentPDF = null;
        splitOptions.style.display = 'none';
        splitBtn.classList.add('disabled');
        splitBtn.disabled = true;
        fileInput.value = '';
        pageRangesInput.value = '';
    });
}

// PDF Compressor
function initPDFCompressor() {
    const uploadArea = document.getElementById('pdf-compress-upload');
    const fileInput = document.getElementById('pdf-compress-input');
    const compressBtn = document.getElementById('pdf-compress-btn');
    const clearBtn = document.getElementById('pdf-compress-clear');
    const compressOptions = document.getElementById('pdf-compress-options');
    const compressionSlider = document.getElementById('compression-slider');
    const compressionValue = document.getElementById('compression-value');
    
    let currentPDF = null;
    
    // Compression slider updates
    compressionSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const levels = ['Low', 'Medium', 'High'];
        compressionValue.textContent = levels[value - 1];
    });
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handlePDFFile(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePDFFile(e.target.files[0]);
        }
    });
    
    function handlePDFFile(file) {
        if (file.type === 'application/pdf') {
            currentPDF = file;
            compressOptions.style.display = 'block';
            compressBtn.classList.remove('disabled');
            compressBtn.disabled = false;
        }
    }
    
    compressBtn.addEventListener('click', async () => {
        if (!currentPDF) return;
        
        const compressionLevel = parseInt(compressionSlider.value);
        
        showProgress('Compressing PDF...');
        
        try {
            // Simple compression by re-saving the PDF
            // Note: This is a basic implementation. Advanced compression would require more complex processing
            const fileBuffer = await currentPDF.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(fileBuffer);
            
            updateProgress(50);
            
            // Save with different compression settings based on level
            const compressedPdfBytes = await pdf.save({
                useObjectStreams: compressionLevel >= 2,
                addDefaultPage: false
            });
            
            updateProgress(100);
            
            const originalSize = currentPDF.size;
            const compressedSize = compressedPdfBytes.length;
            const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            downloadFile(compressedPdfBytes, 'compressed-document.pdf', 'application/pdf');
            
            if (reduction > 0) {
                alert(`PDF compressed successfully! Size reduced by ${reduction}%`);
            } else {
                alert('PDF processed, but no significant size reduction was possible.');
            }
            
        } catch (error) {
            console.error('Error compressing PDF:', error);
            alert('Error compressing PDF. Please try again.');
        } finally {
            hideProgress();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        currentPDF = null;
        compressOptions.style.display = 'none';
        compressBtn.classList.add('disabled');
        compressBtn.disabled = true;
        fileInput.value = '';
    });
}

// Utility functions for PDF tools
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function parsePageRanges(rangeStr, totalPages) {
    const ranges = [];
    const parts = rangeStr.split(',').map(s => s.trim());
    
    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1);
            for (let i = start; i <= Math.min(end, totalPages - 1); i++) {
                ranges.push(i);
            }
        } else {
            const page = parseInt(part) - 1;
            if (page >= 0 && page < totalPages) {
                ranges.push(page);
            }
        }
    });
    
    // Group consecutive pages into ranges
    const groupedRanges = [];
    let currentRange = [];
    
    ranges.sort((a, b) => a - b).forEach(page => {
        if (currentRange.length === 0 || page === currentRange[currentRange.length - 1] + 1) {
            currentRange.push(page);
        } else {
            groupedRanges.push([...currentRange]);
            currentRange = [page];
        }
    });
    
    if (currentRange.length > 0) {
        groupedRanges.push(currentRange);
    }
    
    return groupedRanges;
}

function showProgress(text) {
    const progressEl = document.getElementById('pdf-progress');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    progressEl.style.display = 'block';
    progressText.textContent = text;
    progressFill.style.width = '0%';
}

function updateProgress(percent) {
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = percent + '%';
}

function hideProgress() {
    const progressEl = document.getElementById('pdf-progress');
    setTimeout(() => {
        progressEl.style.display = 'none';
    }, 500);
}

function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Photo to PDF Converter
function initPhotoPDF() {
    const uploadArea = document.getElementById('photo-pdf-upload');
    const fileInput = document.getElementById('photo-pdf-input');
    const photoGallery = document.getElementById('photo-gallery');
    const convertBtn = document.getElementById('photo-pdf-convert');
    const clearBtn = document.getElementById('photo-pdf-clear');
    const photoPdfOptions = document.getElementById('photo-pdf-options');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    
    let imageFiles = [];
    
    // Quality slider update
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value;
    });
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleImageFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        handleImageFiles(files);
    });
    
    function handleImageFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                imageFiles.push({
                    file: file,
                    id: Date.now() + Math.random(),
                    dataUrl: null
                });
            }
        });
        
        loadImagePreviews();
        updateConvertButton();
        showOptions();
    }
    
    async function loadImagePreviews() {
        photoGallery.innerHTML = '';
        
        for (let i = 0; i < imageFiles.length; i++) {
            const imageItem = imageFiles[i];
            
            if (!imageItem.dataUrl) {
                imageItem.dataUrl = await fileToDataUrl(imageItem.file);
            }
            
            createImagePreview(imageItem, i);
        }
    }
    
    function fileToDataUrl(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    
    function createImagePreview(imageItem, index) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.draggable = true;
        photoItem.dataset.id = imageItem.id;
        
        photoItem.innerHTML = `
            <div class="photo-item-index">${index + 1}</div>
            <img src="${imageItem.dataUrl}" alt="${imageItem.file.name}" loading="lazy">
            <div class="photo-item-info">
                <div class="photo-item-name">${imageItem.file.name}</div>
                <div class="photo-item-size">${formatFileSize(imageItem.file.size)}</div>
            </div>
            <button class="photo-item-remove" onclick="removeImage('${imageItem.id}')">&times;</button>
        `;
        
        // Add drag and drop for reordering
        photoItem.addEventListener('dragstart', handleDragStart);
        photoItem.addEventListener('dragover', handleDragOver);
        photoItem.addEventListener('drop', handleDrop);
        photoItem.addEventListener('dragend', handleDragEnd);
        
        photoGallery.appendChild(photoItem);
    }
    
    window.removeImage = function(imageId) {
        imageFiles = imageFiles.filter(item => item.id !== imageId);
        loadImagePreviews();
        updateConvertButton();
        
        if (imageFiles.length === 0) {
            hideOptions();
        }
    };
    
    // Drag and drop for reordering
    let draggedElement = null;
    
    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        if (draggedElement && draggedElement !== e.target) {
            const draggedId = draggedElement.dataset.id;
            const targetId = e.target.closest('.photo-item')?.dataset.id;
            
            if (targetId && draggedId !== targetId) {
                reorderImages(draggedId, targetId);
            }
        }
    }
    
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedElement = null;
    }
    
    function reorderImages(draggedId, targetId) {
        const draggedIndex = imageFiles.findIndex(item => item.id === draggedId);
        const targetIndex = imageFiles.findIndex(item => item.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const draggedItem = imageFiles.splice(draggedIndex, 1)[0];
            imageFiles.splice(targetIndex, 0, draggedItem);
            loadImagePreviews();
        }
    }
    
    function updateConvertButton() {
        if (imageFiles.length > 0) {
            convertBtn.classList.remove('disabled');
            convertBtn.disabled = false;
        } else {
            convertBtn.classList.add('disabled');
            convertBtn.disabled = true;
        }
    }
    
    function showOptions() {
        photoPdfOptions.style.display = 'block';
    }
    
    function hideOptions() {
        photoPdfOptions.style.display = 'none';
    }
    
    // Convert images to PDF
    convertBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) return;
        
        showProgress('Converting images to PDF...');
        
        try {
            const pdf = await PDFLib.PDFDocument.create();
            
            // Get options
            const pageSize = document.getElementById('page-size').value;
            const orientation = document.getElementById('orientation').value;
            const imagesPerPage = parseInt(document.getElementById('images-per-page').value);
            const quality = parseInt(qualitySlider.value) / 100;
            const margin = parseInt(document.getElementById('margin').value);
            
            // Define page dimensions (in points, 72 points = 1 inch)
            const pageDimensions = getPageDimensions(pageSize, orientation);
            
            // Process images in batches based on images per page
            for (let i = 0; i < imageFiles.length; i += imagesPerPage) {
                const batch = imageFiles.slice(i, i + imagesPerPage);
                await addImagesToPage(pdf, batch, pageDimensions, margin, quality, imagesPerPage);
                
                updateProgress((i + batch.length) / imageFiles.length * 100);
            }
            
            const pdfBytes = await pdf.save();
            downloadFile(pdfBytes, 'photos-to-pdf.pdf', 'application/pdf');
            
        } catch (error) {
            console.error('Error converting photos to PDF:', error);
            alert('Error converting images to PDF. Please try again.');
        } finally {
            hideProgress();
        }
    });
    
    async function addImagesToPage(pdf, images, pageDimensions, margin, quality, imagesPerPage) {
        const page = pdf.addPage([pageDimensions.width, pageDimensions.height]);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const availableWidth = pageWidth - (2 * margin);
        const availableHeight = pageHeight - (2 * margin);
        
        if (imagesPerPage === 1) {
            // Single image per page
            const imageBytes = await imageToBytes(images[0].file, quality);
            const image = await embedImage(pdf, imageBytes, images[0].file.type);
            
            const imageDims = image.scale(1);
            const scale = Math.min(
                availableWidth / imageDims.width,
                availableHeight / imageDims.height
            );
            
            const scaledWidth = imageDims.width * scale;
            const scaledHeight = imageDims.height * scale;
            
            const x = margin + (availableWidth - scaledWidth) / 2;
            const y = margin + (availableHeight - scaledHeight) / 2;
            
            page.drawImage(image, {
                x: x,
                y: y,
                width: scaledWidth,
                height: scaledHeight
            });
            
        } else if (imagesPerPage === 2) {
            // Two images per page (side by side or stacked)
            const imageWidth = availableWidth / 2 - margin / 2;
            const imageHeight = availableHeight;
            
            for (let j = 0; j < images.length && j < 2; j++) {
                const imageBytes = await imageToBytes(images[j].file, quality);
                const image = await embedImage(pdf, imageBytes, images[j].file.type);
                
                const imageDims = image.scale(1);
                const scale = Math.min(imageWidth / imageDims.width, imageHeight / imageDims.height);
                
                const scaledWidth = imageDims.width * scale;
                const scaledHeight = imageDims.height * scale;
                
                const x = margin + (j * (imageWidth + margin / 2)) + (imageWidth - scaledWidth) / 2;
                const y = margin + (imageHeight - scaledHeight) / 2;
                
                page.drawImage(image, {
                    x: x,
                    y: y,
                    width: scaledWidth,
                    height: scaledHeight
                });
            }
            
        } else if (imagesPerPage === 4) {
            // Four images per page (2x2 grid)
            const imageWidth = availableWidth / 2 - margin / 2;
            const imageHeight = availableHeight / 2 - margin / 2;
            
            for (let j = 0; j < images.length && j < 4; j++) {
                const imageBytes = await imageToBytes(images[j].file, quality);
                const image = await embedImage(pdf, imageBytes, images[j].file.type);
                
                const imageDims = image.scale(1);
                const scale = Math.min(imageWidth / imageDims.width, imageHeight / imageDims.height);
                
                const scaledWidth = imageDims.width * scale;
                const scaledHeight = imageDims.height * scale;
                
                const col = j % 2;
                const row = Math.floor(j / 2);
                
                const x = margin + (col * (imageWidth + margin / 2)) + (imageWidth - scaledWidth) / 2;
                const y = margin + ((1 - row) * (imageHeight + margin / 2)) + (imageHeight - scaledHeight) / 2;
                
                page.drawImage(image, {
                    x: x,
                    y: y,
                    width: scaledWidth,
                    height: scaledHeight
                });
            }
        }
    }
    
    function getPageDimensions(pageSize, orientation) {
        const sizes = {
            'a4': { width: 595, height: 842 },
            'letter': { width: 612, height: 792 },
            'a3': { width: 842, height: 1191 },
            'custom': { width: 612, height: 792 } // Default fallback
        };
        
        let dimensions = sizes[pageSize] || sizes.a4;
        
        if (orientation === 'landscape') {
            dimensions = { width: dimensions.height, height: dimensions.width };
        }
        
        return dimensions;
    }
    
    async function imageToBytes(file, quality) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(new Uint8Array(reader.result));
                    reader.readAsArrayBuffer(blob);
                }, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    async function embedImage(pdf, imageBytes, mimeType) {
        if (mimeType.includes('png')) {
            return await pdf.embedPng(imageBytes);
        } else {
            return await pdf.embedJpg(imageBytes);
        }
    }
    
    clearBtn.addEventListener('click', () => {
        imageFiles = [];
        photoGallery.innerHTML = '';
        updateConvertButton();
        hideOptions();
        fileInput.value = '';
    });
}

// Initialize Lottie Animation
function initLottieAnimation() {
    const lottieContainer = document.getElementById('lottie-animation');
    
    if (!lottieContainer) {
        console.warn('Lottie container not found');
        return;
    }
    
    // Load the Lottie animation from the provided URL
    const animationData = {
        "v":"5.7.3",
        "fr":25,
        "ip":0,
        "op":250,
        "w":1000,
        "h":1000,
        "nm":"Comp 1",
        "ddd":0,
        "assets":[],
        "layers":[{
            "ddd":0,
            "ind":1,
            "ty":3,
            "nm":"Null 1",
            "sr":1,
            "ks":{
                "o":{"a":0,"k":0,"ix":11},
                "r":{"a":0,"k":0,"ix":10},
                "p":{"a":0,"k":[504,572,0],"ix":2},
                "a":{"a":0,"k":[0,0,0],"ix":1},
                "s":{"a":0,"k":[91,91,100],"ix":6}
            },
            "ao":0,
            "ip":0,
            "op":250,
            "st":0,
            "bm":0
        }]
    };
    
    try {
        // Initialize Lottie animation
        const animation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://lottie.host/201c8bb7-91ca-4b65-bc56-1368fd333927/N04Gx4z1Dq.json'
        });
        
        animation.addEventListener('DOMLoaded', () => {
            console.log('✨ Lottie animation loaded successfully!');
        });
        
        animation.addEventListener('error', (error) => {
            console.error('❌ Error loading Lottie animation:', error);
            // Fallback: Hide the container or show a placeholder
            lottieContainer.style.display = 'none';
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize Lottie animation:', error);
        lottieContainer.style.display = 'none';
    }
}


// Back to Top Button Functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) {
        console.warn('Back to top button not found!');
        return;
    }
    
    // Show/hide button based on scroll position
    function toggleButton() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Event listeners
    window.addEventListener('scroll', toggleButton, { passive: true });
    backToTopButton.addEventListener('click', scrollToTop);
    
    // Initial check
    toggleButton();
    
    console.log('⬆️ Back to top button initialized!');
}

// Add some fun console messages
console.log('%c🚀 SujanTech Tools', 'font-size: 20px; color: #0b3d91; font-weight: bold;');
console.log('%cFree photo editing and PDF tools! Made with ❤️ by Sujan', 'color: #10b981;');
console.log('%c📄 PDF Tools: Merge, Split, Compress - All client-side!', 'color: #f59e0b;');
